import React, { Component, Fragment } from "react";
// import ReactTable from "react-table";
import { Redirect } from "react-router-dom";
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
import { MoneyFormat } from "../../../services/Format/MoneyFormat";
import { Paginator } from "primereact/paginator";

import IntlMessages from "../../../helpers/IntlMessages";

import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import Breadcrumb from "../../../containers/navs/Breadcrumb";

import WithdrawRestService from "../../../api/requestWithdrawRestService";
import RelatedDataRestService from "../../../api/relatedDataRestService";
import PictureRestService from "../../../api/pictureRestService";
// import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
// import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css";
import { InputSwitch } from "primereact/inputswitch";
import { Dropdown } from "primereact/dropdown";
import Loader from "react-loader-spinner";
import Spinner from "../../../containers/pages/Spinner";
import NumberFormat from 'react-number-format';
import ExportWithdrawFunds from "../../../core/export/ExportWithdrawFunds";

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
const MySwal = withReactContent(Swal);

class WithdrawFunds extends Component {
  constructor(props) {
    super(props);
    this.requestWithdrawRest = new WithdrawRestService();
    this.relatedDataRestService = new RelatedDataRestService();
    this.pictureRestService = new PictureRestService();
    this.exportService = new ExportWithdrawFunds();
    this.moneyFormat = new MoneyFormat();
    this.handleInputChange = this.handleInputChange.bind(this);
    this.loadTenantBank = this.loadTenantBank.bind(this);
    this.fileHandler = this.fileHandler.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.submitData = this.submitData.bind(this);
    this.togglePopOver = this.togglePopOver.bind(this);
    this.handleOnPageChange = this.handleOnPageChange.bind(this);
    this.buttonUpload = this.buttonUpload.bind(this);
    this.isAttachment = this.isAttachment.bind(this);
    this.rmAttachment = this.rmAttachment.bind(this);

    this.state = {
      companyName: true,
      companyEmail: true,
      fullName: true,
      username: true,
      userEmail: true,
      industry: true,
      phone: true,
      website: true,
      balanceTransaction: true,
      codBalance: true,
      balanceAmount: true,
      fileAttach: true,
      popoverOpen: false,
      error: false,
      redirectLogin: false,
      table: {
        loading: true,
        loadingSubmit: false,
        spinner: false,
        data: [],
        pagination: {
          currentPage: 0,
          totalPages: 0,
          skipSize: 0,
          pageSize: 10
        }
      },
      amount: null,
      tenantBank: null,
      oneData: "",
      search: "",
      modal: false,
      modal2: false,
      modalResponse: false,
      dropdownOpen: false,
      splitButtonOpen: false,
      dropdownOpen1: false,
      splitButtonOpen1: false,
      isDraft: false,
      selectedBank: [],
      image: null,
      loading: false,
      imageUrl: null,
      attachments: [],
      redirect: false,
      errorData: "",
      totalData: 0,
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

  handleFilterChange(event) {
    const target = event.target;
    const value = target.checked;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  toggleModal() {
    this.setState({
      modal2: !this.state.modal2
    });
    this.loadData();
  }

  togglePopOver() {
    this.setState(prevState => ({
      popoverOpen: !prevState.popoverOpen
    }));
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
      table.pagination.totalPages = Math.ceil(response.total / response.take);
      table.loading = false;

      this.setState({ table });
    }, err => {
      if (err.response.status === 401) {
        this.setState({ redirectLogin: true });
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

  loadTenantBank(id) {
    this.setState({ loadingSubmit: true })
    this.relatedDataRestService.getTenantBank(id, {}).subscribe(
      response => {
        this.setState({ tenantBank: response.data });
      },
      err => {
        this.setState({ loadingSubmit: false });
        if (err.response.status === 401 || err.response.status === 500) {
          this.setState({ redirectLogin: true });
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
      }
    );
  }

  dataTableColumns() {
    return [
      {
        Header: "Tenant ID",
        accessor: "tenantId",
        show: false,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Company",
        accessor: "companyName",
        width: 150,
        show: this.state.companyName,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Company Email",
        accessor: "companyEmail",
        width: 180,
        show: this.state.companyEmail,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Full Name",
        accessor: "fullName",
        width: 150,
        show: this.state.fullName,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Username",
        accessor: "username",
        show: this.state.username,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Email",
        accessor: "userEmail",
        width: 150,
        show: this.state.userEmail,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Industry",
        accessor: "industry",
        width: 100,
        show: this.state.industry,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Phone",
        accessor: "phone",
        width: 120,
        show: this.state.phone,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Website",
        accessor: "website",
        width: 140,
        show: this.state.website,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Ballance Amount",
        accessor: "balanceAmount",
        width: 150,
        show: this.state.balanceTransaction,
        Cell: props => <p>{this.moneyFormat.numberFormat(props.value)}</p>
      },
      // {
      //   Header: "Wallet Balance",
      //   accessor: "walletBalance",
      //   width: 120,
      //   show: this.state.codBalance,
      //   Cell: props => <p>{this.moneyFormat.numberFormat(props.value)}</p>
      // },
      // {
      //   Header: "Ballance Amount",
      //   accessor: "balanceAmount",
      //   width: 150,
      //   show: this.state.balanceAmount,
      //   Cell: props => <p>{this.moneyFormat.numberFormat(props.value)}</p>
      // },
      {
        Header: "Upload Bukti",
        width: 200,
        show: this.state.fileAttach,
        Cell: props => {
          return (
            <div>
              <Button
                outline
                color="success"
                onClick={() => {
                  this.loadTenantBank(props.original.tenantId);
                  this.toggle();
                  this.setState({
                    oneData: props.original,
                    amount: props.original.balanceAmount
                  });
                }}
              >
                <i className="iconsminds-upload mr-2 " />
                Upload Bukti
              </Button>
            </div>
          );
        }
      }
    ];
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
    this.setState({
      loadingSubmit: false,
      isDraft: false,
      loading: false,
      oneData: null,
      selectedBank: [],
      imageUrl: null,
      image: null,
      attachments: []
    })
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

  handleChange(e) {
    this.setState({ amount: e.target.value });
  }

  validateError() {
    if (
      this.state.isDraft === false ||
      this.state.amount === null ||
      this.state.amount === undefined ||
      this.state.selectedBank.length === 0
    ) {
      if (this.state.image === null) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  submitData() {
    if (this.validateError()) {
      // this.setState({ error: true });
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
      this.setState({ modal: false, loadingSubmit: true, errorData: "" });

      let lines = {
        attachments: this.state.isDraft === true ? undefined : this.state.attachments,
        amount: Number.isInteger(this.state.amount) ? this.state.amount : parseFloat(this.state.amount.replace(/,/g, '')),
        feeTransfer: 2500,
        tenantId: this.state.oneData.tenantId,
        tenantBankId: this.state.selectedBank.id,
        isDraft: this.state.isDraft
      };

      this.requestWithdrawRest.postBallance(lines).subscribe(
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
    this.setState({ loading: true });
    const params = {
      "options.includeTotalCount": true
    };

    this.requestWithdrawRest.getBallance({ params }).subscribe(
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

    this.requestWithdrawRest.getBallance({ params }).subscribe(res => {
      this.exportService.exportToCSV(res.data, "Withdraw Funds");
      this.setState({ loading: false });
    });
  }

  buttonUpload(rowData, column) {
    return (
      <div>
        <Button
          outline
          color="success"
          onClick={() => {
            this.loadTenantBank(rowData.tenantId);
            this.toggle();
            this.setState({
              oneData: rowData,
              amount: rowData.balanceAmount
            });
          }}
        >
          <i className="iconsminds-upload mr-2 " />
          Upload Bukti
        </Button>
      </div>
    );
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
            <td colSpan="1">
              {i + 1} .
            </td>
            <td colSpan="3">
              {attachment[i].customFileName}
            </td>
            <td colSpan="1">
              <a href
                className="text-danger"
                style={{ 'cursor': 'pointer' }}
                onClick={() => this.rmAttachment(i)}>
                Hapus
              </a>
            </td>
          </tr >
        )
      }
    }

    return data;
  }

  render() {
    if (this.state.redirect === true) {
      return <Redirect to="/app/request-withdraw-funds/" />;
    }

    if (this.state.redirectLogin === true) {
      this.setState({ redirectLogin: false });
      return <Redirect to="/user/login" />;

    }
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
                            name="companyName"
                            type="checkbox"
                            checked={this.state.companyName}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Company
                        </div>
                        <div>
                          <input
                            name="companyEmail"
                            type="checkbox"
                            checked={this.state.companyEmail}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Company Email
                        </div>
                        <div>
                          <input
                            name="fullName"
                            type="checkbox"
                            checked={this.state.fullName}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Full Name
                        </div>
                        <div>
                          <input
                            name="username"
                            type="checkbox"
                            checked={this.state.username}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Username
                        </div>
                        <div>
                          <input
                            name="userEmail"
                            type="checkbox"
                            checked={this.state.userEmail}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Email
                        </div>
                        <div>
                          <input
                            name="industry"
                            type="checkbox"
                            checked={this.state.industry}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Industry
                        </div>
                        <div>
                          <input
                            name="phone"
                            type="checkbox"
                            checked={this.state.phone}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Phone
                        </div>
                        <div>
                          <input
                            name="website"
                            type="checkbox"
                            checked={this.state.website}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Website
                        </div>
                        <div>
                          <input
                            name="balanceTransaction"
                            type="checkbox"
                            checked={this.state.balanceTransaction}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Ballance Transactions
                        </div>
                        <div>
                          <input
                            name="codBalance"
                            type="checkbox"
                            checked={this.state.codBalance}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          COD Balance
                        </div>
                        <div>
                          <input
                            name="balanceAmount"
                            type="checkbox"
                            checked={this.state.balanceAmount}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Ballance Amount
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
                  <Column style={{ width: '250px' }} field="companyName" header="Company" />
                  <Column style={{ width: '250px' }} field="companyEmail" header="Company Email" />
                  <Column style={{ width: '250px' }} field="fullName" header="Full Name" />
                  <Column style={{ width: '250px' }} field="username" header="Username" />
                  <Column style={{ width: '250px' }} field="userEmail" header="Email" />
                  <Column style={{ width: '250px' }} field="industry" header="Industri" />
                  <Column style={{ width: '250px' }} field="phone" header="Phone" />
                  <Column style={{ width: '250px' }} field="website" header="Website" />
                  <Column style={{ width: '250px' }} field="balanceAmount" header="Balance Amount" body={this.moneyFormat.currencyFormat} />
                  <Column style={{ width: '250px' }} header="Upload Bukti" body={this.buttonUpload} />
                </DataTable>
                {/*
                  <ReactTable
                    minRows={0}
                    data={this.state.table.data}
                    columns={this.dataTableColumns()}
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
              <Table>
                <tbody>
                  <tr>
                    <td>Company Name</td>
                    <td>:</td>
                    <td>{this.state.oneData.companyName}</td>
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
                    <td>Balance Amount</td>
                    <td>:</td>
                    <td>{this.moneyFormat.numberFormat(this.state.oneData.balanceAmount) || 0}</td>
                  </tr>
                  <tr>
                    <td>Total Bayar</td>
                    <td>:</td>
                    <td>
                      <NumberFormat thousandSeparator={true} value={this.state.amount} onChange={this.handleChange} />
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="3">
                      <InputSwitch
                        checked={this.state.isDraft}
                        onChange={e => this.setState({ isDraft: e.value })}
                      />
                      <div
                        style={{
                          marginLeft: 50,
                          marginTop: -25
                        }}
                      >
                        Simpan Sebagai Draft
                      </div>
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
                    <Loader
                      type="Oval"
                      color="#51BEEA"
                      height={80}
                      width={80}
                    />
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
      </Fragment>
    );
  }
}

export default WithdrawFunds;
