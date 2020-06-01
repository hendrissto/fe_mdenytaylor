import React, { Component, Fragment } from "react";
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, Row, Card, CardBody } from "reactstrap";
import PerfectScrollbar from "react-perfect-scrollbar";
import { Colxx, Separator } from "../../components/common/CustomBootstrap";
import Breadcrumb from "../navs/Breadcrumb";

import { Paginator } from "primereact/paginator";
import Swal from "sweetalert2";
import * as _ from "lodash";
import withReactContent from "sweetalert2-react-content";

import notifications from "../../data/notifications";
import NotificationRestService from "../../api/notificationRestService";

const MySwal = withReactContent(Swal);

const NotificationItem = ({ img, title, date }) => {
  return (
    <div className="d-flex flex-row mb-3 pb-3 border-bottom">
      <a href="/app/pages/details">
        <img
          src={img}
          alt={title}
          className="img-thumbnail list-thumbnail xsmall border-0 rounded-circle"
        />
      </a>
      <div className="pl-3 pr-2">
        <a href="/app/pages/details">
          <p className="font-weight-medium mb-1">{title}</p>
          <p className="text-muted mb-0 text-small">{date}</p>
        </a>
      </div>
    </div>
  );
};

export default class Notifications extends Component {
  constructor(props) {
    super(props);
    this.notificationRest = new NotificationRestService();

    this.handleOnPageChange = this.handleOnPageChange.bind(this);
    this.loadData = this.loadData.bind(this);


    this.state = {
      unreadUser: 0,
      table: {
        loading: true,
        data: [],
        pagination: {
          currentPage: 0,
          totalPages: 0,
          skipSize: 0,
          pageSize: 10
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
      "options.take": this.state.table.pagination.pageSize,
      "options.skip": this.state.table.pagination.skipSize,
      "options.includeTotalCount": true
    };

    this.notificationRest.getNotifications({ params }).subscribe(
      response => {
        const table = { ...this.state.table };
        console.log(response.data)
        table.data = response.data;

        table.pagination.totalPages = Math.ceil(response.total / response.take);
        table.loading = false;
        this.setState({
          table,
          unreadUser: _.map(response.data, ['isReadByUser', false]).length
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

  render() {
    return (
    <div className={
      this.props.type === 'summary' ? "position-relative d-inline-block" : "col-md-12"}>
      { this.props.type !== 'summary' &&
      <Fragment>
        <Row>
          <Colxx xxs="12">
            <Breadcrumb heading="menu.search" match={this.props.match} />
            <Separator className="mb-5" />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" className="mb-4">
            <Card>
              <CardBody>
              {/* <PerfectScrollbar options={{ suppressScrollX: true, wheelPropagation: false }} style={{maxHeight: '80vh'}}> */}
                {notifications.map((notification, index) => {
                  return <NotificationItem key={index} {...notification} />;
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
              <PerfectScrollbar
                options={{ suppressScrollX: true, wheelPropagation: false }}
              >
                {notifications.map((notification, index) => {
                  return <NotificationItem key={index} {...notification} />;
                })}
              </PerfectScrollbar>
            </DropdownMenu>
        </UncontrolledDropdown>
      }
    </div>
    )
  }
};
