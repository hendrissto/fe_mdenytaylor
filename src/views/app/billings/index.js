import moment from "moment";
import "moment/locale/id";
import { NavLink, Redirect } from "react-router-dom";
import React, { Component, Fragment } from "react";
import { Card, CardBody } from "reactstrap";
import ReactTable from "react-table";
import "react-table/react-table.css";
import withFixedColumns from "react-table-hoc-fixed-columns";
import "react-table-hoc-fixed-columns/lib/styles.css";
import { Paginator } from "primereact/paginator";

import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import Breadcrumb from "../../../containers/navs/Breadcrumb";
// import DataTablePagination from "../../../components/DatatablePagination";
import {
  InputGroup,
  Button,
  Input,
  // Modal,
  // ModalHeader,
  // ModalBody,
  // ModalFooter,
  Row,
  Col,
  Collapse,
  CardFooter,
  UncontrolledPopover,
  // Popover,
  // PopoverHeader,
  PopoverBody,
  // Dropdown,
  // DropdownToggle,
  // DropdownItem,
  // DropdownMenu,
  // ButtonDropdown
} from "reactstrap";

import BillingRestService from "../../../core/billingRestService";
import IconCard from "../../../components/cards/IconCard";
import { MoneyFormat } from "../../../services/Format/MoneyFormat";

// import { Checkbox } from "primereact/checkbox";
// import { Dropdown } from "primereact/dropdown";
// import { Calendar } from "primereact/calendar";
import "./style.scss";

const ReactTableFixedColumn = withFixedColumns(ReactTable);

const filterStyle = {
  marginLeft: 30,
  marginTop: 10
};

const filterColumnsStyle = {
  marginBottom: 7
};

export default class Billing extends Component {
  constructor(props) {
    super(props);
    this.billingRest = new BillingRestService();
    this.moneyFormat = new MoneyFormat();
    this.loadData = this.loadData.bind(this);
    this.loadRelatedData = this.loadRelatedData.bind(this);
    this.loadDetailTenant = this.loadDetailTenant.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.togglePopover = this.togglePopover.bind(this);
    this.toggle = this.toggle.bind(this);
    this.toggleRenew = this.toggleRenew.bind(this);
    this.toggleUpgrade = this.toggleUpgrade.bind(this);
    this.togglePopoverColumns = this.togglePopoverColumns.bind(this);
    this.onPackageChange = this.onPackageChange.bind(this);
    this.onBillingCycleChange = this.onBillingCycleChange.bind(this);
    this.onBillingCycleChange2 = this.onBillingCycleChange2.bind(this);
    this.loadTenantsSubscriptionsSummary = this.loadTenantsSubscriptionsSummary.bind(
      this
    );

    let today = new Date();
    today.setDate(today.getDate() - 1);

    let today2 = new Date();
    today2.setDate(today2.getDate() - 1);

    this.state = {
      dropdownBasicOpen: false,
      dayBefore: 0,
      dayAfter: 0,
      tableFilter: {
        subscriptionPlanName: true,
        freeTrialEndDate: true,
        billingPeriodStartDate: true,
        billingPeriodEndDate: true,
        billingCycle: true,
        billingAmount: true,
        maxUser: true,
        maxProducts: true,
      },
      totalTenants: 0,
      totalCODTenants: 0,
      data: [],
      filter: [],
      filterColumns: [],
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
      tenantsSubscriptionsSummary: [],
      subscriptionPlanData: [],
      package: [],
      checked: false,
      dropdownOpen: false,
      popoverOpen: false,
      popoverColumns: false,
      collapse: false,
      search: "",
      date: null,
      date2: null,
      invalidDates: [today],
      invalidDates2: [today],
      redirect: null,
      subscriptionPlan: null,
      freeTrial: false,
      freeTrialWeekBeforeExp: false,
      packageFilter: ""
    };
  }

  toggleBasic = () => {
    this.setState(prevState => ({
      dropdownBasicOpen: !prevState.dropdownBasicOpen
    }));
  };

