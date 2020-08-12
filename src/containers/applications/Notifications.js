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

var OneSignal = window.OneSignal;
export default class Notifications extends Component {
  interval;
  constructor(props) {
    super(props);
    this.notificationRest = new NotificationRestService();
    this.dateTimezone = new DateTimezoneService();
    this.handleOnPageChange = this.handleOnPageChange.bind(this);
    this.loadData = this.loadData.bind(this);
    this.markOneAsRead = this.markOneAsRead.bind(this);
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
    // this.interval = setInterval(() => {
    //   console.log('HALLO')
    //   this.loadData()
    // }, 60000); // reload in 60 seconds
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
    console.log(this.props.type)
    const params = {
      keyword: this.state.search || null,
      "take":  this.props.type === 'summary' ? 10 : this.state.table.pagination.pageSize,
      "skip": this.state.table.pagination.skipSize,
      "includeTotalCount": true
    };

    this.notificationRest.getNotifications(params).subscribe(
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

    if(arrayObs.length) {
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

  }

  markOneAsRead(notification, index) {
    if (notification.isReadByUser) {
      return;
    }

    const table = { ...this.state.table };
    table.loading = true;
    this.setState({ table });
    return this.notificationRest.markOneAsRead(notification.id)
    .pipe(
      catchError(error => {
        return throwError(error);
      })
    ).subscribe(response => {
      table.loading = false;
      this.setState({ table });
      this.replaceDataByIndex(index, response);
    });
  }

  replaceDataByIndex(index, newData = null) {
    if (newData) {
      const table = { ...this.state.table };
      table.data[index] = this.reFormatNotif(newData);
      console.log(_.filter(this.state.table.data, ['isReadByUser', false]).length)
      console.log(this.state.table.data)
      this.setState({
        table,
        unreadUser: _.filter(this.state.table.data, ['isReadByUser', false]).length
      });
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
    <div className={this.props.type === 'summary' ? "position-relative d-inline-block" : "col-md-12"}>
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
                <span className="router-link pull-right p0" onClick={() => this.markAllAsRead(this.state.table.data)}>
                 Tandai semua sudah dibaca
                </span>
                <span className="router-link pull-right ml-3 p0" onClick={() => this.loadData()}>
                 Refresh
                </span>
              </div>
                  {this.state.table.data.map((data, index) => {
                    return <div key={index} index={index} className={!data.isReadByUser ? "unread-message d-flex flex-row mb-3 pb-3 border-bottom" : "d-flex flex-row mb-3 pb-3 border-bottom" } style={{width: '100%'}}>
                      {/* <a href="/app/pages/details">
                        <img
                          src={img}
                          alt={data.title}
                          className="img-thumbnail list-thumbnail xsmall border-0 rounded-circle"
                        />
                      </a> */}
                      <div className="pl-3 pr-2 col-12">
                        {this.props.type !== 'summary' &&
                        <div className="row d-flex justify-content-between align-items-center mx-0">
                          <span className="row pl-3">
                            <h5 className="font-weight-bold mb-1 mr-1">{data.title}</h5>{!data.isReadByUser && <span className="router-link pull-right ml2 p0" onClick={() => this.markOneAsRead(data, index)}>Tandai sudah dibaca</span>}
                          </span>
                          <p className="row mr-2 text-muted mb-1 text-small">{data.notificationDateTime}</p>
                        </div>
                        }
                        <p className="row pl-3 text-muted mb-0 text-small">{data.description}</p>
                      </div>
                    </div>
                  // return <NotificationItem key={index} {...data}  isSummary={true} index={index}/>;
                  })}

                { (!this.state.table.loading && !this.state.table.data.length) &&
                  <div className="col-md-12 text-center mt-2">
                      Belum ada Data
                  </div>
                }
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
      {this.state.table.loading && this.props.type !== 'summary' && <Loading />}

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
                <span className="router-link pull-right p0" onClick={() => this.markAllAsRead(this.state.table.data)}>
                 Tandai semua sudah dibaca
                </span>
                <span className="router-link pull-right ml-3 p0" onClick={() => this.loadData()}>
                 Refresh
                </span>
              </div>


              <div className="container-content">
                { this.state.table.loading &&
                  <div class="loader-cstm"></div>
                }

                { !this.state.table.loading &&
                  <PerfectScrollbar
                    style={{width: '100%', paddingTop:'10px'}}
                    options={{ suppressScrollX: true, wheelPropagation: false }}
                  >
                    {this.state.table.data.map((data, index) => {
                      return <div key={index} index={index} className={!data.isReadByUser ? "unread-message d-flex flex-row mb-3 pb-3 border-bottom" : "d-flex flex-row mb-3 pb-3 border-bottom" } style={{ width: "100%" }}>
                        {/* <a href="/app/pages/details">
                          <img
                            src={img}
                            alt={data.title}
                            className="img-thumbnail list-thumbnail xsmall border-0 rounded-circle"
                          />
                        </a> */}
                        <div className="pl-3 pr-2 col-12">
                          <div className="row d-flex justify-content-between align-items-center mx-0">
                            <p className="font-weight-bold mb-1" style={{fontSize: "20px!important"}}>{data.title}</p>
                            <p className="row mr-2 text-muted mb-1 text-small">{data.notificationDateTime}</p>
                          </div>
                          <p className="row pl-3 text-muted mb-0 text-small">{data.description}</p>
                        </div>
                      </div>
                      // return <NotificationItem key={index} {...data}  isSummary={true} index={index}/>;
                    })}
                  </PerfectScrollbar>
                }
              </div>
                { (!this.state.table.loading && !this.state.table.data.length) &&
                  <div className="col-md-12 text-center mt-2">
                      Belum ada Data
                  </div>
                }

              <div className="col-md-12 text-center mt-2">
                <NavLink to="/app/notifications">
                  Lihat semua
                </NavLink>
              </div>
            </DropdownMenu>
        </UncontrolledDropdown>
      }
    </div>
    )
  }
};
