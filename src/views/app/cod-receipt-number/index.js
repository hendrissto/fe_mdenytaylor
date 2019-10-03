import React, { Component, Fragment } from "react";
import { Card, CardBody } from "reactstrap";
import ReactTable from "react-table";

import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import Breadcrumb from "../../../containers/navs/Breadcrumb";
import DataTablePagination from "../../../components/DatatablePagination";
import {
  InputGroup,
  Button,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Row,
  Col,
  Popover,
  PopoverBody
} from "reactstrap";
// import { InputGroup, Button, InputGroupButtonDropdown, Input, DropdownToggle, DropdownMenu, DropdownItem, Modal, ModalHeader, ModalBody, ModalFooter, Row, Col } from 'reactstrap';
import CODRestService from "../../../core/codRestService";
import { MoneyFormat } from "../../../services/Format/MoneyFormat";

const regex = /\[(.*?)\-/;
export default class CODReceiptNumber extends Component {
  constructor(props) {
    super(props);
    this.codRest = new CODRestService();
    this.moneyFormat = new MoneyFormat();
    this.handleInputChange = this.handleInputChange.bind(this);
    this.togglePopOver = this.togglePopOver.bind(this);

    // this.toggleDropDown = this.toggleDropDown.bind(this);
    // this.toggleSplit = this.toggleSplit.bind(this);
    // this.toggleDropDown1 = this.toggleDropDown1.bind(this);
    // this.toggleSplit1 = this.toggleSplit1.bind(this);
    this.dataTable = this.dataTable.bind(this);
    this.toggle = this.toggle.bind(this);
    this.state = {
      sellerName: true,
      deliveryNotes: true,
      airwaybillNumber: true,
      courierChannelId: true,
      destination: true,
      notes: true,
      amount: true,
      codValue: true,
      goodValue: true,
      shippingCharge: true,
      discount: true,
      tax: true,
      adjustment: true,
      total: true,
      subTotalAmount: true,
      totalAmount: true,
      codFeePercentage: true,
      codFeeValue: true,
      receiveAmount: true,
      popoverOpen: false,
      data: [],
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

      dropdownOpen: false,
      // splitButtonOpen: false,
      // dropdownOpen1: false,
      // splitButtonOpen1: false,
      modal: false,
      oneData: "",
      search: ""
    };
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

    let receiverName = [];
    this.codRest.getCODReceipts({ params }).subscribe(response => {
      table.data = response.data;
      table.pagination.totalPages = response.total / table.pagination.pageSize;
      table.loading = false;
      this.setState({ table });
    });
  }

  componentDidMount() {
    this.loadData();
  }

  // below is handler of table
  // handleOnPageChange(event) {
  //   console.log(event)
  // }

  // handleOnPageSizeChange(newPageSize, newPage) {
  //   console.log(newPageSize, newPage)
  // }

  handleSortedChange(newSorted, column, additive) {
    console.log(newSorted);
    console.log(column);
    console.log(additive);
  }

  dataTable() {
    return [
      {
        Header: "Seller Name",
        accessor: "sellerName",
        width: 200,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Delivery Notes",
        accessor: "deliveryNotes",
        width: 350,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "No Resi",
        accessor: "airwaybillNumber",
        width: 130,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Kurir",
        accessor: "courierChannelId",
        Cell: props => <p>{props.value === null ? "-" : props.value}</p>
      },
      {
        Header: "Destination",
        accessor: "destination",
        width: 150,
        Cell: props => <p>{props.value === null ? "-" : props.value}</p>
      },
      {
        Header: "Note",
        accessor: "notes",
        Cell: props => <p>{props.value === "" ? "-" : props.value}</p>
      },
      {
        Header: "Good Value",
        accessor: "goodValue",
        show: this.state.goodValue,
        Cell: props => <p>{this.moneyFormat.numberFormat(props.value)}</p>
      },
      {
        Header: "Shipping Charge",
        accessor: "shippingCharge",
        show: this.state.shippingCharge,
        Cell: props => <p>{this.moneyFormat.numberFormat(props.value)}</p>
      },
      {
        Header: "Discount",
        accessor: "discount",
        show: this.state.discount,
        Cell: props => <p>{this.moneyFormat.numberFormat(props.value)}</p>
      },
      {
        Header: "Tax",
        accessor: "tax",
        show: this.state.tax,
        Cell: props => <p>{this.moneyFormat.numberFormat(props.value)}</p>
      },
      {
        Header: "Adjustment",
        accessor: "adjustment",
        show: this.state.adjustment,
        Cell: props => <p>{this.moneyFormat.numberFormat(props.value)}</p>
      },
      {
        Header: "Total",
        accessor: "total",
        show: this.state.total,
        Cell: props => <p>{this.moneyFormat.numberFormat(props.value)}</p>
      },
      {
        Header: "Sub Total Amount",
        accessor: "subTotalAmount",
        width: 140,
        show: this.state.subTotalAmount,
        Cell: props => <p>{this.moneyFormat.numberFormat(props.value)}</p>
      },
      {
        Header: "Total Amount",
        accessor: "totalAmount",
        show: this.state.totalAmount,
        Cell: props => <p>{this.moneyFormat.numberFormat(props.value)}</p>
      },
      {
        Header: "Fee COD (%)",
        accessor: "codFeePercentage",
        show: this.state.codFeePercentage,
        Cell: props => <p>{props.value} %</p>
      },
      {
        Header: "Fee COD (Rp)",
        accessor: "codFeeValue",
        show: this.state.codFeeValue,
        Cell: props => <p>{this.moneyFormat.numberFormat(props.value)}</p>
      },
      {
        Header: "Receive Amount",
        accessor: "receiveAmount",
        width: 140,
        show: this.state.receiveAmount,
        Cell: props => <p>{this.moneyFormat.numberFormat(props.value)}</p>
      }
    ];
  }

  toggle() {
    this.setState(prevState => ({
      modal: !prevState.modal
    }));
  }

  togglePopOver() {
    this.setState(prevState => ({
      popoverOpen: !prevState.popoverOpen
    }));
  }

  oneData() {
    return (
      <div>
        <Row>
          <Col xs="3"> No. Receipt </Col>
          <Col xs="1">:</Col>
          <Col> {this.state.oneData.receiptNumber} </Col>
        </Row>
        <Row>
          <Col xs="3"> Sender </Col>
          <Col xs="1">:</Col>
          <Col> {this.state.oneData.sender} </Col>
        </Row>
        <Row>
          <Col xs="3"> Receiver </Col>
          <Col xs="1">:</Col>
          <Col> {this.state.oneData.receiver} </Col>
        </Row>
        <Row>
          <Col xs="3"> Total </Col>
          <Col xs="1">:</Col>
          <Col> {this.state.oneData.amount} </Col>
        </Row>
        <Row>
          <Col xs="3"> Status </Col>
          <Col xs="1">:</Col>
          <Col> {this.state.oneData.status} </Col>
        </Row>
      </div>
    );
  }
  render() {
    return (
      <Fragment>
        <Row>
          <Colxx xxs="12">
            <Breadcrumb
              heading="menu.cod-receipt-number"
              match={this.props.match}
            />
            <Separator className="mb-5" />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <Card className="mb-12 lg-12">
              <CardBody>
                <div className="row">
                  <div className="mb-3 col-md-5">
                    <InputGroup>
                      <Input
                        placeholder="Search.."
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
                            name="amount"
                            type="checkbox"
                            checked={this.state.amount}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Total
                        </div>
                        <div>
                          <input
                            name="codValue"
                            type="checkbox"
                            checked={this.state.codValue}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Fee COD
                        </div>
                        <div>
                          <input
                            name="goodValue"
                            type="checkbox"
                            checked={this.state.goodValue}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Good Value
                        </div>
                        <div>
                          <input
                            name="shippingCharge"
                            type="checkbox"
                            checked={this.state.shippingCharge}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Shipping Charge
                        </div>
                        <div>
                          <input
                            name="discount"
                            type="checkbox"
                            checked={this.state.discount}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Discount
                        </div>
                        <div>
                          <input
                            name="tax"
                            type="checkbox"
                            checked={this.state.tax}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Tax
                        </div>
                        <div>
                          <input
                            name="adjustment"
                            type="checkbox"
                            checked={this.state.adjustment}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Adjustment
                        </div>
                        <div>
                          <input
                            name="total"
                            type="checkbox"
                            checked={this.state.total}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Total
                        </div>
                        <div>
                          <input
                            name="subTotalAmount"
                            type="checkbox"
                            checked={this.state.subTotalAmount}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Sub Total Amount
                        </div>
                        <div>
                          <input
                            name="totalAmount"
                            type="checkbox"
                            checked={this.state.totalAmount}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Total Amount
                        </div>
                        <div>
                          <input
                            name="codFeePercentage"
                            type="checkbox"
                            checked={this.state.codFeePercentage}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Fee COD (%)
                        </div>
                        <div>
                          <input
                            name="codFeeValue"
                            type="checkbox"
                            checked={this.state.codFeeValue}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Fee COD (Rp)
                        </div>
                        <div>
                          <input
                            name="receiveAmount"
                            type="checkbox"
                            checked={this.state.receiveAmount}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Receive Amount
                        </div>
                      </PopoverBody>
                    </Popover>
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
        </Row>

        <Modal
          isOpen={this.state.modal}
          toggle={this.toggle}
          className={this.props.className}
        >
          <ModalHeader toggle={this.toggle}>Detail Resi COD</ModalHeader>
          <ModalBody>{this.oneData()}</ModalBody>
          <ModalFooter>
            <Button color="danger" outline onClick={this.toggle}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </Fragment>
    );
  }
}
