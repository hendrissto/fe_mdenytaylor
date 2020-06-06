import React, { Component, Fragment } from "react";
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, Row, Card, CardBody } from "reactstrap";
import PerfectScrollbar from "react-perfect-scrollbar";
import { Paginator } from "primereact/paginator";
import Swal from "sweetalert2";
import * as _ from "lodash";
import moment from "moment";
import { NavLink } from "react-router-dom";

import withReactContent from "sweetalert2-react-content";
import { Observable, forkJoin, throwError } from 'rxjs';
import { finalize, tap, catchError } from 'rxjs/operators';


import { Colxx, Separator } from "../../components/common/CustomBootstrap";
import Breadcrumb from "../navs/Breadcrumb";
import Loading from "../pages/Spinner";


import NotificationRestService from "../../api/notificationRestService";
import { DateTimezoneService } from "../../services/DateTimezoneService";
const MySwal = withReactContent(Swal);

const NotificationItem = ({title, description, isReadByUser, isSummary, id, index, notificationDateTime}) => {

  return (
    <div className={!isReadByUser ? "unread-message d-flex flex-row mb-3 pb-3 border-bottom" : "d-flex flex-row mb-3 pb-3 border-bottom" }>
      {/* <a href="/app/pages/details">
        <img
          src={img}
          alt={title}
          className="img-thumbnail list-thumbnail xsmall border-0 rounded-circle"
        />
      </a> */}
      <div className="pl-3 pr-2 col-12">
        {isSummary &&
          <div className="row d-flex justify-content-between align-items-center mx-0">
            <p className="font-weight-bold mb-1" style={{fontSize: "20px!important"}}>{title}</p>
            <p className="row mr-2 text-muted mb-1 text-small">{notificationDateTime}</p>
          </div>
        }
        {!isSummary &&
         <div className="row d-flex justify-content-between align-items-center mx-0">
          <span className="row pl-3">
            <h5 className="font-weight-bold mb-1 mr-1">{title}</h5>{!isReadByUser && <span className="router-link pull-right ml2 p0" onClick={() => this.markOneAsRead(id, index)}>Tandai sudah dibaca</span>}
          </span>
          <p className="row mr-2 text-muted mb-1 text-small">{notificationDateTime}</p>
        </div>
        }
        <p className="row pl-3 text-muted mb-0 text-small">{description}</p>
      </div>
    </div>
  );
};

export default class Notifications extends Component {
  constructor(props) {
    super(props);
    this.notificationRest = new NotificationRestService();
    this.dateTimezone = new DateTimezoneService();
    this.handleOnPageChange = this.handleOnPageChange.bind(this);
    this.loadData = this.loadData.bind(this);
    this.iconsStatus = {
      syncProductSalesChannelerror: 'linear-gradient(132.97deg, #3FD3A7 3.3%, #40B793 100%)',
      newCodCreditinfo: 'linear-gradient(132.97deg, #FFAA60 3.3%, #FF582B 100%)',
    };


    this.state = {
      unreadUser: 0,
      table: {
        loading: true,
        data: [],
        pagination: {
          currentPage: 0,
          totalPages: 0,
          skipSize: 0,
          pageSize: 30
        }
      },
    }
  }

  componentDidMount() {
    this.loadData();
  }

  handleOnPageChange(paginationEvent) {
    const table = { ...this.state.table };
    table.loading = true;
    table.pagination.pageSize = paginationEvent.rows;
    table.pagination.skipSize = paginationEvent.first;
    table.pagination.currentPage = paginationEvent.page + 1;

    this.setState({ table }, () => {
      this.loadData();
    });
  }

  loadData() {
    const table = { ...this.state.table };
    table.loading = true;
    this.setState({ table });

    const params = {
      keyword: this.state.search || null,
      "options.take":  this.props.type === 'summary' ? 10 : this.state.table.pagination.pageSize,
      "options.skip": this.state.table.pagination.skipSize,
      "options.includeTotalCount": true
    };

    this.notificationRest.getNotifications({ params }).subscribe(
      response => {
        const table = { ...this.state.table };
        table.data = response.data.map(data => {
          const newData = this.reFormatNotif(data);
          return newData;
        });

        table.pagination.totalPages = Math.ceil(response.total / response.take);
        table.loading = false;
        this.setState({
          table,
          unreadUser: _.filter(response.data, ['isReadByUser', false]).length
        });
      },
      err => {
        if (err.response.status === 401) {
          MySwal.fire({
            type: "error",
            title: "Unauthorized.",
            toast: true,
            position: "top-end",
            timer: 2000,
            showConfirmButton: false,
            customClass: "swal-height"
          });
        } else {
          MySwal.fire({
            type: "error",
            title: "Maaf atas kesalahan tidak terduga.",
            toast: true,
            position: "top-end",
            timer: 4000,
            showConfirmButton: false,
            customClass: "swal-height"
          });
        }
      }
    );
  }

