import moment from "moment";
import React, { Component, Fragment } from "react";
import { Card, CardBody } from "reactstrap";
import ReactTable from "react-table";
import "react-table/react-table.css";
import withFixedColumns from "react-table-hoc-fixed-columns";
import "react-table-hoc-fixed-columns/lib/styles.css";

import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import Breadcrumb from "../../../containers/navs/Breadcrumb";
import DataTablePagination from "../../../components/DatatablePagination";
import {
  InputGroup,
  Button,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Row,
  Col,
  Collapse,
  CardFooter,
  Popover,
  PopoverHeader,
  PopoverBody
} from "reactstrap";

import TenantRestService from "../../../core/tenantRestService";
import IconCard from "../../../components/cards/IconCard";

import { Checkbox } from "primereact/checkbox";

const ReactTableFixedColumn = withFixedColumns(ReactTable);

const filterStyle = {
  marginLeft: 30,
  marginTop: 10
};
export default class Billing extends Component {
  constructor(props) {
    super(props);
    this.tenantRest = new TenantRestService();
    this.handleInputChange = this.handleInputChange.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.togglePopover = this.togglePopover.bind(this);
    this.toggle = this.toggle.bind(this);
    this.onFilterChange = this.onFilterChange.bind(this);

    this.state = {
      totalTenants: 0,
      totalCODTenants: 0,
      data: [],
      filter: [],
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
      checked: false,
      dropdownOpen: false,
      popoverOpen: false,
      collapse: false,
      modal: false,
      oneData: "",
      search: ""
    };
  }

  onFilterChange(e) {
    let selectedFilter = [...this.state.filter];

    if (e.checked) {
      selectedFilter.push(e.value);
    } else {
      selectedFilter.splice(selectedFilter.indexOf(e.value), 1);
    }

    this.setState({ filter: selectedFilter });
  }

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

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleOnPageChange(pageIndex) {
    const table = { ...this.state.table };
    table.loading = true;
    table.pagination.skipSize = pageIndex * table.pagination.pageSize;
    table.pagination.currentPage = pageIndex;

    console.log(table);

    this.setState({ table });
    this.loadData();
  }

  handleOnPageSizeChange(newPageSize, newPage) {
    const table = { ...this.state.table };
    table.loading = true;
    table.pagination.pageSize = newPageSize;
    this.setState({ table });
    this.loadData();
  }

  handleSortedChange(newSorted, column, additive) {
    console.log(newSorted);
    console.log(column);
    console.log(additive);
  }

  loadData() {
    const table = { ...this.state.table };
    table.loading = true;
    this.setState({ table });
    let total = this.state.totalCODTenants;

    const params = {
      keyword: this.state.search || null,
      "options.take": this.state.table.pagination.pageSize,
      "options.skip": this.state.table.pagination.skipSize,
      "options.includeTotalCount": true
    };

    this.tenantRest.getTenants({ params }).subscribe(response => {
      const table = { ...this.state.table };
      table.data = response.data;
      table.pagination.totalPages = response.total / table.pagination.pageSize;
      table.loading = false;
      for (let i = 0; i < response.data.length; i++) {
        if (response.data[i].siCepatCOD === true) {
          this.setState({ totalCODTenants: this.state.totalCODTenants + 1 });
        }
      }
      this.setState({ totalTenants: response.total });
      this.setState({ table });
    });
  }

  componentDidMount() {
    this.loadData();
  }

  toggle() {
    this.setState(prevState => ({
      modal: !prevState.modal
    }));
  }

