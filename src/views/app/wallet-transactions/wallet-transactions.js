import React, { Component, Fragment } from "react";
import { Row, Table, Card, CardBody, Button, Input, InputGroup,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter, } from "reactstrap";
import { Redirect } from "react-router-dom";
import { Colxx } from "../../../components/common/CustomBootstrap";
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

const MySwal = withReactContent(Swal);

class WalletTransactions extends Component {
  initialState = {
    amount: null,
    note: null,
    isCredit: true,
    feeAmount: 0,

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

    oneData: null,
    modalAddWallet: false,
    modalDetailWallet: false,
    isEdit: false,
    realAttachments: [],
    tenantBank: null,
    selectedBank: null,
  };
  constructor(props) {
    super(props);
    this.tenantRest = new TenantRestService();
    this.walletTransactionsRestService = new WalletTransactionsRestService();
    this.relatedDataRestService = new RelatedDataRestService();
    this.pictureRestService = new PictureRestService();
    this.moneyFormat = new MoneyFormat();
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

    this.state = this.initialState;
  }

  componentDidMount() {
    this.loadData();
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

    this.walletTransactionsRestService.loadData({ params }).subscribe(response => {
      const table = { ...this.state.table };
      table.data = response.data;
      table.pagination.totalPages = Math.ceil(response.total / response.take);
      table.loading = false;
      this.setState({ table });
    }, err => {
      if (err.response.status === 401) {
        this.setState({ redirect: true });
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
      this.state.feeAmount === null || this.state.feeAmount === "" ||
      this.state.tenantSelected.length === 0 ||
      (this.state.attachments && this.state.attachments.length === 0)
    ) {
      return true;
    } else {
      return false;
    }
  }

  suggestTenants(event) {
    const params = {
      keyword: event.query || null,
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
      this.setState({ mainLoading: true });
      const payload = {
        tenantId: this.state.tenantSelected.id,
        isCredit: this.state.isCredit,
        note: this.state.note,
        amount: Number.isInteger(this.state.amount)
          ? parseInt(this.state.amount)
          : parseFloat(this.state.amount.replace(/,/g, "")),
        feeTransfer: Number.isInteger(this.state.feeAmount)
          ? parseInt(this.state.feeAmount)
          : parseFloat(this.state.feeAmount.replace(/,/g, "")),
        attachments: this.state.attachments,
        tenantBankId: !this.state.isCredit ? this.state.selectedBank.bankId : undefined,
      };

      this.walletTransactionsRestService
        .submitData(payload)
        .pipe(
          catchError(error => {
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
            modalAddWallet: false,
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
            <td>{attachment[i].customFileName}</td>
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

  actionTemplate(rowData, column) {
    return <div>
      <Button
        type="button"
        icon="pi pi-search"
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
            attachments,
            realAttachments,
            oneData: rowData,
            modalDetailWallet: true
          })
        }}
        className="p-button-success"
      >
        Detail
        </Button>
    </div>;
  }

  changeDateFormat(rowData, column) {
    return moment(rowData['transactionDate']).format('DD-MM-YYYY');
  }

  showAttachment() {
    const view = [];
    if (this.state.attachments) {
      this.state.attachments.map(function (attachment, i) {
        view.push(
          <>
            <tr>
              <td>
                <a target="_blank" href={attachment.fileUrl}>{attachment.customFileName}</a>
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

  editData() {
    this.setState({modalDetailWallet: false, mainLoading: true});

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
      note: oneData.note,
      amount: oneData.amount,
      feeTransfer: oneData.feeTransfer,
      attachments: attachments,
    }

    this.walletTransactionsRestService.editData(oneData.id, payload).subscribe(res => {
      MySwal.fire({
        type: "success",
        title: "Sukses Edit Data.",
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
        customClass: "swal-height"
      });
      this.setState({mainLoading: false});
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
    })
  }

  render() {
    if (this.state.redirect === true) {
      this.setState({ redirect: false });
      return <Redirect to="/user/login" />;
    }
    return (
      <Fragment>
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
          </div>
                      
          <DataTable value={this.state.table.data} className="noheader" lazy={true} loading={this.state.table.loading} responsive={true} resizableColumns={true} columnResizeMode="fit" scrollable={true} scrollHeight="500px">
            {/*<Column style={{width:'250px'}} field="deliveryDate" header="Seller Name" frozen={true}/>*/}
            <Column style={{width:'220px'}} field="transactionDate" header="Tanggal Transaksi" body={this.changeDateFormat} />
            <Column style={{width:'200px'}} field="transactionType" header="Type Transaksi"/>
            <Column style={{width:'200px'}} field="accountNumber" header="No Rekening" />
            <Column style={{width:'250px'}} field="accountName" header="Nama Rekening" />
            <Column style={{width:'200px'}} field="bankName" header="Nama Bank" />
            <Column style={{width:'200px'}} field="bankDistrict" header="Cabang Bank" />
            <Column style={{width:'200px'}} field="amount" header="Amount" body={this.moneyFormat.currencyFormat}  />
            <Column style={{width:'200px'}} field="feeTransfer" header="Fee Transfer" body={this.moneyFormat.currencyFormat}  />
            <Column style={{width:'200px'}} field="note" header="Note" />
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
                      {/* <Dropdown
                          optionLabel="accountName"
                          value={this.state.tenantSelected}
                          options={this.state.tenantOptions}
                          onChange={e => {
                              this.setState({ tenantSelected: e.value });
                          }}
                          placeholder="Select a Tenant"
                      /> */}

                      {/* <Dropdown value={this.state.tenantSelected} options={this.state.tenantOptions} onChange={e => {
                            this.setState({ tenantSelected: e.value });
                        }} dataKey="id" optionLabel="companyInfo.name" filter={true} filterPlaceholder="Select Tenant" filterBy="companyInfo.name" showClear={true} /> */}

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
                        thousandSeparator={true}
                        value={this.state.amount}
                        onChange={event => {
                          this.setState({ amount: event.target.value });
                        }}
                      />
                    </td>
                  </tr>

                  <tr>
                    <td> Fee Amount</td>
                    <td>:</td>
                    <td>
                      <NumberFormat
                        className="form-control"
                        isNumericString={true}
                        defaultValue={this.state.feeAmount}
                        thousandSeparator={true}
                        value={this.state.feeAmount}
                        onChange={event => {
                          this.setState({ feeAmount: event.target.value });
                        }}
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
          <Modal isOpen={this.state.modalDetailWallet}>
            <ModalHeader>Detail</ModalHeader>
            <ModalBody>
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
                      {this.moneyFormat.numberFormat(this.state.oneData.amount)}
                    </td>
                  </tr>
                  <tr>
                    <td>Fee Transfer</td>
                    <td>:</td>
                    <td>
                      {this.moneyFormat.numberFormat(this.state.oneData.feeTransfer)}
                    </td>
                  </tr>
                  <tr>
                    <td>Note</td>
                    <td>:</td>
                    <td>
                      {this.state.oneData.note}
                    </td>
                  </tr>
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
                    this.setState({ attachments: [], isEdit: !this.state.isEdit })
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
                onClick={() => this.setState({ modalDetailWallet: false })}
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
