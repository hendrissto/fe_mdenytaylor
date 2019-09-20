import React, { Component, Fragment } from "react";
import ReactTable from "react-table";
import {
  Row,
  Card,
  CardBody,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  Input,
  InputGroup,
  InputGroupButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";
// import { Formik } from "formik";
// import validate from "./validate";

import IntlMessages from "../../../helpers/IntlMessages";

import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import Breadcrumb from "../../../containers/navs/Breadcrumb";
import DataTablePagination from "../../../components/DatatablePagination";

import WithdrawRestService from "../../../core/requestWithdrawRestService";
// import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
// import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css";
class WithdrawFunds extends Component {
  constructor(props) {
    super(props);
    this.requestWithdrawRest = new WithdrawRestService();
    this.handleInputChange = this.handleInputChange.bind(this);

    this.state = {
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
      oneData: "",
      search: "",
      modal: false,
      dropdownOpen: false,
      splitButtonOpen: false,
      dropdownOpen1: false,
      splitButtonOpen1: false
    };

    this.loadData = this.loadData.bind(this);
    this.toggle = this.toggle.bind(this);
    this.toggleDropDown = this.toggleDropDown.bind(this);
    this.toggleSplit = this.toggleSplit.bind(this);
    this.toggleDropDown1 = this.toggleDropDown1.bind(this);
    this.toggleSplit1 = this.toggleSplit1.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
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

    this.requestWithdrawRest.getBallance({ params }).subscribe(response => {
      const table = { ...this.state.table };
      table.data = response.data;
      table.pagination.totalPages = response.total / table.pagination.pageSize;
      table.loading = false;

      this.setState({ table });
    });
  }

  dataTableColumns() {
    return [
      {
        Header: "Permintaan Penarikan",
        accessor: "requestWithdraw",
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Seller",
        accessor: "seller",
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Jumlah Saldo Ditarik",
        accessor: "amountWithdraw",
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Ditarik ke Rekening",
        accessor: "withdrawToAccount",
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Cabang Bank",
        accessor: "bankBranch",
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Upload Bukti",
        Cell: props => {
          if (props.original.status === "Berhasil") {
            return (
              <div>
                <Button
                  outline
                  color="info"
                  onClick={() => {
                    this.toggle();
                    this.setState({ oneData: props.original });
                  }}
                >
                  <i className="simple-icon-paper-clip mr-2" />
                  Bukti Transfer
                </Button>
              </div>
            );
          } else {
            return (
              <div>
                <Button
                  outline
                  color="success"
                  onClick={() => {
                    this.toggle();
                    this.setState({ oneData: props.original });
                  }}
                >
                  <i className="iconsminds-upload mr-2 " />
                  Upload Bukti
                </Button>
              </div>
            );
          }
        }
      }
    ];
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

  toggle() {
    this.setState(prevState => ({
      modal: !prevState.modal
    }));
  }

  toggleDropDown() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  toggleSplit() {
    this.setState({
      splitButtonOpen: !this.state.splitButtonOpen
    });
  }
  toggleDropDown1() {
    this.setState({
      dropdownOpen1: !this.state.dropdownOpen1
    });
  }

  toggleSplit1() {
    this.setState({
      splitButtonOpen1: !this.state.splitButtonOpen1
    });
  }

  button(cell, row) {
    if (row.status === "Berhasil") {
      return (
        <div>
          <Button
            outline
            color="info"
            onClick={() => {
              this.toggle();
              this.setState({ oneData: row });
            }}
          >
            <i className="simple-icon-paper-clip mr-2" />
            Bukti Transfer
          </Button>
        </div>
      );
    } else {
      return (
        <div>
          <Button
            outline
            color="success"
            onClick={() => {
              this.toggle();
              this.setState({ oneData: row });
            }}
          >
            <i className="iconsminds-upload mr-2 " />
            Upload Bukti
          </Button>
        </div>
      );
    }
  }

  render() {
    // const option = {
    //   sizePerPage: 5,
    //   sizePerPageList: [
    //     {
    //       text: "5",
    //       value: 5
    //     },
    //     {
    //       text: "10",
    //       value: 10
    //     }
    //   ]
    // };
    return (
      <Fragment>
        <Row>
          <Colxx xxs={12}>
            <Breadcrumb
              heading="menu.request-withdraw-funds"
              match={this.props.match}
            />
            <Separator className="mb-5" />
          </Colxx>
          <Colxx xxs={12}>
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
                </div>
                {/*
                <BootstrapTable
                  data={this.dataTable()}
                  pagination={true}
                  options={option}
                >
                  <TableHeaderColumn dataField="requestWithdraw" isKey>
                    Permintaan Penarikan
                  </TableHeaderColumn>
                  <TableHeaderColumn dataField="seller">
                    Seller
                  </TableHeaderColumn>
                  <TableHeaderColumn dataField="amountWithdraw">
                    Jumlah Saldo Ditarik
                  </TableHeaderColumn>
                  <TableHeaderColumn dataField="withdrawToAccount">
                    Ditarik ke Rekening
                  </TableHeaderColumn>
                  <TableHeaderColumn dataField="bankBranch">
                    Cabang Bank
                  </TableHeaderColumn>
                  <TableHeaderColumn dataField="status">
                    Status
                  </TableHeaderColumn>
                  <TableHeaderColumn dataFormat={this.button.bind(this)}>
                    Upload Bukti
                  </TableHeaderColumn>
                </BootstrapTable>
                 */}
                <ReactTable
                  page={this.state.table.pagination.currentPage}
                  PaginationComponent={DataTablePagination}
                  data={this.state.table.data}
                  pages={this.state.table.pagination.totalPages}
                  columns={this.dataTableColumns()}
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

        {/* MODAL */}
        <Modal isOpen={this.state.modal} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>
            <IntlMessages id="modal.modalTitle" />
          </ModalHeader>
          <ModalBody>
            <Table>
              <tbody>
                <tr>
                  <td>
                    <IntlMessages id="modal.seller" />
                  </td>
                  <td>:</td>
                  <td>{this.state.oneData.seller}</td>
                </tr>
                <tr>
                  <td>
                    <IntlMessages id="modal.cardName" />
                  </td>
                  <td>:</td>
                  <td>{this.state.oneData.seller}</td>
                </tr>
                <tr>
                  <td>
                    <IntlMessages id="modal.bank" />
                  </td>
                  <td>:</td>
                  <td>{this.state.oneData.withdrawToAccount}</td>
                </tr>
                <tr>
                  <td>
                    <IntlMessages id="modal.creditNumber" />
                  </td>
                  <td>:</td>
                  <td>{this.state.oneData.receiptNumber}</td>
                </tr>
                <tr>
                  <td>
                    <IntlMessages id="modal.total" />
                  </td>
                  <td>:</td>
                  <td>{this.state.oneData.amountWithdraw}</td>
                </tr>
                <tr>
                  {this.state.oneData.status === "Berhasil" ? (
                    <div></div>
                  ) : (
                    <>
                      <td>
                        <IntlMessages id="modal.amount" />
                      </td>
                      <td>:</td>
                      <td>
                        <input type="text" name="amount" />
                      </td>
                    </>
                  )}
                </tr>
              </tbody>
            </Table>
            {this.state.oneData.status === "Berhasil" ? (
              <div>Disini Bukti Transfer.</div>
            ) : (
              <div>
                <Input type="file" />
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            {this.state.oneData.status === "Berhasil" ? (
              <Button color="danger" onClick={this.toggle}>
                Close
              </Button>
            ) : (
              <Button color="primary" onClick={this.toggle}>
                Upload
              </Button>
            )}
          </ModalFooter>
        </Modal>
      </Fragment>
    );
  }
}

export default WithdrawFunds;
