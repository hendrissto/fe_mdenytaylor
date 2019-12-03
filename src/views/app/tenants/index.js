import moment from "moment";
import "moment/locale/id";
import { Redirect } from "react-router-dom";
import React, { Component, Fragment } from "react";
import { Card, CardBody } from "reactstrap";
import ReactTable from "react-table";
import "react-table/react-table.css";
import withFixedColumns from "react-table-hoc-fixed-columns";
import "react-table-hoc-fixed-columns/lib/styles.css";
import { Paginator } from "primereact/paginator";
import ExportTenants from "../../../core/export/ExportTenants";

import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import Breadcrumb from "../../../containers/navs/Breadcrumb";
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
  UncontrolledPopover,
  PopoverBody,
  CustomInput
} from "reactstrap";
import TenantRestService from "../../../api/tenantRestService";
import Spinner from "../../../containers/pages/Spinner";
import IconCard from "../../../components/cards/IconCard";
import "./tenants.css";

import Switch from "rc-switch";
import "rc-switch/assets/index.css";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
const MySwal = withReactContent(Swal);

const ReactTableFixedColumn = withFixedColumns(ReactTable);

export default class Tenant extends Component {
  constructor(props) {
    super(props);
    this.tenantRest = new TenantRestService();
    this.exportService = new ExportTenants();
    this.handleInputChange = this.handleInputChange.bind(this);
    this.loadTenantsSummmary = this.loadTenantsSummmary.bind(this);
    this.togglePopOver = this.togglePopOver.bind(this);
    this.editStatusCOD = this.editStatusCOD.bind(this);
    this.toggleFilterPopOver = this.toggleFilterPopOver.bind(this);
    this.toggle = this.toggle.bind(this);
    this.exportData = this.exportData.bind(this);
    this.loadAllData = this.loadAllData.bind(this);

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
      isRealColumn: true,
      popoverOpen: false,
      filterPopover: false,
      totalTenants: 0,
      totalCODTenants: 0,
      data: [],
      table: {
        loading: true,
        data: [],
        sort: null,
        pagination: {
          currentPage: 0,
          totalPages: 0,
          skipSize: 0,
          pageSize: 10
        }
      },
      allData: null,
      tenantsSummary: [],
      dropdownOpen: false,
      modal: false,
      oneData: "",
      search: "",
      redirect: false,
      loading: false,
      error: false,
      errorMessage: null,
      isReal: true,
      isCod: "",
      filterIsReal: true,
      totalData: 0
    };
  }

  togglePopOver() {
    this.setState(prevState => ({
      popoverOpen: !prevState.popoverOpen
    }));
  }

  toggleFilterPopOver() {
    this.setState(prevState => ({
      filterPopover: !prevState.filterPopover
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

  handleOnPageSizeChange(newPageSize, newPage) {
    const table = { ...this.state.table };
    table.loading = true;
    table.pagination.pageSize = newPageSize;
    this.setState({ table });
    this.loadData();
  }

  handleSortedChange(newSorted, column, additive) {
    const sort = [];
    sort.push({
      field: newSorted[0].id,
      dir: newSorted[0].desc === true ? "desc" : "asc"
    });
    // this.setState({sort: sort}, () => {
    //   this.loadData()
    // })
  }

  loadData() {
    const table = { ...this.state.table };
    table.loading = true;
    this.setState({ table });

    const params = {
      keyword: this.state.search || null,
      isCod: this.state.isCod || null,
      isReal: this.state.isReal || null,
      "options.take": this.state.table.pagination.pageSize,
      "options.skip": this.state.table.pagination.skipSize,
      "options.includeTotalCount": true
    };

    this.tenantRest.getTenants({ params }).subscribe(
      response => {
        const table = { ...this.state.table };
        table.data = response.data;
        table.pagination.totalPages = Math.ceil(response.total / response.take);
        table.loading = false;
        for (let i = 0; i < response.data.length; i++) {
          if (response.data[i].siCepatCOD === true) {
            this.setState({ totalCODTenants: this.state.totalCODTenants + 1 });
          }
        }
        this.setState({ totalTenants: response.total });
        this.setState({ table });
      },
      error => {
        this.setState({ redirect: true });
      }
    );
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
    moment.locale("id");
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
        // fixed: "left",
        width: 170,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "No Telp",
        accessor: "phone",
        // fixed: "left",
        width: 140,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Total SKU",
        accessor: "totalSku",
        width: 70,
        show: this.state.totalSku,
        Cell: props => (
          <p
            style={{
              textAlign: "center"
            }}
          >
            {props.value}
          </p>
        )
      },
      {
        Header: "Total Order",
        accessor: "totalOrder",
        width: 80,
        show: this.state.totalOrder,
        Cell: props => (
          <p
            style={{
              textAlign: "center"
            }}
          >
            {props.value}
          </p>
        )
      },
      {
        Header: "Total Receipt",
        accessor: "totalReceipt",
        width: 80,
        show: this.state.totalReceipt,
        Cell: props => (
          <p
            style={{
              textAlign: "center"
            }}
          >
            {props.value}
          </p>
        )
      },
      {
        Header: "Total User",
        accessor: "totalUser",
        width: 80,
        show: this.state.totalUser,
        Cell: props => (
          <div
            color="link"
            className="text-primary hover"
            style={{
              textAlign: "center"
            }}
            onClick={() => {
              this.toggle();
              this.setState({ oneData: props.original });
            }}
          >
            <p>{props.value}</p>
          </div>
        )
      },
      {
        Header: "Last Login",
        accessor: "owner.lastLoginDateUtc",
        width: 200,
        show: this.state.lastLoginDateUtc,
        Cell: props => <p>{moment(props.value).format("DD MMMM YYYY HH:mm")}</p>
      },
      {
        Header: "Join Date",
        accessor: "owner.joinDateUtc",
        width: 200,
        show: this.state.joinDateUtc,
        Cell: props => <p>{moment(props.value).format("DD MMMM YYYY HH:mm")}</p>
      },
      {
        Header: "Sicepat COD",
        accessor: "siCepatCOD",
        show: this.state.siCepatCOD,
        Cell: props => (
          <Switch
            className="custom-switch custom-switch-secondary"
            checked={props.original.siCepatCOD}
            onChange={() => {
              this.editStatusCOD(props.original);
            }}
          />
        )
      },
      {
        Header: "ID Sicepat",
        accessor: "siCepatMemberId",
        show: this.state.siCepatMemberId,
        Cell: props => <p>{props.value === null ? "-" : props.value}</p>
      },
      {
        Header: "Is Real",
        accessor: "isReal",
        show: this.state.isRealColumn,
        Cell: props => (
          <Switch
            className="custom-switch custom-switch-secondary"
            checked={props.original.isReal}
            onChange={() => {
              this.editIsReal(props.original);
            }}
          />
        )
      },
      {
        Header: "Status",
        accessor: "status",
        show: this.state.status,
        Cell: props => <p>{props.value === 1 ? "Aktif" : "Tidak Aktif"}</p>
      }
      // {
      //   Header: "Status",
      //   width: 200,
      //   Cell: props => {
      //     if (props.original.siCepatCOD) {
      //       return (
      //         <Button
      //           color="secondary"
      //           style={{ width: 150 }}
      //           onClick={() => {
      //             this.editStatusCOD(props.original);
      //           }}
      //         >
      //           Nonaktifkan COD
      //         </Button>
      //       );
      //     } else {
      //       return (
      //         <Button
      //           color="secondary"
      //           style={{ width: 150 }}
      //           onClick={() => {
      //             this.editStatusCOD(props.original);
      //           }}
      //         >
      //           Aktifkan COD
      //         </Button>
      //       );
      //     }
      //   }
      // }
    ];
  }

  editStatusCOD(data) {
    const table = { ...this.state.table };

    table.loading = true;
    this.setState({ table }, () => {
      this.tenantRest.activeCOD(data.id, !data.siCepatCOD).subscribe(
        response => {
          this.loadData();
          this.loadTenantsSummmary();
          if (!data.siCepatCOD) {
            MySwal.fire({
              type: "success",
              title: "COD SiCepat telah diaktifkan.",
              toast: true,
              position: "top-end",
              timer: 2000,
              showConfirmButton: false,
              customClass: "swal-height"
            });
          } else {
            MySwal.fire({
              type: "success",
              title: "COD SiCepat telah dinonaktifkan.",
              toast: true,
              position: "top-end",
              timer: 2000,
              showConfirmButton: false,
              customClass: "swal-height"
            });
          }
        },
        error => {
          this.setState({
            errorMessage: error.data[0].errorMessage,
            error: true
          });
        }
      );
    });
  }

  editIsReal(data) {
    const table = { ...this.state.table };

    table.loading = true;
    this.setState({ table }, () => {
      this.tenantRest.isRealUser(data.id, !data.isReal).subscribe(
        response => {
          this.loadData();
          this.loadTenantsSummmary();
          MySwal.fire({
            type: "success",
            title: "Berhasil.",
            toast: true,
            position: "top-end",
            timer: 2000,
            showConfirmButton: false,
            customClass: "swal-height"
          });
        },
        error => {
          this.setState({
            errorMessage: error.data[0].errorMessage,
            error: true
          });
        }
      );
    });
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

  exportData() {
    this.setState({ loading: true });
    const params = {
      "options.includeTotalCount": true
    };

    this.tenantRest.getTenants({ params }).subscribe(
      response => {
        this.setState({ totalData: response.total }, () => {
          this.loadAllData();
        });
      },
      error => {
        this.setState({ redirect: true });
      }
    );
  }

  loadAllData() {
    const params = {
      "options.includeTotalCount": true,
      "options.take": this.state.totalData
    };

    this.tenantRest.getTenants({ params }).subscribe(res => {
      this.exportService.exportToCSV(res.data, "Tenants");
      this.setState({ loading: false });
    });
  }

  render() {
    if (this.state.redirect === true) {
      this.setState({ redirect: false });
      return <Redirect to="/user/login" />;
    }
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
            <Card
              className="mb-12 lg-12"
              style={{
                borderRadius: 10
              }}
            >
              <CardBody>
                <Row>
                  <Colxx
                    xxs="6"
                    onClick={() => {
                      const table = { ...this.state.table };

                      table.pagination.skipSize = 0;
                      this.setState({ isCod: "", isReal: true, table }, () => {
                        this.loadData();
                      });
                    }}
                  >
                    <IconCard
                      title="Total Registered Tenants"
                      value={this.state.tenantsSummary.totalRealTenant}
                      className="mb-4 hover"
                    />
                  </Colxx>
                  <Colxx
                    xxs="6"
                    onClick={() => {
                      const table = { ...this.state.table };

                      table.pagination.skipSize = 0;
                      this.setState({ isCod: true, isReal: "", table }, () => {
                        this.loadData();
                      });
                    }}
                  >
                    <IconCard
                      title="Total Registered COD Tenants"
                      value={this.state.tenantsSummary.totalTenantRegisteredCOD}
                      className="mb-4 hover"
                    />
                  </Colxx>
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
                      <div
                        style={{
                          margin: "10px 0px 0px 20px"
                        }}
                      >
                        <CustomInput
                          type="checkbox"
                          id="isReal"
                          label="Is Real"
                          checked={
                            this.state.filterIsReal === "" ||
                            this.state.filterIsReal === false
                              ? false
                              : true
                          }
                          onClick={e => {
                            const isReal =
                              e.target.checked === true ? e.target.checked : "";
                            this.setState(
                              {
                                filterIsReal: e.target.checked,
                                isReal: isReal
                              },
                              () => {
                                this.loadData();
                              }
                            );
                          }}
                        />
                      </div>
                    </InputGroup>
                  </div>
                  <div className="col-md-7">
                    <Button
                      className="float-right default"
                      color="primary"
                      id="Popover1"
                      type="button"
                      style={{
                        marginLeft: 10,
                        borderRadius: 6
                      }}
                    >
                      <i className="simple-icon-menu mr-2" />
                    </Button>
                    <UncontrolledPopover
                      trigger="legacy"
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
                            name="isRealColumn"
                            type="checkbox"
                            checked={this.state.isRealColumn}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Is Real
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
                    </UncontrolledPopover>

                    <Button
                      className="float-right default"
                      color="primary"
                      onClick={() => {
                        const table = { ...this.state.table };

                        table.pagination.skipSize = 0;
                        this.setState(
                          {
                            packageFilter: "",
                            search: "",
                            isCod: "",
                            isReal: "",
                            table
                          },
                          () => {
                            this.loadData();
                            this.loadTenantsSummmary();
                          }
                        );
                        this.setState({ collapse: false });
                      }}
                      style={{
                        borderRadius: 6
                      }}
                    >
                      <i className="simple-icon-refresh" />
                    </Button>
                    <Button
                      className="float-right default"
                      color="primary"
                      style={{
                        marginRight: 10,
                        borderRadius: 6
                      }}
                      onClick={() => this.exportData()}
                    >
                      Export
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
                  className="-striped"
                  loading={this.state.table.loading}
                  onSortedChange={(newSorted, column, additive) => {
                    this.handleSortedChange(newSorted, column, additive);
                  }}
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
          {this.state.loading && <Spinner />}
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

        {this.state.error && (
          <div
            style={{
              maxHeight: 580
            }}
          >
            <Modal isOpen={this.state.error}>
              <ModalHeader>Error</ModalHeader>
              <ModalBody
                style={{
                  maxHeight: 380,
                  overflow: "auto"
                }}
              >
                {this.state.errorMessage}
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  outline
                  onClick={() => {
                    this.setState({ error: false });
                  }}
                >
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
