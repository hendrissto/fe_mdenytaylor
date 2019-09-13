import React, { Component, Fragment } from "react";
import { Card, CardBody } from "reactstrap";
import ReactTable from "react-table";

import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import Breadcrumb from "../../../containers/navs/Breadcrumb";
import DataTablePagination from "../../../components/DatatablePagination";
import { InputGroup, Button, Input, Modal, ModalHeader, ModalBody, ModalFooter, Row, Col } from 'reactstrap';
// import { InputGroup, Button, InputGroupButtonDropdown, Input, DropdownToggle, DropdownMenu, DropdownItem, Modal, ModalHeader, ModalBody, ModalFooter, Row, Col } from 'reactstrap';
import CODRestService from "../../../core/codRestService";

// const data = []
// const data = [
//   {
//     id: 1,
//     receiptNumber: 908989,
//     sender: 'Marble Cake',
//     img: '/assets/img/marble-cake-thumb.jpg',
//     receiver: 'Cakes',
//     createDate: '02.04.2018',
//     status: 'Paid',
//     statusColor: 'primary',
//     description: 'Wedding cake with flowers Macarons and blueberries',
//     amount: 'Rp. 164.000',
//     stock: 62
//   },
//   {
//     id: 2,
//     receiptNumber: 890800,
//     sender: 'Fat Rascal',
//     receiver: 'Cupcakes',
//     img: '/assets/img/fat-rascal-thumb.jpg',
//     createDate: '01.04.2018',
//     status: 'Partial Paid',
//     statusColor: 'secondary',
//     description: 'Cheesecake with chocolate cookies and Cream biscuits',
//     amount: 'Rp. 124.000',
//     stock: 48
//   },
//   {
//     id: 3,
//     receiptNumber: 23423400,
//     sender: 'Chocolate Cake',
//     img: '/assets/img/chocolate-cake-thumb.jpg',
//     receiver: 'Cakes',
//     createDate: '25.03.2018',
//     status: 'Partial Paid',
//     statusColor: 'secondary',
//     description: 'Homemade cheesecake with fresh berries and mint',
//     amount: 'Rp. 108.000',
//     stock: 57
//   },
//   {
//     id: 4,
//     receiptNumber: 2342300,
//     sender: 'Goose Breast',
//     img: '/assets/img/goose-breast-thumb.jpg',
//     receiver: 'Cakes',
//     createDate: '21.03.2018',
//     status: 'Partial Paid',
//     statusColor: 'secondary',
//     description: 'Chocolate cake with berries',
//     amount: 'Rp. 101.004',
//     stock: 41
//   },
//   {
//     id: 5,
//     receiptNumber: 23423400,
//     sender: 'Petit Gâteau',
//     receiver: 'Cupcakes',
//     img: '/assets/img/petit-gateau-thumb.jpg',
//     createDate: '02.06.2018',
//     status: 'Paid',
//     statusColor: 'primary',
//     description: 'Chocolate cake with mascarpone',
//     amount: 'Rp. 985.000',
//     stock: 23
//   },
//   {
//     id: 6,
//     receiptNumber: 234234200,
//     sender: 'Salzburger Nockerl',
//     img: '/assets/img/salzburger-nockerl-thumb.jpg',
//     receiver: 'Desserts',
//     createDate: '14.07.2018',
//     status: 'Partial Paid',
//     statusColor: 'secondary',
//     description: 'Wedding cake decorated with donuts and wild berries',
//     amount: 'Rp. 962.000',
//     stock: 34
//   },
//   {
//     id: 7,
//     receiptNumber: 23400,
//     sender: 'Napoleonshat',
//     img: '/assets/img/napoleonshat-thumb.jpg',
//     receiver: 'Desserts',
//     createDate: '05.02.2018',
//     status: 'Partial Paid',
//     statusColor: 'secondary',
//     description: 'Cheesecake with fresh berries and mint for dessert',
//     amount: 'Rp. 921.000',
//     stock: 31
//   },
//   {
//     id: 8,
//     receiptNumber: 2349802938400,
//     sender: 'Cheesecake',
//     img: '/assets/img/cheesecake-thumb.jpg',
//     receiver: 'Cakes',
//     createDate: '18.08.2018',
//     status: 'Paid',
//     statusColor: 'primary',
//     description: 'Delicious vegan chocolate cake',
//     amount: 'Rp. 887.000',
//     stock: 21
//   },
//   {
//     id: 9,
//     receiptNumber: 230984029300,
//     sender: 'Financier',
//     img: '/assets/img/financier-thumb.jpg',
//     receiver: 'Cakes',
//     createDate: '15.03.2018',
//     status: 'Paid',
//     statusColor: 'primary',
//     description:
//       'White chocolate strawberry yogurt cake decorated with fresh fruits and chocolate',
//     amount: 'Rp. 865.000',z
//     stock: 53
//   },
//   {
//     id: 10,
//     receiptNumber: 203984000,
//     sender: 'Genoise',
//     img: '/assets/img/genoise-thumb.jpg',
//     receiver: 'Cupcakes',
//     createDate: '11.06.2018',
//     status: 'Partial Paid',
//     statusColor: 'secondary',
//     description: 'Christmas fruit cake, pudding on top',
//     amount: 'Rp. 824.000',
//     stock: 55
//   },
//   {
//     id: 11,
//     receiptNumber: 2398409200,
//     sender: 'Gingerbread',
//     img: '/assets/img/gingerbread-thumb.jpg',
//     receiver: 'Cakes',
//     createDate: '10.04.2018',
//     status: 'Paid',
//     statusColor: 'primary',
//     description: 'Wedding cake decorated with donuts and wild berries',
//     amount: 'Rp. 714.000',
//     stock: 12
//   },
//   {
//     id: 12,
//     receiptNumber: 239849238400,
//     sender: 'Magdalena',
//     img: '/assets/img/magdalena-thumb.jpg',
//     receiver: 'Cakes',
//     createDate: '22.07.2018',
//     status: 'Partial Paid',
//     statusColor: 'secondary',
//     description: 'Christmas fruit cake, pudding on top',
//     amount: 'Rp. 702.000',
//     stock: 14
//   },
//   {
//     id: 13,
//     receiptNumber: 2039840200,
//     sender: 'Parkin',
//     img: '/assets/img/parkin-thumb.jpg',
//     receiver: 'Cakes',
//     createDate: '22.08.2018',
//     status: 'Paid',
//     statusColor: 'primary',
//     description:
//       'White chocolate strawberry yogurt cake decorated with fresh fruits and chocolate',
//     amount: 'Rp. 689.000',
//     stock: 78
//   },
//   {
//     id: 14,
//     receiptNumber: 2093804200,
//     sender: 'Streuselkuchen',
//     img: '/assets/img/streuselkuchen-thumb.jpg',
//     receiver: 'Cakes',
//     createDate: '22.07.2018',
//     status: 'Partial Paid',
//     statusColor: 'secondary',
//     description: 'Delicious vegan chocolate cake',
//     amount: 'Rp. 645.000',
//     stock: 55
//   },
//   {
//     id: 15,
//     receiptNumber: 239480239400,
//     sender: 'Tea loaf',
//     img: '/assets/img/tea-loaf-thumb.jpg',
//     receiver: 'Cakes',
//     createDate: '10.09.2018',
//     status: 'Paid',
//     statusColor: 'primary',
//     description: 'Cheesecake with fresh berries and mint for dessert',
//     amount: 'Rp. 632.000',
//     stock: 20
//   },
//   {
//     id: 16,
//     receiptNumber: 23084023900,
//     sender: 'Merveilleux',
//     img: '/assets/img/merveilleux-thumb.jpg',
//     receiver: 'Cakes',
//     createDate: '18.02.2018',
//     status: 'Paid',
//     statusColor: 'primary',
//     description: 'Chocolate cake with mascarpone',
//     amount: 'Rp. 621.000',
//     stock: 6
//   },
//   {
//     id: 17,
//     receiptNumber: 4023980400,
//     sender: 'Fruitcake',
//     img: '/assets/img/fruitcake-thumb.jpg',
//     receiver: 'Cakes',
//     createDate: '12.01.2019',
//     status: 'Partial Paid',
//     statusColor: 'secondary',
//     description: 'Chocolate cake with berries',
//     amount: 'Rp. 595.000',
//     stock: 17
//   },
//   {
//     id: 18,
//     receiptNumber: 23984029300,
//     sender: 'Bebinca',
//     img: '/assets/img/bebinca-thumb.jpg',
//     receiver: 'Cakes',
//     createDate: '04.02.2019',
//     status: 'Partial Paid',
//     statusColor: 'secondary',
//     description: 'Homemade cheesecake with fresh berries and mint',
//     amount: 'Rp. 574.000',
//     stock: 16
//   },
//   {
//     id: 19,
//     receiptNumber: 230984000,
//     sender: 'Cremeschnitte',
//     img: '/assets/img/cremeschnitte-thumb.jpg',
//     receiver: 'Desserts',
//     createDate: '04.03.2018',
//     status: 'Paid',
//     statusColor: 'primary',
//     description: 'Cheesecake with chocolate cookies and Cream biscuits',
//     amount: 'Rp. 562.000',
//     stock: 9
//   },
//   {
//     id: 20,
//     receiptNumber: 23094800,
//     sender: 'Soufflé',
//     img: '/assets/img/souffle-thumb.jpg',
//     receiver: 'Cupcakes',
//     createDate: '16.01.2018',
//     status: 'Paid',
//     statusColor: 'primary',
//     description: 'Wedding cake with flowers Macarons and blueberries',
//     amount: 'Rp. 524.000',
//     stock: 14
//   }
// ]

