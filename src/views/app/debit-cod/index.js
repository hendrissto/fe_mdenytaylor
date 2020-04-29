import React, { Component } from "react";
// import ReactTable from "react-table";
import {
  // Col,
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

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import TenantRestService from "../../../api/tenantRestService";
import { ColumnFormat } from "../../../services/Format/ColumnFormat";
const MySwal = withReactContent(Swal);
class DebitCod extends Component {
  constructor(props) {
    super(props);

    this.debitRestService = new DebitRestService();
    this.tenantRestService = new TenantRestService();
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
    this.isAttachment = this.isAttachment.bind(this);
    this.showAttachment = this.showAttachment.bind(this);
    this.rmAttachment = this.rmAttachment.bind(this);
    this.actionTemplate = this.actionTemplate.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.columnFormat = new ColumnFormat();

    this.state = {
      deliveryDate: true,
      sellerName: true,
      amount2: true,
      bankName: true,
      bankDistrict2: true,
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
      attachments: [],
      realAttachments: [],
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
      isEdit: false,
      note: "",
      amountWithComma: "",
      isChanged: false,
      search: "",
    };
  }

  handleChange(e) {
    this.setState({ amount: e.target.value });
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
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
      oneData: "",
      selectedBank: [],
      imageUrl: null,
      image: null,
      modal: !this.state.modal,
      note: "",
      attachments: [],
      isChanged: false,
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
      statuses: 'draft, voided, paid',
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
      table.loading = false;
      this.setState({ table });
      if(err.response.status === 401){
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
        show: this.state.bankDistrict2,
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
                    this.setState({ note: null, modal3: true });
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
      // Create a new array based on current state:
      let attachments = [...this.state.attachments];

      // Add item to it
      attachments.push(response);

      this.setState({
        spinner: false,
        imageUrl: response.fileUrl,
        loading: true,
        image: response,
        attachments
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
      let tempAmount = 0;
      let parsedAmount = 0;
      const data = this.state;

      if (this.state.isChanged) {
        tempAmount = this.state.amountWithComma.split('.').join('');
        if(tempAmount.indexOf(',') !== -1) {
          parsedAmount = parseFloat(tempAmount.replace(',', '.'));
        }
      } else {
        parsedAmount = this.state.amount;
      }

      let lines = {
        id: this.state.oneData.id,
        attachments: this.state.isDraft === true ? undefined : this.state.attachments,
        amount: parsedAmount || 0,
        feeTransfer: 2500,
        tenantId: this.state.oneData.tenantId,
        tenantBankId: this.state.selectedBank.id,
        note: this.state.note,
      };

      MySwal.fire({
        title: '<strong>Konfirmasi Transfer</strong>',
        icon: 'info',
        html:
          '<table className=\'table\' align=\'center\'>' +
            '<tr>' +
              '<th>No Rekening</th>' +
              '<td>:</td>' +
              `<td>${data.selectedBank.accountNumber}</td>` +
            '</tr>' +
            '<tr>' +
              '<th>Nama Rekening</th>' +
              '<td>:</td>' +
              `<td>${data.selectedBank.accountName}</td>` +
            '</tr>' +
            '<tr>' +
              '<th>Ballance Amount</th>' +
              '<td>:</td>' +
              `<td>${this.moneyFormat.numberFormat(data.oneData.amount)}</td>` +
            '</tr>' +
            '<tr>' +
              '<th>Total Bayar</th>' +
              '<td>:</td>' +
              `<td>Rp. ${parsedAmount.toLocaleString('id-ID')}</td>` +
            '</tr>' +
          '</table>',
        showCloseButton: true,
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText:
          'Ok',
        cancelButtonText:
          'Cancel',
      }).then((result) => {
        if(result.value) {
          this.setState({modal: false, loadingSubmit: true})
          this.debitRestService.putDebitCod(this.state.oneData.id, lines).subscribe(
            response => {
              this.setState({
                modal2: true,
                loadingSubmit: false,
                modalResponse: true,
                isChanged: false,
                attachments: [],
              });
            },
            err => {
              this.setState({
                isChanged: false,
                loadingSubmit: false,
                modal2: true,
                modalError: true,
                attachments: [],
                errorData: err.data[0] ? err.data[0].errorMessage : 'Tidak diketahui'
              });
            }
          );
        }
      })
    }
  }

  exportData() {
    this.setState({ loadingSubmit: true });
    const params = {
      "options.includeTotalCount": true,
      statuses: 'draft, voided, paid'
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
      statuses: 'paid,draft,open,void',
      "options.take": this.state.totalData
    };

    this.debitRestService.getDebitCod({ params }).subscribe(res => {
      this.exportService.exportToCSV(res.data, "Withdraw Funds");
      this.setState({ loadingSubmit: false });
    });
  }


  rmAttachment(i) {
    let attachments = [...this.state.attachments];
    attachments.splice(i, 1);

    this.setState({
      attachments
    });
  }

  isAttachment() {
    const data = [];

    const attachment = this.state.attachments;
    if (attachment) {
      for (let i = 0; i < attachment.length; i++) {
        data.push(
          <tr>
            <td colSpan="4">
              {attachment[i].customFileName}
            </td>
            <td>
              <a href
                className="text-danger"
                style={{ 'cursor': 'pointer' }}
                onClick={() => this.rmAttachment(i)}>
                Hapus
              </a>
            </td>
          </tr>
        )
      }
    }

    return data;
  }

  showAttachment() {
    const view = [];
    if (this.state.oneData) {
      this.state.attachments.map(function (attachment, i) {
        view.push(
          <>
            <tr>
              <td></td>
              <td>
                {i + 1} .
              </td>
              <td>
                <a rel="noopener noreferrer" target="_blank" href={attachment.fileUrl}>{attachment.customFileName}</a>
              </td>
            </tr>
          </>
        )
        return true;
      })
    }
    return view;
  }

  editData() {
    this.setState({modal3: false, loadingSubmit: true});

    const data = this.state;
    const oneData = data.oneData;
    const attachments = [];
    for(let i = 0; i < data.attachments.length; i++) {
      attachments.push({
        id: data.attachments[i].id,
        isMain: i === 0 ? true : false,
        customFileName: data.attachments[i].customFileName,
      })
    }

    const payload = {
      id: oneData.id,
      tenantId: oneData.tenantId,
      note: data.note,
      amount: oneData.amount,
      feeTransfer: oneData.feeTransfer,
      attachments: attachments,
      tenantBankId: null,
    }

    this.debitRestService.putDebitCod(oneData.id, payload).subscribe(res => {
      MySwal.fire({
        type: "success",
        title: "Sukses Edit Data.",
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
        customClass: "swal-height"
      });
      this.setState({loadingSubmit: false});
      this.loadData();
    }, err => {
      MySwal.fire({
        type: "error",
        title: "Gagal Edit Data.",
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
        customClass: "swal-height"
      });
      this.setState({loadingSubmit: false});
      this.loadData();
    })
  }

  actionTemplate(rowData, column) {
    if (rowData.status !== "draft") {
      return (
        <div>
          <Button
            outline
            color="info"
            onClick={() => {
              // this.setState({attachments: []});

              let attachments = this.state.attachments;
              let realAttachments = this.state.realAttachments;
              attachments = [];
              if(rowData.attachments) {
                for(let i = 0; i < rowData.attachments.length; i++) {
                  attachments.push(rowData.attachments[i]);
                  realAttachments.push(rowData.attachments[i]);
                }
              }
              this.setState({
                note: rowData.note,
                attachments,
                realAttachments,
                oneData: rowData,
                modal3: true,
              });
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
                error: false,
                note: rowData.note,
                amountWithComma: rowData.amount.toString(),
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
            <Breadcrumb heading="Histori Pencairan" match={this.props.match} />
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
                  {/*<Column style={{width:'250px'}} field="deliveryDate" header="Seller Name" frozen={true}/>*/}
                  <Column style={{width:'250px'}} field="sellerName" header="Seller" body={this.columnFormat.emptyColumn} />
                  <Column style={{width:'250px'}} field="amount" header="Jumlah Saldo Ditarik" body={this.moneyFormat.currencyFormat}  />
                  <Column style={{width:'250px'}} field="bankName" header="Ditarik ke Rekening" body={this.columnFormat.emptyColumn} />
                  <Column style={{width:'250px'}} field="bankDistrict" header="Cabang Bank" body={this.columnFormat.emptyColumn} />
                  <Column style={{width:'150px'}} field="status" header="status" body={this.columnFormat.emptyColumn} />
                  <Column style={{width:'250px'}} header="Upload Bukti" body={this.actionTemplate}/>
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
          <Modal isOpen={this.state.modal} >
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
                      <NumberFormat isNumericString={true} thousandSeparator={'.'} decimalSeparator={','} value={this.state.amount} onValueChange={(values) => {
                        const { value, formattedValue } = values;
                        this.setState({isChanged: true, amount: value, amountWithComma: formattedValue});
                      }} />
                    </td>
                  </tr>
                  <tr>
                    <td>Note</td>
                    <td>:</td>
                    <td>
                      <Input
                        type="textarea"
                        className="form-control"
                        onChange={event => {
                          this.setState({ note: event.target.value });
                        }}
                        value={this.state.note}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="3">
                      {!this.state.isDraft && (
                        <input
                          type="file"
                          onChange={this.fileHandler.bind(this)}
                        />
                      )}
                    </td>
                  </tr>
                  {this.state.spinner && (
                    <Loader type="Oval" color="#51BEEA" height={80} width={80} />
                  )}
                  {this.state.loading && (
                    this.isAttachment()
                  )}
                </tbody>
              </Table>
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
              <Button
                color="primary"
                outline
                onClick={() => {
                  this.toggle();
                }}
              >
                Close
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
                  {!this.state.isEdit && (
                    <tr>
                      <td>Note</td>
                      <td>:</td>
                      <td>
                        {this.state.oneData.note}
                      </td>
                    </tr>
                  )}
                  {this.state.isEdit && (
                    <tr>
                      <td>Note</td>
                      <td>:</td>
                      <td>
                        <Input
                          type="textarea"
                          className="form-control"
                          onChange={event => {
                            this.setState({ note: event.target.value });
                          }}
                          value={this.state.note}
                        />
                      </td>
                    </tr>
                  )}
                  {this.state.isEdit && (
                      <tr>
                      <td colSpan="3">
                        <input
                          type="file"
                          onChange={this.fileHandler.bind(this)}
                        />
                      </td>
                    </tr>
                  )}

                  {this.state.spinner && (
                    <Loader
                      type="Oval"
                      color="#51BEEA"
                      height={80}
                      width={80}
                    />
                  )}

                  {!this.state.isEdit && this.showAttachment() && (
                    <tr>
                      <td>Lampiran</td>
                      <td>:</td>
                      <td></td>
                    </tr>
                  )}
                  {!this.state.isEdit &&  this.showAttachment()}
                  {this.state.isEdit && (
                    this.isAttachment()
                  )}
                </tbody>
              </Table>
            </ModalBody>
            <ModalFooter>
            {this.state.isEdit && (
              <div>
                <Button
                  className="default"
                  color="primary"
                  style={{
                    borderRadius: 6,
                    marginRight: 10
                  }}
                  onClick={() => {
                    this.setState({ isEdit: false });
                    this.editData();
                  }}
                >
                  Save
                </Button>
                <Button
                  className="default"
                  color="primary"
                  style={{
                    borderRadius: 6
                  }}
                  onClick={() => {
                    this.setState({ attachments: this.state.realAttachments,isEdit: false })
                  }}
                >
                  Cancel
              </Button>
              </div>
            )}
            {!this.state.isEdit && (
              <Button
                className="default"
                color="primary"
                style={{
                  borderRadius: 6
                }}
                onClick={() => {
                  this.setState({ isEdit: true })
                }}
              >
                Edit
              </Button>

            )}
              <Button
                color="primary"
                outline
                style={{
                  borderRadius: 6
                }}
                onClick={() => this.setState({ attachments: [], realAttachments: [], isEdit: false, modal3: false })}
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