  toggleCollapse() {
    this.setState({
      collapse: !this.state.collapse
    });
  }

  togglePopover() {
    this.setState({
      popoverOpen: !this.state.popoverOpen
    });
  }

  togglePopoverColumns = () => {
    this.setState(prevState => ({
      popoverColumns: !prevState.popoverColumns
    }));
  };

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleOnPageChange = paginationEvent => {
    const table = { ...this.state.table };
    table.loading = true;
    table.pagination.pageSize = paginationEvent.rows;
    table.pagination.skipSize = paginationEvent.first;
    table.pagination.currentPage = paginationEvent.page + 1;

    this.setState({ table }, () => {
      this.loadData();
    });
  };

  handleSortedChange(newSorted, column, additive) {
    console.log(newSorted);
    console.log(column);
    console.log(additive);
  }

  onPackageChange(e) {
    this.setState({ package: e.value });
  }

  onBillingCycleChange(e) {
    this.setState({ billingCycle: e.value });
  }

  onBillingCycleChange2(e) {
    this.setState({ billingCycle2: e.value });
  }

  loadData() {
    const table = { ...this.state.table };
    table.loading = true;
    this.setState({ table });

    const params = {
      keyword: this.state.search || null,
      subscriptionPlan: this.state.packageFilter || null,
      freeTrial: this.state.freeTrial || null,
      freeTrialWeekBeforeExp: this.state.freeTrialWeekBeforeExp || null,
      daysBeforeExpDate:
        this.state.dayBefore === 0 ? null : this.state.dayBefore,
      "options.take": this.state.table.pagination.pageSize,
      "options.skip": this.state.table.pagination.skipSize,
      "options.includeTotalCount": true
    };

    this.billingRest.getTenantsSubscriptions({ params }).subscribe(
      response => {
        const table = { ...this.state.table };
        table.data = response.data;
        table.pagination.totalPages = Math.ceil(response.total / response.take);
        table.loading = false;

        this.setState({ table });
      },
      error => {
        this.setState({ redirect: true });
      }
    );
    this.setState({
      freeTrial: false,
      freeTrialWeekBeforeExp: false,
      dayAfter: 0,
      dayBefore: 0
    });
  }

  componentDidMount() {
    let tableFilter = { ...this.state.tableFilter };
    const date = new Date();
    this.setState({ date: date, date2: date });

    this.loadData(null);
    this.loadTenantsSubscriptionsSummary();

    if (JSON.parse(localStorage.getItem("filter")) === null) {
      localStorage.setItem("filter", JSON.stringify(this.state.tableFilter));
    }
    tableFilter = JSON.parse(localStorage.getItem("filter"));
    this.setState({
      tableFilter: tableFilter
    });
  }

  handleFilterChange(event) {
    const tableFilter = { ...this.state.tableFilter };
    const target = event.target;
    const value = target.checked;
    const name = target.name;
    tableFilter[name] = value;
    this.setState({
      tableFilter: tableFilter
    });

    localStorage.setItem("filter", JSON.stringify(tableFilter));
  }

  handleFilterDayChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    const day = value.substr(1);
    if (parseInt(value) < 0) {
      this.setState({
        dayAfter: 0,
        dayBefore: parseInt(day)
      });
    } else {
      this.setState({
        dayBefore: 0,
        dayAfter: parseInt(value)
      });
    }
  }

  loadTenantsSubscriptionsSummary() {
    this.billingRest.getTenantsSubscriptionsSummary().subscribe(response => {
      this.setState({ tenantsSubscriptionsSummary: response });
    });
  }

  toggle() {
    this.setState(prevState => ({
      modal: false
    }));
  }

  toggleRenew() {
    this.setState(prevState => ({
      renewModal: false
    }));
  }

  toggleUpgrade() {
    this.setState(prevState => ({
      upgradeModal: false
    }));
  }

  dataTable() {
    moment.locale("id");
    const tableFilter = { ...this.state.tableFilter };
    return [
      {
        Header: "ID Tenant",
        accessor: "tenantId",
        fixed: "left",
        width: 70,
        show: false,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Nama Perusahaan",
        accessor: "companyInfo.name",
        fixed: "left",
        width: 150
      },
      {
        Header: "Email",
        accessor: "companyInfo.email",
        fixed: "left",
        width: 170,
        Cell: props => <p>{props.value === null ? "-" : props.value}</p>
      },
      {
        Header: "No Telp",
        accessor: "companyInfo.phone",
        fixed: "left",
        width: 140,
        Cell: props => <p>{props.value === null ? "-" : props.value}</p>
      },
      {
        Header: "Package",
        accessor: "subscriptionPlanName",
        show: tableFilter.subscriptionPlanName,
        Cell: props => <p>{props.value === null ? "-" : props.value}</p>
      },
      {
        Header: "Total Product",
        accessor: "subscriptionPlanName",
        show: tableFilter.maxProducts,
        Cell: props => (
          <p>
            {props.original.totalProducts}
            {' '} / {' '}
            {props.original.maxNumOfProducts === null ? '∞' : props.original.maxNumOfProducts}
          </p>
        )
      },
      {
        Header: "Total User",
        accessor: "subscriptionPlanName",
        show: tableFilter.maxUser,
        Cell: props => (
          <p>
            {props.original.totalUsers}
            {' '} / {' '}
            {props.original.maxNumOfUsers === null ? '∞' : props.original.maxNumOfUsers}
          </p>
        )
      },
      {
        Header: "Expired Date Free Trial",
        accessor: "freeTrialEndDate",
        width: 150,
        show: tableFilter.freeTrialEndDate,
        Cell: props => (
          <p>{props.value === null ? "-" : moment(props.value).format("LL")}</p>
        )
      },
      {
        Header: "Tanggal Mulai",
        accessor: "billingPeriodStartDate",
        width: 150,
        show: tableFilter.billingPeriodStartDate,
        Cell: props => (
          <p>{props.value === null ? "-" : moment(props.value).format("LL")}</p>
        )
      },
      {
        Header: "Tanggal Penagihan",
        accessor: "billingPeriodEndDate",
        width: 150,
        show: tableFilter.billingPeriodEndDate,
        Cell: props => (
          <p>{props.value === null ? "-" : moment(props.value).format("LL")}</p>
        )
      },
      {
        Header: "Billing Cycle",
        accessor: "billingCycle",
        show: tableFilter.billingCycle,
        Cell: props => <p>{props.value === null ? "-" : props.value}</p>
      },
      {
        Header: "Total Penagihan",
        accessor: "billingAmount",
        width: 130,
        show: tableFilter.billingAmount,
        Cell: props => <p>{props.value === null ? "-" : props.value}</p>
      },
      {
        Header: <p style={{textAlign: "center"}}>Actions</p>,
        accessor: "status",
        width: 220,
        style: {paddingLeft: 20},
        fixed: "right",
        show: true,
        Cell: props => (
          <Row>
            <NavLink to={`billings/upgrade/${props.original.tenantId}`}>
              <Button
                className="float-right default"
                color="secondary"
                style={{ marginRight: 10, marginLeft: 10, borderRadius: 6 }}
              >
                Upgrade
              </Button>
            </NavLink>
            <NavLink to={`billings/renew/${props.original.tenantId}`}>
              <Button
                className="float-right default"
                color="secondary"
                style={{ borderRadius: 6 }}
              >
                Renew
              </Button>
            </NavLink>
          </Row>
        )
      }
    ];
  }

  loadRelatedData() {
    this.billingRest.getRelatedData({}).subscribe(response => {
      this.setState({
        subscriptionPlanData: response.subscriptionPlan,
        upgradeModal: true
      });
    });
  }

  loadDetailTenant(id) {
    this.billingRest.getTenantsSubscriptionsById(id, {}).subscribe(response => {
      console.log(response);
    });
  }

  _renderPrice() {
    const selectedPackage = this.state.package;
    const billingCycle = this.state.billingCycle;
    let price;
    if (selectedPackage.length !== [] && billingCycle !== undefined) {
      let code = billingCycle.code;
      if (code == 1) {
        console.log(selectedPackage.monthlyPrice);
        price = selectedPackage.monthlyPrice;
      } else if (code == 3) {
        console.log(selectedPackage.quaterlyPrice);
        price = selectedPackage.quaterlyPrice;
      } else if (code == 6) {
        console.log(selectedPackage.semesterlyPrice);
        price = selectedPackage.semesterlyPrice;
      } else if (code == 12) {
        console.log(selectedPackage.yearlyPrice);
        price = selectedPackage.yearlyPrice;
      } else {
        price = 0;
      }
    } else {
      price = 0;
    }
    return price;
  }

  oneData() {
    return (
      <div>
        <Row>
          <Col xs="3"> No. Receipt </Col>
          <Col xs="1">:</Col>
          <Col> {this.state.oneData.receiptNumber} </Col>
        </Row>
        <Row>
          <Col xs="3"> Sender </Col>
          <Col xs="1">:</Col>
          <Col> {this.state.oneData.sender} </Col>
        </Row>
        <Row>
          <Col xs="3"> Receiver </Col>
          <Col xs="1">:</Col>
          <Col> {this.state.oneData.receiver} </Col>
        </Row>
        <Row>
          <Col xs="3"> Total </Col>
          <Col xs="1">:</Col>
          <Col> {this.state.oneData.amount} </Col>
        </Row>
        <Row>
          <Col xs="3"> Status </Col>
          <Col xs="1">:</Col>
          <Col> {this.state.oneData.status} </Col>
        </Row>
      </div>
    );
  }

  render() {
    const tableFilter = { ...this.state.tableFilter };
    if (this.state.redirect === true) {
      this.setState({ redirect: false });
      return <Redirect to="/user/login" />;
    }
    if (this.state.freeTrial || this.state.freeTrialWeekBeforeExp) {
      this.loadData();
    }
    return (
      <Fragment>
        <Row>
          <Colxx xxs="12">
            <Breadcrumb heading="Subscription" match={this.props.match} />
            <Separator className="mb-5" />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <Card
              className="mb-12 lg-12"
              style={{
                borderRadius: 10
              }}
            >
              <CardBody
                style={{
                  minHeight: 290
                }}
              >
                <Row
                  style={{
                    minHeight: 70
                  }}
                >
                  <div
                    className="col-12 col-md-4 hover"
                    onClick={() => {
                      this.setState({ freeTrial: true });
                    }}
                  >
                    <IconCard
                      title="Free Trial Tenant (Total)"
                      value={
                        this.state.tenantsSubscriptionsSummary.totalFreeTrial
                      }
                      className="mb-4"
                    />
                  </div>
                  <div
                    className="col-12 col-md-4 hover"
                    onClick={() => {
                      this.setState({ freeTrialWeekBeforeExp: true });
                    }}
                  >
                    <IconCard
                      title="Free Trial Tenant (7 hari lagi)"
                      value={
                        this.state.tenantsSubscriptionsSummary
                          .totalFreeTrialNearlyExp
                      }
                      className="mb-4"
                    />
                  </div>
                  <div
                    className="col-12 col-md-4 hover"
                    onClick={() => {
                      const table = { ...this.state.table };

                      table.pagination.skipSize = 0;
                      this.setState({ packageFilter: "starter", table }, () => {
                        this.loadData();
                      });
                    }}
                  >
                    <IconCard
                      title="Jumlah Starter Tenant"
                      value={
                        this.state.tenantsSubscriptionsSummary.totalStarter
                      }
                      className="mb-4"
                    />
                  </div>
                </Row>
                <Row>
                  <div
                    className="col-12 col-md-4 hover"
                    onClick={() => {
                      const table = { ...this.state.table };

                      table.pagination.skipSize = 0;
                      this.setState({ packageFilter: "growing", table }, () => {
                        this.loadData();
                      });
                    }}
                  >
                    <IconCard
                      title="Jumlah Growing Tenant"
                      value={
                        this.state.tenantsSubscriptionsSummary.totalGrowing
                      }
                      className="mb-4"
                    />
                  </div>
                  <div
                    className="col-12 col-md-4 hover"
                    onClick={() => {
                      const table = { ...this.state.table };

                      table.pagination.skipSize = 0;
                      this.setState(
                        { packageFilter: "professional", table },
                        () => {
                          this.loadData();
                        }
                      );
                    }}
                  >
                    <IconCard
                      title="Jumlah Professional Tenant"
                      value={
                        this.state.tenantsSubscriptionsSummary.totalProfessional
                      }
                      className="mb-4"
                    />
                  </div>
                  <div
                    className="col-12 col-md-4 hover"
                    onClick={() => {
                      const table = { ...this.state.table };

                      table.pagination.skipSize = 0;
                      this.setState(
                        { packageFilter: "enterprise", table },
                        () => {
                          this.loadData();
                        }
                      );
                    }}
                  >
                    <IconCard
                      title="Jumlah Enterprise Tenant"
                      value={
                        this.state.tenantsSubscriptionsSummary.totalEnterprise
                      }
                      className="mb-4"
                    />
                  </div>
                </Row>
              </CardBody>
            </Card>
          </Colxx>
        </Row>
        <Row style={{ marginTop: 20 }}>
          <Colxx xxs="12">
            <Card
              className="mb-12 lg-12"
              style={{
                borderRadius: 10
              }}
            >
              <CardBody>
                <div className="row">
                  <div className="mb-3 col-md-5">
                    <InputGroup>
                      <Input
                        placeholder="Search..."
                        name="search"
                        value={this.state.search}
                        onChange={this.handleInputChange}
                        onKeyPress={event => {
                          if (event.key === "Enter") {
                            this.loadData();
                          }
                        }}
                        style={{
                          borderRadius: "6px 0px 0px 6px"
                        }}
                      />
                      <Button
                        className="default"
                        color="primary"
                        onClick={() => this.loadData()}
                        style={{
                          borderRadius: "0px 6px 6px 0px"
                        }}
                      >
                        <i className="simple-icon-magnifier" />
                      </Button>
                      <Button
                        className="default"
                        color="primary"
                        color="primary"
                        onClick={this.toggleCollapse}
                        style={{ marginLeft: 50, width: 100, borderRadius: 6 }}
                      >
                        Filter
                      </Button>
                      <Collapse isOpen={this.state.collapse}>
                        <Card style={{ width: 1000 }}>
                          <CardBody>
                            Sisa Waktu Berlangganan
                            <div
                              onChange={this.handleFilterDayChange.bind(this)}
                            >
                              <Row>
                                <div style={filterStyle}>
                                  <input
                                    name="dayBefore"
                                    value="-7"
                                    type="radio"
                                  />
                                  7 Hari
                                </div>
                                <div style={filterStyle}>
                                  <input
                                    name="dayBefore"
                                    value="-3"
                                    type="radio"
                                  />
                                  3 Hari
                                </div>
                                <div style={filterStyle}>
                                  <input
                                    name="dayBefore"
                                    value="-1"
                                    type="radio"
                                  />
                                  1 Hari
                                </div>
                                {/*
                                <div style={filterStyle}>
                                  <input
                                    name="dayBefore"
                                    value="+3"
                                    type="radio"
                                  />
                                  3 Hari Setelah Jatuh Tempo
                                </div>
                                 */}
                              </Row>
                            </div>
                          </CardBody>
                          <CardFooter>
                            <Button
                              className="float-right default"
                              color="primary"
                              onClick={() => {
                                this.loadData();
                                this.setState({ collapse: false });
                              }}
                              style={{ borderRadius: 6 }}
                            >
                              Apply
                            </Button>
                          </CardFooter>
                        </Card>
                      </Collapse>
                    </InputGroup>
                  </div>

                  <div>
                    <Button
                      className="float-right default"
                      color="primary"
                      // onClick={this.toggleCollapse}
                      id="Popover2"
                      style={{
                        borderRadius: 6
                      }}
                    >
                      <i className="simple-icon-menu" />
                    </Button>
                    <UncontrolledPopover
                      trigger="legacy"
                      placement="bottom"
                      isOpen={this.state.popoverColumns}
                      target="Popover2"
                      toggle={this.togglePopoverColumns}
                    >
                      <PopoverBody>
                        <div>
                          <input
                            name="subscriptionPlanName"
                            type="checkbox"
                            checked={tableFilter.subscriptionPlanName}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Package
                        </div>
                        <div>
                          <input
                            name="maxProducts"
                            type="checkbox"
                            checked={tableFilter.maxProducts}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Total Product
                        </div>
                        <div>
                          <input
                            name="maxUser"
                            type="checkbox"
                            checked={tableFilter.maxUser}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Total User
                        </div>
                        <div>
                          <input
                            name="freeTrialEndDate"
                            type="checkbox"
                            checked={tableFilter.freeTrialEndDate}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Expired Date Free Trial
                        </div>
                        <div>
                          <input
                            name="billingPeriodStartDate"
                            type="checkbox"
                            checked={tableFilter.billingPeriodStartDate}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Tanggal Mulai
                        </div>
                        <div>
                          <input
                            name="billingPeriodEndDate"
                            type="checkbox"
                            checked={tableFilter.billingPeriodEndDate}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Tanggal Penagihan
                        </div>
                        <div>
                          <input
                            name="billingCycle"
                            type="checkbox"
                            checked={tableFilter.billingCycle}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Billing Cycle
                        </div>
                        <div>
                          <input
                            name="billingAmount"
                            type="checkbox"
                            checked={tableFilter.billingAmount}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Total Penagihan
                        </div>
                      </PopoverBody>
                    </UncontrolledPopover>
                    <Button
                      className="float-right default"
                      color="primary"
                      onClick={() => {
                        const table = { ...this.state.table };

                        table.pagination.skipSize = 0;
                        this.setState({ packageFilter: "", search: "" }, () => {
                          this.loadData();
                        });
                        this.setState({ collapse: false });
                      }}
                      style={{
                        marginRight: 10,
                        borderRadius: 6
                      }}
                    >
                      <i className="simple-icon-refresh" />
                    </Button>
                  </div>
                </div>

                <ReactTableFixedColumn
                  minRows={0}
                  showPagination={false}
                  showPaginationTop={false}
                  showPaginationBottom={false}
                  data={this.state.table.data}
                  columns={this.dataTable()}
                  noDataText={"Data tidak ditemukan"}
                  className="-striped"
                  loading={this.state.table.loading}
                  manual // this would indicate that server side pagination has been enabled
                  onFetchData={(state, instance) => {
                    const newState = { ...this.state.table };

                    newState.pagination.currentPage = state.page;
                    newState.pagination.pageSize = state.pageSize;
                    newState.pagination.skipSize = state.pageSize * state.page;
                    this.setState({ newState });
                    this.loadData();
                  }}
                />
                <Paginator
                  first={this.state.table.pagination.skipSize}
                  rows={this.state.table.pagination.pageSize}
                  totalRecords={
                    Math.ceil(this.state.table.pagination.totalPages) *
                    this.state.table.pagination.pageSize
                  }
                  onPageChange={this.handleOnPageChange}
                />
              </CardBody>
            </Card>
          </Colxx>
        </Row>
      </Fragment>
    );
  }
}
