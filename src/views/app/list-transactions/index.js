import React, { Component, Fragment } from "react";
import Axios from "axios";
import moment from "moment";
import ReactTable from "react-table";
import {
  Col,
  InputGroup,
  Card,
  CardBody,
  Input,
  Button,
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";
import { Row } from "reactstrap";
import Breadcrumb from "../../../containers/navs/Breadcrumb";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import { Paginator } from "primereact/paginator";
import { MoneyFormat } from "../../../services/Format/MoneyFormat";
import ModalComponent from "../../../components/shared/modal.js";
import "./list-transactions.style.scss";

export default class ListTransactions extends Component {
  constructor(props) {
    super(props);

    this._moneyFormat = new MoneyFormat();

    this.toogleDropdownSearch = this.toogleDropdownSearch.bind(this);
    this.handleOnPageChange = this.handleOnPageChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.toggle = this.toggle.bind(this);
    this.dataTransactions = this.dataTransactions.bind(this);

    this.state = {
      search: "",
      filterSearch: false,
      valueSearch: {
        id: "*",
        value: "All"
      },
      table: {
        loading: true,
        data: [],
        pagination: {
          currentPage: 0,
          totalPages: 0,
          skipSize: 0,
          pageSize: 0
        }
      },
      dataModal: {
        header: "",
        body: "",
        footer: ""
      },
      modal: false,
      modalTransactions: false,
      modalCustomer: false,
      modalCompany: false,
      modalTotal: false,
      modalReceipt: false,
      resetPaginations: false,
    };
  }

  typeData(code) {
    switch (code) {
      case 1101:
        return "Chart Of Account";
      case 1200:
        return "Manual Journal";
      case 2101:
        return "Sales Source";
      case 2200:
        return "Sales Quotation";
      case 2201:
        return "Sales Order";
      case 2202:
        return "Sales Delivery";
      case 2203:
        return "Sales Invoice";
      case 2204:
        return "Sales Receipt";
      case 2205:
        return "Sales Credit Note";
      case 2206:
        return "Sales Down Payment";
      case 2207:
        return "Sales Over Payment";
      case 2208:
        return "Sales Payment";
      case 2209:
        return "Sales Refund";
      case 4200:
        return "Purchase Quation";
      case 4201:
        return "Purchase Order";
      case 4202:
        return "Purchase Goods Receipt";
      case 4203:
        return "Purchase Invoice";
      case 4204:
        return "Purchase Receipt";
      case 4205:
        return "Purchase Debit Note";
      case 4206:
        return "Purchase Down Payment";
      case 4207:
        return "Purchase Over Payment";
      case 4208:
        return "Purchase Payment";
      case 4209:
        return "Purchase Refund";
      default:
        return "Invalid Code";
    }
  }

  typePaymentStatus(code) {
    switch (code) {
      case 0:
        return "Unpaid";
      case 1:
        return "Partially Paid";
      case 2:
        return "Paid";
      default:
        return "Invalid Code";
    }
  }

  typeShipmentStatus(code) {
    switch (code) {
      case 0:
        return "Pending Process";
      case 1:
        return "In Process";
      case 2:
        return "Ready to Ship";
      case 3:
        return "Delivered";
      case 4:
        return "Received";
      default:
        return "Invalid Code";
    }
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
    const valueSearch = this.state.valueSearch.id;
    const search = this.state.search === "" ? "*" : this.state.search;

    const url =
      this.state.valueSearch.value === "All"
        ? encodeURIComponent(`${search}`)
        : encodeURIComponent(`${valueSearch}:${search}`);

    // Axios.get(`http://172.16.0.253:8983/solr/db/select?q=${url}`).then(res => {
    //   console.log(res.data.response.docs);
    // });

    const table = { ...this.state.table };
    table.loading = true;
    let page =
      table.pagination.currentPage === 0
        ? 0
        : table.pagination.currentPage * 10 - 10;
    this.setState({ table });

    if(this.state.resetPaginations) {
      page = 0;
      this.setState({resetPaginations: false});
    }

    Axios.get(
      `http://172.16.0.253:8983/solr/db/select?q=${url}&start=${page}&sort=CreateDateUtc%20desc`
    ).then(response => {
      const table = { ...this.state.table };
      table.data = response.data.response.docs;
      table.pagination.totalPages = Math.ceil(
        response.data.response.numFound / 10
      );
      table.loading = false;
      this.setState({ table });
    });
  }

  toogleDropdownSearch() {
    this.setState({
      filterSearch: !this.state.filterSearch
    });
  }

  onChangeFilter = (id, value) => {
    const { valueSearch } = this.state;

    valueSearch.id = id;
    valueSearch.value = value;

    this.setState({ valueSearch });
  };

  toggle() {
    this.setState({
      modal: !this.state.modal
    });
  }

  dataTable() {
    return [
      {
        Header: "No Transaksi",
        accessor: "transactionNumber",
        width: 100,
        Cell: props => (
          <div
            onClick={() => {
              this.dataTransactions(props.original);
            }}
            className="link-text"
          >
            {props.value || "-"}
            {props.original.IsDropship && (
              <div className="isDropship">Dropship</div>
            )}
          </div>
        )
      },
      {
        Header: "Tanggal Transaksi",
        accessor: "TransactionDate",
        width: 120,
        Cell: props => (
          <div>
            {moment(props.value).format("DD-MM-YYYY") || "-"}
            {props.original.isCOD && <div className="isCOD">COD</div>}
          </div>
        )
      },
      {
        Header: "Customer",
        accessor: "Customer_displayName",
        width: 207,
        Cell: props => {
          if (props.value) {
            return (
              <div
                onClick={() => {
                  this.dataCustomer(props.original);
                }}
                className="link-text"
              >
                {props.value || "-"}
                {props.original.Customer_inactive !== undefined &&
                  props.original.Customer_inactive && (
                    <div className="isInactive">inactive</div>
                  )}
                {props.original.Customer_inactive !== undefined &&
                  !props.original.Customer_inactive && (
                    <div className="isActive">active</div>
                  )}
              </div>
            );
          } else {
            return <div>{props.value || "-"}</div>;
          }
        }
      },
      {
        Header: "Company",
        accessor: "CompanyInfo_CompanyName",
        width: 140,
        Cell: props => {
          if (props.value) {
            return (
              <div
                onClick={() => {
                  this.dataCompany(props.original);
                }}
                className="link-text"
              >
                {props.value || "-"}
              </div>
            );
          } else {
            return <div>{props.value || "-"}</div>;
          }
        }
      },
      {
        Header: "Total",
        accessor: "Total",
        width: 116,
        Cell: props => (
          <div
            onClick={() => {
              this.dataTotal(props.original);
            }}
            className="link-text"
          >
            {this._moneyFormat.numberFormat(props.value) || "-"}
          </div>
        )
      },
      {
        Header: "Nama Gudang",
        accessor: "Warehouse_Name",
        Cell: props => <div>{props.value || "-"}</div>
      },
      {
        Header: "Sumber Penjualan",
        accessor: "SalesSource_Name",
        width: 130,
        Cell: props => <div>{props.value || "-"}</div>
      },
      // {
      //   Header: "No Resi",
      //   accessor: "ShippingTrackingNumber",
      //   Cell: props => <div>{props.value}</div>
      // },
      {
        Header: "Kurir",
        accessor: "Shipping_Name",
        width: 120,
        Cell: props => (
          <div>
            {props.value || "-"} <br />
            {props.original.ShippingTrackingNumber}
          </div>
        )
      },
      {
        Header: "Status pembayaran",
        accessor: "PaymentStatus",
        width: 140,
        Cell: props => <div>{this.typePaymentStatus(props.value) || "-"}</div>
      },
      {
        Header: "Status pengiriman",
        accessor: "ShipmentStatus",
        width: 140,
        Cell: props => <div>{this.typeShipmentStatus(props.value) || "-"}</div>
      }
    ];
  }

  dataTransactions(data) {
    const dataModal = this.state.dataModal;

    dataModal.header = `Transactions ${data.transactionNumber}`;
    dataModal.body = (
      <div>
        <Row>
          <Col xs="5"> Tanggal Pengiriman </Col>
          <Col xs="1">:</Col>
          <Col> {moment(data.ShippingDate).format("DD-MM-YYYY")} </Col>
        </Row>
        <Row>
          <Col xs="5"> Tipe </Col>
          <Col xs="1">:</Col>
          <Col> {this.typeData(data.TransactionType)} </Col>
        </Row>
        <Row>
          <Col xs="5"> Total Baris Produk </Col>
          <Col xs="1">:</Col>
          <Col> {data.LineCount} </Col>
        </Row>
        <Row>
          <Col xs="5"> Total Qty Produk Dipesan </Col>
          <Col xs="1">:</Col>
          <Col> {data.LineTotalQty} </Col>
        </Row>
      </div>
    );
    dataModal.footer = (
      <div>
        <Button
          className="default btn-search"
          color="primary"
          style={{
            borderRadius: 6
          }}
        >
          Close
        </Button>
      </div>
    );

    this.setState({ dataModal, modal: true });
  }

  dataCustomer(data) {
    const dataModal = this.state.dataModal;

    dataModal.header = `Customer ${data.Customer_displayName}`;
    dataModal.body = (
      <div>
        <Row>
          <Col xs="5"> Nomor Telepon </Col>
          <Col xs="1">:</Col>
          <Col> {data.Customer_phone} </Col>
        </Row>
        <Row>
          <Col xs="5"> Tipe Kontak </Col>
          <Col xs="1">:</Col>
          <Col> {data.Customer_contactType} </Col>
        </Row>
      </div>
    );
    dataModal.footer = (
      <div>
        <Button
          className="default btn-search"
          color="primary"
          style={{
            borderRadius: 6
          }}
        >
          Close
        </Button>
      </div>
    );

    this.setState({ dataModal, modal: true });
  }

  dataCompany(data) {
    const dataModal = this.state.dataModal;

    dataModal.header = `Company ${data.CompanyInfo_CompanyName}`;
    dataModal.body = (
      <div>
        <Row>
          <Col xs="5"> ID Tenant </Col>
          <Col xs="1">:</Col>
          <Col> {data.tenantId} </Col>
        </Row>
        <Row>
          <Col xs="5"> Alamat </Col>
          <Col xs="1">:</Col>
          <Col>
            {" "}
            {data.CompanyInfo_CompanyStreet},{" "}
            {data.CompanyInfo_CompanySubdistrict},{" "}
            {data.CompanyInfo_CompanyCity}, {data.CompanyInfo_CompanyProvince}{" "}
          </Col>
        </Row>
        <Row>
          <Col xs="5"> Website </Col>
          <Col xs="1">:</Col>
          <Col> {data.CompanyInfo_CompanyWebsite} </Col>
        </Row>
        <Row>
          <Col xs="5"> Email </Col>
          <Col xs="1">:</Col>
          <Col> {data.Email} </Col>
        </Row>
      </div>
    );
    dataModal.footer = (
      <div>
        <Button
          className="default btn-search"
          color="primary"
          style={{
            borderRadius: 6
          }}
        >
          Close
        </Button>
      </div>
    );

    this.setState({ dataModal, modal: true });
  }

  dataTotal(data) {
    const dataModal = this.state.dataModal;

    dataModal.header = "Total";
    dataModal.body = (
      <div>
        <Row>
          <Col xs="5"> Total Penyesuaian </Col>
          <Col xs="1">:</Col>
          <Col> {this._moneyFormat.numberFormat(data.AdjustmentAmount)} </Col>
        </Row>
        <Row>
          <Col xs="5"> Total Diskon </Col>
          <Col xs="1">:</Col>
          <Col> {this._moneyFormat.numberFormat(data.DiscountAmount)} </Col>
        </Row>
        <Row>
          <Col xs="5"> Pajak </Col>
          <Col xs="1">:</Col>
          <Col> {this._moneyFormat.numberFormat(data.TaxAmount)} </Col>
        </Row>
        <Row>
          <Col xs="5"> Ongkos Kirim </Col>
          <Col xs="1">:</Col>
          <Col> {this._moneyFormat.numberFormat(data.ShippingCharge)} </Col>
        </Row>
        <Row>
          <Col xs="5"> Sisa Bayar </Col>
          <Col xs="1">:</Col>
          <Col> {this._moneyFormat.numberFormat(data.ARBalanceDue)} </Col>
        </Row>
        <Row>
          <Col xs="5"> Subtotal </Col>
          <Col xs="1">:</Col>
          <Col> {this._moneyFormat.numberFormat(data.Subtotal)} </Col>
        </Row>
      </div>
    );
    dataModal.footer = (
      <div>
        <Button
          className="default btn-search"
          color="primary"
          style={{
            borderRadius: 6
          }}
        >
          Close
        </Button>
      </div>
    );

    this.setState({ dataModal, modal: true });
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

  _renderSearch() {
    const { valueSearch } = this.state;
    return (
      <div className="mb-3 col-md-5">
        <InputGroup className="filter">
          <ButtonDropdown
            isOpen={this.state.filterSearch}
            toggle={this.toogleDropdownSearch}
          >
            <DropdownToggle className="btn-filter" caret>
              {valueSearch.value}
            </DropdownToggle>
            <DropdownMenu className="list-filter">
              <DropdownItem onClick={() => this.onChangeFilter("*", "All")}>
                All
              </DropdownItem>
              <DropdownItem
                onClick={() => this.onChangeFilter("tenantId", "ID Tenant")}
              >
                ID Tenant
              </DropdownItem>
              <DropdownItem
                onClick={() =>
                  this.onChangeFilter("ShippingTrackingNumber", "Nomor Resi")
                }
              >
                Nomor resi
              </DropdownItem>
              <DropdownItem
                onClick={() =>
                  this.onChangeFilter("Customer_displayName", "Nama Pelanggan")
                }
              >
                Nama Pelanggan
              </DropdownItem>
              <DropdownItem
                onClick={() =>
                  this.onChangeFilter("CompanyInfo_CompanyName", "Company")
                }
              >
                Company
              </DropdownItem>
              <DropdownItem
                onClick={() => this.onChangeFilter("Email", "Email")}
              >
                Email
              </DropdownItem>
              <DropdownItem
                onClick={() => this.onChangeFilter("Phone", "Phone")}
              >
                Nomor Telepon
              </DropdownItem>
            </DropdownMenu>
          </ButtonDropdown>
          <Input
            placeholder="Search.."
            name="search"
            value={this.state.search}
            onChange={this.handleInputChange}
            onKeyPress={event => {
              if (event.key === "Enter") {
                const table = this.state.table;

                table.pagination.skipSize = 0;
                this.setState({table, resetPaginations: true}, () => {
                  this.loadData();
                })
              }
            }}
          />
          <Button
            className="default btn-search"
            color="primary"
            onClick={() => {
              const table = this.state.table;

              table.pagination.skipSize = 0;
              this.setState({table, resetPaginations: true}, () => {
                this.loadData();
              })
            }}
          >
            <i className="simple-icon-magnifier" />
          </Button>
        </InputGroup>
      </div>
    );
  }

  _renderTable() {
    return (
      <div>
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
    );
  }

  _renderModalTransactions() {}

  _renderModalCustomer() {}

  _renderModalCompany() {}

  _renderModalTotal() {}

  render() {
    return (
      <Fragment>
        <Row>
          <Colxx xxs="12">
            <Breadcrumb
              heading="menu.list-transactions"
              match={this.props.match}
            />
            <Separator className="mb-5" />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs={12}>
            <Card className="mb-12 lg-12">
              <CardBody>{this._renderSearch()}</CardBody>
            </Card>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs={12}>
            <Card className="mb-12 lg-12">
              <CardBody>{this._renderTable()}</CardBody>
            </Card>
          </Colxx>
        </Row>

        {this.state.modal && (
          <div>
            <ModalComponent
              header={this.state.dataModal.header}
              body={this.state.dataModal.body}
              footer={this.state.dataModal.footer}
              close={() => {
                this.setState({ modal: false });
              }}
            />
          </div>
        )}
      </Fragment>
    );
  }
}