  dataTable() {
    return [
      {
        Header: "ID Tenant",
        accessor: "id",
        fixed: "left",
        width: 70,
        Cell: props => (
          // <Button color="link" className="text-primary" onClick={() => {
          //   this.toggle();
          //   this.setState({ oneData: props.original });
          // }}>
          //   <p>{props.value}</p>
          // </Button>
          <p>{props.value}</p>
        )
      },
      {
        Header: "Nama Perusahaan",
        accessor: "companyInfo.name",
        fixed: "left",
        width: 120
      },
      {
        Header: "Email",
        accessor: "email",
        fixed: "left",
        width: 170,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "No Telp",
        accessor: "phone",
        fixed: "left",
        width: 140,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Package",
        accessor: "subscriptionPlan.subscriptionPlanName",
        Cell: props => <p>{props.value === null ? "-" : props.value}</p>
      },
      {
        Header: "Expired Date Free Trial",
        accessor: "owner.lastLoginDateUtc",
        width: 150,
        Cell: props => <p>{moment(props.value).format("DD-MM-YYYY HH:mm")}</p>
      },
      {
        Header: "Tanggal Mulai",
        accessor: "owner.lastLoginDateUtc",
        width: 150,
        Cell: props => <p>{moment(props.value).format("DD-MM-YYYY HH:mm")}</p>
      },
      {
        Header: "Tanggal Penagihan",
        accessor: "owner.joinDateUtc",
        width: 150,
        Cell: props => <p>{moment(props.value).format("DD-MM-YYYY HH:mm")}</p>
      },
      {
        Header: "Billing Cycle",
        accessor: "siCepatCOD",
        Cell: props => <p>{props.value === false ? "Tidak Aktif" : "Aktif"}</p>
      },
      {
        Header: "Total Penagihan",
        accessor: "siCepatMemberId",
        width: 130,
        Cell: props => <p>{props.value === null ? "-" : props.value}</p>
      },
      {
        Header: "Status",
        accessor: "status",
        width: 200,
        Cell: props => (
          <Row>
            <Button
              className="float-right default"
              color="secondary"
              style={{ marginRight: 10 }}
            >
              Upgrade
            </Button>
            <Button className="float-right default" color="secondary">
              Renew
            </Button>
          </Row>
        )
      }
    ];
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
    return (
      <Fragment>
        <Row>
          <Colxx xxs="12">
            <Breadcrumb heading="Billing" match={this.props.match} />
            <Separator className="mb-5" />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <Card className="mb-12 lg-12">
              <CardBody>
                <Row>
                  <Colxx xxs="4">
                    <IconCard
                      title="Free Trial User (Total)"
                      value={0}
                      className="mb-4"
                    />
                  </Colxx>
                  <Colxx xxs="4">
                    <IconCard
                      title="Free Trial User (7 hari lagi)"
                      value={0}
                      className="mb-4"
                    />
                  </Colxx>
                  <Colxx xxs="4">
                    <IconCard
                      title="Jumlah Stater User"
                      value={this.state.totalTenants}
                      className="mb-4"
                    />
                  </Colxx>
                </Row>
                <Row>
                  <Colxx xxs="6">
                    <IconCard
                      title="Jumlah Growing User"
                      value={0}
                      className="mb-4"
                    />
                  </Colxx>
                  <Colxx xxs="6">
                    <IconCard
                      title="Jumlah Professional User"
                      value={this.state.totalTenants}
                      className="mb-4"
                    />
                  </Colxx>
                </Row>
              </CardBody>
            </Card>
          </Colxx>
        </Row>
        <Row style={{ marginTop: 20 }}>
          <Colxx xxs="12">
            <Card className="mb-12 lg-12">
              <CardBody>
                <div className="row">
                  <div className="mb-3 col-md-5">
                    <InputGroup>
                      <Input
                        placeholder="Search Owner"
                        name="search"
                        value={this.state.search}
                        onChange={this.handleInputChange}
                        onKeyPress={event => {
                          if (event.key === "Enter") {
                            this.loadData();
                          }
                        }}
                      />
                      <Button
                        className="default"
                        color="primary"
                        onClick={() => this.loadData()}
                      >
                        <i className="simple-icon-magnifier" />
                      </Button>
                      <Button
                        className="default"
                        color="primary"
                        color="primary"
                        onClick={this.toggleCollapse}
                        style={{ marginLeft: 50, width: 100 }}
                      >
                        Filter
                      </Button>
                      <Collapse isOpen={this.state.collapse}>
                        <Card style={{ width: 1000 }}>
                          <CardBody>
                            <Row>
                              <div style={{ marginLeft: 30 }}>
                                <Button
                                  className="float-right default"
                                  color="primary"
                                  id="Popover1"
                                >
                                  Paket
                                </Button>
                                <Popover
                                  placement="bottom"
                                  isOpen={this.state.popoverOpen}
                                  target="Popover1"
                                  toggle={this.togglePopover}
                                >
                                  <PopoverBody style={{ width: 500 }}>
                                    <div style={{ marginLeft: 20 }}>
                                      <div>
                                        <Checkbox
                                          inputId="cb1"
                                          onChange={this.onFilterChange}
                                          value="Starter"
                                          checked={
                                            this.state.filter.indexOf(
                                              "Starter"
                                            ) !== -1
                                          }
                                        ></Checkbox>
                                        <label
                                          htmlFor="cb1"
                                          className="p-checkbox-label"
                                        >
                                          Starter
                                        </label>
                                      </div>
                                      <div>
                                        <Checkbox
                                          inputId="cb2"
                                          onChange={this.onFilterChange}
                                          value="Growing"
                                          checked={
                                            this.state.filter.indexOf(
                                              "Growing"
                                            ) !== -1
                                          }
                                        ></Checkbox>
                                        <label
                                          htmlFor="cb2"
                                          className="p-checkbox-label"
                                        >
                                          Growing
                                        </label>
                                      </div>
                                      <div>
                                        <Checkbox
                                          inputId="cb3"
                                          onChange={this.onFilterChange}
                                          value="Professional"
                                          checked={
                                            this.state.filter.indexOf(
                                              "Professional"
                                            ) !== -1
                                          }
                                        ></Checkbox>
                                        <label
                                          htmlFor="cb3"
                                          className="p-checkbox-label"
                                        >
                                          Professional
                                        </label>
                                      </div>
                                      <div>
                                        <Checkbox
                                          inputId="cb4"
                                          onChange={this.onFilterChange}
                                          value="Enterprise"
                                          checked={
                                            this.state.filter.indexOf(
                                              "Enterprise"
                                            ) !== -1
                                          }
                                        ></Checkbox>
                                        <label
                                          htmlFor="cb4"
                                          className="p-checkbox-label"
                                        >
                                          Enterprise
                                        </label>
                                      </div>
                                    </div>
                                  </PopoverBody>
                                </Popover>
                              </div>
                              <div style={filterStyle}>
                                <Checkbox
                                  inputId="cb5"
                                  value="7 Hari Sebelum"
                                  onChange={this.onFilterChange}
                                  checked={
                                    this.state.filter.indexOf("7 Hari Sebelum") !== -1
                                  }
                                ></Checkbox>
                                <label
                                  htmlFor="cb5"
                                  className="p-checkbox-label"
                                >
                                  7 Hari Sebelum
                                </label>
                              </div>
                              <div style={filterStyle}>
                                <Checkbox
                                  inputId="cb6"
                                  value="3 Hari Sebelum"
                                  onChange={this.onFilterChange}
                                  checked={
                                    this.state.filter.indexOf("3 Hari Sebelum") !== -1
                                  }
                                ></Checkbox>
                                <label
                                  htmlFor="cb6"
                                  className="p-checkbox-label"
                                >
                                  3 Hari Sebelum
                                </label>
                              </div>
                              <div style={filterStyle}>
                                <Checkbox
                                  inputId="cb7"
                                  value="1 Hari Sebelum"
                                  onChange={this.onFilterChange}
                                  checked={
                                    this.state.filter.indexOf("1 Hari Sebelum") !== -1
                                  }
                                ></Checkbox>
                                <label
                                  htmlFor="cb7"
                                  className="p-checkbox-label"
                                >
                                  1 Hari Sebelum
                                </label>
                              </div>
                              <div style={filterStyle}>
                                <Checkbox
                                  inputId="cb8"
                                  value="3 Hari Setelah Jatuh Tempo"
                                  onChange={this.onFilterChange}
                                  checked={
                                    this.state.filter.indexOf("3 Hari Setelah Jatuh Tempo") !== -1
                                  }
                                ></Checkbox>
                                <label
                                  htmlFor="cb8"
                                  className="p-checkbox-label"
                                >
                                  3 Hari Setelah Jatuh Tempo
                                </label>
                              </div>
                            </Row>
                          </CardBody>
                          <CardFooter>
                            <Button
                              className="float-right default"
                              color="primary"
                            >
                              Apply
                            </Button>
                          </CardFooter>
                        </Card>
                      </Collapse>
                    </InputGroup>
                  </div>
                </div>

                <ReactTableFixedColumn
                  page={this.state.table.pagination.currentPage}
                  PaginationComponent={DataTablePagination}
                  data={this.state.table.data}
                  pages={this.state.table.pagination.totalPages}
                  columns={this.dataTable()}
                  defaultPageSize={this.state.table.pagination.pageSize}
                  className="-striped"
                  loading={this.state.table.loading}
                  showPagination={true}
                  showPaginationTop={false}
                  showPaginationBottom={true}
                  pageSizeOptions={[5, 10, 20, 25, 50, 100]}
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
              </CardBody>
            </Card>
          </Colxx>
        </Row>

        <Modal
          isOpen={this.state.modal}
          toggle={this.toggle}
          className={this.props.className}
        >
          <ModalHeader toggle={this.toggle}>Detail Resi COD</ModalHeader>
          <ModalBody>{this.oneData()}</ModalBody>
          <ModalFooter>
            <Button color="primary" outline onClick={this.toggle}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </Fragment>
    );
  }
}