export default class CODReceiptNumber extends Component {
  constructor(props) {
    super(props);
    this.codRest = new CODRestService();
    this.handleInputChange = this.handleInputChange.bind(this);

    // this.toggleDropDown = this.toggleDropDown.bind(this);
    // this.toggleSplit = this.toggleSplit.bind(this);
    // this.toggleDropDown1 = this.toggleDropDown1.bind(this);
    // this.toggleSplit1 = this.toggleSplit1.bind(this);
    this.dataTable = this.dataTable.bind(this);
    this.toggle = this.toggle.bind(this);
    this.state = {
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

  handleOnPageChange(pageIndex) {
    const table = { ...this.state.table }
    table.loading = true;
    table.pagination.skipSize = (pageIndex * table.pagination.pageSize);
    table.pagination.currentPage = pageIndex;

    console.log(table);

    this.setState({ table });
    this.loadData();
  }

  handleOnPageSizeChange(newPageSize, newPage) {
    const table = { ...this.state.table }
    table.loading = true;
    table.pagination.pageSize = newPageSize
    this.setState({ table });
    this.loadData();
  }

  loadData() {
    const table = { ...this.state.table }
    table.loading = true;
    this.setState({ table });

    const params = {
      keyword: this.state.search || null,
      "options.take": this.state.table.pagination.pageSize,
      "options.skip": this.state.table.pagination.skipSize,
      "options.includeTotalCount": true,
    }


    this.codRest.getCODReceipts({ params })
      .subscribe((response) => {
        const table = { ...this.state.table }
        table.data = response.data;
        table.pagination.totalPages = response.total / table.pagination.pageSize;
        table.loading = false;
        this.setState({ table });
      })
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
    console.log(newSorted)
    console.log(column)
    console.log(additive)
  }

  dataTable(){
    return(
      [
        {
          Header: "Tracking Number",
          accessor: "trackingNumber",
          Cell: props => <p>{props.value}</p>
        },
        {
          Header: "Receiver Name",
          accessor: "receiverName",
          Cell: props => <p>{props.value}</p>
        },
        {
          Header: "Seller Name",
          accessor: "sellerName",
          Cell: props => <p>{props.value}</p>
        },
        {
          Header: "Total",
          accessor: "amount",
          Cell: props => <p>{props.value}</p>
        },
        {
          Header: "Tracking Number",
          accessor: "trackingNumber",
          Cell: props => <p>{props.value}</p>
        },
      ]
    )
  }

  // columnsTable() {
  //   return (
  //     [
  //       {
  //         Header: "Resi",
  //         accessor: "receiptNumber",
  //         Cell: props =>
  //           <Button color="link" className="text-primary" onClick={() => {
  //             this.toggle();
  //             this.setState({ oneData: props.original });
  //           }}
  //           >
  //             <p>{props.value}</p>
  //           </Button>
  //       },
  //       {
  //         Header: "Pengirim",
  //         accessor: "sender",
  //         Cell: props => <p>{props.value}</p>
  //       },
  //       {
  //         Header: "Penerima",
  //         accessor: "receiver",
  //         Cell: props => <p>{props.value}</p>
  //       },
  //       {
  //         Header: "Total",
  //         accessor: "amount",
  //         Cell: props => <p>{props.value}</p>
  //       },
  //       {
  //         Header: "Status",
  //         accessor: "status",
  //         Cell: props => <p>{props.value}</p>
  //       }
  //     ]);
  // }


  // Others
  toggle() {
    this.setState(prevState => ({
      modal: !prevState.modal
    }));
  }

  // toggleDropDown() {
  //   this.setState({
  //     dropdownOpen: !this.state.dropdownOpen
  //   });
  // }

  // toggleSplit() {
  //   this.setState({
  //     splitButtonOpen: !this.state.splitButtonOpen
  //   });
  // }
  // toggleDropDown1() {
  //   this.setState({
  //     dropdownOpen1: !this.state.dropdownOpen1
  //   });
  // }

  // toggleSplit1() {
  //   this.setState({
  //     splitButtonOpen1: !this.state.splitButtonOpen1
  //   });
  // }

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
    const option = {
      sizePerPage: 5,
      sizePerPageList: [{
        text: '5', value: 5
      }, {
        text: '10', value: 10
      }],
    }
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
                      {/* <InputGroupButtonDropdown addonType="prepend" isOpen={this.state.splitButtonOpen} toggle={this.toggleSplit}>
                      <DropdownToggle color="primary" className="default">
                        <i className="simple-icon-menu" />
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem>1</DropdownItem>
                        <DropdownItem>2</DropdownItem>
                      </DropdownMenu>
                    </InputGroupButtonDropdown> */}
                      <Input placeholder="Search.." name="search" value={this.state.search} onChange={this.handleInputChange}
                        onKeyPress={event => {
                          if (event.key === 'Enter') {
                            this.loadData();
                          }
                        }} />
                      <Button className="default" color="primary" onClick={() => this.loadData()}>
                        <i className="simple-icon-magnifier" />
                      </Button>
                      {/* <InputGroupButtonDropdown addonType="prepend" isOpen={this.state.splitButtonOpen1} toggle={this.toggleSplit1}>
                      <DropdownToggle color="primary" className="default">
                        <span className="mr-2">Filter</span> <i className="iconsminds-arrow-down-2" />
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem>1</DropdownItem>
                        <DropdownItem>2</DropdownItem>
                      </DropdownMenu>
                    </InputGroupButtonDropdown> */}
                    </InputGroup>
                  </div>
                </div>

                <ReactTable
                  page={this.state.table.pagination.currentPage}
                  PaginationComponent={DataTablePagination}
                  data={this.state.table.data}
                  pages={this.state.table.pagination.totalPages}
                  columns={this.dataTable()}
                  defaultPageSize={this.state.table.pagination.pageSize}
                  className='-striped'
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

        <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
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
