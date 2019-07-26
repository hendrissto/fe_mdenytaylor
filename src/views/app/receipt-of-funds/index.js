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
  Table,
  Input
} from "reactstrap";
import * as numeral from "numeral";

import IntlMessages from "../../../helpers/IntlMessages";

import DataTablePagination from "../../../components/DatatablePagination";
import Breadcrumb from "../../../containers/navs/Breadcrumb";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";

const totalBalance = "Rp 580.000.000";

class ReceiptOfFunds extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      resiModal: false,
      resiModalSeller: false,
    };

    this.toggle = this.toggle.bind(this);
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
            resiModalSeller: true,
          }));
          break;
      default:
        this.setState({
          modal: false,
          resiModal: false,
          resiModalSeller: false,
        });
        break;
    }
  }

  dataTableColumns() {
    return [
      {
        Header: "Tanggal Unggah",
        accessor: "uploadDate",
        Cell: props => <p className="list-item-heading">{props.value}</p>
      },
      {
        Header: "ID File",
        accessor: "idFile",
        Cell: props => (
          <a onClick={() => this.toggle("resiModal")}>
            <p className="list-item-heading">{props.value}</p>
          </a>
        )
      },
      {
        Header: "Nama File",
        accessor: "fileName",
        Cell: props => (
          <a href={props.value}>
            <p className="list-item-heading">{props.value}</p>
          </a>
        )
      },
      {
        Header: "Diupload Oleh",
        accessor: "uploadedBy",
        Cell: props => <p className="list-item-heading">{props.value}</p>
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
        accessor: "sellerName",
        Footer: <p className="list-item-heading">Total</p>,
        Cell: props => <p className="list-item-heading"><a onClick={() => this.toggle("resiModalSeller")}>{props.value}</a></p>
      },
      {
        Header: "Jumlah Paket",
        accessor: "packageAmount",
        Cell: props => <p className="list-item-heading">{props.value}</p>
      },
      {
        Header: "Total",
        accessor: "total",
        Cell: props => <p className="list-item-heading">{props.value}</p>
      },
      {
        Header: "Fee COD",
        accessor: "feeCOD",
        Footer: <p className="list-item-heading">Rp {
            numeral(this.dataTableCOD().reduce((total, {feeCOD}) => total += feeCOD, 0)).format("0,0")
        }</p>,
        Cell: props => (
          <p className="list-item-heading">
            Rp {numeral(props.value).format("0,0")}
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
        accessor: "receipt",
        Footer: <p className="list-item-heading">Total</p>,
        Cell: props => <p className="list-item-heading"><a onClick={() => console.log(props.value)}>{props.value}</a></p>
      },
      {
        Header: "Penerima Paket",
        accessor: "receive",
        Cell: props => <p className="list-item-heading">{props.value}</p>
      },
      {
        Header: "Total",
        accessor: "total",
        Footer: <p className="list-item-heading">Rp {
            numeral(this.dataTableCODSeller().reduce((sum, {total}) => sum += total, 0)).format("0,0")
        }</p>,
        Cell: props => (
          <p className="list-item-heading">
            Rp {numeral(props.value).format("0,0")}
          </p>
        )
      }
    ];
  }

  dataTableCODSeller() {
    return [
      {
        id: 1,
        sellerName: "A Shop",
        receipt: "2340823941",
        receive: "Mas Ucok",
        total: 1000000
      },
      {
        id: 2,
        sellerName: "B Shop",
        receipt: "2340823942",
        receive: "Mas Ucok",
        total: 1000000
      },
      {
        id: 3,
        sellerName: "C Shop",
        receipt: "2340823943",
        receive: "Mas Ucok",
        total: 1000000
      }
    ];
  }

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
                <CardTitle>
                  <h3>
                    <IntlMessages id="title.total-balance" />
                  </h3>
                  <h1>{totalBalance}</h1>
                  <Button
                    className="float-right"
                    onClick={() => this.toggle("modal")}
                  >
                    <i className="iconsminds-upload mr-2" />
                    Upload Laporan Resi
                  </Button>
                </CardTitle>
                <ReactTable
                  data={this.dataTable()}
                  columns={this.dataTableColumns()}
                  defaultPageSize={5}
                  minRows={0}
                  filterable={true}
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
            <Input type="file" />
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => this.toggle()}>Next</Button>
          </ModalFooter>
        </Modal>

        {/* MODAL DATA RESI */}
        <Modal isOpen={this.state.resiModal} toggle={this.toggle}>
          <ModalHeader>
            <IntlMessages id="modal.receiptDataCOD" />
          </ModalHeader>
          <ModalBody>
            <ReactTable
              data={this.dataTableCOD()}
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

        {/* MODAL DATA RESI SELLER */}
        <Modal isOpen={this.state.resiModalSeller} toggle={this.toggle}>
          <ModalHeader>
            <IntlMessages id="modal.receiptDataCOD" />
          </ModalHeader>
          <ModalBody>
            <ReactTable
              data={this.dataTableCODSeller()}
              columns={this.dataTableColumsCODSeller()}
              minRows={0}
              showPagination={false}
              showPageSizeOptions={true}
            />
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => this.toggle()}>OK</Button>
          </ModalFooter>
        </Modal>
      </Fragment>
    );
  }
}

export default ReceiptOfFunds;
