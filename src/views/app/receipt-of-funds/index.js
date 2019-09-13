import * as numeral from "numeral";
import * as _ from "lodash";
import {
  Row,
  Card,
  CardBody,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  InputGroup,
  Input
} from "reactstrap";
import { ExcelRenderer } from "react-excel-renderer";

import React, { Component, Fragment } from "react";
import ReactTable from "react-table";
// import CsvParse from "@vtex/react-csv-parse";

import IntlMessages from "../../../helpers/IntlMessages";
import Breadcrumb from "../../../containers/navs/Breadcrumb";
import DataTablePagination from "../../../components/DatatablePagination";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";

import CODRestService from "../../../core/codRestService";

// import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
// import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css";
import "./receipt-of-funds.scss";
class ReceiptOfFunds extends Component {
  constructor(props) {
    super(props);
    this.codRest =  new CODRestService();

    this.showModal = this.showModal.bind(this);
    this.dataTable = this.dataTable.bind(this);
    // this.dataTableColumsCOD = this.dataTableColumsCOD.bind(this);
    // this.dataTableCODSeller = this.dataTableCODSeller.bind(this);
    this.state = {
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
      modal: false,
      resiModal: false,
      resiModalSeller: false,
      data: [],
      oneData: [],
      footerData: [
        [
          {
            label: "Total",
            columnIndex: 0
          },
          {
            label: "Nilai Paket",
            columnIndex: 2,
            align: "left",
            formatter: tableData => this.sumData(tableData, "totalAmount")
          },
          {
            label: "Fee COD",
            columnIndex: 3,
            align: "left",
            formatter: tableData => this.sumData(tableData, "codFeeRp")
          },
          {
            label: "Total Diterima",
            columnIndex: 4,
            align: "left",
            formatter: tableData => this.sumData(tableData, "totalReceive")
          }
        ]
      ],
      footerData2: [
        [
          {
            label: "Total",
            columnIndex: 0
          },
          {
            label: "Nilai Paket",
            columnIndex: 2,
            align: "left",
            formatter: tableData => this.sumData(tableData, "totalAmount")
          },
          {
            label: "Fee COD",
            columnIndex: 3,
            align: "left",
            formatter: tableData => this.sumData(tableData, "codFeeRp")
          },
          {
            label: "Total Diterima",
            columnIndex: 4,
            align: "left",
            formatter: tableData => this.sumData(tableData, "totAmountCodFee")
          }
        ]
      ]
    };

    // this.toggleDropDown = this.toggleDropDown.bind(this);
    // this.toggleSplit = this.toggleSplit.bind(this);
    // this.toggleDropDown1 = this.toggleDropDown1.bind(this);
    // this.toggleSplit1 = this.toggleSplit1.bind(this);
  }

