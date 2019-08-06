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
  InputGroup,
  InputGroupButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";

import IntlMessages from "../../../helpers/IntlMessages";

import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import Breadcrumb from "../../../containers/navs/Breadcrumb";
import DataTablePagination from "../../../components/DatatablePagination";

import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css";
class WithdrawFunds extends Component {
  constructor(props) {
    super(props);
    this.state = {
      oneData: "",
      modal: false,
      dropdownOpen: false,
      splitButtonOpen: false,
      dropdownOpen1: false,
      splitButtonOpen1: false
    };

    this.toggle = this.toggle.bind(this);
    this.toggleDropDown = this.toggleDropDown.bind(this);
    this.toggleSplit = this.toggleSplit.bind(this);
    this.toggleDropDown1 = this.toggleDropDown1.bind(this);
    this.toggleSplit1 = this.toggleSplit1.bind(this);
  }

  dataTableColumns() {
    return [
      {
        Header: "Permintaan Penarikan",
        accessor: "requestWithdraw",
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Seller",
        accessor: "seller",
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Jumlah Saldo Ditarik",
        accessor: "amountWithdraw",
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Ditarik ke Rekening",
        accessor: "withdrawToAccount",
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Cabang Bank",
        accessor: "bankBranch",
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
          if (props.original.status === "Berhasil") {
            return (
              <div>
                <Button
                  outline
                  color="info"
                  onClick={() => {
                    this.toggle();
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
                    this.toggle();
                    this.setState({ oneData: props.original });
                  }}
                >
                  <i className="iconsminds-upload mr-2 " />
                  Upload Bukti
                </Button>
              </div>
            );
          }
        }
      }
    ];
  }

  dataTable() {
    return [
      {
        id: 1,
        receiptNumber: 908989,
        seller: "Marble Cake",
        img: "/assets/img/marble-cake-thumb.jpg",
        bankBranch: "BRI",
        requestWithdraw: "02.04.2018",
        withdrawToAccount: "BNI",
        status: "Berhasil",
        statusColor: "primary",
        description: "Wedding cake with flowers Macarons and blueberries",
        amountWithdraw: "Rp. 164.000",
        stock: 62
      },
      {
        id: 2,
        receiptNumber: 890800,
        seller: "Fat Rascal",
        bankBranch: "BNI",
        img: "/assets/img/fat-rascal-thumb.jpg",
        requestWithdraw: "01.04.2018",
        withdrawToAccount: "BCA",
        status: "Tertunda",
        statusColor: "secondary",
        description: "Cheesecake with chocolate cookies and Cream biscuits",
        amountWithdraw: "Rp. 124.000",
        stock: 48
      },
      {
        id: 3,
        receiptNumber: 23423400,
        seller: "Chocolate Cake",
        img: "/assets/img/chocolate-cake-thumb.jpg",
        bankBranch: "BCA",
        requestWithdraw: "25.03.2018",
        withdrawToAccount: "BRI",
        status: "Tertunda",
        statusColor: "secondary",
        description: "Homemade cheesecake with fresh berries and mint",
        amountWithdraw: "Rp. 108.000",
        stock: 57
      },
      {
        id: 4,
        receiptNumber: 2342300,
        seller: "Goose Breast",
        img: "/assets/img/goose-breast-thumb.jpg",
        bankBranch: "BCA",
        requestWithdraw: "21.03.2018",
        withdrawToAccount: "BLS",
        status: "Tertunda",
        statusColor: "secondary",
        description: "Chocolate cake with berries",
        amountWithdraw: "Rp. 101.004",
        stock: 41
      },
      {
        id: 5,
        receiptNumber: 23423400,
        seller: "Petit Gâteau",
        bankBranch: "BNI",
        img: "/assets/img/petit-gateau-thumb.jpg",
        requestWithdraw: "02.06.2018",
        withdrawToAccount: "BCM",
        status: "Berhasil",
        statusColor: "primary",
        description: "Chocolate cake with mascarpone",
        amountWithdraw: "Rp. 985.000",
        stock: 23
      },
      {
        id: 6,
        receiptNumber: 234234200,
        seller: "Salzburger Nockerl",
        img: "/assets/img/salzburger-nockerl-thumb.jpg",
        bankBranch: "Desserts",
        requestWithdraw: "14.07.2018",
        withdrawToAccount: "BCA",
        status: "Tertunda",
        statusColor: "secondary",
        description: "Wedding cake decorated with donuts and wild berries",
        amountWithdraw: "Rp. 962.000",
        stock: 34
      },
      {
        id: 7,
        receiptNumber: 23400,
        seller: "Napoleonshat",
        img: "/assets/img/napoleonshat-thumb.jpg",
        bankBranch: "Desserts",
        requestWithdraw: "05.02.2018",
        withdrawToAccount: "BCA",
        status: "Tertunda",
        statusColor: "secondary",
        description: "Cheesecake with fresh berries and mint for dessert",
        amountWithdraw: "Rp. 921.000",
        stock: 31
      },
      {
        id: 8,
        receiptNumber: 2349802938400,
        seller: "Cheesecake",
        img: "/assets/img/cheesecake-thumb.jpg",
        bankBranch: "BCA",
        requestWithdraw: "18.08.2018",
        withdrawToAccount: "BCA",
        status: "Berhasil",
        statusColor: "primary",
        description: "Delicious vegan chocolate cake",
        amountWithdraw: "Rp. 887.000",
        stock: 21
      },
      {
        id: 9,
        receiptNumber: 230984029300,
        seller: "Financier",
        img: "/assets/img/financier-thumb.jpg",
        bankBranch: "BCA",
        requestWithdraw: "15.03.2018",
        withdrawToAccount: "BCA",
        status: "Berhasil",
        statusColor: "primary",
        description:
          "White chocolate strawberry yogurt cake decorated with fresh fruits and chocolate",
        amountWithdraw: "Rp. 865.000",
        stock: 53
      },
      {
        id: 10,
        receiptNumber: 203984000,
        seller: "Genoise",
        img: "/assets/img/genoise-thumb.jpg",
        bankBranch: "BNI",
        requestWithdraw: "11.06.2018",
        withdrawToAccount: "BCA",
        status: "Tertunda",
        statusColor: "secondary",
        description: "Christmas fruit cake, pudding on top",
        amountWithdraw: "Rp. 824.000",
        stock: 55
      },
      {
        id: 11,
        receiptNumber: 2398409200,
        seller: "Gingerbread",
        img: "/assets/img/gingerbread-thumb.jpg",
        bankBranch: "BCA",
        requestWithdraw: "10.04.2018",
        withdrawToAccount: "BCA",
        status: "Berhasil",
        statusColor: "primary",
        description: "Wedding cake decorated with donuts and wild berries",
        amountWithdraw: "Rp. 714.000",
        stock: 12
      },
      {
        id: 12,
        receiptNumber: 239849238400,
        seller: "Magdalena",
        img: "/assets/img/magdalena-thumb.jpg",
        bankBranch: "BCA",
        requestWithdraw: "22.07.2018",
        withdrawToAccount: "BCA",
        status: "Tertunda",
        statusColor: "secondary",
        description: "Christmas fruit cake, pudding on top",
        amountWithdraw: "Rp. 702.000",
        stock: 14
      },
      {
        id: 13,
        receiptNumber: 2039840200,
        seller: "Parkin",
        img: "/assets/img/parkin-thumb.jpg",
        bankBranch: "BCA",
        requestWithdraw: "22.08.2018",
        withdrawToAccount: "BCA",
        status: "Berhasil",
        statusColor: "primary",
        description:
          "White chocolate strawberry yogurt cake decorated with fresh fruits and chocolate",
        amountWithdraw: "Rp. 689.000",
        stock: 78
      },
      {
        id: 14,
        receiptNumber: 2093804200,
        seller: "Streuselkuchen",
        img: "/assets/img/streuselkuchen-thumb.jpg",
        bankBranch: "BCA",
        requestWithdraw: "22.07.2018",
        withdrawToAccount: "BCA",
        status: "Tertunda",
        statusColor: "secondary",
        description: "Delicious vegan chocolate cake",
        amountWithdraw: "Rp. 645.000",
        stock: 55
      },
      {
        id: 15,
        receiptNumber: 239480239400,
        seller: "Tea loaf",
        img: "/assets/img/tea-loaf-thumb.jpg",
        bankBranch: "BCA",
        requestWithdraw: "10.09.2018",
        withdrawToAccount: "BCA",
        status: "Berhasil",
        statusColor: "primary",
        description: "Cheesecake with fresh berries and mint for dessert",
        amountWithdraw: "Rp. 632.000",
        stock: 20
      },
      {
        id: 16,
        receiptNumber: 23084023900,
        seller: "Merveilleux",
        img: "/assets/img/merveilleux-thumb.jpg",
        bankBranch: "BCA",
        requestWithdraw: "18.02.2018",
        withdrawToAccount: "BCA",
        status: "Berhasil",
        statusColor: "primary",
        description: "Chocolate cake with mascarpone",
        amountWithdraw: "Rp. 621.000",
        stock: 6
      },
      {
        id: 17,
        receiptNumber: 4023980400,
        seller: "Fruitcake",
        img: "/assets/img/fruitcake-thumb.jpg",
        bankBranch: "BCA",
        requestWithdraw: "12.01.2019",
        withdrawToAccount: "BCA",
        status: "Tertunda",
        statusColor: "secondary",
        description: "Chocolate cake with berries",
        amountWithdraw: "Rp. 595.000",
        stock: 17
      },
      {
        id: 18,
        receiptNumber: 23984029300,
        seller: "Bebinca",
        img: "/assets/img/bebinca-thumb.jpg",
        bankBranch: "BCA",
        requestWithdraw: "04.02.2019",
        withdrawToAccount: "BCA",
        status: "Tertunda",
        statusColor: "secondary",
        description: "Homemade cheesecake with fresh berries and mint",
        amountWithdraw: "Rp. 574.000",
        stock: 16
      },
      {
        id: 19,
        receiptNumber: 230984000,
        seller: "Cremeschnitte",
        img: "/assets/img/cremeschnitte-thumb.jpg",
        bankBranch: "Desserts",
        requestWithdraw: "04.03.2018",
        withdrawToAccount: "BCA",
        status: "Berhasil",
        statusColor: "primary",
        description: "Cheesecake with chocolate cookies and Cream biscuits",
        amountWithdraw: "Rp. 562.000",
        stock: 9
      },
      {
        id: 20,
        receiptNumber: 23094800,
        seller: "Soufflé",
        img: "/assets/img/souffle-thumb.jpg",
        bankBranch: "BNI",
        requestWithdraw: "16.01.2018",
        withdrawToAccount: "BCA",
        status: "Berhasil",
        statusColor: "primary",
        description: "Wedding cake with flowers Macarons and blueberries",
        amountWithdraw: "Rp. 524.000",
        stock: 14
      }
    ];
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

  render() {
    const option = {
      sizePerPage: 5,
      sizePerPageList: [
        {
          text: "5",
          value: 5
        },
        {
          text: "10",
          value: 10
        }
      ]
    };
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
                      <InputGroupButtonDropdown
                        addonType="prepend"
                        isOpen={this.state.splitButtonOpen}
                        toggle={this.toggleSplit}
                      >
                        <DropdownToggle color="primary" className="default">
                          <i className="simple-icon-menu" />
                        </DropdownToggle>
                        <DropdownMenu>
                          <DropdownItem>1</DropdownItem>
                          <DropdownItem>2</DropdownItem>
                        </DropdownMenu>
                      </InputGroupButtonDropdown>
                      <Button
                        className="default disabled"
                        outline
                        color="ligth"
                      >
                        <i className="simple-icon-magnifier" />
                      </Button>
                      <Input placeholder="Search.." />
                      <InputGroupButtonDropdown
                        addonType="prepend"
                        isOpen={this.state.splitButtonOpen1}
                        toggle={this.toggleSplit1}
                      >
                        <DropdownToggle color="primary" className="default">
                          <span className="mr-2">Filter</span>{" "}
                          <i className="iconsminds-arrow-down-2" />
                        </DropdownToggle>
                        <DropdownMenu>
                          <DropdownItem>1</DropdownItem>
                          <DropdownItem>2</DropdownItem>
                        </DropdownMenu>
                      </InputGroupButtonDropdown>
                    </InputGroup>
                  </div>
                </div>
                <BootstrapTable
                  data={this.dataTable()}
                  pagination={true}
                  options={option}
                >
                  <TableHeaderColumn dataField="requestWithdraw" isKey>
                    Permintaan Penarikan
                  </TableHeaderColumn>
                  <TableHeaderColumn dataField="seller">
                    Seller
                  </TableHeaderColumn>
                  <TableHeaderColumn dataField="amountWithdraw">
                    Jumlah Saldo Ditarik
                  </TableHeaderColumn>
                  <TableHeaderColumn dataField="withdrawToAccount">
                    Ditarik ke Rekening
                  </TableHeaderColumn>
                  <TableHeaderColumn dataField="bankBranch">
                    Cabang Bank
                  </TableHeaderColumn>
                  <TableHeaderColumn dataField="status">
                    Status
                  </TableHeaderColumn>
                  <TableHeaderColumn dataFormat={this.button.bind(this)}>
                    Upload Bukti
                  </TableHeaderColumn>
                </BootstrapTable>
              </CardBody>
            </Card>
          </Colxx>
        </Row>

        {/* MODAL */}
        <Modal isOpen={this.state.modal} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>
            <IntlMessages id="modal.modalTitle" />
          </ModalHeader>
          <ModalBody>
            <Table>
              <tr>
                <td>
                  <IntlMessages id="modal.seller" />
                </td>
                <td>:</td>
                <td>{this.state.oneData.seller}</td>
              </tr>
              <tr>
                <td>
                  <IntlMessages id="modal.cardName" />
                </td>
                <td>:</td>
                <td>{this.state.oneData.seller}</td>
              </tr>
              <tr>
                <td>
                  <IntlMessages id="modal.bank" />
                </td>
                <td>:</td>
                <td>{this.state.oneData.withdrawToAccount}</td>
              </tr>
              <tr>
                <td>
                  <IntlMessages id="modal.creditNumber" />
                </td>
                <td>:</td>
                <td>{this.state.oneData.receiptNumber}</td>
              </tr>
              <tr>
                <td>
                  <IntlMessages id="modal.total" />
                </td>
                <td>:</td>
                <td>{this.state.oneData.amountWithdraw}</td>
              </tr>
            </Table>
            {this.state.oneData.status === "Berhasil" ? (
              <div>Disini Bukti Transfer.</div>
            ) : (
              <div>
                <Input type="file" />
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            {this.state.oneData.status === "Berhasil" ? (
              <Button color="danger" onClick={this.toggle}>
                Close
              </Button>
            ) : (
              <Button color="primary" onClick={this.toggle}>
                Upload
              </Button>
            )}
          </ModalFooter>
        </Modal>
      </Fragment>
    );
  }
}

export default WithdrawFunds;
