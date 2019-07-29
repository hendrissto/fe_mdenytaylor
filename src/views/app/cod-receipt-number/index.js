import React, { Component, Fragment } from "react";
import { Card, CardBody, } from "reactstrap";
import ReactTable from "react-table";

import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import Breadcrumb from "../../../containers/navs/Breadcrumb";
import DataTablePagination from "../../../components/DatatablePagination";
import { InputGroup, Button, InputGroupButtonDropdown, Input, DropdownToggle, DropdownMenu, DropdownItem, Modal, ModalHeader, ModalBody, ModalFooter, Row, Col } from 'reactstrap';

const data = [
  {
    id: 1,
    receiptNumber: 908989,
    sender: 'Marble Cake',
    img: '/assets/img/marble-cake-thumb.jpg',
    receiver: 'Cakes',
    createDate: '02.04.2018',
    status: 'Paid',
    statusColor: 'primary',
    description: 'Wedding cake with flowers Macarons and blueberries',
    amount: 'Rp. 164.000',
    stock: 62
  },
  {
    id: 2,
    receiptNumber: 890800,
    sender: 'Fat Rascal',
    receiver: 'Cupcakes',
    img: '/assets/img/fat-rascal-thumb.jpg',
    createDate: '01.04.2018',
    status: 'Partial Paid',
    statusColor: 'secondary',
    description: 'Cheesecake with chocolate cookies and Cream biscuits',
    amount: 'Rp. 124.000',
    stock: 48
  },
  {
    id: 3,
    receiptNumber: 23423400,
    sender: 'Chocolate Cake',
    img: '/assets/img/chocolate-cake-thumb.jpg',
    receiver: 'Cakes',
    createDate: '25.03.2018',
    status: 'Partial Paid',
    statusColor: 'secondary',
    description: 'Homemade cheesecake with fresh berries and mint',
    amount: 'Rp. 108.000',
    stock: 57
  },
  {
    id: 4,
    receiptNumber: 2342300,
    sender: 'Goose Breast',
    img: '/assets/img/goose-breast-thumb.jpg',
    receiver: 'Cakes',
    createDate: '21.03.2018',
    status: 'Partial Paid',
    statusColor: 'secondary',
    description: 'Chocolate cake with berries',
    amount: 'Rp. 101.004',
    stock: 41
  },
  {
    id: 5,
    receiptNumber: 23423400,
    sender: 'Petit Gâteau',
    receiver: 'Cupcakes',
    img: '/assets/img/petit-gateau-thumb.jpg',
    createDate: '02.06.2018',
    status: 'Paid',
    statusColor: 'primary',
    description: 'Chocolate cake with mascarpone',
    amount: 'Rp. 985.000',
    stock: 23
  },
  {
    id: 6,
    receiptNumber: 234234200,
    sender: 'Salzburger Nockerl',
    img: '/assets/img/salzburger-nockerl-thumb.jpg',
    receiver: 'Desserts',
    createDate: '14.07.2018',
    status: 'Partial Paid',
    statusColor: 'secondary',
    description: 'Wedding cake decorated with donuts and wild berries',
    amount: 'Rp. 962.000',
    stock: 34
  },
  {
    id: 7,
    receiptNumber: 23400,
    sender: 'Napoleonshat',
    img: '/assets/img/napoleonshat-thumb.jpg',
    receiver: 'Desserts',
    createDate: '05.02.2018',
    status: 'Partial Paid',
    statusColor: 'secondary',
    description: 'Cheesecake with fresh berries and mint for dessert',
    amount: 'Rp. 921.000',
    stock: 31
  },
  {
    id: 8,
    receiptNumber: 2349802938400,
    sender: 'Cheesecake',
    img: '/assets/img/cheesecake-thumb.jpg',
    receiver: 'Cakes',
    createDate: '18.08.2018',
    status: 'Paid',
    statusColor: 'primary',
    description: 'Delicious vegan chocolate cake',
    amount: 'Rp. 887.000',
    stock: 21
  },
  {
    id: 9,
    receiptNumber: 230984029300,
    sender: 'Financier',
    img: '/assets/img/financier-thumb.jpg',
    receiver: 'Cakes',
    createDate: '15.03.2018',
    status: 'Paid',
    statusColor: 'primary',
    description:
      'White chocolate strawberry yogurt cake decorated with fresh fruits and chocolate',
    amount: 'Rp. 865.000',
    stock: 53
  },
  {
    id: 10,
    receiptNumber: 203984000,
    sender: 'Genoise',
    img: '/assets/img/genoise-thumb.jpg',
    receiver: 'Cupcakes',
    createDate: '11.06.2018',
    status: 'Partial Paid',
    statusColor: 'secondary',
    description: 'Christmas fruit cake, pudding on top',
    amount: 'Rp. 824.000',
    stock: 55
  },
  {
    id: 11,
    receiptNumber: 2398409200,
    sender: 'Gingerbread',
    img: '/assets/img/gingerbread-thumb.jpg',
    receiver: 'Cakes',
    createDate: '10.04.2018',
    status: 'Paid',
    statusColor: 'primary',
    description: 'Wedding cake decorated with donuts and wild berries',
    amount: 'Rp. 714.000',
    stock: 12
  },
  {
    id: 12,
    receiptNumber: 239849238400,
    sender: 'Magdalena',
    img: '/assets/img/magdalena-thumb.jpg',
    receiver: 'Cakes',
    createDate: '22.07.2018',
    status: 'Partial Paid',
    statusColor: 'secondary',
    description: 'Christmas fruit cake, pudding on top',
    amount: 'Rp. 702.000',
    stock: 14
  },
  {
    id: 13,
    receiptNumber: 2039840200,
    sender: 'Parkin',
    img: '/assets/img/parkin-thumb.jpg',
    receiver: 'Cakes',
    createDate: '22.08.2018',
    status: 'Paid',
    statusColor: 'primary',
    description:
      'White chocolate strawberry yogurt cake decorated with fresh fruits and chocolate',
    amount: 'Rp. 689.000',
    stock: 78
  },
  {
    id: 14,
    receiptNumber: 2093804200,
    sender: 'Streuselkuchen',
    img: '/assets/img/streuselkuchen-thumb.jpg',
    receiver: 'Cakes',
    createDate: '22.07.2018',
    status: 'Partial Paid',
    statusColor: 'secondary',
    description: 'Delicious vegan chocolate cake',
    amount: 'Rp. 645.000',
    stock: 55
  },
  {
    id: 15,
    receiptNumber: 239480239400,
    sender: 'Tea loaf',
    img: '/assets/img/tea-loaf-thumb.jpg',
    receiver: 'Cakes',
    createDate: '10.09.2018',
    status: 'Paid',
    statusColor: 'primary',
    description: 'Cheesecake with fresh berries and mint for dessert',
    amount: 'Rp. 632.000',
    stock: 20
  },
  {
    id: 16,
    receiptNumber: 23084023900,
    sender: 'Merveilleux',
    img: '/assets/img/merveilleux-thumb.jpg',
    receiver: 'Cakes',
    createDate: '18.02.2018',
    status: 'Paid',
    statusColor: 'primary',
    description: 'Chocolate cake with mascarpone',
    amount: 'Rp. 621.000',
    stock: 6
  },
  {
    id: 17,
    receiptNumber: 4023980400,
    sender: 'Fruitcake',
    img: '/assets/img/fruitcake-thumb.jpg',
    receiver: 'Cakes',
    createDate: '12.01.2019',
    status: 'Partial Paid',
    statusColor: 'secondary',
    description: 'Chocolate cake with berries',
    amount: 'Rp. 595.000',
    stock: 17
  },
  {
    id: 18,
    receiptNumber: 23984029300,
    sender: 'Bebinca',
    img: '/assets/img/bebinca-thumb.jpg',
    receiver: 'Cakes',
    createDate: '04.02.2019',
    status: 'Partial Paid',
    statusColor: 'secondary',
    description: 'Homemade cheesecake with fresh berries and mint',
    amount: 'Rp. 574.000',
    stock: 16
  },
  {
    id: 19,
    receiptNumber: 230984000,
    sender: 'Cremeschnitte',
    img: '/assets/img/cremeschnitte-thumb.jpg',
    receiver: 'Desserts',
    createDate: '04.03.2018',
    status: 'Paid',
    statusColor: 'primary',
    description: 'Cheesecake with chocolate cookies and Cream biscuits',
    amount: 'Rp. 562.000',
    stock: 9
  },
  {
    id: 20,
    receiptNumber: 23094800,
    sender: 'Soufflé',
    img: '/assets/img/souffle-thumb.jpg',
    receiver: 'Cupcakes',
    createDate: '16.01.2018',
    status: 'Paid',
    statusColor: 'primary',
    description: 'Wedding cake with flowers Macarons and blueberries',
    amount: 'Rp. 524.000',
    stock: 14
  }
]

