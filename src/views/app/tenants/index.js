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
  Popover,
  PopoverBody,
} from "reactstrap";
// import { InputGroup, Button, InputGroupButtonDropdown, Input, DropdownToggle, DropdownMenu, DropdownItem, Modal, ModalHeader, ModalBody, ModalFooter, Row, Col } from 'reactstrap';
import TenantRestService from "../../../core/tenantRestService";
import IconCard from "../../../components/cards/IconCard";
import "./tenants.css";

const ReactTableFixedColumn = withFixedColumns(ReactTable);
export default class Tenant extends Component {
  constructor(props) {
    super(props);
    this.tenantRest = new TenantRestService();
    this.handleInputChange = this.handleInputChange.bind(this);
    this.loadTenantsSummmary = this.loadTenantsSummmary.bind(this);
    this.togglePopOver = this.togglePopOver.bind(this);

    this.toggle = this.toggle.bind(this);
    this.state = {
      totalSku: true,
      totalOrder: true,
      totalReceipt: true,
      totalUser: true,
      lastLoginDateUtc: true,
      joinDateUtc: true,
      siCepatCOD: true,
      siCepatMemberId: true,
      status: true,
      popoverOpen: false,
      totalTenants: 0,
      totalCODTenants: 0,
      data: [],
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
      tenantsSummary: [],
      dropdownOpen: false,
      modal: false,
      oneData: "",
      search: ""
    };
  }

  togglePopOver() {
    this.setState(prevState => ({
      popoverOpen: !prevState.popoverOpen
    }));
  }

  handleFilterChange(event) {
    const target = event.target;
    const value = target.checked;
    const name = target.name;

    this.setState({
      [name]: value
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
    this.loadTenantsSummmary();
  }

  loadTenantsSummmary() {
    this.tenantRest.getTenantsSummary().subscribe(response => {
      this.setState({ tenantsSummary: response });
    });
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
        show: false,
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
        width: 150
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
        Header: "Total SKU",
        accessor: "totalSku",
        width: 70,
        show: this.state.totalSku,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Total Order",
        accessor: "totalOrder",
        width: 80,
        show: this.state.totalOrder,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Total Receipt",
        accessor: "totalReceipt",
        width: 80,
        show: this.state.totalReceipt,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Total User",
        accessor: "totalUser",
        show: this.state.totalUser,
        Cell: props => (
          <Button
            color="link"
            className="text-primary"
            onClick={() => {
              this.toggle();
              this.setState({ oneData: props.original });
            }}
          >
            <p>{props.value}</p>
          </Button>
        )
      },
      {
        Header: "Last Login",
        accessor: "owner.lastLoginDateUtc",
        width: 150,
        show: this.state.lastLoginDateUtc,
        Cell: props => <p>{moment(props.value).format("DD-MM-YYYY HH:mm")}</p>
      },
      {
        Header: "Join Date",
        accessor: "owner.joinDateUtc",
        width: 150,
        show: this.state.joinDateUtc,
        Cell: props => <p>{moment(props.value).format("DD-MM-YYYY HH:mm")}</p>
      },
      {
        Header: "Sicepat COD",
        accessor: "siCepatCOD",
        show: this.state.siCepatCOD,
        Cell: props => <p>{props.value === false ? "Tidak Aktif" : "Aktif"}</p>
      },
      {
        Header: "ID Sicepat",
        accessor: "siCepatMemberId",
        show: this.state.siCepatMemberId,
        Cell: props => <p>{props.value === null ? "-" : props.value}</p>
      },
      {
        Header: "Status",
        accessor: "status",
        show: this.state.status,
        Cell: props => <p>{props.value === 1 ? "Aktif" : "Tidak Aktif"}</p>
      }
    ];
  }
  oneData() {
    let dataTable = [];
    const data = this.state.oneData.users;

    for (let i = 0; i < data.length; i++) {
      dataTable.push(
        <div
          style={{
            marginBottom: 10
          }}
        >
          <Row>
            <Col xs="3"> ID User </Col>
            <Col xs="1">:</Col>
            <Col> {data[i].id} </Col>
          </Row>
          <Row>
            <Col xs="3"> User Name </Col>
            <Col xs="1">:</Col>
            <Col> {data[i].fullName} </Col>
          </Row>
        </div>
      );
    }

    return dataTable;
  }

  render() {
    return (
      <Fragment>
        <Row>
          <Colxx xxs="12">
            <Breadcrumb heading="menu.tenants" match={this.props.match} />
            <Separator className="mb-5" />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <Card className="mb-12 lg-12">
              <CardBody>
                <Row>
                  <Colxx xxs="6">
                    <IconCard
                      title="Total Registered Tenants"
                      value={this.state.tenantsSummary.totalTenant}
                      className="mb-4"
                    />
                  </Colxx>
                  <Colxx xxs="6">
                    <IconCard
                      title="Total Registered COD Tenants"
                      value={this.state.tenantsSummary.totalTenantRegisteredCOD}
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
                    </InputGroup>
                  </div>
                  <div className="col-md-7">
                    <Button
                      className="float-right default"
                      id="Popover1"
                      type="button"
                      style={{
                        marginLeft: 10
                      }}
                    >
                      <i className="simple-icon-menu mr-2" />
                    </Button>
                    <Popover
                      placement="bottom"
                      isOpen={this.state.popoverOpen}
                      target="Popover1"
                      toggle={this.togglePopOver}
                    >
                      <PopoverBody>
                        <div>
                          <input
                            name="totalSku"
                            type="checkbox"
                            checked={this.state.totalSku}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Total SKU
                        </div>
                        <div>
                          <input
                            name="totalOrder"
                            type="checkbox"
                            checked={this.state.totalOrder}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Total Order
                        </div>
                        <div>
                          <input
                            name="totalReceipt"
                            type="checkbox"
                            checked={this.state.totalReceipt}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Total Receipt
                        </div>
                        <div>
                          <input
                            name="totalUser"
                            type="checkbox"
                            checked={this.state.totalUser}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Total User
                        </div>
                        <div>
                          <input
                            name="lastLoginDateUtc"
                            type="checkbox"
                            checked={this.state.lastLoginDateUtc}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Last Login
                        </div>
                        <div>
                          <input
                            name="joinDateUtc"
                            type="checkbox"
                            checked={this.state.joinDateUtc}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Join Date
                        </div>
                        <div>
                          <input
                            name="siCepatCOD"
                            type="checkbox"
                            checked={this.state.siCepatCOD}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Sicepat COD
                        </div>
                        <div>
                          <input
                            name="siCepatMemberId"
                            type="checkbox"
                            checked={this.state.siCepatMemberId}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          ID Sicepat
                        </div>
                        <div>
                          <input
                            name="status"
                            type="checkbox"
                            checked={this.state.status}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Status
                        </div>
                      </PopoverBody>
                    </Popover>
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

        {this.state.oneData && (
          <div
            style={{
              maxHeight: 580
            }}
          >
            <Modal isOpen={this.state.modal} toggle={this.toggle}>
              <ModalHeader toggle={this.toggle}>Detail User</ModalHeader>
              <ModalBody
                style={{
                  maxHeight: 380,
                  overflow: "auto"
                }}
              >
                {this.oneData()}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" outline onClick={this.toggle}>
                  Close
                </Button>
              </ModalFooter>
            </Modal>
          </div>
        )}
      </Fragment>
    );
  }
}
