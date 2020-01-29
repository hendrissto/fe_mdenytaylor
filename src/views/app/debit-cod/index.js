import React, { Component } from "react";
// import ReactTable from "react-table";
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
  Popover,
  PopoverBody
} from "reactstrap";
// import { Formik } from "formik";
// import validate from "./validate";

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import IntlMessages from "../../../helpers/IntlMessages";
import { Paginator } from "primereact/paginator";
import { Redirect } from "react-router-dom";

import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import Breadcrumb from "../../../containers/navs/Breadcrumb";

import DebitRestService from "../../../api/debitRestService";
import RelatedDataRestService from "../../../api/relatedDataRestService";
import PictureRestService from "../../../api/pictureRestService";
import { MoneyFormat } from "../../../services/Format/MoneyFormat";
import NumberFormat from 'react-number-format';

import { Dropdown } from "primereact/dropdown";
import Loader from "react-loader-spinner";
import Spinner from "../../../containers/pages/Spinner";
import BaseAlert from "../../base/baseAlert";
import ExportDebitCOD from "../../../core/export/ExportDebitCOD";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
const MySwal = withReactContent(Swal);
class DebitCod extends Component {
  constructor(props) {
    super(props);

    this.debitRestService = new DebitRestService();
    this.relatedData = new RelatedDataRestService();
    this.exportService = new ExportDebitCOD();
    this.pictureRestService = new PictureRestService();
    this.moneyFormat = new MoneyFormat();
    this.toggle = this.toggle.bind(this);
    this.loadRelatedData = this.loadRelatedData.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.submitData = this.submitData.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.togglePopOver = this.togglePopOver.bind(this);
    this.handleOnPageChange = this.handleOnPageChange.bind(this);
    this.buttonUpload = this.buttonUpload.bind(this);

    this.state = {
      deliveryDate: true,
      sellerName: true,
      amount2: true,
      bankName: true,
      bankDistrict: true,
      status: true,
      fileAttach: true,
      popoverOpen: false,
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
      oneData: null,
      redirect: false,
    };
  }

  handleChange(e) {
    this.setState({ amount: e.target.value });
  }

