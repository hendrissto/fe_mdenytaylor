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
  InputGroup
} from "reactstrap";
// import { Formik } from "formik";
// import validate from "./validate";

import IntlMessages from "../../../helpers/IntlMessages";

import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import Breadcrumb from "../../../containers/navs/Breadcrumb";
import DataTablePagination from "../../../components/DatatablePagination";

import DebitRestService from "../../../core/debitRestService";
import RelatedDataRestService from "../../../core/relatedDataRestService";
import PictureRestService from "../../../core/pictureRestService";
import { MoneyFormat } from "../../../services/Format/MoneyFormat";

import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import Loader from "react-loader-spinner";
import Spinner from "../../../containers/pages/Spinner";
import BaseAlert from "../../base/baseAlert";

class DebitCod extends Component {
  constructor(props) {
    super(props);

    this.debitRestService = new DebitRestService();
    this.relatedData = new RelatedDataRestService();
    this.pictureRestService = new PictureRestService();
    this.moneyFormat = new MoneyFormat();
    this.toggle = this.toggle.bind(this);
    this.loadRelatedData = this.loadRelatedData.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.submitData = this.submitData.bind(this);
    this.toggleModal = this.toggleModal.bind(this);

    this.state = {
      error: false,
      loadingSubmit: false,
      spinner: false,
      loading: false,
      relatedData: [],
      selectedBank: [],
      tenantBank: null,
      amount: null,
      image: null,
      imageUrl: null,
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
      modal: false,
      modal2: false,
      modal3: false,
      errorData: "",
      oneData: null
    };
  }

  handleChange(e) {
    this.setState({ amount: e.target.value });
  }

  toggle() {
    this.setState({
      modal: !this.state.modal
    });
  }

  toggleModal() {
    this.setState({
      modal2: !this.state.modal2
    });
    this.loadData();
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

  loadRelatedData(id) {
    this.relatedData.getTenantBank(id, {}).subscribe(response => {
      console.log(response);
      this.setState({ tenantBank: response.data });
    });
  }

  dataTable() {
    return [
      {
        Header: "Id",
        accessor: "id",
        show: false,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Permintaan Penarikan",
        accessor: "deliveryDate",
        Cell: props => <p>{props.value === null ? "-" : props.value}</p>
      },
      {
        Header: "Seller",
        accessor: "sellerName",
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Jumlah Saldo Ditarik",
        accessor: "amount",
        Cell: props => <p>{this.moneyFormat.numberFormat(props.value)}</p>
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
          if (props.original.status !== "draft") {
            return (
              <div>
                <Button
                  outline
                  color="info"
                  onClick={() => {
                    this.setState({ modal3: true });
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
                    this.loadRelatedData(props.original.tenantId);
                    this.setState({ modal: true });
                    console.log(props.original);
                    this.setState({
                      oneData: props.original,
                      amount: props.original.amount
                    });
                  }}
                >
                  <i className="iconsminds-upload mr-2 " />
                  Upload
                </Button>
              </div>
            );
          }
        }
      }
    ];
  }

  fileHandler = event => {
    this.setState({ loading: false, spinner: true });
    let fileObj = event.target.files[0];

    let data = new FormData();
    data.append("file", fileObj);

    this.pictureRestService.postPicture(data).subscribe(response => {
      this.setState({
        spinner: false,
        imageUrl: response.fileUrl,
        loading: true,
        image: response
      });
    });
  };

  validateError() {
    if (
      this.state.image === null ||
      this.state.amount === null ||
      this.state.amount === undefined ||
      this.state.selectedBank === []
    ) {
      return true;
    } else {
      return false;
    }
  }

