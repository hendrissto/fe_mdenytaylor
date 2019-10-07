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
  Input,
  Col,
  Popover,
  PopoverBody
} from "reactstrap";
import { ExcelRenderer } from "react-excel-renderer";
import Loader from "react-loader-spinner";
import Loading from "../../../containers/pages/Spinner";

import React, { Component, Fragment } from "react";
import ReactTable from "react-table";
// import CsvParse from "@vtex/react-csv-parse";

import IntlMessages from "../../../helpers/IntlMessages";
import Breadcrumb from "../../../containers/navs/Breadcrumb";
import DataTablePagination from "../../../components/DatatablePagination";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";

import CODRestService from "../../../core/codRestService";
import RelatedDataRestService from "../../../core/relatedDataRestService";
import * as moment from "moment";

import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css";
import "./receipt-of-funds.scss";

import { Dropdown } from "primereact/dropdown";
import { MoneyFormat } from "../../../services/Format/MoneyFormat";

import BaseAlert from "../../base/baseAlert";
import * as css from "../../base/baseCss";

const regex = /\[(.*?)\-/;
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)"
  }
};

class ReceiptOfFunds extends Component {
  constructor(props) {
    super(props);
    this.codRest = new CODRestService();
    this.moneyFormat = new MoneyFormat();
    this.relatedData = new RelatedDataRestService();
    this.user = null;

    this.showModal = this.showModal.bind(this);
    this.dataTable = this.dataTable.bind(this);
    this.loadRelatedData = this.loadRelatedData.bind(this);
    this.onCourierChange = this.onCourierChange.bind(this);
    this.showModal = this.showModalError.bind(this);
    this.loadDetailData = this.loadDetailData.bind(this);
    this.toggle = this.toggle.bind(this);

    this.state = {
      uploadDateShow: true,
      idFileShow: true,
      uploadByShow: true,
      detailShow: true,
      popoverOpen: false,
      loading: false,
      error: false,
      errorFile: false,
      resError: null,
      fileTemp: null,
      dataExcel: null,
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
      relatedData: [],
      selectedCourier: [],
      modal: false,
      resiModalDetail: false,
      resiModal: false,
      resiModalSeller: false,
      resiModalSellerDetail: false,
      modalError: false,
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
      ],
      footerData3: [
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
            formatter: tableData => this.sumData(tableData, "codFeeValue")
          },
          {
            label: "Total Diterima",
            columnIndex: 4,
            align: "left",
            formatter: tableData => this.sumData(tableData, "subTotalAmount")
          }
        ]
      ]
    };

    // this.toggleDropDown = this.toggleDropDown.bind(this);
    // this.toggleSplit = this.toggleSplit.bind(this);
    // this.toggleDropDown1 = this.toggleDropDown1.bind(this);
    // this.toggleSplit1 = this.toggleSplit1.bind(this);
  }

  toggle() {
    this.setState({
      popoverOpen: !this.state.popoverOpen
    });
  }

  sumData = (tableData, type) => {
    switch (type) {
      case "totalAmount":
        return (
          <p>
            Rp{" "}
            {numeral(
              tableData.reduce(
                (total, { totalAmount }) => (total += parseInt(totalAmount)),
                0
              )
            ).format("0,0")}
          </p>
        );
      case "codFeeRp":
        return (
          <p>
            Rp{" "}
            {numeral(
              tableData.reduce(
                (total, { codFeeRp }) => (total += parseInt(codFeeRp)),
                0
              )
            ).format("0,0")}
          </p>
        );
      case "totalReceive":
        return (
          <p>
            Rp{" "}
            {numeral(
              tableData.reduce(
                (total, { totalReceive }) => (total += parseInt(totalReceive)),
                0
              )
            ).format("0,0")}
          </p>
        );
      case "totAmountCodFee":
        return (
          <p>
            Rp{" "}
            {numeral(
              tableData.reduce(
                (total, { totAmountCodFee }) =>
                  (total += parseInt(totAmountCodFee)),
                0
              )
            ).format("0,0")}
          </p>
        );
      case "codFeeValue":
        return (
          <p>
            Rp{" "}
            {numeral(
              tableData.reduce(
                (total, { codFeeValue }) => (total += parseInt(codFeeValue)),
                0
              )
            ).format("0,0")}
          </p>
        );
      case "subTotalAmount":
        return (
          <p>
            Rp{" "}
            {numeral(
              tableData.reduce(
                (total, { subTotalAmount }) =>
                  (total += parseInt(subTotalAmount)),
                0
              )
            ).format("0,0")}
          </p>
        );
      default:
        return <p>Wrong value.</p>;
    }
  };

  componentDidMount() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.loadData();
    this.loadRelatedData();
  }

  onCourierChange(e) {
    this.setState({ selectedCourier: e.value });
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

    this.setState({ [name]: value });
  }

  handleOnPageChange(pageIndex) {
    const table = { ...this.state.table };
    table.loading = true;
    table.pagination.skipSize = pageIndex * table.pagination.pageSize;
    table.pagination.currentPage = pageIndex;

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

  showModal(modalName) {
    switch (modalName) {
      case "modal":
        this.setState({ selectedCourier: [] });
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

  dataTable() {
    return [
      {
        Header: "Upload Date",
        accessor: "uploadDate",
        show: this.state.uploadDateShow,
        Cell: props => <p> {moment(props.value).format("DD-MM-YYYY HH:mm")}</p>
      },
      {
        Header: "ID File",
        accessor: "documentNumber",
        show: this.state.idFileShow,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Upload By",
        accessor: "uploadBy",
        show: this.state.uploadByShow,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Detail",
        show: this.state.detailShow,
        Cell: props => (
          <p>
            <Button
              onClick={() => {
                this.loadDetailData(props.original.id);
              }}
            >
              Detail
            </Button>
          </p>
        )
      }
    ];
  }

  dataTableDetail() {
    return [
      {
        Header: "No Resi",
        accessor: "airwaybill",
        width: 130,
        Footer: <p>Total</p>,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Delivery Notes",
        accessor: "deliveredNotes",
        width: 350,
        Cell: props => <p>{props.value}</p>
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
        accessor: "goodsValue",
        Footer: props => (
          <p>
            {this.moneyFormat.numberFormat(
              props.data.reduce(
                (total, { goodsValue }) => (total += parseInt(goodsValue)),
                0
              )
            )}
          </p>
        ),
        Cell: props => <p>{this.moneyFormat.numberFormat(props.value)}</p>
      },
      {
        Header: "Shipping Charge",
        accessor: "shippingCharge",
        Footer: props => (
          <p>
            {this.moneyFormat.numberFormat(
              props.data.reduce(
                (total, { shippingCharge }) =>
                  (total += parseInt(shippingCharge)),
                0
              )
            )}
          </p>
        ),
        Cell: props => <p>{this.moneyFormat.numberFormat(props.value)}</p>
      },
      {
        Header: "Discount",
        accessor: "discount",
        Footer: props => (
          <p>
            {this.moneyFormat.numberFormat(
              props.data.reduce(
                (total, { discount }) => (total += parseInt(discount)),
                0
              )
            )}
          </p>
        ),
        Cell: props => <p>{this.moneyFormat.numberFormat(props.value)}</p>
      },
      {
        Header: "Tax",
        accessor: "tax",
        Footer: props => (
          <p>
            {this.moneyFormat.numberFormat(
              props.data.reduce((total, { tax }) => (total += parseInt(tax)), 0)
            )}
          </p>
        ),
        Cell: props => <p>{this.moneyFormat.numberFormat(props.value)}</p>
      },
      {
        Header: "Adjustment",
        accessor: "adjustment",
        Footer: props => (
          <p>
            {this.moneyFormat.numberFormat(
              props.data.reduce(
                (total, { adjustment }) => (total += parseInt(adjustment)),
                0
              )
            )}
          </p>
        ),
        Cell: props => <p>{this.moneyFormat.numberFormat(props.value)}</p>
      },
      {
        Header: "Total",
        accessor: "total",
        Footer: props => (
          <p>
            {this.moneyFormat.numberFormat(
              props.data.reduce(
                (total2, { total }) => (total2 += parseInt(total)),
                0
              )
            )}
          </p>
        ),
        Cell: props => <p>{this.moneyFormat.numberFormat(props.value)}</p>
      },
      {
        Header: "Sub Total Amount",
        accessor: "subTotalAmount",
        width: 140,
        Footer: props => (
          <p>
            {this.moneyFormat.numberFormat(
              props.data.reduce(
                (total, { subTotalAmount }) =>
                  (total += parseInt(subTotalAmount)),
                0
              )
            )}
          </p>
        ),
        Cell: props => <p>{this.moneyFormat.numberFormat(props.value)}</p>
      },
      {
        Header: "Total Amount",
        accessor: "totalAmount",
        Footer: props => (
          <p>
            {this.moneyFormat.numberFormat(
              props.data.reduce(
                (total, { totalAmount }) => (total += parseInt(totalAmount)),
                0
              )
            )}
          </p>
        ),
        Cell: props => <p>{this.moneyFormat.numberFormat(props.value)}</p>
      },
      {
        Header: "Fee COD (%)",
        accessor: "codFee",
        Cell: props => <p>{props.value * 100} %</p>
      },
      {
        Header: "Fee COD (Rp)",
        accessor: "codFeeRp",
        Footer: props => (
          <p>
            {this.moneyFormat.numberFormat(
              props.data.reduce(
                (total, { codFeeRp }) => (total += parseInt(codFeeRp)),
                0
              )
            )}
          </p>
        ),
        Cell: props => (
          <p>{this.moneyFormat.numberFormat(Math.round(props.value))}</p>
        )
      },
      {
        Header: "Receive Amount",
        accessor: "totAmountCodFee",
        width: 140,
        Footer: props => (
          <p>
            {this.moneyFormat.numberFormat(
              props.data.reduce(
                (total, { totAmountCodFee }) =>
                  (total += parseInt(totAmountCodFee)),
                0
              )
            )}
          </p>
        ),
        Cell: props => (
          <p>{this.moneyFormat.numberFormat(Math.round(props.value))}</p>
        )
      }
    ];
  }

  dataTableDetailFromBackend() {
    return [
      {
        Header: "No Resi",
        accessor: "airwaybillNumber",
        width: 130,
        Footer: <p>Total</p>,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Delivery Notes",
        accessor: "deliveryNotes",
        width: 350,
        Cell: props => <p>{props.value}</p>
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
        Footer: props => (
          <p>
            {this.moneyFormat.numberFormat(
              props.data.reduce(
                (total, { goodValue }) => (total += parseInt(goodValue)),
                0
              )
            )}
          </p>
        ),
        Cell: props => <p>{this.moneyFormat.numberFormat(props.value)}</p>
      },
      {
        Header: "Shipping Charge",
        accessor: "shippingCharge",
        Footer: props => (
          <p>
            {this.moneyFormat.numberFormat(
              props.data.reduce(
                (total, { shippingCharge }) =>
                  (total += parseInt(shippingCharge)),
                0
              )
            )}
          </p>
        ),
        Cell: props => <p>{this.moneyFormat.numberFormat(props.value)}</p>
      },
      {
        Header: "Discount",
        accessor: "discount",
        Footer: props => (
          <p>
            {this.moneyFormat.numberFormat(
              props.data.reduce(
                (total, { discount }) => (total += parseInt(discount)),
                0
              )
            )}
          </p>
        ),
        Cell: props => <p>{this.moneyFormat.numberFormat(props.value)}</p>
      },
      {
        Header: "Tax",
        accessor: "tax",
        Footer: props => (
          <p>
            {this.moneyFormat.numberFormat(
              props.data.reduce((total, { tax }) => (total += parseInt(tax)), 0)
            )}
          </p>
        ),
        Cell: props => <p>{this.moneyFormat.numberFormat(props.value)}</p>
      },
      {
        Header: "Adjustment",
        accessor: "adjustment",
        Footer: props => (
          <p>
            {this.moneyFormat.numberFormat(
              props.data.reduce(
                (total, { adjustment }) => (total += parseInt(adjustment)),
                0
              )
            )}
          </p>
        ),
        Cell: props => <p>{this.moneyFormat.numberFormat(props.value)}</p>
      },
      {
        Header: "Total",
        accessor: "total",
        Footer: props => (
          <p>
            {this.moneyFormat.numberFormat(
              props.data.reduce(
                (total2, { total }) => (total2 += parseInt(total)),
                0
              )
            )}
          </p>
        ),
        Cell: props => <p>{this.moneyFormat.numberFormat(props.value)}</p>
      },
      {
        Header: "Sub Total Amount",
        accessor: "subTotalAmount",
        width: 140,
        Footer: props => (
          <p>
            {this.moneyFormat.numberFormat(
              props.data.reduce(
                (total, { subTotalAmount }) =>
                  (total += parseInt(subTotalAmount)),
                0
              )
            )}
          </p>
        ),
        Cell: props => <p>{this.moneyFormat.numberFormat(props.value)}</p>
      },
      {
        Header: "Total Amount",
        accessor: "totalAmount",
        Footer: props => (
          <p>
            {this.moneyFormat.numberFormat(
              props.data.reduce(
                (total, { totalAmount }) => (total += parseInt(totalAmount)),
                0
              )
            )}
          </p>
        ),
        Cell: props => <p>{this.moneyFormat.numberFormat(props.value)}</p>
      },
      {
        Header: "Fee COD (%)",
        accessor: "codFeePercentage",
        Cell: props => <p>{props.value} %</p>
      },
      {
        Header: "Fee COD (Rp)",
        accessor: "codFeeValue",
        Footer: props => (
          <p>
            {this.moneyFormat.numberFormat(
              props.data.reduce(
                (total, { codFeeValue }) => (total += parseInt(codFeeValue)),
                0
              )
            )}
          </p>
        ),
        Cell: props => (
          <p>{this.moneyFormat.numberFormat(Math.round(props.value))}</p>
        )
      },
      {
        Header: "Receive Amount",
        accessor: "receiveAmount",
        width: 140,
        Footer: props => (
          <p>
            {this.moneyFormat.numberFormat(
              props.data.reduce(
                (total, { receiveAmount }) =>
                  (total += parseInt(receiveAmount)),
                0
              )
            )}
          </p>
        ),
        Cell: props => (
          <p>{this.moneyFormat.numberFormat(Math.round(props.value))}</p>
        )
      }
    ];
  }

  dataTableCODSeller(osName) {
    let i = _.findKey(this.state.data, ["osName", osName]);
    let data = this.state.data[i];

    let finish = data.lines;
    this.setState({ oneData: finish, resiModalSeller: true });
  }

  dataTableCODSellerDetail(osName) {
    let i = _.findKey(this.state.data, ["osName", osName]);
    let data = this.state.data[i];

    let finish = data.lines;
    this.setState({ oneData: finish, resiModalSellerDetail: true });
  }

  loadData() {
    const table = { ...this.state.table };
    table.loading = true;
    this.setState({ table });

    const params = {
      keyword: this.state.search || null,
      subscriptionPlan : this.state.subscriptions || null,
      "options.take": this.state.table.pagination.pageSize,
      "options.skip": this.state.table.pagination.skipSize,
      "options.includeTotalCount": true
    };

    this.codRest.getReceiptFunds({ params }).subscribe(response => {
      const table = { ...this.state.table };
      table.data = response.data;
      table.pagination.totalPages = response.total / table.pagination.pageSize;
      table.loading = false;
      this.setState({ table });
    });
  }

  loadRelatedData() {
    this.relatedData.getCourierChannel().subscribe(response => {
      this.setState({ relatedData: response });
    });
  }

  loadDetailData(id) {
    let receiver = [];
    let newReceiver = [];
    this.codRest.getdDetailCod(id, {}).subscribe(response => {
      const resData = response.codCreditTransactions[0].lines;
      const data = _(resData)
        .groupBy("sellerName")
        .map((value, index) => ({
          osName: index,
          package: value.length,
          lines: value,
          totalAmount: Math.round(_.sumBy(value, "totalAmount")),
          codFeeRp: Math.round(_.sumBy(value, "codFeeValue")),
          totalReceive: Math.round(_.sumBy(value, "subTotalAmount"))
        }))
        .value();
      this.setState({ data: data, resiModalDetail: true });
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

    if (
      fileObj.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      this.setState({ fileTemp: fileObj });
    } else {
      this.setState({ errorFile: true });
    }
  };

  excelProcess() {
    ExcelRenderer(this.state.fileTemp, (err, resp) => {
      if (err) {
        console.log(err);
      } else {
        let excelData = resp.rows;
        excelData.splice(0, 2);
        excelData.shift();

        const excelValue = this.extractExcelData(excelData);
        const newExcelData = this.createObjectExcel(excelValue);
        this.normalizeLines(newExcelData);

        let data = _(newExcelData)
          .groupBy("osName")
          .map((newDataExcel, sellerName) => ({
            osName: sellerName,
            lines: newDataExcel,
            package: newDataExcel.length,
            totalAmount: Math.round(_.sumBy(newDataExcel, "totalAmount")),
            codFeeRp: Math.round(_.sumBy(newDataExcel, "codFeeRp")),
            totalReceive: Math.round(_.sumBy(newDataExcel, "totAmountCodFee"))
          }))
          .value();
        this.setState({ data: data });
      }
    });
  }

  normalizeLines(array) {
    const lineValue = {
      lines: []
    };

    for (let i = 0; i < array.length; i++) {
      lineValue.lines.push({
        tenantId: array[i].tenantId,
        sellerName: array[i].osName,
        deliveryNotes: array[i].deliveredNotes,
        airwaybillNumber: array[i].airwaybill.toString(),
        notes: array[i].notes || "",
        destination: array[i].destination || "",
        amount: array[i].totalAmount || 0,
        codValue: Math.round(array[i].codFeeRp) || 0,
        goodValue: array[i].goodsValue || 0,
        shippingCharge: array[i].shippingCharge || 0,
        discount: array[i].discount || 0,
        tax: array[i].tax || 0,
        adjustment: array[i].adjustment || 0,
        total: array[i].total || 0,
        subTotalAmount: array[i].subTotalAmount || 0,
        totalAmount: array[i].totalAmount || 0,
        codFeePercentage: array[i].codFee * 100 || 0,
        codFeeValue: Math.round(array[i].codFeeRp) || 0,
        receiveAmount: Math.round(array[i].totAmountCodFee) || 0
      });
    }

    let data = {
      ...lineValue,
      uploadDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
      uploadBy: this.user.user_name,
      courierChannelId: this.state.selectedCourier.id
    };
    this.setState({ dataExcel: data, selectedCourier: [] });
  }

  submitData() {
    this.setState({ resiModal: false, modal: false, loading: true });
    this.codRest.postCOD(this.state.dataExcel).subscribe(
      response => {
        this.setState({ resiModal: false, modal: false, loading: false });
        this.loadData();
      },
      error => {
        let errorMessage = [];
        if(error.data.length > 1){
          for(let i = 0; i < error.data.length; i++){
            errorMessage.push(error.data[i].errorMessage);
          }
        }
        this.setState({
          resError: errorMessage.length === 0 ? error.data[0].errorMessage : errorMessage,
          resiModal: false,
          loading: false
        });
        this.showModalError();
      }
    );
  }

  extractExcelData(data) {
    let excelData = [];
    data = _.pull(data, []);
    for (let i = 0; i < data.length - 1; i++) {
      // we should getting true data
      if (data[i].length > 10) {
        excelData.push(data[i]);
      }
    }
    return excelData;
  }

  createObjectExcel(data) {
    let dataWithObject = [];
    for (let i = 1; i < data.length; i++) {
      let concatValue = _.zipObject(
        _.map(data[0], (header, i) => _.camelCase(header)),
        data[i]
      );
      dataWithObject.push(concatValue);
    }
    return dataWithObject;
  }

  currencyFormat(cell, row) {
    return `Rp. ${numeral(cell).format("0,0")}`;
  }

  button(cell, row) {
    return (
      <a
        href="#"
        // onClick={() => this.dataTableCODSeller(cell)}
        className="button"
      >
        {cell}
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

  buttonResiCodDetail(cell, row) {
    return (
      <a
        href="#"
        onClick={() => this.dataTableCODSellerDetail(cell)}
        className="button"
      >
        {cell}
      </a>
    );
  }

  nextStep() {
    if (
      this.state.selectedCourier.length === 0 ||
      this.state.fileTemp === null ||
      this.state.errorFile === true
    ) {
      this.setState({ error: true });
    } else {
      this.setState({ error: false });
      this.excelProcess();
      this.setState({ resiModal: true });
    }
  }

  showModalError() {
    this.setState({ modalError: true });

    if (this.state.modalError === false) {
      setTimeout(() => {
        this.setState({ modalError: false });
      }, 2000);
    }
  }

  _renderError() {
    let data = [];

    if(this.state.resError !== null){
      for(let i = 0; i < this.state.resError.length; i++){
        data.push(
          <p>
            {this.state.resError[i]}
          </p>
        )
      }
    }

    return data;
  }
  onShowModalAWBUpload() {
    const defaultCourier = this.state.relatedData.courierChannel ?  _.find(this.state.relatedData.courierChannel, ['id', 'sicepat']) : [];
    this.setState({ selectedCourier: defaultCourier });
  }

  render() {
    const option = this.state.relatedData.courierChannel;
    // this.setState({ selectedCourier: defaultCourier });
    // if (this.state.relatedData.length > 0) {
    //   option = this.state.relatedData.courierChannel;
    //   console.log(defaultCourier);
    // }
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
                      toggle={this.toggle}
                    >
                      <PopoverBody>
                        <div>
                          <input
                            name="uploadDateShow"
                            type="checkbox"
                            checked={this.state.uploadDateShow}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Upload Date
                        </div>
                        <div>
                          <input
                            name="idFileShow"
                            type="checkbox"
                            checked={this.state.idFileShow}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          ID File
                        </div>
                        <div>
                          <input
                            name="uploadByShow"
                            type="checkbox"
                            checked={this.state.uploadByShow}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Upload By
                        </div>
                        <div>
                          <input
                            name="detailShow"
                            type="checkbox"
                            checked={this.state.detailShow}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Upload Detail
                        </div>
                      </PopoverBody>
                    </Popover>
                    <Button
                      className="float-right default"
                      color="secondary"
                      onClick={() => this.setState({ modal: true })}
                    >
                      <i className="iconsminds-upload mr-2" />
                      <IntlMessages
                        id={"ui.menu.receipt-of-funds.list.button.uploadAWB"}
                      />
                    </Button>
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

        {/* MODAL UPLOAD RESI */}
        {this.state.modal && (
          <Modal
            isOpen={this.state.modal}
            toggle={() => this.setState({ modal: false })}
            onEnter={() => this.onShowModalAWBUpload()}
          >
            <ModalHeader>
              <IntlMessages id="modal.uploadReceiptTitle" />
            </ModalHeader>
            <ModalBody>
              {this.state.error && (
                <BaseAlert
                  onClick={() => {
                    this.setState({ error: false });
                  }}
                  text={"Semua data wajib diisi"}
                />
              )}
              <div>
                <Row>
                  <Col
                    xs="3"
                    style={{
                      marginTop: 5
                    }}
                  >
                    Courier
                  </Col>
                  <Col
                    xs="1"
                    style={{
                      marginTop: 5
                    }}
                  >
                    :
                  </Col>
                  <Col>
                    <Dropdown
                      value={this.state.selectedCourier}
                      options={option}
                      onChange={this.onCourierChange}
                      placeholder="Select Courier"
                      optionLabel="name"
                      required
                    />
                  </Col>
                </Row>
                <input
                  type="file"
                  onChange={this.fileHandler.bind(this)}
                  required
                />
                {this.state.errorFile && (
                  <BaseAlert
                    onClick={() => {
                      this.setState({ errorFile: false });
                    }}
                    text={"Hanya file excel yang bisa diupload."}
                  />
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => this.nextStep()}>Next</Button>
            </ModalFooter>
          </Modal>
        )}

        {/* MODAL DATA RESI DETAIL*/}
        {this.state.resiModalDetail && (
          <Modal
            isOpen={this.state.resiModalDetail}
            size="lg"
            toggle={() => this.setState({ resiModalDetail: false })}
          >
            <ModalHeader>
              <IntlMessages id="modal.receiptDataCOD" />
            </ModalHeader>
            <ModalBody>
              <BootstrapTable
                data={this.state.data}
                footerData={this.state.footerData}
                footer
              >
                <TableHeaderColumn
                  dataField="osName"
                  isKey
                  dataFormat={this.buttonResiCodDetail.bind(this)}
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
              </BootstrapTable>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => this.setState({ resiModalDetail: false })}>
                OK
              </Button>
            </ModalFooter>
          </Modal>
        )}

        {/* MODAL DATA RESI */}
        {this.state.resiModal && (
          <Modal isOpen={this.state.resiModal} size="lg">
            <ModalHeader>
              <IntlMessages id="modal.receiptDataCOD" />
            </ModalHeader>
            <ModalBody>
              <BootstrapTable
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
              </BootstrapTable>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => this.setState({ resiModal: false })}>
                Back
              </Button>
              <Button onClick={() => this.submitData()}>Submit</Button>
            </ModalFooter>
          </Modal>
        )}

        {/* MODAL DATA RESI SELLER */}
        {this.state.resiModalSeller && (
          <Modal isOpen={this.state.resiModalSeller} size="lg">
            <ModalHeader>
              <IntlMessages id="modal.receiptDataCOD" />
            </ModalHeader>
            <ModalBody>
              <ReactTable
                minRows={0}
                page={this.state.table.pagination.currentPage}
                PaginationComponent={DataTablePagination}
                data={this.state.oneData}
                pages={this.state.table.pagination.totalPages}
                columns={this.dataTableDetail()}
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
            </ModalBody>

            <ModalFooter>
              <Button onClick={() => this.setState({ resiModalSeller: false })}>
                Back
              </Button>
            </ModalFooter>
          </Modal>
        )}

        {/* MODAL DATA RESI SELLER DETAIL */}
        {this.state.resiModalSellerDetail && (
          <Modal isOpen={this.state.resiModalSellerDetail} size="lg">
            <ModalHeader>
              <IntlMessages id="modal.receiptDataCOD" />
            </ModalHeader>
            <ModalBody>
              <ReactTable
                minRows={0}
                page={this.state.table.pagination.currentPage}
                PaginationComponent={DataTablePagination}
                data={this.state.oneData}
                pages={this.state.table.pagination.totalPages}
                columns={this.dataTableDetailFromBackend()}
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

              {/*
              
              <BootstrapTable
                data={this.state.oneData}
                footerData={this.state.footerData3}
                footer
              >
                <TableHeaderColumn dataField="airwaybillNumber" isKey>
                  Resi
                </TableHeaderColumn>
                <TableHeaderColumn dataField="deliveryNotes" width={300}>
                  Penerima Paket
                </TableHeaderColumn>
                <TableHeaderColumn
                  dataField="totalAmount"
                  dataFormat={this.currencyFormat.bind(this)}
                >
                  Nilai Paket
                </TableHeaderColumn>
                <TableHeaderColumn
                  dataField="codFeeValue"
                  dataFormat={this.currencyFormat.bind(this)}
                >
                  Fee COD
                </TableHeaderColumn>
                <TableHeaderColumn
                  dataField="subTotalAmount"
                  dataFormat={this.currencyFormat.bind(this)}
                >
                  Total Diterima
                </TableHeaderColumn>
              </BootstrapTable>
             */}
            </ModalBody>

            <ModalFooter>
              <Button
                onClick={() => this.setState({ resiModalSellerDetail: false })}
              >
                Back
              </Button>
            </ModalFooter>
          </Modal>
        )}

        {this.state.modalError && (
          <Modal
            isOpen={this.state.modalError}
            style={{
              width: 500
            }}
            toggle={() => this.setState({ modalError: false })}
          >
            <ModalHeader>Error</ModalHeader>
            <ModalBody>{this._renderError()}</ModalBody>

            <ModalFooter>
              <Button onClick={() => this.setState({ modalError: false })}>
                Back
              </Button>
            </ModalFooter>
          </Modal>
        )}
        {this.state.loading && <Loading />}
      </Fragment>
    );
  }
}

export default ReceiptOfFunds;