  componentDidMount() {
    this.codRest.getReceiptFunds().subscribe((response) => {
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

  showModal(modalName) {
    switch (modalName) {
      case "modal":
        this.setState(prevState => ({
          modal: !prevState.modal
        }));
        break;
      case "resiModal":
        this.setState(prevState => ({
          resiModal: !prevState.resiModal
        }));
        break;
      case "resiModalSeller":
        this.setState(prevState => ({
          resiModal: false,
          resiModalSeller: true
        }));
        break;
      default:
        this.setState({
          modal: false,
          resiModal: false,
          resiModalSeller: false,
          data: []
        });
        break;
    }
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

  // tableColumns() {
  //   return [
  //     {
  //       Header: "Tanggal Unggah",
  //       accessor: "uploadDate",
  //       Cell: props => <p>{props.value}</p>
  //     },
  //     {
  //       Header: "ID File",
  //       accessor: "idFile",
  //       Cell: props => (
  //         <Button color="link" onClick={() => this.showModal("resiModal")}>
  //           <p>{props.value}</p>
  //         </Button>
  //       )
  //     },
  //     {
  //       Header: "Nama File",
  //       accessor: "fileName",
  //       Cell: props => (
  //         <Button color="link" onClick={() => this.showModal("resiModal")}>
  //           <p className="list-item-heading">{props.value}</p>
  //         </Button>
  //       )
  //     },
  //     {
  //       Header: "Diupload Oleh",
  //       accessor: "uploadedBy",
  //       Cell: props => <p>{props.value}</p>
  //     }
  //   ];
  // }

  dataTable() {
    return [
      {
        Header: "Upload Date",
        accessor: "uploadDate",
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "ID File",
        accessor: "file.id",
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "File Name",
        accessor: "file.filename",
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Upload By",
        accessor: "uploadBy",
        Cell: props => <p>{props.value}</p>
      },
    ];
  }

  // dataTableColumsCOD() {
  //   // _.map(this.state.data, (v, i) => {
  //   //   _.map(v.sumData, (v, i) => {
  //   //     console.log(v.osName)
  //   //   })
  //   // })'
  //   return [
  //     {
  //       Header: "Nama Seller",
  //       accessor: "osName",
  //       Footer: <p className="list-item-heading">Total</p>,
  //       Cell: props => (
  //         <p>
  //           <Button
  //             color="link"
  //             className="text-primary"
  //             onClick={() => this.dataTableCODSeller(props.value)}
  //           >
  //             {props.value}
  //           </Button>
  //         </p>
  //       )
  //     },
  //     {
  //       Header: "Jumlah Paket",
  //       accessor: "package",
  //       Cell: props => <p>{props.value} Paket</p>
  //     },
  //     {
  //       Header: "Total",
  //       accessor: "totalAmount",
  //       Cell: props => <p>{props.value}</p>,
  //       Footer: props => (
  //         <p>
  //           Rp{" "}
  //           {numeral(
  //             this.state.data.reduce(
  //               (total, { totalAmount }) => (total += parseInt(totalAmount)),
  //               0
  //             )
  //           ).format("0,0")}
  //         </p>
  //       )
  //     },
  //     {
  //       Header: "Fee COD",
  //       accessor: "codFeeRp",
  //       Cell: props => <p>{props.value}</p>,
  //       Footer: props => (
  //         <p>
  //           Rp{" "}
  //           {numeral(
  //             this.state.data.reduce(
  //               (total, { codFeeRp }) => (total += parseInt(codFeeRp)),
  //               0
  //             )
  //           ).format("0,0")}
  //         </p>
  //       )
  //     }
  //     // {
  //     //   Header: "Fee COD",
  //     //   accessor: "feeCOD",
  //     //   Footer: (
  //     //     <p>
  //     //       Rp{" "}
  //     //       {numeral(
  //     //         this.state.data.reduce(
  //     //           (total, { feeCOD }) => (total += parseInt(feeCOD)),
  //     //           0
  //     //         )
  //     //       ).format("0,0")}
  //     //     </p>
  //     //   ),
  //     //   Cell: props => (
  //     //     <p>
  //     //       Rp {numeral(props.value).format("0,0")}
  //     //     </p>
  //     //   )
  //     // }
  //   ];
  // }

  // dataTableCOD() {
  //   return [
  //     {
  //       id: 1,
  //       sellerName: "A Shop",
  //       packageAmount: "100 Paket",
  //       total: "Rp. 2.000.000",
  //       feeCOD: 1000000
  //     },
  //     {
  //       id: 2,
  //       sellerName: "B Shop",
  //       packageAmount: "100 Paket",
  //       total: "Rp. 2.000.000",
  //       feeCOD: 1000000
  //     },
  //     {
  //       id: 3,
  //       sellerName: "C Shop",
  //       packageAmount: "100 Paket",
  //       total: "Rp. 2.000.000",
  //       feeCOD: 1000000
  //     }
  //   ];
  // }

  // dataTableColumsCODSeller() {
  //   return [
  //     {
  //       Header: "Resi",
  //       accessor: "airwaybill",
  //       Footer: <p>Total</p>,
  //       Cell: props => (
  //         <p>
  //           <Button
  //             color="link"
  //             className="text-primary"
  //             onClick={() => console.log(props.value)}
  //           >
  //             {props.value}
  //           </Button>
  //         </p>
  //       )
  //     },
  //     {
  //       Header: "Penerima Paket",
  //       accessor: "penerima",
  //       Cell: props => <p>{props.value}</p>
  //     },
  //     {
  //       Header: "Total",
  //       accessor: "totalAmount",
  //       Cell: props => <p>{props.value}</p>,
  //       Footer: props => (
  //         <p>
  //           Rp{" "}
  //           {numeral(
  //             this.state.oneData.reduce(
  //               (total, { totalAmount }) => (total += parseInt(totalAmount)),
  //               0
  //             )
  //           ).format("0,0")}
  //         </p>
  //       )
  //     }
  //     // {
  //     //   Header: "Total",
  //     //   accessor: "total",
  //     //   Footer: (
  //     //     <p>
  //     //       Rp{" "}
  //     //       {numeral(
  //     //         this.dataTableCODSeller().reduce(
  //     //           (sum, { total }) => (sum += total),
  //     //           0
  //     //         )
  //     //       ).format("0,0")}
  //     //     </p>
  //     //   ),
  //     //   Cell: props => (
  //     //     <p>
  //     //       Rp {numeral(props.value).format("0,0")}
  //     //     </p>
  //     //   )
  //     // }
  //   ];
  // }

  // dataTableCODSeller(osName) {
  //   let i = _.findKey(this.state.data, ["osName", osName]);
  //   let data = this.state.data[i];

  //   let finish = data.v;
  //   this.setState({ oneData: finish });
  //   this.showModal("resiModalSeller");
  // }

  // dataTableCODSeller() {
  //   return [
  //     {
  //       id: 1,
  //       sellerName: "A Shop",
  //       receipt: "2340823941",
  //       receive: "Mas Ucok",
  //       total: 1000000
  //     },
  //     {
  //       id: 2,
  //       sellerName: "B Shop",
  //       receipt: "2340823942",
  //       receive: "Mas Ucok",
  //       total: 1000000
  //     },
  //     {
  //       id: 3,
  //       sellerName: "C Shop",
  //       receipt: "2340823943",
  //       receive: "Mas Ucok",
  //       total: 1000000
  //     }
  //   ];
  // }

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

    this.codRest.getReceiptFunds({ params })
      .subscribe((response) => {
        const table = { ...this.state.table }
        table.data = response.data;
        table.pagination.totalPages = response.total / table.pagination.pageSize;
        table.loading = false;
        this.setState({ table });
      })
  };

  handleData = data => {
    this.setState({ data: data });
  };

  cekdata(data) {
    return data;
  };

  fileHandler = event => {
    let fileObj = event.target.files[0];
    //just pass the fileObj as parameter
    ExcelRenderer(fileObj, (err, resp) => {
      if (err) {
        console.log(err);
      } else {
        let data = resp.rows;
        data.splice(0, 2);
        data.shift();
        console.log(data);

        let gabung = [];
        for (let i = 1; i < data.length - 1; i++) {
          let obj = _.zipObject(
            _.map(data[0], (v, i) => _.camelCase(v)),
            data[i]
          );
          gabung.push(obj);
        }

        let filter = _(gabung)
          .groupBy("osName")
          .map((v, i) => ({
            osName: i,
            v,
            package: v.length,
            totalAmount: _.sumBy(v, "totalAmount"),
            codFeeRp: _.sumBy(v, "codFeeRp"),
            totalReceive: _.sumBy(v, "totAmountCodFee")
          }))
          .value();
        this.setState({ data: filter });

        // let sumData = _(gabung)
        //   .groupBy("osName")
        //   .map((objs, key) => ({
        //     osName: key,
        //     totalAmount: _.sumBy(objs, "totalAmount"),
        //     codFeeRp: _.sumBy(objs, "codFeeRp")
        //   }))
        //   .value();
        //console.log(sumData);
        // let finish = { sumData }
        //let summary = Object.assign({}, totalamount)
        // gabung.push(finish);
        // console.log(gabung);
        // this.setState({data: gabung})
      }
    });
  };

  currencyFormat(cell, row) {
    return `Rp. ${numeral(cell).format("0,0")}`;
  }

  button(cell, row) {
    return (
    <a
      href="#"
      // onClick={() => this.dataTableCODSeller(cell)}
      className="button"
    >{cell}
    </a>
    );
  }

  buttonResiCod(cell, row) {
    return (
      <a
        href="#"
        onClick={() => this.dataTableCODSeller(cell)}
        className="button"
      >
        {cell}
      </a>
    );
  }

  render() {
    const option = {
      sizePerPage: 5,
      sizePerPageList: [ {
        text: '5', value: 5
      }, {
        text: '10', value: 10
      }],
    }
    return (
      <Fragment>
        <Row>
          <Colxx xxs={12}>
            <Breadcrumb
              heading="menu.receipt-of-funds"
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
                    {/* <InputGroupButtonDropdown addonType="prepend" isOpen={this.state.splitButtonOpen} showModal={this.toggleSplit}>
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
                      }}/>
                    <Button className="default"  color="primary" onClick={() => this.loadData()}>
                      <i className="simple-icon-magnifier" />
                    </Button>
                    {/* <InputGroupButtonDropdown addonType="prepend" isOpen={this.state.splitButtonOpen1} showModal={this.toggleSplit1}>
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

                  <div className="col-md-7">
                    <Button
                      className="float-right default"
                      color="secondary"
                      onClick={() => this.showModal("modal")}
                    >
                      <i className="iconsminds-upload mr-2" />
                      <IntlMessages id={"ui.menu.receipt-of-funds.list.button.uploadAWB"} />
                  </Button>
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

        {/* MODAL UPLOAD RESI */}
        <Modal isOpen={this.state.modal} toggle={this.showModal}>
          <ModalHeader>
            <IntlMessages id="modal.uploadReceiptTitle" />
          </ModalHeader>
          <ModalBody>
            <input type="file" onChange={this.fileHandler.bind(this)} />
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={() => this.setState({ resiModal: true, modal: false })}
            >
              Next
            </Button>
          </ModalFooter>
        </Modal>

        {/* MODAL DATA RESI */}
        {this.state.resiModal && (
          <Modal isOpen={this.state.resiModal} toggle={this.showModal}>
            <ModalHeader>
              <IntlMessages id="modal.receiptDataCOD" />
            </ModalHeader>
            <ModalBody>
              {/* <BootstrapTable
                data={this.state.data}
                footerData={this.state.footerData}
                footer
              >
                <TableHeaderColumn
                  dataField="osName"
                  isKey
                  dataFormat={this.buttonResiCod.bind(this)}
                >
                  Nama Seller
                </TableHeaderColumn>
                <TableHeaderColumn dataField="package">
                  Jumlah Paket
                </TableHeaderColumn>
                <TableHeaderColumn
                  dataField="totalAmount"
                  dataFormat={this.currencyFormat.bind(this)}
                >
                  Nilai Paket
                </TableHeaderColumn>
                <TableHeaderColumn
                  dataField="codFeeRp"
                  dataFormat={this.currencyFormat.bind(this)}
                >
                  Fee COD
                </TableHeaderColumn>
                <TableHeaderColumn
                  dataField="totalReceive"
                  dataFormat={this.currencyFormat.bind(this)}
                >
                  Total Diterima
                </TableHeaderColumn>
              </BootstrapTable> */}
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => this.showModal()}>OK</Button>
            </ModalFooter>
          </Modal>
        )}

        {/* MODAL DATA RESI SELLER */}
        {this.state.resiModalSeller && (
          <Modal isOpen={this.state.resiModalSeller} toggle={this.showModal}>
            <ModalHeader>
              <IntlMessages id="modal.receiptDataCOD" />
            </ModalHeader>
            <ModalBody>
              {/* <BootstrapTable
                data={this.state.oneData}
                footerData={this.state.footerData2}
                footer
              >
                <TableHeaderColumn dataField="airwaybill" isKey>
                  Resi
                </TableHeaderColumn>
                <TableHeaderColumn dataField="penerima">
                  Penerima Paket
                </TableHeaderColumn>
                <TableHeaderColumn
                  dataField="totalAmount"
                  dataFormat={this.currencyFormat.bind(this)}
                >
                  Nilai Paket
                </TableHeaderColumn>
                <TableHeaderColumn
                  dataField="codFeeRp"
                  dataFormat={this.currencyFormat.bind(this)}
                >
                  Fee COD
                </TableHeaderColumn>
                <TableHeaderColumn
                  dataField="totAmountCodFee"
                  dataFormat={this.currencyFormat.bind(this)}
                >
                  Total Diterima
                </TableHeaderColumn>
              </BootstrapTable> */}
            </ModalBody>
            <ModalFooter>
            <Button onClick={() => this.setState({resiModalSeller: false, resiModal: true})}>Back</Button>
              <Button onClick={() => this.showModal()}>OK</Button>
            </ModalFooter>
          </Modal>
        )}
      </Fragment>
    );
  }
}

export default ReceiptOfFunds;
