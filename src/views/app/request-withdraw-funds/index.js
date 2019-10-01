import React, { Component, Fragment } from "react";
import ReactTable from "react-table";
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
  InputGroupButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";
// import { Formik } from "formik";
// import validate from "./validate";
import { MoneyFormat } from "../../../services/Format/MoneyFormat";

import IntlMessages from "../../../helpers/IntlMessages";

import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import Breadcrumb from "../../../containers/navs/Breadcrumb";
import DataTablePagination from "../../../components/DatatablePagination";

import WithdrawRestService from "../../../core/requestWithdrawRestService";
import RelatedDataRestService from "../../../core/relatedDataRestService";
import PictureRestService from "../../../core/pictureRestService";
// import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
// import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css";
import { InputText } from "primereact/inputtext";
import { InputSwitch } from "primereact/inputswitch";
import { Dropdown } from "primereact/dropdown";
import Loader from "react-loader-spinner";
import Spinner from "../../../containers/pages/Spinner";
import BaseAlert from "../../base/baseAlert";

class WithdrawFunds extends Component {
  constructor(props) {
    super(props);
    this.requestWithdrawRest = new WithdrawRestService();
    this.relatedDataRestService = new RelatedDataRestService();
    this.pictureRestService = new PictureRestService();
    this.moneyFormat = new MoneyFormat();
    this.handleInputChange = this.handleInputChange.bind(this);
    this.loadTenantBank = this.loadTenantBank.bind(this);
    this.fileHandler = this.fileHandler.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.submitData = this.submitData.bind(this);

    this.state = {
      error: false,
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
      redirect: false,
      errorData: ""
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

  toggleModal() {
    this.setState({
      modal2: !this.state.modal2
    });
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

  loadTenantBank(id) {
    this.relatedDataRestService.getTenantBank(id, {}).subscribe(
      response => {
        this.setState({ tenantBank: response.data });
      },
      err => {
        console.log(err);
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
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Company Email",
        accessor: "companyEmail",
        width: 180,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Full Name",
        accessor: "fullName",
        width: 150,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Username",
        accessor: "username",
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Email",
        accessor: "userEmail",
        width: 150,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Industry",
        accessor: "industry",
        width: 100,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Phone",
        accessor: "phone",
        width: 120,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Website",
        accessor: "website",
        width: 140,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Ballance Transactions",
        accessor: "balanceTransaction",
        width: 150,
        Cell: props => <p>{this.moneyFormat.numberFormat(props.value)}</p>
      },
      {
        Header: "COD Balance",
        accessor: "codBalance",
        width: 120,
        Cell: props => <p>{this.moneyFormat.numberFormat(props.value)}</p>
      },
      {
        Header: "Ballance Amount",
        accessor: "balanceAmount",
        width: 150,
        Cell: props => <p>{this.moneyFormat.numberFormat(props.value)}</p>
      },
      {
        Header: "Upload Bukti",
        width: 200,
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
    if(this.state.isDraft === false || this.state.amount === null || this.state.amount === undefined || this.state.selectedBank === []){
      if(this.state.image === null){
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  }

  submitData() {
    if (this.validateError()) {
      this.setState({error: true});
    } else {
      this.setState({ modal: false, loadingSubmit: true, errorData: "" });

      let lines = {
        fileId: this.state.isDraft === true ? undefined : this.state.image.id,
        amount: parseInt(this.state.amount),
        feeTransfer: 2500,
        tenantId: this.state.oneData.tenantId,
        tenantBankId: this.state.selectedBank.id,
        isDraft: this.state.isDraft
      };
      console.log(lines);
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

  render() {
    if (this.state.redirect === true) {
      return <Redirect to="/app/request-withdraw-funds/" />;
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
                    <td>{this.state.oneData.balanceAmount}</td>
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
                    <tr>
                      <td colSpan="3">
                        <img
                          src={this.state.imageUrl}
                          height="150"
                          width="150"
                        />
                      </td>
                    </tr>
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
