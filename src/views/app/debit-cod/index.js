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

import DebitRestService from "../../../core/debitRestService";
import RelatedDataRestService from "../../../core/relatedDataRestService";
// import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
// import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css";

import {InputText} from "primereact/inputtext";

class DebitCod extends Component {
  constructor(props) {
    super(props);

    this.debitRestService = new DebitRestService();
    this.relatedData = new RelatedDataRestService();

    this.state = {
      relatedData: [],
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
      modal: false
    };
  }

  componentDidMount() {
    this.loadData();
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

    this.debitRestService.getDebitCod({ params }).subscribe(response => {
      const table = { ...this.state.table };
      table.data = response.data;
      table.pagination.totalPages = response.total / table.pagination.pageSize;
      table.loading = false;
      this.setState({ table });
    });
  }

  loadRelatedData() {
    this.relatedData.getTenantBank().subscribe(response => {
      this.setState({ relatedData: response });
    });
  }

  dataTable() {
    return [
      {
        Header: "Permintaan Penarikan",
        accessor: "deliveryDate",
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Seller",
        accessor: "sellerName",
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Jumlah Saldo Ditarik",
        accessor: "amount",
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Ditarik ke Rekening",
        accessor: "bankName",
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Cabang Bank",
        accessor: "bankDistrict",
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
                    this.setState({ modal: true });
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
                    this.setState({ modal: true });
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

  render() {
    return (
      <>
        <Row>
          <Colxx xxs={12}>
            <Breadcrumb heading="Debit COD" match={this.props.match} />
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

                <ReactTable
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

        {/* MODAL */}
        {this.state.modal && (
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
                    <td>sellerName [ debit-cod ]</td>
                  </tr>
                  <tr>
                    <td>
                      <IntlMessages id="modal.cardName" />
                    </td>
                    <td>:</td>
                    <td>accountName [ tenant-bank ]</td>
                  </tr>
                  <tr>
                    <td>
                      <IntlMessages id="modal.bank" />
                    </td>
                    <td>:</td>
                    <td>bankName [ tenant-bank ]</td>
                  </tr>
                  <tr>
                    <td>
                      <IntlMessages id="modal.creditNumber" />
                    </td>
                    <td>:</td>
                    <td>accountNumber [ tenant-bank ]</td>
                  </tr>
                  <tr>
                    <td>
                      <IntlMessages id="modal.total" />
                    </td>
                    <td>:</td>
                    <td>amount [ debit-cod ]</td>
                  </tr>
                  <tr>
                    <td>
                      Total Bayar
                    </td>
                    <td>:</td>
                    <td><InputText placeholder="pay amount" /></td>
                  </tr>
                </tbody>
              </Table>
              <Input type="file" />
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onClick={this.toggle}>
                Upload
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </>
    );
  }
}

export default DebitCod;
