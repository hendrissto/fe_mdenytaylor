import React, { Component, Fragment } from "react";
import {
  // Row,
  Table,
  // Card,
  // CardBody,
  Button,
  Input,
  InputGroup,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter, } from "reactstrap";
import { Redirect, NavLink } from "react-router-dom";
import { Separator } from "../../../components/common/CustomBootstrap";
import Breadcrumb from "../../../containers/navs/Breadcrumb";
import NumberFormat from "react-number-format";
import Loader from "react-loader-spinner";
import RelatedDataRestService from "../../../api/relatedDataRestService";
import PictureRestService from "../../../api/pictureRestService";
import { MoneyFormat } from "../../../services/Format/MoneyFormat";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import TenantRestService from "../../../api/tenantRestService";
import { RadioButton } from "primereact/radiobutton";
import { AutoComplete } from "primereact/autocomplete";
import Loading from "../../../containers/pages/Spinner";
import WalletTransactionsRestService from "../../../api/walletTransactionsRestService";
import { throwError } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import * as moment from 'moment';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { ColumnFormat } from "../../../services/Format/ColumnFormat";
import { AclService } from "../../../services/auth/AclService";
import { Checkbox } from 'primereact/checkbox';

const MySwal = withReactContent(Swal);

class WalletTransactions extends Component {
  initialState = {
    amount: null,
    note: null,
    isCredit: true,
    feeAmount: null,

    image: null,
    loading: false,
    mainLoading: false,
    imageUrl: null,
    attachments: [],

    tenantOptions: null,
    tenantSelected: null,
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
    tableDetail: {
      loading: false,
      data: [],
      pagination: {
        currentPage: 0,
        totalPages: 0,
        skipSize: 0,
        pageSize: 10
      }
    },
    oneData: null,
    oneDataTransactions: null,
    modalAddWallet: false,
    modalDetailWallet: false,
    isEdit: false,
    realAttachments: [],
    tenantBank: null,
    selectedBank: null,
    isClodeoBank: false,
    modalDetailOneTenants: false,
    selectedTenantId: null,
  };
  constructor(props) {
    super(props);
    this.tenantRest = new TenantRestService();
    this.walletTransactionsRestService = new WalletTransactionsRestService();
    this.relatedDataRestService = new RelatedDataRestService();
    this.pictureRestService = new PictureRestService();
    this.acl = new AclService();
    this.moneyFormat = new MoneyFormat();
    this.columnFormat = new ColumnFormat();
    this.fileHandler = this.fileHandler.bind(this);
    this.isAttachment = this.isAttachment.bind(this);
    this.rmAttachment = this.rmAttachment.bind(this);
    this.submitData = this.submitData.bind(this);
    this.suggestTenants = this.suggestTenants.bind(this);
    this.actionTemplate = this.actionTemplate.bind(this);
    this.handleOnPageChange = this.handleOnPageChange.bind(this);
    this.toggle = this.toggle.bind(this);
    this.showAttachment = this.showAttachment.bind(this);
    this.editData = this.editData.bind(this);
    this.loadBankTenant = this.loadBankTenant.bind(this);
    this.loadOneData = this.loadOneData.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.actionTemplateForEditAttachment = this.actionTemplateForEditAttachment.bind(this);
    this.handleOnPageDetailChange = this.handleOnPageDetailChange.bind(this);

    this.state = this.initialState;
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

  toggle() {
    this.setState({modalAddWallet: !this.state.modalAddWallet});
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

    this.walletTransactionsRestService.loadDataTenantTransactions({ params }).subscribe(response => {
      const table = { ...this.state.table };
      table.data = response.data;
      table.pagination.totalPages = Math.ceil(response.total / response.take);
      table.loading = false;
      this.setState({ table });
    }, err => {
      if (err.response.status === 401) {
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

  validateError() {
    if (
      this.state.amount === null ||
      this.state.amount === "" ||
      this.state.tenantSelected.length === 0 ||
      (!this.state.isCredit && !this.state.selectedBank && !this.state.isClodeoBank)
    ) {
      return true;
    } else {
      return false;
    }
  }

  suggestTenants(event) {
    const params = {
      keyword: event.query || null,
      isWalletTransaction: true,
      "options.take": 30,
      "options.skip": 0
    };

    this.tenantRest.getTenants({ params }).subscribe(response => {
      this.setState({
        tenantOptions: response.data
      });
    });
  }

  submitData() {
    if (this.validateError()) {
      MySwal.fire({
        type: "error",
        title: "Pastikan semua data telah diisi.",
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
        customClass: "swal-height"
      });
    } else {
      let tenantBank = null;
      if (!this.state.isClodeoBank && !this.state.isCredit) {
        tenantBank = this.state.selectedBank.id;
      }
      this.setState({ modalAddWallet: false, mainLoading: true });
      const payload = {
        tenantId: this.state.tenantSelected.id,
        isCredit: this.state.isCredit,
        note: this.state.note,
        amount: Number.isInteger(this.state.amount)
          ? parseInt(this.state.amount)
          : parseFloat(this.state.amount.replace(/,/g, "")),
        feeTransfer: parseInt(this.state.feeAmount) || 0,
        attachments: this.state.attachments || null,
        tenantBankId: !this.state.isCredit ? tenantBank : null,
        isClodeoBank: this.state.isClodeoBank
      };

      this.walletTransactionsRestService
        .submitData(payload)
        .pipe(
          catchError(error => {
            MySwal.fire({
              type: "error",
              title:  error.data[0] ? error.data[0].errorMessage : 'Tidak diketahui',
              toast: true,
              position: "top-end",
              timer: 2000,
              showConfirmButton: false,
              customClass: "swal-height"
            });
            return throwError(error);
          }),
          finalize(() => {
            this.setState({ mainLoading: false });
          })
        )
        .subscribe(() => {
          MySwal.fire({
            type: "success",
            title: "Berhasil input data.",
            toast: true,
            position: "top-end",
            timer: 2000,
            showConfirmButton: false,
            customClass: "swal-height"
          });

          this.setState({
            amount: null,
            note: null,
            isCredit: true,
            feeAmount: null,

            image: null,
            imageUrl: null,
            attachments: [],

            tenantOptions: null,
            tenantSelected: null,
          });
          this.loadData();
        });
    }
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
          <tr key={`${attachment[i].id}`}>
            <td colSpan={3}>{attachment[i].customFileName}</td>
            <td>
              <a
                href
                className="text-danger"
                style={{ cursor: "pointer" }}
                onClick={() => this.rmAttachment(i)}
              >
                Hapus
              </a>
            </td>
          </tr>
        );
      }
    }

    return data;
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

  handleOnPageDetailChange(paginationEvent) {
    const tableDetail = { ...this.state.tableDetail };
    tableDetail.loading = true;
    tableDetail.pagination.pageSize = paginationEvent.rows;
    tableDetail.pagination.skipSize = paginationEvent.first;
    tableDetail.pagination.currentPage = paginationEvent.page + 1;

    this.setState({ tableDetail }, () => {
      this.loadOneData(this.state.selectedTenantId);
    });
  }

  actionTemplate(rowData, column) {
    return (
        <div>
        <Button
          type="button"
          icon="pi pi-search"
          onClick={() => {
            this.setState({selectedTenantId: rowData.id});
            this.loadOneData(rowData.id);
          }}
          className="p-button-success"
        >
          Detail
        </Button>
      </div>
    )
  }

  actionTemplateForEditAttachment(rowData, column) {
    return <div>
      <Button
        type="button"
        icon="pi pi-search"
        onClick={() => {
          // this.setState({realAttachments: []});

          let attachments = this.state.attachments;
          let realAttachments = this.state.realAttachments;
          attachments = [];
          realAttachments = [];
          if(rowData.attachments) {
            for(let i = 0; i < rowData.attachments.length; i++) {
              attachments.push(rowData.attachments[i]);
              realAttachments.push(rowData.attachments[i]);
            }
          }
          this.setState({
            attachments,
            realAttachments,
            note: rowData.note,
            oneData: rowData,
            modalDetailWallet: true
          })
        }}
        className="p-button-success"
      >
        Update
        </Button>
    </div>;
  }

  loadOneData(data) {
    const table = { ...this.state.table };
    table.loading = true;
    this.setState({table});

    const params = {
      keyword: this.state.search || null,
      "options.take": this.state.tableDetail.pagination.pageSize,
      "options.skip": this.state.tableDetail.pagination.skipSize,
      "options.includeTotalCount": true
    };

    this.walletTransactionsRestService.loadOneDataTenantTransactions(data, {params}).subscribe(response => {
      const tableDetail = { ...this.state.tableDetail };
      tableDetail.data = response.data;
      tableDetail.pagination.totalPages = Math.ceil(response.total / response.take);
      tableDetail.loading = false;
      table.loading = false;
      this.setState({tableDetail, mainLoading: false, modalDetailOneTenants: true, table });
    }, err => {
      if (err.response.status === 401) {
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
      table.loading = false;
      this.setState({mainLoading: false, table});
    })
  }

  changeDateFormat(rowData, column) {
    return moment(rowData['transactionDate']).format('DD-MM-YYYY') || '-';
  }

  showAttachment() {
    const view = [];
    if (this.state.attachments) {
      this.state.attachments.map(function (attachment, i) {
        view.push(
          <>
            <tr>
              <td colSpan={4}>
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

  loadBankTenant(id) {
    this.relatedDataRestService.getTenantBank(id, {}).subscribe(response => {
      this.setState({ tenantBank: response.data });
    });
  }

  detailWalletTransactions(rowData, column) {
    return (
      <NavLink to={`detail-transactions/${rowData.id}`}>
        <span>
          {rowData.companyInfo.companyName}
        </span>
      </NavLink>
    )
  }

  editData() {
    const tableDetail = { ...this.state.tableDetail };
    tableDetail.loading = true;
    this.setState({tableDetail, modalDetailWallet: false });

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
      tenantId: oneData.tenantId,
      isCredit: oneData.transactionType === 'credit' ? true : false,
      note: data.note,
      amount: oneData.amount,
      feeTransfer: oneData.feeTransfer,
      attachments: attachments,
    }

    this.walletTransactionsRestService.editData(oneData.id, payload).subscribe(res => {
      tableDetail.loading = false;
      MySwal.fire({
        type: "success",
        title: "Sukses Edit Data.",
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
        customClass: "swal-height"
      });
      this.loadOneData(this.state.selectedTenantId);
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
      this.setState({mainLoading: false});
      this.loadOneData(this.state.selectedTenantId);
    })
  }

  render() {
    if (this.state.redirect === true) {
      this.setState({ redirect: false });
      return <Redirect to="/user/login" />;
    }
    return (
      <Fragment>
        <Breadcrumb heading="Tenants Wallet" match={this.props.match} />
        <Separator className="mb-5" />
        <div className="card">
          <div className="card-body">
          <div className="row d-flex justify-content-between" style={{marginBottom: 10}}>
            <div className="col-md-3">
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
                  style={{
                    borderRadius: '0px 6px 6px 0px'
                  }}
                >
                  <i className="simple-icon-magnifier" />
                </Button>
              </InputGroup>
            </div>
            { this.acl.can(['wallet.tenant_wallet.create']) &&
            <div>
              <Button
                className="default"
                color="primary"
                onClick={() => this.setState({
                  amount: null,
                  note: null,
                  isCredit: true,
                  feeAmount: null,

                  image: null,
                  imageUrl: null,
                  attachments: [],

                  selectedBank: null,
                  tenantBank: null,
                  tenantOptions: null,
                  tenantSelected: null,
                  modalAddWallet: true
                })}
                style={{
                  borderRadius: 6,
                  marginRight: 14
                }}
              >
                Tambah Wallet Transaction
              </Button>
            </div>
            }
         </div>

            {/*<Column style={{width:'250px'}} field="deliveryDate" header="Seller Name" frozen={true}/>*/}
            <DataTable value={this.state.table.data} className="noheader" lazy={true} loading={this.state.table.loading} responsive={true} resizableColumns={true} columnResizeMode="fit" scrollable={true} scrollHeight="500px">
              {/*
                <Column style={{width:'220px'}} field="transactionDate" header="Tanggal Transaksi" body={this.changeDateFormat} />
                <Column style={{width:'200px'}} field="transactionType" header="Type Transaksi" body={this.columnFormat.emptyColumn}/>
                <Column style={{width:'200px'}} field="accountNumber" header="No Rekening" body={this.columnFormat.emptyColumn}/>
                <Column style={{width:'250px'}} field="accountName" header="Nama Rekening" body={this.columnFormat.emptyColumn}/>
                <Column style={{width:'200px'}} field="bankName" header="Nama Bank" body={this.columnFormat.emptyColumn}/>
                <Column style={{width:'200px'}} field="bankDistrict" header="Cabang Bank" body={this.columnFormat.emptyColumn}/>
                <Column style={{width:'200px'}} field="amount" header="Amount" body={this.moneyFormat.currencyFormat}  />
                <Column style={{width:'200px'}} field="feeTransfer" header="Fee Transfer" body={this.moneyFormat.currencyFormat}  />
                <Column style={{width:'200px'}} field="note" header="Note" body={this.columnFormat.emptyColumn}/>
              */}
              <Column style={{width:'250px'}} field="companyInfo.companyName" header="Company Name" body={this.detailWalletTransactions} />
              <Column style={{width:'250px'}} field="companyInfo.email" header="Company Email" />
              <Column style={{width:'250px'}} field="companyInfo.phone" header="Company Phone" />
              <Column style={{width:'250px'}} field="walletBalance.balance" header="Ballance" body={this.moneyFormat.currencyFormatOld} />
              <Column style={{width:'250px'}} header="Detail" body={this.actionTemplate}/>
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
          </div>
        </div>

        {this.state.mainLoading && <Loading />}

        {this.state.modalAddWallet && (
          <Modal isOpen={this.state.modalAddWallet} toggle={this.toggle} size="lg">
            <ModalHeader toggle={this.toggle}>
              Tambah Data
            </ModalHeader>
            <ModalBody>
              <Table>
                <tbody>
                  <tr>
                    <td>Tenant</td>
                    <td>:</td>
                    <td>
                      <AutoComplete
                        value={this.state.tenantSelected}
                        suggestions={this.state.tenantOptions}
                        completeMethod={this.suggestTenants}
                        size={30}
                        minLength={1}
                        field="companyInfo.name"
                        dropdown={true}
                        onDropdownClick={this.suggestTenants}
                        onChange={e => {
                          this.setState({ tenantSelected: e.value })
                        }}
                        onSelect={(e) => {
                          this.loadBankTenant(e.value.id)
                        }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Transaction Type</td>
                    <td>:</td>
                    <td>
                      <div className="p-col-12 mb-2">
                        <RadioButton
                          value={true}
                          name="isCredit"
                          onChange={e => this.setState({ isCredit: e.value })}
                          checked={this.state.isCredit === true}
                        />
                        <label htmlFor="rb2" className="p-radiobutton-label">
                          Credit
                        </label>
                      </div>

                      <div className="p-col-12">
                        <RadioButton
                          value={false}
                          name="isCredit"
                          onChange={e => this.setState({ isCredit: e.value })}
                          checked={this.state.isCredit === false}
                        />
                        <label htmlFor="rb2" className="p-radiobutton-label">
                          Debit
                        </label>
                      </div>
                    </td>
                  </tr>
                  {!this.state.isCredit && (
                    <tr>
                      <td>{" "}</td>
                      <td>{" "}</td>
                      <td><Checkbox inputId="cb1" onChange={e => this.setState({isClodeoBank: e.checked})} checked={this.state.isClodeoBank}></Checkbox>
                      <label htmlFor="cb1" className="p-checkbox-label">Transfer ke rekening Clodeo</label> </td>
                    </tr>
                  )}
                  {!this.state.isCredit && !this.state.isClodeoBank && (
                    <tr>
                      <td> Bank </td>
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

                  )}

                  <tr>
                    <td>{this.state.isCredit ? "Credit" : "Debit"} Amount</td>
                    <td>:</td>
                    <td>
                      <NumberFormat
                        className="form-control"
                        isNumericString={true}
                        thousandSeparator={'.'}
                        decimalSeparator={','}
                        value={this.state.amount}
                        onValueChange={(values) => {
                          const { value } = values;
                          this.setState({ amount: value });
                        }}
                      />
                    </td>
                  </tr>

                  <tr>
                    <td> Fee Amount</td>
                    <td>:</td>
                    <td>
                    <InputText
                      keyfilter="pint"
                      className="form-control"
                      value={this.state.feeAmount}
                      onChange={e =>
                        this.setState({ feeAmount: e.target.value })
											}
											placeholder={0}
                    />
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
                      />
                    </td>
                  </tr>

                  <tr>
                    <td colSpan="3">
                      <input
                        ref={el => {
                          this.inputFile = el;
                        }}
                        type="file"
                        onChange={this.fileHandler.bind(this)}
                      />
                    </td>
                  </tr>
                  {this.state.spinner && (
                    <Loader
                      type="Oval"
                      color="#51BEEA"
                      height={80}
                      width={80}
                    />
                  )}
                  {this.state.loading && this.isAttachment()}
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
            </ModalFooter>
          </Modal>
        )}

        {this.state.modalDetailWallet && (
          <Modal isOpen={this.state.modalDetailWallet} >
            <ModalHeader>Detail</ModalHeader>
            <ModalBody
              style={{
                maxHeight: 380,
                overflow: "auto"
              }}>
              <Table>
                <tbody>
                  <tr>
                    <td>Nama Rekening</td>
                    <td>:</td>
                    <td>{this.state.oneData.bankName}</td>
                  </tr>
                  <tr>
                    <td>
                      No Rekening
                    </td>
                    <td>:</td>
                    <td>{this.state.oneData.accountNumber}</td>
                  </tr>
                  <tr>
                    <td>
                      Nama Bank
                    </td>
                    <td>:</td>
                    <td>{this.state.oneData.bankName}</td>
                  </tr>
                  <tr>
                    <td>
                      Cabang Bank
                    </td>
                    <td>:</td>
                    <td>{this.state.oneData.bankDistrict}</td>
                  </tr>
                  <tr>
                    <td>Amount</td>
                    <td>:</td>
                    <td>
                      Rp. {this.state.oneData.amount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                  <tr>
                    <td>Fee Transfer</td>
                    <td>:</td>
                    <td>
                      Rp. {this.state.oneData.feeTransfer.toLocaleString('id-ID')}
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
                      this.setState({ attachments: this.state.realAttachments, isEdit: false })
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
                onClick={() => this.setState({ attachments: [], modalDetailWallet: false, isEdit: false })}
              >
                Close
              </Button>
            </ModalFooter>
          </Modal>
        )}

        {this.state.modalDetailOneTenants && (
          <Modal isOpen={this.state.modalDetailOneTenants} size="lg">
            <ModalHeader>Detail Transaksi</ModalHeader>
            <ModalBody>
              <DataTable value={this.state.tableDetail.data} className="noheader" lazy={true} loading={this.state.tableDetail.loading} responsive={true} resizableColumns={true} columnResizeMode="fit" scrollable={true} scrollHeight="250px">
                <Column style={{width:'220px'}} field="transactionDate" header="Tanggal Transaksi" body={this.changeDateFormat} />
                <Column style={{width:'200px'}} field="transactionType" header="Type Transaksi" body={this.columnFormat.emptyColumn}/>
                <Column style={{width:'200px'}} field="accountNumber" header="No Rekening" body={this.columnFormat.emptyColumn}/>
                <Column style={{width:'250px'}} field="accountName" header="Nama Rekening" body={this.columnFormat.emptyColumn}/>
                <Column style={{width:'200px'}} field="bankName" header="Nama Bank" body={this.columnFormat.emptyColumn}/>
                <Column style={{width:'200px'}} field="bankDistrict" header="Cabang Bank" body={this.columnFormat.emptyColumn}/>
                <Column style={{width:'200px'}} field="amount" header="Amount" body={this.moneyFormat.currencyFormat}  />
                <Column style={{width:'200px'}} field="feeTransfer" header="Fee Transfer" body={this.moneyFormat.currencyFormat}  />
                <Column style={{width:'200px'}} field="note" header="Note" body={this.columnFormat.emptyColumn}/>
                { this.acl.can(['wallet.tenant_wallet.edit']) &&
                  <Column style={{width:'250px'}} header="Action" body={this.actionTemplateForEditAttachment}/>
                }
              </DataTable>
              <Paginator
                first={this.state.tableDetail.pagination.skipSize}
                rows={this.state.tableDetail.pagination.pageSize}
                totalRecords={
                  Math.ceil(this.state.tableDetail.pagination.totalPages) *
                  this.state.tableDetail.pagination.pageSize
                }
                onPageChange={this.handleOnPageDetailChange}
              />
            </ModalBody>
            <ModalFooter>
              <Button
                color="primary"
                outline
                style={{
                  borderRadius: 6
                }}
                onClick={() => this.setState({ modalDetailOneTenants: false })}
              >
                Close
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </Fragment>
    );
  }
}

export default WalletTransactions;