export default class CODReceiptNumber extends Component {
  constructor(props) {
    super(props);

    this.toggleDropDown = this.toggleDropDown.bind(this);
    this.toggleSplit = this.toggleSplit.bind(this);
    this.toggleDropDown1 = this.toggleDropDown1.bind(this);
    this.toggleSplit1 = this.toggleSplit1.bind(this);
    this.toggle = this.toggle.bind(this);
    this.state = {
      dropdownOpen: false,
      splitButtonOpen: false,
      dropdownOpen1: false,
      splitButtonOpen1: false,
      modal: false,
      oneData: ""
    };
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
  dataTable() {
    return (
      [
        {
          Header: "Resi",
          accessor: "receiptNumber",
          Cell: props =>
            <Button color="link" className="text-primary" onClick={() => {
              this.toggle();
              this.setState({ oneData: props.original });
            }}>
              <p>{props.value}</p>
            </Button>
        },
        {
          Header: "Pengirim",
          accessor: "sender",
          Cell: props => <p>{props.value}</p>
        },
        {
          Header: "Penerima",
          accessor: "receiver",
          Cell: props => <p>{props.value}</p>
        },
        {
          Header: "Total",
          accessor: "amount",
          Cell: props => <p>{props.value}</p>
        },
        {
          Header: "Status",
          accessor: "status",
          Cell: props => <p>{props.value}</p>
        }
      ]
    )
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
    )
  }
  render() {

    return (
      <Fragment>
        <Row>
          <Colxx xxs="12">
            <Breadcrumb heading="menu.cod-receipt-number" match={this.props.match} />
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
                    <InputGroupButtonDropdown addonType="prepend" isOpen={this.state.splitButtonOpen} toggle={this.toggleSplit}>
                      <DropdownToggle color="primary" className="default">
                        <i className="simple-icon-menu" />
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem>1</DropdownItem>
                        <DropdownItem>2</DropdownItem>
                      </DropdownMenu>
                    </InputGroupButtonDropdown>
                    <Button className="default disabled" outline color="ligth">
                      <i className="simple-icon-magnifier" />
                    </Button>
                    <Input placeholder="Search.." />
                    <InputGroupButtonDropdown addonType="prepend" isOpen={this.state.splitButtonOpen1} toggle={this.toggleSplit1}>
                      <DropdownToggle color="primary" className="default">
                        <span className="mr-2">Filter</span> <i className="iconsminds-arrow-down-2" />
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem>1</DropdownItem>
                        <DropdownItem>2</DropdownItem>
                      </DropdownMenu>
                    </InputGroupButtonDropdown>
                  </InputGroup>
                </div>
              </div>

                <ReactTable
                  className="-striped"
                  data={data}
                  columns={this.dataTable()}
                  minRows={0}
                  defaultPageSize={5}
                  showPageJump={true}
                  PaginationComponent={DataTablePagination}
                  showPageSizeOptions={true}
                />
              </CardBody>
            </Card>
          </Colxx>
        </Row>

        // Modal detail
        <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
          <ModalHeader toggle={this.toggle}>Detail Resi COD</ModalHeader>
          <ModalBody>
            {this.oneData()}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" outline onClick={this.toggle}>Close</Button>
          </ModalFooter>
        </Modal>
      </Fragment>
    )
  }
}