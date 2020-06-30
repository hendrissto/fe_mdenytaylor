import React, { Component } from "react";
import {
  Row,
  Card,
  CardBody,
  CardFooter,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  Input,
  InputGroup,
  Popover,
  PopoverBody,
  Collapse
} from "reactstrap";

import IntlMessages from "../../../helpers/IntlMessages";
import { Paginator } from "primereact/paginator";
import { Redirect } from "react-router-dom";
import moment from 'moment';
import * as _ from 'lodash';

import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import Breadcrumb from "../../../containers/navs/Breadcrumb";

import DebitRestService from "../../../api/debitRestService";
import WalletTransactionsRestService from "../../../api/walletTransactionsRestService";

import RelatedDataRestService from "../../../api/relatedDataRestService";
import PictureRestService from "../../../api/pictureRestService";
import { MoneyFormat } from "../../../services/Format/MoneyFormat";

import { Dropdown } from "primereact/dropdown";
import Loader from "react-loader-spinner";
import Spinner from "../../../containers/pages/Spinner";
import BaseAlert from "../../base/baseAlert";
import ExportDebitCOD from "../../../core/export/ExportDebitCOD";

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Calendar } from 'primereact/calendar';
import { MultiSelect } from 'primereact/multiselect';

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import TenantRestService from "../../../api/tenantRestService";
import { ColumnFormat } from "../../../services/Format/ColumnFormat";
import TenantsBankRestService from "../../../api/tenantsBankRestService";
const MySwal = withReactContent(Swal);
class WithdrawOfTenantFunds extends Component {
  constructor(props) {
    super(props);

    this.debitRestService = new DebitRestService();
    this.tenantRestService = new TenantRestService();
    this.walletTransactionsRestService = new WalletTransactionsRestService();

    this.relatedData = new RelatedDataRestService();
    this.exportService = new ExportDebitCOD();
    this.pictureRestService = new PictureRestService();
    this.tenantBankRestService = new TenantsBankRestService();
    this.moneyFormat = new MoneyFormat();
    this.toggle = this.toggle.bind(this);
    this.loadRelatedDataBank = this.loadRelatedDataBank.bind(this);
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
      collapse: false,
      bankNames: [],
      bankSelected: [],
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
      bankOptions: [],
      lowDate: null,
      highDate: null,
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
    this.loadRelatedDataBank();
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

  loadRelatedDataBank() {
    this.tenantBankRestService.loadRelatedData({}).subscribe(response => {
      this.setState({
        bankOptions: response.bank,
      })
    });
  }

  loadData() {
    const table = { ...this.state.table };
    table.loading = true;
    this.setState({ table });

    const params = {
      keyword: this.state.search || null,
      statuses: 'open',
      lowDate: this.state.lowDate,
      highDate: this.state.highDate,
      bankNames: this.state.bankNames || null,
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
      this.state.amount === undefined
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

      const attachments = [];
      for(let i = 0; i < data.attachments.length; i++) {
        attachments.push({
          id: data.attachments[i].id,
          isMain: i === 0 ? true : false,
          customFileName: data.attachments[i].customFileName,
        })
      }

      let lines = {
        isApprove: true,
        note: this.state.note,
        attachments: attachments,
      };

      MySwal.fire({
        title: '<strong>Konfirmasi Transfer</strong>',
        icon: 'info',
        html:
          '<table className=\'table\' align=\'center\'>' +
            '<tr>' +
              '<th>No Rekening</th>' +
              '<td>:</td>' +
              `<td>${data.oneData.accountNumber}</td>` +
            '</tr>' +
            '<tr>' +
              '<th>Nama Rekening</th>' +
              '<td>:</td>' +
              `<td>${data.oneData.accountName}</td>` +
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
          this.walletTransactionsRestService.approve(this.state.oneData.id, lines).subscribe(
            response => {
              this.setState({
                errorData: '',
                modal2: true,
                loadingSubmit: false,
                modalResponse: true,
                modalError: false,
                isChanged: false,
                attachments: [],
                note: '',
              });
            },
            err => {
              this.setState({
                isChanged: false,
                loadingSubmit: false,
                modal2: true,
                modalError: true,
                modalResponse: false,
                attachments: [],
                errorData: err.data[0] ? err.data[0].errorMessage : 'Tidak diketahui',
                note: '',
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
      statuses: 'open'
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
      "options.take": this.state.totalData,
      statuses: 'open'
    };

    this.debitRestService.getDebitCod({ params }).subscribe(res => {
      this.exportService.exportToCSV(res.data, "Penarikan Data Tenant");
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

  render() {
    if (this.state.redirect === true) {
      this.setState({ redirect: false });
      return <Redirect to="/user/login" />;
    }
    return (
      <>
        <Row>
          <Colxx xxs={12}>
            <Breadcrumb heading="Permintaan penarikan dana" match={this.props.match} />
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
                        style={{borderRadius: '5px 0px 0px 5px'}}
                      />
                      <Button
                        className="default"
                        color="primary"
                        onClick={() => this.loadData()}
                        style={{borderRadius: '0px 5px 5px 0px'}}
                      >
                        <i className="simple-icon-magnifier" />
                      </Button>
                      <Button
                        className="default"
                        color="primary"
                        onClick={() => this.setState({collapse: !this.state.collapse})}
                        style={{marginLeft: 10, borderRadius: 5}}
                      >
                        Filter
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
                  {this.state.bankOptions && (
                    <Collapse isOpen={this.state.collapse} className="col-md-12">
                      <Card>
                          <div className="form-row">
                            <div className="form-group col-md-6">
                              <label for="inputPassword4">Bank</label>
                              <div className="col-md-7">
                                <MultiSelect optionLabel="bankName" value={this.state.bankSelected} options={this.state.bankOptions}  onChange={(e) => this.setState({bankSelected: e.value})} filter={true} maxSelectedLabels={2} />
                              </div>
                            </div>
                            <div className="form-group col-md-6">
                              <label for="inputEmail4">Tanggal</label>
                              <div className="row">
                                <div className="col-md-6">
                                  <Calendar value={this.state.lowDate} onChange={(e) => this.setState({lowDate: moment(e.value).format('YYYY-MM-DD')})}></Calendar>
                                </div>
                                <div className="col-md-6">
                                  <Calendar value={this.state.highDate} onChange={(e) => this.setState({highDate: moment(e.value).format('YYYY-MM-DD')})}></Calendar>
                                </div>
                              </div>
                            </div>
                          </div>
                        <CardFooter>
                        <div className="float-right">
                          <Button 
                            className="default"
                            color="primary"
                            style={{borderRadius: 5, marginRight: 10}}
                            onClick={() => {
                              this.setState({collapse: false})
                              const data = this.state;
                              const bankNames = data.bankSelected;
                              const filterBank = [];
                              let bank = null;

                              if(_.isArray(bankNames)) {
                                for (const bank of bankNames) {
                                  filterBank.push(bank.bankName)
                                }
                              }

                              if (filterBank.length) {
                                bank = filterBank.join();
                              }
                              this.setState({bankNames: bank}, () => {
                                this.loadData();
                              });
                            }}
                          >
                            Terapkan
                          </Button>
                          <Button
                            className="default"
                            color="danger"
                            style={{borderRadius: 5}}
                            onClick={() => {
                              this.setState({
                                bankSelected: null,
                                lowDate: null,
                                highDate: null,
                              })
                            }}
                          >
                            Reset
                          </Button>
                        </div>
                        </CardFooter>
                      </Card>
                    </Collapse>
                  )}
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
                    <td>{this.state.oneData.accountName || '-'}</td>
                  </tr>
                  <tr>
                    <td>
                      <IntlMessages id="modal.bank" />
                    </td>
                    <td>:</td>
                    <td>
                      {this.state.oneData.bankName || '-'}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <IntlMessages id="modal.creditNumber" />
                    </td>
                    <td>:</td>
                    <td>
                      {this.state.oneData.accountNumber || '-'}
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
                      {this.moneyFormat.numberFormat(this.state.amount) || 0}
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

export default WithdrawOfTenantFunds;
