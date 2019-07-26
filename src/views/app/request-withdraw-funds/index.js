import React, { Component, Fragment } from "react";
import ReactTable from "react-table";
import {
  Row,
  Card,
  CardBody,
  CardTitle,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table
} from "reactstrap";

import IntlMessages from "../../../helpers/IntlMessages";

import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import Breadcrumb from "../../../containers/navs/Breadcrumb";
import DataTablePagination from "../../../components/DatatablePagination";

const totalBalance = "Rp 580.000.000";
class WithdrawFunds extends Component {
  constructor(props) {
    super(props);
    this.state = {
      oneData: "",
      modal: false
    };

    this.toggle = this.toggle.bind(this);
  }

  dataTableColumns() {
    return [
      {
        Header: "Permintaan Penarikan",
        accessor: "requestWithdraw",
        Cell: props => <p className="list-item-heading">{props.value}</p>
      },
      {
        Header: "Seller",
        accessor: "seller",
        Cell: props => <p className="list-item-heading">{props.value}</p>
      },
      {
        Header: "Jumlah Saldo Ditarik",
        accessor: "amountWithdraw",
        Cell: props => <p className="list-item-heading">{props.value}</p>
      },
      {
        Header: "Ditarik ke Rekening",
        accessor: "withdrawToAccount",
        Cell: props => <p className="list-item-heading">{props.value}</p>
      },
      {
        Header: "Cabang Bank",
        accessor: "bankBranch",
        Cell: props => <p className="list-item-heading">{props.value}</p>
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: props => <p className="list-item-heading">{props.value}</p>
      },
      {
        Header: "Upload Bukti",
        Cell: props => {
          if (props.original.status == "Paid") {
            return (
              <div>
                <Button
                  onClick={() => {
                    this.toggle();
                    this.setState({ oneData: props.original });
                  }}
                >
                  Bukti Transfer
                </Button>
              </div>
            );
          } else {
            return (
              <div>
                <Button
                  onClick={() => {
                    this.toggle();
                    this.setState({ oneData: props.original });
                  }}
                >
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
        bankBranch: "Cakes",
        requestWithdraw: "02.04.2018",
        withdrawToAccount: "BNI",
        status: "Paid",
        statusColor: "primary",
        description: "Wedding cake with flowers Macarons and blueberries",
        amountWithdraw: "Rp. 164.000",
        stock: 62
      },
      {
        id: 2,
        receiptNumber: 890800,
        seller: "Fat Rascal",
        bankBranch: "Cupcakes",
        img: "/assets/img/fat-rascal-thumb.jpg",
        requestWithdraw: "01.04.2018",
        withdrawToAccount: "BCA",
        status: "Partial Paid",
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
        bankBranch: "Cakes",
        requestWithdraw: "25.03.2018",
        withdrawToAccount: "BRI",
        status: "Partial Paid",
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
        bankBranch: "Cakes",
        requestWithdraw: "21.03.2018",
        withdrawToAccount: "BLS",
        status: "Partial Paid",
        statusColor: "secondary",
        description: "Chocolate cake with berries",
        amountWithdraw: "Rp. 101.004",
        stock: 41
      },
      {
        id: 5,
        receiptNumber: 23423400,
        seller: "Petit Gâteau",
        bankBranch: "Cupcakes",
        img: "/assets/img/petit-gateau-thumb.jpg",
        requestWithdraw: "02.06.2018",
        withdrawToAccount: "BCM",
        status: "Paid",
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
        status: "Partial Paid",
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
        status: "Partial Paid",
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
        bankBranch: "Cakes",
        requestWithdraw: "18.08.2018",
        withdrawToAccount: "BCA",
        status: "Paid",
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
        bankBranch: "Cakes",
        requestWithdraw: "15.03.2018",
        withdrawToAccount: "BCA",
        status: "Paid",
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
        bankBranch: "Cupcakes",
        requestWithdraw: "11.06.2018",
        withdrawToAccount: "BCA",
        status: "Partial Paid",
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
        bankBranch: "Cakes",
        requestWithdraw: "10.04.2018",
        withdrawToAccount: "BCA",
        status: "Paid",
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
        bankBranch: "Cakes",
        requestWithdraw: "22.07.2018",
        withdrawToAccount: "BCA",
        status: "Partial Paid",
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
        bankBranch: "Cakes",
        requestWithdraw: "22.08.2018",
        withdrawToAccount: "BCA",
        status: "Paid",
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
        bankBranch: "Cakes",
        requestWithdraw: "22.07.2018",
        withdrawToAccount: "BCA",
        status: "Partial Paid",
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
        bankBranch: "Cakes",
        requestWithdraw: "10.09.2018",
        withdrawToAccount: "BCA",
        status: "Paid",
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
        bankBranch: "Cakes",
        requestWithdraw: "18.02.2018",
        withdrawToAccount: "BCA",
        status: "Paid",
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
        bankBranch: "Cakes",
        requestWithdraw: "12.01.2019",
        withdrawToAccount: "BCA",
        status: "Partial Paid",
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
        bankBranch: "Cakes",
        requestWithdraw: "04.02.2019",
        withdrawToAccount: "BCA",
        status: "Partial Paid",
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
        status: "Paid",
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
        bankBranch: "Cupcakes",
        requestWithdraw: "16.01.2018",
        withdrawToAccount: "BCA",
        status: "Paid",
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

  render() {
    const { match } = this.props;
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
                <CardTitle>
                  <h3>
                    <IntlMessages id="title.total-balance" />
                  </h3>
                  <h1>{totalBalance}</h1>
                </CardTitle>
                <ReactTable
                  columns={this.dataTableColumns()}
                  data={this.dataTable()}
                  defaultPageSize={5}
                  filterable={true}
                  showPageJump={true}
                  PaginationComponent={DataTablePagination}
                  showPageSizeOptions={true}
                />
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
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.toggle}>
              Submit
            </Button>
          </ModalFooter>
        </Modal>
      </Fragment>
    );
  }
}

export default WithdrawFunds;