  markAllAsRead(data) {
    const notification = data || [];
    const arrayObs = [];

    for (let index = 0; index < notification.length; index++) {
      if (!notification[index].isReadByUser) {
        arrayObs.push(
          this.notificationRest.markOneAsRead(notification[index].id)
            .pipe(
              finalize(() => {}),

              tap(response => {
                this.replaceDataByIndex(index, response);
              })
            )
        );
      }
    }


    const table = { ...this.state.table };
    table.loading = true;
    this.setState({ table });

    forkJoin(arrayObs)
      .pipe(
        catchError(error => {
          return throwError(error);
        })
      ).subscribe(() => {
        const table = { ...this.state.table };
        table.loading = false;
        this.setState({ table });
      });
  }

  replaceDataByIndex(index, newData = null) {
    if (newData) {
      const table = { ...this.state.table };
      table.data = this.state.table.data.map(data => {
        data = this.reFormatNotif(newData);
        return data;
      });

      this.setState({table});
    }
  }

  reFormatNotif(data) {
    const date = moment(this.dateTimezone.convertUtctoLocalTimezone(new Date(data.notificationDateTime)));
    const type = _.camelCase(data.notificationEventType + data.notificationType);
    return {
      ...data,
      icon: type,
      isReadByUser: data.isReadByUser,
      iconStatus: data.fullImg ?  'transparent' : this.iconsStatus[type],
      notificationDateTime: this.checkingIsWithinWeek(date) ? date.fromNow() : date.format('MMM D, YYYY, H:mm:ss A'),
    };
  }

  checkingIsWithinWeek(date) {
    const aWeekOld = moment().clone().subtract(8, 'days').startOf('day');

    return moment(date).isAfter(aWeekOld);
  }

  render() {
    return (
    <div className={
      this.props.type === 'summary' ? "position-relative d-inline-block" : "col-md-12"}>
      { !this.state.table.loading && this.props.type !== 'summary' &&
      <Fragment>
        <Row>
          <Colxx xxs="12">
            <Breadcrumb heading="menu.notifications" match={this.props.match} />
            <Separator className="mb-5" />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" className="mb-4">
            <Card>
              <CardBody>
              <div className="col-md-12 text-right mb-3">
                <span className="router-link pull-right mr-3 p0" onClick={() => this.loadData()}>
                 Refresh
                </span>
                <span className="router-link pull-right ml2 p0" onClick={() => this.markAllAsRead(this.state.table.data)}>
                 Tandai semua sudah dibaca
                </span>
              </div>
              {/* <PerfectScrollbar options={{ suppressScrollX: true, wheelPropagation: false }} style={{maxHeight: '80vh'}}> */}
                {this.state.table.data.map((data, index) => {
                  return <NotificationItem key={index} {...data} />;
                })}
              {/* </PerfectScrollbar> */}
              <Paginator
                first={this.state.table.pagination.skipSize}
                rows={this.state.table.pagination.pageSize}
                totalRecords={
                  Math.ceil(this.state.table.pagination.totalPages) *
                  this.state.table.pagination.pageSize
                }
                onPageChange={this.handleOnPageChange}
              ></Paginator>
              </CardBody>
            </Card>
            </Colxx>
        </Row>
      </Fragment>
      }

      { this.props.type === 'summary' &&
        <UncontrolledDropdown className="dropdown-menu-right">
          <DropdownToggle
            className="header-icon notificationButton"
            color="empty"
          >
            <i className="simple-icon-bell" />
            <span className="count">{this.state.unreadUser}</span>
          </DropdownToggle>
            <DropdownMenu
              className="position-absolute mt-3 scroll"
              right
              id="notificationDropdown"
            >
              <div className="col-md-12 text-right mb-3">
                <span className="router-link pull-right mr-3 p0" onClick={() => this.loadData()}>
                 Refresh
                </span>
                <span className="router-link pull-right ml2 p0" onClick={() => this.markAllAsRead(this.state.table.data)}>
                 Tandai semua sudah dibaca
                </span>
              </div>
              <PerfectScrollbar
                options={{ suppressScrollX: true, wheelPropagation: false }}
              >
                {this.state.table.data.map((data, index) => {
                  return <NotificationItem key={index} {...data}  isSummary={true} index={index}/>;
                })}
              </PerfectScrollbar>
              <div className="col-md-12 text-center mt-2">
                <NavLink to="/app/notifications">
                  Lihat semua
                </NavLink>
              </div>
            </DropdownMenu>
        </UncontrolledDropdown>
      }
      {this.state.table.loading && <Loading />}
    </div>
    )
  }
};