  handleFilterChange(event) {
    const target = event.target;
    const value = target.checked;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  togglePopOver() {
    this.setState(prevState => ({
      popoverOpen: !prevState.popoverOpen
    }));
  }

  toggle() {
    this.setState({
      loading: false,
      oneData: null,
      selectedBank: [],
      imageUrl: null,
      image: null,
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

    this.debitRestService.getDebitCod({ params }).subscribe(response => {
      const table = { ...this.state.table };
      table.data = response.data;
      table.pagination.totalPages = Math.ceil(response.total / response.take);
      table.loading = false;
      this.setState({ table });
    }, err => {
      if(err.response.status === 401){
        this.setState({redirect: true});
        MySwal.fire({
          type: "error",
          title: "Unauthorized.",
          toast: true,
          position: "top-end",
          timer: 2000,
          showConfirmButton: false,
          customClass: "swal-height"
        });
      }
    });
  }

  loadRelatedData(id) {
    this.relatedData.getTenantBank(id, {}).subscribe(response => {
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
        show: this.state.deliveryDate,
        Cell: props => <p>{props.value === null ? "-" : props.value}</p>
      },
      {
        Header: "Seller",
        accessor: "sellerName",
        show: this.state.sellerName,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Jumlah Saldo Ditarik",
        accessor: "amount",
        show: this.state.amount2,
        Cell: props => <p>{this.moneyFormat.numberFormat(props.value)}</p>
      },
      {
        Header: "Ditarik ke Rekening",
        accessor: "bankName",
        show: this.state.bankName,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Cabang Bank",
        accessor: "bankDistrict",
        show: this.state.bankDistrict,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Status",
        accessor: "status",
        show: this.state.status,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Upload Bukti",
        show: this.state.fileAttach,
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
                    this.setState({
                      selectedBank: [],
                      image: null,
                      imageUrl: null,
                      loading: false,
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
        amount: Number.isInteger(this.state.amount) ? this.state.amount : parseFloat(this.state.amount.replace(/,/g, '')),
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

  exportData() {
    this.setState({ loadingSubmit: true });
    const params = {
      "options.includeTotalCount": true
    };

    this.debitRestService.getDebitCod({ params }).subscribe(
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

    this.debitRestService.getDebitCod({ params }).subscribe(res => {
      this.exportService.exportToCSV(res.data, "Withdraw Funds");
      this.setState({ loadingSubmit: false });
    });
  }

  buttonUpload(rowData, column) {
    if (rowData.status !== "draft") {
      return (
        <div>
          <Button
            outline
            color="info"
            onClick={() => {
              this.setState({ modal3: true });
              this.setState({ oneData: rowData });
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
              this.loadRelatedData(rowData.tenantId);
              this.setState({ modal: true });
              this.setState({
                selectedBank: [],
                image: null,
                imageUrl: null,
                loading: false,
                oneData: rowData,
                amount: rowData.amount
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

  render() {
    if (this.state.redirect === true) {
      this.setState({ redirect: false });
      return <Redirect to="/user/login" />;
    }
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
                        placeholder="Search..."
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
                            name="deliveryDate"
                            type="checkbox"
                            checked={this.state.deliveryDate}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Permintaan Penarikan
                        </div>
                        <div>
                          <input
                            name="sellerName"
                            type="checkbox"
                            checked={this.state.sellerName}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Seller
                        </div>
                        <div>
                          <input
                            name="amount2"
                            type="checkbox"
                            checked={this.state.amount2}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Jumlah Saldo Ditarik
                        </div>
                        <div>
                          <input
                            name="bankName"
                            type="checkbox"
                            checked={this.state.bankName}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Ditarik ke Rekening
                        </div>
                        <div>
                          <input
                            name="bankDistrict"
                            type="checkbox"
                            checked={this.state.bankDistrict}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Cabang Bank
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
                        <div>
                          <input
                            name="fileAttach"
                            type="checkbox"
                            checked={this.state.fileAttach}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Upload Bukti
                        </div>
                      </PopoverBody>
                    </Popover>
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

                <DataTable value={this.state.table.data} className="noheader" lazy={true} loading={this.state.table.loading} responsive={true} resizableColumns={true} columnResizeMode="fit" scrollable={true} scrollHeight="500px">
                  <Column style={{width:'250px'}} field="deliveryDate" header="Permintaan Penarikan" />
                  <Column style={{width:'250px'}} field="sellerName" header="Seller" />
                  <Column style={{width:'250px'}} field="amount" header="Jumlah Saldo Ditarik" />
                  <Column style={{width:'250px'}} field="bankName" header="Ditarik ke Rekening" />
                  <Column style={{width:'250px'}} field="bankDistrict" header="Cabang Bank" />
                  <Column style={{width:'250px'}} field="status" header="Status" />
                  <Column style={{width:'250px'}} header="Upload Bukti" body={this.buttonUpload}  />
                </DataTable>
                {/*
                <ReactTable
                  minRows={0}
                  data={this.state.table.data}
                  columns={this.dataTable()}
                  className="-striped"
                  loading={this.state.table.loading}
                  showPagination={false}
                  showPaginationTop={false}
                  showPaginationBottom={false}
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
                 */}
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
                    <td>{this.moneyFormat.numberFormat(this.state.oneData.amount) || 0}</td>
                  </tr>
                  <tr>
                    <td>Total Bayar</td>
                    <td>:</td>
                    <td>
                    <NumberFormat thousandSeparator={true} value={this.state.amount} onChange={this.handleChange}/>
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
                    <img src={this.state.imageUrl} height="150" width="150" alt="'name'" />
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
                      <a target="_blank" href={this.state.oneData.file.fileUrl} rel="noopener noreferrer">
                        <img src={this.state.oneData.file.fileUrl} height="150" width="150" alt="'name'"/>
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
