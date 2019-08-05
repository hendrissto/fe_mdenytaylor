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
  InputGroup,
  InputGroupButtonDropdown,
  Input,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";
import * as numeral from "numeral";
import CsvParse from "@vtex/react-csv-parse";

import IntlMessages from "../../../helpers/IntlMessages";

import DataTablePagination from "../../../components/DatatablePagination";
import Breadcrumb from "../../../containers/navs/Breadcrumb";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";

import { ExcelRenderer } from "react-excel-renderer";
import * as _ from "lodash";

class ReceiptOfFunds extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      resiModal: false,
      resiModalSeller: false,
      data: [],
      oneData: []
    };

    this.toggle = this.toggle.bind(this);
    this.dataTableColumsCOD = this.dataTableColumsCOD.bind(this);
    this.toggleDropDown = this.toggleDropDown.bind(this);
    this.toggleSplit = this.toggleSplit.bind(this);
    this.toggleDropDown1 = this.toggleDropDown1.bind(this);
    this.toggleSplit1 = this.toggleSplit1.bind(this);
    this.dataTableCODSeller = this.dataTableCODSeller.bind(this);
  }

  toggle(modalName) {
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

  dataTableColumns() {
    return [
      {
        Header: "Tanggal Unggah",
        accessor: "uploadDate",
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "ID File",
        accessor: "idFile",
        Cell: props => (
          <Button color="link" onClick={() => this.toggle("resiModal")}>
            <p>{props.value}</p>
          </Button>
        )
      },
      {
        Header: "Nama File",
        accessor: "fileName",
        Cell: props => (
          <Button color="link" onClick={() => this.toggle("resiModal")}>
            <p className="list-item-heading">{props.value}</p>
          </Button>
        )
      },
      {
        Header: "Diupload Oleh",
        accessor: "uploadedBy",
        Cell: props => <p>{props.value}</p>
      }
    ];
  }

  dataTable() {
    return [
      {
        id: 1,
        uploadDate: "12-12-2012",
        idFile: "0000001",
        fileName: "Data Laporan.csv",
        uploadedBy: "Admin"
      },
      {
        id: 2,
        uploadDate: "26-07-2019",
        idFile: "0000002",
        fileName: "Data Laporan.csv",
        uploadedBy: "Manager"
      },
      {
        id: 3,
        uploadDate: "26-07-2019",
        idFile: "0000003",
        fileName: "Data Laporan.csv",
        uploadedBy: "CEO"
      },
      {
        id: 4,
        uploadDate: "26-07-2019",
        idFile: "0000004",
        fileName: "Data Laporan.csv",
        uploadedBy: "CRO"
      },
      {
        id: 5,
        uploadDate: "26-07-2019",
        idFile: "0000005",
        fileName: "Data Laporan.csv",
        uploadedBy: "CTO"
      },
      {
        id: 6,
        uploadDate: "26-07-2019",
        idFile: "0000006",
        fileName: "Data Laporan.csv",
        uploadedBy: "Ngademin"
      },
      {
        id: 7,
        uploadDate: "26-07-2019",
        idFile: "0000007",
        fileName: "Data Laporan.csv",
        uploadedBy: "Rakjel"
      },
      {
        id: 8,
        uploadDate: "26-07-2019",
        idFile: "0000008",
        fileName: "Data Laporan.csv",
        uploadedBy: "Owner"
      },
      {
        id: 9,
        uploadDate: "26-07-2019",
        idFile: "0000009",
        fileName: "Data Laporan.csv",
        uploadedBy: "Lalalala"
      },
      {
        id: 10,
        uploadDate: "26-07-2019",
        idFile: "0000010",
        fileName: "Data Laporan.csv",
        uploadedBy: "Yeyeyeyeye"
      }
    ];
  }

  dataTableColumsCOD() {
    return [
      {
        Header: "Nama Seller",
        accessor: "osName",
        Footer: <p className="list-item-heading">Total</p>,
        Cell: props => (
          <p>
            <Button
              color="link"
              className="text-primary"
              onClick={() => this.dataTableCODSeller(props.value)}
            >
              {props.value}
            </Button>
          </p>
        )
      },
      {
        Header: "Jumlah Paket",
        accessor: "package",
        Cell: props => <p>{props.value} Paket</p>
      },
      {
        Header: "Total",
        accessor: "totalAmount",
        Cell: props => <p>{props.value}</p>,
        Footer: props => (
          <p>
            Rp{" "}
            {numeral(
              this.state.data.reduce(
                (total, { totalAmount }) => (total += parseInt(totalAmount)),
                0
              )
            ).format("0,0")}
          </p>
        )
      },
      {
        Header: "Fee COD",
        accessor: "codFeeRp",
        Cell: props => <p>{props.value}</p>,
        Footer: props => (
          <p>
            Rp{" "}
            {numeral(
              this.state.data.reduce(
                (total, { codFeeRp }) => (total += parseInt(codFeeRp)),
                0
              )
            ).format("0,0")}
          </p>
        )
      }
    ];
  }

  dataTableCOD() {
    return [
      {
        id: 1,
        sellerName: "A Shop",
        packageAmount: "100 Paket",
        total: "Rp. 2.000.000",
        feeCOD: 1000000
      },
      {
        id: 2,
        sellerName: "B Shop",
        packageAmount: "100 Paket",
        total: "Rp. 2.000.000",
        feeCOD: 1000000
      },
      {
        id: 3,
        sellerName: "C Shop",
        packageAmount: "100 Paket",
        total: "Rp. 2.000.000",
        feeCOD: 1000000
      }
    ];
  }

  dataTableColumsCODSeller() {
    return [
      {
        Header: "Resi",
        accessor: "airwaybill",
        Footer: <p>Total</p>,
        Cell: props => (
          <p>
            <Button
              color="link"
              className="text-primary"
              onClick={() => console.log(props.value)}
            >
              {props.value}
            </Button>
          </p>
        )
      },
      {
        Header: "Penerima Paket",
        accessor: "penerima",
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Total",
        accessor: "totalAmount",
        Cell: props => <p>{props.value}</p>,
        Footer: props => (
          <p>
            Rp{" "}
            {numeral(
              this.state.oneData.reduce(
                (total, { totalAmount }) => (total += parseInt(totalAmount)),
                0
              )
            ).format("0,0")}
          </p>
        )
      }
    ];
  }

  dataTableCODSeller(osName) {
    let i = _.findKey(this.state.data, ["osName", osName]);
    let data = this.state.data[i];
    
    let finish = data.v;
    this.setState({ oneData: finish });
    this.toggle("resiModalSeller");
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

  handleData = data => {
    this.setState({ data: data });
  };

  cekdata(data) {
    return data;
  }

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
            codFeeRp: _.sumBy(v, "codFeeRp")
          }))
          .value();
          
        this.setState({ data: filter });

      }
    });
  };

  render() {
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
                  <div className="col-md-7">
                    <Button
                      className="float-right default"
                      color="secondary"
                      onClick={() => this.toggle("modal")}
                    >
                      <i className="iconsminds-upload mr-2" />
                      Upload Laporan Resi
                  </Button>
                  </div>
                </div>
                <ReactTable
                  className="-striped"
                  data={this.dataTable()}
                  columns={this.dataTableColumns()}
                  defaultPageSize={5}
                  minRows={0}
                  showPageJump={true}
                  showPageSizeOptions={true}
                  PaginationComponent={DataTablePagination}
                />
              </CardBody>
            </Card>
          </Colxx>
        </Row>

        {/* MODAL UPLOAD RESI */}
        <Modal isOpen={this.state.modal} toggle={this.toggle}>
          <ModalHeader>
            <IntlMessages id="modal.uploadReceiptTitle" />
          </ModalHeader>
          <ModalBody>
            {/* <CsvParse
              keys={keys}
              onDataUploaded={this.handleData}
              render={onChange => (
                <input
                  accept=".csv"
                  type="file"
                  onChange={onChange}
                />
              )}
              onError={this.handleError}
              /> */}
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
          <Modal isOpen={this.state.resiModal} toggle={this.toggle}>
            <ModalHeader>
              <IntlMessages id="modal.receiptDataCOD" />
            </ModalHeader>
            <ModalBody>
              <ReactTable
                data={
                  this.state.data.length === 0
                    ? this.dataTableCOD()
                    : this.state.data
                }
                columns={this.dataTableColumsCOD()}
                minRows={0}
                showPagination={false}
                showPageSizeOptions={true}
              />
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => this.toggle()}>OK</Button>
            </ModalFooter>
          </Modal>
        )}

        {/* MODAL DATA RESI SELLER */}
        {this.state.resiModalSeller && (
          <Modal isOpen={this.state.resiModalSeller} toggle={this.toggle}>
            <ModalHeader>
              <IntlMessages id="modal.receiptDataCOD" />
            </ModalHeader>
            <ModalBody>
              <ReactTable
                data={this.state.oneData}
                columns={this.dataTableColumsCODSeller()}
                minRows={0}
                showPagination={false}
                showPageSizeOptions={true}
              />
            </ModalBody>
            <ModalFooter>
            <Button onClick={() => this.setState({resiModalSeller: false, resiModal: true})}>Back</Button>
              <Button onClick={() => this.toggle()}>OK</Button>
            </ModalFooter>
          </Modal>
        )}
      </Fragment>
    );
  }
}

export default ReceiptOfFunds;