  submitData() {
    if (this.validateError()) {
      this.setState({ error: true });
    } else {
      this.setState({ modal: false, loadingSubmit: true });
      let lines = {
        id: this.state.oneData.id,
        fileId: this.state.image.id,
        amount: parseInt(this.state.amount),
        feeTransfer: 2500,
        tenantId: this.state.oneData.tenantId,
        tenantBankId: this.state.selectedBank.id
      };

      this.debitRestService.putDebitCod(this.state.oneData.id, lines).subscribe(
        response => {
          this.setState({
            modal2: true,
            loadingSubmit: false,
            modalResponse: true
          });
        },
        err => {
          this.setState({
            loadingSubmit: false,
            modal2: true,
            modalError: true,
            errorData: err.data[0].errorMessage
          });
        }
      );
    }
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
                  minRows={0}
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
          {this.state.loadingSubmit && <Spinner />}
        </Row>

        {/* MODAL */}
        {this.state.modal && this.state.tenantBank !== null && (
          <Modal isOpen={this.state.modal} toggle={this.toggle}>
            <ModalHeader toggle={this.toggle}>
              <IntlMessages id="modal.modalTitle" />
            </ModalHeader>
            <ModalBody>
              {this.state.error && (
                <BaseAlert
                  onClick={() => {
                    this.setState({ error: false });
                  }}
                  text={"Pastikan semua data telah terisi."}
                />
              )}
              <Table>
                <tbody>
                  <tr>
                    <td>Company Name</td>
                    <td>:</td>
                    <td>{this.state.oneData.sellerName}</td>
                  </tr>
                  <tr>
                    <td>
                      <IntlMessages id="modal.cardName" />
                    </td>
                    <td>:</td>
                    <td>
                      <Dropdown
                        optionLabel="accountName"
                        value={this.state.selectedBank}
                        options={this.state.tenantBank}
                        onChange={e => {
                          this.setState({ selectedBank: e.value });
                        }}
                        placeholder="Select a Bank Account"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <IntlMessages id="modal.bank" />
                    </td>
                    <td>:</td>
                    <td>
                      {this.state.selectedBank.length === 0
                        ? "-"
                        : this.state.selectedBank.bank.bankName}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <IntlMessages id="modal.creditNumber" />
                    </td>
                    <td>:</td>
                    <td>
                      {this.state.selectedBank.length === 0
                        ? "-"
                        : this.state.selectedBank.accountNumber}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <IntlMessages id="modal.total" />
                    </td>
                    <td>:</td>
                    <td>{this.state.oneData.amount}</td>
                  </tr>
                  <tr>
                    <td>Total Bayar</td>
                    <td>:</td>
                    <td>
                      <input
                        type="text"
                        value={this.state.amount}
                        onChange={this.handleChange}
                      />
                    </td>
                  </tr>
                </tbody>
              </Table>
              <input type="file" onChange={this.fileHandler.bind(this)} />
              {this.state.spinner && (
                <Loader type="Oval" color="#51BEEA" height={80} width={80} />
              )}
              {this.state.loading && (
                <tr>
                  <td colSpan="3">
                    <img src={this.state.imageUrl} height="150" width="150" />
                  </td>
                </tr>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                color="primary"
                onClick={() => {
                  this.submitData();
                }}
              >
                Upload
              </Button>
            </ModalFooter>
          </Modal>
        )}

        {this.state.modal2 && (
          <Modal isOpen={this.state.modal2}>
            <ModalHeader>Status</ModalHeader>
            {this.state.modalResponse && <ModalBody>Berhasil.</ModalBody>}
            {this.state.modalError && (
              <ModalBody>{this.state.errorData}</ModalBody>
            )}
            <ModalFooter>
              <Button color="primary" outline onClick={this.toggleModal}>
                Close
              </Button>
            </ModalFooter>
          </Modal>
        )}

        {this.state.modal3 && (
          <Modal isOpen={this.state.modal3}>
            <ModalHeader>Status</ModalHeader>
            <ModalBody>
              <Table>
                <tbody>
                  <tr>
                    <td>Company Name</td>
                    <td>:</td>
                    <td>{this.state.oneData.sellerName}</td>
                  </tr>
                  <tr>
                    <td>
                      <IntlMessages id="modal.bank" />
                    </td>
                    <td>:</td>
                    <td>{this.state.oneData.bankName}</td>
                  </tr>
                  <tr>
                    <td>Total Bayar</td>
                    <td>:</td>
                    <td>
                      {this.moneyFormat.numberFormat(this.state.oneData.amount)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="3">
                      <a target="_blank" href={this.state.oneData.file.fileUrl}>
                        <img
                          src={this.state.oneData.file.fileUrl}
                          height="150"
                          width="150"
                        />
                      </a>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </ModalBody>
            <ModalFooter>
              <Button
                color="primary"
                outline
                onClick={() => this.setState({ modal3: false })}
              >
                Close
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </>
    );
  }
}

export default DebitCod;
