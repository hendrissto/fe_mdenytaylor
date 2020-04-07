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
import { Redirect } from "react-router-dom";
import { ExcelRenderer } from "react-excel-renderer";
import Loading from "../../../containers/pages/Spinner";
import { Paginator } from "primereact/paginator";
import { InputText } from "primereact/inputtext";

import React, { Component, Fragment } from "react";
// import CsvParse from "@vtex/react-csv-parse";

import IntlMessages from "../../../helpers/IntlMessages";
import Breadcrumb from "../../../containers/navs/Breadcrumb";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";

import CODRestService from "../../../api/codRestService";
import RelatedDataRestService from "../../../api/relatedDataRestService";
import * as moment from "moment";
import ExportReceiptofFunds from "../../../core/export/ExportReceiptofFunds";

import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css";
import "./receipt-of-funds.scss";

import { Dropdown } from "primereact/dropdown";
import { MoneyFormat } from "../../../services/Format/MoneyFormat";

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ColumnGroup } from 'primereact/columngroup';
// import { InputText } from 'primereact/inputtext';
import { Row as RowPrime } from 'primereact/row';
import { Calendar } from 'primereact/calendar';

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { ColumnFormat } from "../../../services/Format/ColumnFormat";
const MySwal = withReactContent(Swal);

class ReceiptOfFunds extends Component {
  constructor(props) {
    super(props);
    this.codRest = new CODRestService();
    this.moneyFormat = new MoneyFormat();
    this.relatedData = new RelatedDataRestService();
    this.exportService = new ExportReceiptofFunds();
    this.columnFormat = new ColumnFormat();
    this.user = null;

    this.showModal = this.showModal.bind(this);
    this.dataTable = this.dataTable.bind(this);
    this.loadRelatedData = this.loadRelatedData.bind(this);
    this.onCourierChange = this.onCourierChange.bind(this);
    this.showModal = this.showModalError.bind(this);
    this.loadDetailData = this.loadDetailData.bind(this);
    this.toggle = this.toggle.bind(this);
    this.handleOnPageChange = this.handleOnPageChange.bind(this);
    this.actionTemplate = this.actionTemplate.bind(this);
    this.loadDetailSellerFromBE = this.loadDetailSellerFromBE.bind(this);
    this.loadDetailSellerFromExcel = this.loadDetailSellerFromExcel.bind(this);
    this.moneyFormat.currencyFormat = this.moneyFormat.currencyFormat.bind(this);
    this.exportDetailDataToExcel = this.exportDetailDataToExcel.bind(this);
    this.checkDate = this.checkDate.bind(this);
    this.changeDateFormatFromUser = this.changeDateFormatFromUser.bind(this);

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
      initialData: [],
      oneData: [],
      redirect: false,
      totalData: 0,
      date: null,
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
      ],
      totalError: 0,
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
    return this.moneyFormat.numberFormat(_.sumBy(tableData, type));
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
              style={{
                borderRadius: 6
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
        Cell: props => <p>{props.value * 100 || 0} %</p>
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
        Header: "Diskon Ongkir",
        accessor: "discountShippingChargePercentage",
        Cell: props => <p>{props.value * 100 || 0} %</p>
      },
      {
        Header: "Total Ongkir",
        accessor: "totalShippingCharge",
        Footer: props => (
          <p>
            {this.moneyFormat.numberFormat(
              props.data.reduce(
                (total, { totalShippingCharge }) => (total += parseInt(totalShippingCharge)),
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
        Header: "Diskon Ongkir",
        accessor: "discountShippingChargePercentage",
        Cell: props => <p>{props.value * 100 || 0} %</p>
      },
      {
        Header: "Total Ongkir",
        accessor: "totalShippingCharge",
        Footer: props => (
          <p>
            {this.moneyFormat.numberFormat(
              props.data.reduce(
                (total, { totalShippingCharge }) => (total += parseInt(totalShippingCharge)),
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

  dataTableCODSeller(props) {
    const osName = props.osName;
    let i = _.findKey(this.state.data, ["osName", osName]);
    let data = this.state.data[i];

    for (let j = 0; j < data.lines.length; j++) {
      data.lines[j].codFee *= 100;
      data.lines[j].discountShippingChargePercentage *= 100;
      Math.round(data.lines[j].codFeeRp);
      Math.round(data.lines[j].totAmountCodFee);
    }

    let finish = data.lines;
    
    this.setState({ oneData: finish, resiModalSeller: true });
  }

  dataTableCODSellerDetail(props) {
    const osName = props.osName;
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
      subscriptionPlan: this.state.subscriptions || null,
      "options.take": this.state.table.pagination.pageSize,
      "options.skip": this.state.table.pagination.skipSize,
      "options.includeTotalCount": true
    };

    this.codRest.getReceiptFunds({ params }).subscribe(
      response => {
        const table = { ...this.state.table };
        table.data = response.data;
        table.pagination.totalPages = Math.ceil(response.total / response.take);
        table.loading = false;
        this.setState({ table });
      },
      err => {
        if(err.response.status === 401){
          this.setState({redirect: true});
          MySwal.fire({
            type: "error",
            title: "Unauthorized.",
            toast: true,
            position: "top-end",
            timer: 2000,
            showConfirmButton: false,
            customClass: "swal-height"
          });
        } else {
          MySwal.fire({
            type: "error",
            title: "Maaf atas kesalahan tidak terduga.",
            toast: true,
            position: "top-end",
            timer: 4000,
            showConfirmButton: false,
            customClass: "swal-height"
          });
        }
      }
    );
  }

  loadRelatedData() {
    this.relatedData.getCourierChannel().subscribe(response => {
      this.setState({ relatedData: response });
    });
  }

  loadDetailData(id) {
    this.setState({ loading: true })
    let receiver = [];
    this.codRest.getdDetailCod(id, {}).subscribe(response => {
      // const resData = response.codCreditTransactions[0].lines;
      const resData = response.codCreditTransactions;
      for (let i = 0; i < resData.length; i++) {
        for (let j = 0; j < resData[i].lines.length; j++) {
          receiver.push(resData[i].lines[j]);
        }
      }
      const data = [];

      for (let index = 0; index < resData.length; index++) {
        data.push({
          osName: resData[index].sellerName,
          //tenantId: resData[index].lines[0].tenantId,
          package: resData[index].lineCount,
          totalAmount: resData[index].total,
          codFeeRp: resData[index].codFeeValue,
          totalReceive: resData[index].receiveAmount,
          lines: resData[index].lines
        });
      }

      this.setState({ data: data, initialData: data, loading: false, resiModalDetail: true });
    });
  }

  handleData = data => {
    this.setState({ data: data });
  };

  cekdata(data) {
    return data;
  }

  fileHandler = event => {
    this.setState({ errorFile: false });
    let fileObj = event.target.files[0];

    this.setState({ fileTemp: fileObj });
  };

  excelProcess() {
    ExcelRenderer(this.state.fileTemp, (err, resp) => {
      if (err) {
        console.log(err);
      } else {
        let arr = [];
        arr.push(resp.rows);

        let excelData = resp.rows;
        // excelData.splice(0, 2);
        // excelData.shift();
        const excelValue = this.extractExcelData(excelData);
        const newExcelData = this.createObjectExcel(excelValue);
        const filteredData = newExcelData.filter(v => v.osName !== undefined);
        filteredData.map(v => {
          v.airwaybill = this.addZero(v.airwaybill || '', 12);
          v['discountShippingChargePercentage'] = v['diskonOngkir'];
          v['totalShippingCharge'] = v['totalOngkir'];

          delete v['diskonOngkir'];
          delete v['totalOngkir'];
          return v;
        })

        for (let i = 0; i < filteredData.length; i++) {
          filteredData[i].codFeeRp = Math.round(filteredData[i].codFeeRp);
          filteredData[i].totAmountCodFee = Math.round(
            filteredData[i].totAmountCodFee
          );

          // this condition for convert undefined value to be number 0
          _.mapValues(filteredData[i], function (val, key) {
            if (
              val === undefined &&
              [
                "tax",
                "discount",
                "codFee",
                "codFeeRp",
                "adjustment",
                "goodsValue",
                "shippingCharge",
                "subTotalAmount",
                "totAmountCodFee",
                "total",
                "totalAmount",
                "discountShippingChargePercentage",
                "totalShippingCharge",
              ].includes(key)
            ) {
              filteredData[i][key] = 0;
              // return 0;
            }
            // return val;
          });
        }
        if (!this.validate(filteredData)) {
          this.normalizeLines(filteredData);
          let data = _(filteredData)
            .groupBy("tenantId")
            .map((newDataExcel, sellerName) => ({
              osName: newDataExcel[0].osName,
              lines: newDataExcel,
              package: newDataExcel.length,
              totalAmount: Math.round(_.sumBy(newDataExcel, "totalAmount")),
              codFeeRp: Math.round(_.sumBy(newDataExcel, "codFeeRp")),
              totalReceive: Math.round(_.sumBy(newDataExcel, "totAmountCodFee")),
              totalShippingCharge: Math.round(_.sumBy(newDataExcel, "totalShippingCharge"))
            }))
            .value();
          this.setState({ data: data, initialData: data, resiModal: true });
        }
      }
    });
  }

  addZero(number, length) {
    let my_string = '' + number.toString();
    while (my_string.length < length) {
      my_string = '0' + my_string;
    }

    return my_string;
  }

  validate(data) {
    let isFound = false;

    for (let i = 0; i < data.length; i++) {
      if (data[i].airwaybill === undefined || data[i].airwaybill === '000000000000') {
        MySwal.fire({
          type: "error",
          title: "Pastikan semua resi telah diisi.",
          toast: true,
          position: "top-end",
          timer: 2000,
          showConfirmButton: false,
          customClass: "swal-height"
        });
        isFound = true;
      } else if (data[i].tenantId === undefined) {
        MySwal.fire({
          type: "error",
          title: "Pastikan semua tenantId telah diisi.",
          toast: true,
          position: "top-end",
          timer: 2000,
          showConfirmButton: false,
          customClass: "swal-height"
        });
        isFound = true;
      } else if (data[i].osName === undefined) {
        MySwal.fire({
          type: "error",
          title: "Pastikan semua Seller Name telah diisi.",
          toast: true,
          position: "top-end",
          timer: 2000,
          showConfirmButton: false,
          customClass: "swal-height"
        });
        isFound = true;
      }
    }

    return isFound;
  }

  normalizeLines(array) {
    const lineValue = {
      lines: []
    };

    for (let i = 0; i < array.length; i++) {
      lineValue.lines.push({
        tenantId: array[i].tenantId,
        sellerName: array[i].osName,
        deliveryNotes: array[i].statusDescription,
        airwaybillNumber: array[i].airwaybill.toString(),
        notes: array[i].notes || "",
        receiverName: array[i].lastReceiverName || "",
        destination: array[i].receiverAddress || "",
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
        receiveAmount: Math.round(array[i].totAmountCodFee) || 0,
        discountShippingChargePercentage: array[i].discountShippingChargePercentage * 100 || 0,
        totalShippingCharge: Math.round(array[i].totalShippingCharge) || 0,
        insuranceAmount: Math.round(array[i].insurance) || 0,
        lastUpdateDate: this.checkDate(array[i].dateTime),
      });
    }

    let data = {
      ...lineValue,
      uploadDate: moment(this.state.date).format("YYYY-MM-DD"),
      uploadBy: this.user.user_name,
      courierChannelId: this.state.selectedCourier.id
    };
    this.setState({ dataExcel: data, selectedCourier: [] });
  }

  checkDate(date) {
    if(!date) {
      return null
    } else {
      if( moment(date).format() === 'Invalid date' ) {
        return moment(date, 'DD/MM/YYYY').format()
      } else {
        return moment(date).format()
      }
    }
  }

  changeDateFormatFromUser(rowData, column) {
    this.checkDate(rowData.dateTime)
  }

  changeDateFormat(rowData, column) {
    if(!rowData.lastUpdateDate) {
      return '';
    } else {
      return moment(rowData.lastUpdateDate).format('DD/MM/YYYY hh:mm')
    }
  }

  submitData() {
    this.setState({ resiModal: false, modal: false, loading: true });
    this.codRest.postCOD(this.state.dataExcel).subscribe(
      response => {
        this.setState({ resiModal: false, modal: false, loading: false });
        MySwal.fire({
          type: "success",
          title: "Sukses upload",
          toast: true,
          position: "top-end",
          timer: 2000,
          showConfirmButton: false,
          customClass: "swal-height"
        });
        this.loadData();
      },
      error => {
        let errorMessage = [];
        if (error.data.length > 0) {
          for (let i = 0; i < error.data.length; i++) {
            errorMessage.push(error.data[i].errorMessage);
          }
        }
        this.setState({
          resError: errorMessage,
          totalError: errorMessage.length,
          resiModal: false,
          loading: false
        });
        this.showModalError();
      }
    );
  }

  extractExcelData(data2) {
    let excelData = [];
    // let datawithoutEmptyArray = [];
    const data = _.pull(data2, []);
    // for (let i = 0; i < data.length - 1; i++) {
    //   if (data[i].length > 5) {
    //     datawithoutEmptyArray.push(data[i]);
    //   }
    // }

    for (let i = 0; i < data.length; i++) {
      // we should getting true data
      if (data[i] && data[i].length) {
        if (data[i].length > 10) {
          excelData.push(data[i]);
        }
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

  currencyFormat(rowData, column) {
    switch (column.field) {
      case 'totalAmount':
        return this.moneyFormat.numberFormat(rowData.totalAmount);
      case 'codFeeRp':
        return this.moneyFormat.numberFormat(rowData.codFeeRp);
      case 'totalReceive':
        return this.moneyFormat.numberFormat(rowData.totalReceive);
      case 'goodsValue':
        return this.moneyFormat.numberFormat(rowData.goodsValue);
      case 'shippingCharge':
        return this.moneyFormat.numberFormat(rowData.shippingCharge);
      case 'discount':
        return this.moneyFormat.numberFormat(rowData.discount);
      case 'tax':
        return this.moneyFormat.numberFormat(rowData.tax);
      case 'adjustment':
        return this.moneyFormat.numberFormat(rowData.adjustment);
      case 'total':
        return this.moneyFormat.numberFormat(rowData.total);
      case 'subTotalAmount':
        return this.moneyFormat.numberFormat(rowData.subTotalAmount);
      case 'totalShippingCharge':
        return this.moneyFormat.numberFormat(rowData.totalShippingCharge);
      case 'totAmountCodFee':
        return this.moneyFormat.numberFormat(rowData.totAmountCodFee);
      case 'goodValue':
        return this.moneyFormat.numberFormat(rowData.goodValue);
      case 'codFeeValue':
        return this.moneyFormat.numberFormat(rowData.codFeeValue);
      case 'receiveAmount':
        return this.moneyFormat.numberFormat(rowData.receiveAmount);
      default:
        return 0;
    }
  }

  button(cell, row) {
    return (
      <Button color="link">{cell}</Button>
      // <a
      //   href="/#"
      //   // onClick={() => this.dataTableCODSeller(cell)}
      //   className="button"
      // >
      //   {cell}
      // </a>
    );
  }

  buttonResiCod(cell, row) {
    return (
      <Button
        color="link"
        onClick={() => this.dataTableCODSeller(cell)}
        className="text-primary hover"
        style={{
          textAlign: "center",
          marginLeft: "-15px",
          marginTop: "-14px"
        }}
      >
        {cell}
      </Button>
      // <a
      //   href="/#"
      //   onClick={() => this.dataTableCODSeller(cell)}
      //   className="button"
      // >
      //   {cell}
      // </a>
    );
  }

  buttonResiCodDetail(cell, row) {
    return (
      <Button
        color="link"
        onClick={() => this.dataTableCODSellerDetail(cell)}
        className="text-primary hover"
        style={{
          textAlign: "center",
          marginLeft: "-15px",
          marginTop: "-14px"
        }}
      >
        {cell}
      </Button>
      // <a
      //   href="/#"
      //   onClick={() => this.dataTableCODSellerDetail(cell)}
      //   className="button"
      // >
      //   {cell}
      // </a>
    );
  }

  nextStep() {
    if (
      this.state.selectedCourier.length === 0 ||
      this.state.fileTemp === null ||
      this.state.errorFile === true ||
      this.state.date === null
    ) {
      this.setState({ error: true });
      if (this.state.errorFile) {
        MySwal.fire({
          type: "error",
          title: "Hanya file excel yang bisa diupload.",
          toast: true,
          position: "top-end",
          timer: 2000,
          showConfirmButton: false,
          customClass: "swal-height"
        });
      } else {
        MySwal.fire({
          type: "error",
          title: "Pastikan Semua Data Telah Terisi.",
          toast: true,
          position: "top-end",
          timer: 2000,
          showConfirmButton: false,
          customClass: "swal-height"
        });
      }
    } else {
      this.setState({ error: false });
      this.excelProcess();
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
    if (this.state.resError !== null) {
      for (let i = 0; i < this.state.resError.length; i++) {
        data.push(<p>{this.state.resError[i]} <hr /></p>);
      }
    }
    return data;
  }
  onShowModalAWBUpload() {
    this.setState({ fileTemp: null });
    const defaultCourier = this.state.relatedData.courierChannel
      ? _.find(this.state.relatedData.courierChannel, ["id", "sicepat"])
      : [];
    this.setState({ selectedCourier: defaultCourier });
  }

  exportData() {
    this.setState({ loading: true });
    const params = {
      "options.includeTotalCount": true
    };

    this.codRest.getReceiptFunds({ params }).subscribe(
      response => {
        this.setState({ totalData: response.total }, () => {
          this.loadAllData();
        });
      },
      error => {
        this.setState({ redirect: true });
      }
    );
  }

  loadAllData() {
    const params = {
      "options.includeTotalCount": true,
      "options.take": this.state.totalData
    };

    this.codRest.getReceiptFunds({ params }).subscribe(res => {
      this.exportService.exportToCSV(res.data, "Receipt of Funds", true);
      this.setState({ loading: false });
    });
  }

  actionTemplate(rowData, column) {
    return <div>
      <Button
        type="button"
        icon="pi pi-search"
        onClick={() => this.loadDetailData(rowData.id)}
        className="p-button-success"
      >
        Detail
        </Button>
    </div>;
  }

  changeDataFormat(rowData, column) {
    return moment(rowData.uploadDate).format("DD-MM-YYYY") || '-';
  }

  loadDetailSellerFromExcel(rowData, column) {
    return (
      <Button
        color="link"
        onClick={() => this.dataTableCODSeller(rowData)}
        className="text-primary hover"
        style={{
          textAlign: "center",
          marginLeft: "-15px",
          marginTop: "-14px"
        }}
      >
        {rowData.osName}
      </Button>
    );
  }

  loadDetailSellerFromBE(rowData, column) {
    return (
      <Button
        color="link"
        onClick={() => this.dataTableCODSellerDetail(rowData)}
        className="text-primary hover"
        style={{
          textAlign: "center",
          marginLeft: "-15px",
          marginTop: "-14px"
        }}
      >
        {rowData.osName}
      </Button>
    )
  }

  exportDetailDataToExcel(data) {
    const tempData = _.cloneDeep(data);
    for(let i = 0; i < tempData.length; i++) {
      delete tempData[i]['lines'];
    }
    this.exportService.exportToCSV(tempData, "Detail COD", false);
  }
  
  exportDetailSellerDataToExcel(data) {
    const tempData = _.cloneDeep(data);
    for(let i = 0; i < tempData.length; i++) {
      delete tempData[i]['lines'];
      delete tempData[i]['uploadDate'];
      delete tempData[i]['documentNumber'];
      delete tempData[i]['id'];
    }
    this.exportService.exportToCSV(tempData, "Detail Seller COD", false);
  }

  handleSearchSellerName(e) {
    const initialData = this.state.initialData;
    const searchValue = e.target.value;
    let search = [];

    if (searchValue.length > 0) {
      search = initialData.filter(item => item.osName.toLowerCase().includes(searchValue.toLowerCase()));
    } else {
      search = initialData;
    }

    this.setState({data: search});
  }

  render() {
    const option = this.state.relatedData.courierChannel;
    if (this.state.redirect === true) {
      this.setState({ redirect: false });
      return <Redirect to="/user/login" />;
    }

    const footerDetailFirst = (
      <ColumnGroup>
        <RowPrime>
          <Column footer="Total" />
          <Column footer=" " />
          <Column footer={this.sumData(this.state.data, "totalAmount")} />
          <Column footer={this.sumData(this.state.data, "codFeeRp")} />
          <Column footer={this.sumData(this.state.data, "totalReceive")} />
        </RowPrime>
      </ColumnGroup>
    )
      //FROM BE
    const footerDetailSecond = (
      <ColumnGroup>
        <RowPrime>
          <Column footer="Total" />
          <Column footer=" " />
          <Column footer=" " />
          <Column footer=" " />
          <Column footer=" " />
          <Column footer={this.sumData(this.state.oneData, "goodValue")} />
          <Column footer={this.sumData(this.state.oneData, "shippingCharge")} />
          <Column footer={this.sumData(this.state.oneData, "discount")} />
          <Column footer={this.sumData(this.state.oneData, "tax")} />
          <Column footer={this.sumData(this.state.oneData, "adjustment")} />
          <Column footer={this.sumData(this.state.oneData, "total")} />
          <Column footer={this.sumData(this.state.oneData, "subTotalAmount")} />
          <Column footer={this.sumData(this.state.oneData, "totalAmount")} />
          <Column footer={this.sumData(this.state.oneData, "insuranceAmount")} />
          <Column footer=" " />
          <Column footer={this.sumData(this.state.oneData, "codFeeValue")} />
          <Column footer=" " />
          <Column footer={this.sumData(this.state.oneData, "totalShippingCharge")} />
          <Column footer={this.sumData(this.state.oneData, "receiveAmount")} />
        </RowPrime>
      </ColumnGroup>
    )
    // FROM EXCEL
    const footerDetailThird = (
      <ColumnGroup>
        <RowPrime>
          <Column footer="Total" />
          <Column footer=" " />
          <Column footer=" " />
          <Column footer=" " />
          <Column footer=" " />
          <Column footer={this.sumData(this.state.oneData, "goodsValue")} />
          <Column footer={this.sumData(this.state.oneData, "shippingCharge")} />
          <Column footer={this.sumData(this.state.oneData, "discount")} />
          <Column footer={this.sumData(this.state.oneData, "tax")} />
          <Column footer={this.sumData(this.state.oneData, "adjustment")} />
          <Column footer={this.sumData(this.state.oneData, "total")} />
          <Column footer={this.sumData(this.state.oneData, "subTotalAmount")} />
          <Column footer={this.sumData(this.state.oneData, "totalAmount")} />
          <Column footer={this.sumData(this.state.oneData, "insurance")} />
          <Column footer=" " />
          <Column footer={this.sumData(this.state.oneData, "codFeeRp")} />
          <Column footer=" " />
          <Column footer={this.sumData(this.state.oneData, "totalShippingCharge")} />
          <Column footer={this.sumData(this.state.oneData, "totAmountCodFee")} />
        </RowPrime>
      </ColumnGroup>
    )

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
            <Card
              className="mb-12 lg-12"
              style={{
                borderRadius: 10
              }}
            >
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
                        style={{
                          borderRadius: "6px 0px 0px 6px"
                        }}
                      />
                      <Button
                        className="default"
                        color="primary"
                        onClick={() => this.loadData()}
                        style={{
                          borderRadius: "0px 6px 6px 0px"
                        }}
                      >
                        <i className="simple-icon-magnifier" />
                      </Button>
                    </InputGroup>
                  </div>

                  <div className="col-md-7">
                    <Button
                      className="float-right"
                      color="primary"
                      id="Popover1"
                      type="button"
                      style={{
                        marginLeft: 10,
                        borderRadius: 6
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
                      className="float-right"
                      color="primary"
                      onClick={() => this.setState({ modal: true })}
                      style={{
                        borderRadius: 6
                      }}
                    >
                      <i className="iconsminds-upload mr-2" />
                      <IntlMessages
                        id={"ui.menu.receipt-of-funds.list.button.uploadAWB"}
                      />
                    </Button>
                    <Button
                      className="float-right default"
                      color="primary"
                      style={{
                        marginRight: 10,
                        borderRadius: 6
                      }}
                      onClick={() => this.exportData()}
                    >
                      Export
                    </Button>
                  </div>

                </div>


                <DataTable value={this.state.table.data} className="noheader" lazy={true} loading={this.state.table.loading} responsive={true} resizableColumns={true} columnResizeMode="fit" scrollable={true} scrollHeight="500px">
                  <Column field="uploadDate" body={this.changeDataFormat} header="Upload Date" />
                  <Column field="documentNumber" header="ID File" body={this.columnFormat.emptyColumn} />
                  <Column field="uploadBy" header="Upload By"  body={this.columnFormat.emptyColumn}/>
                  <Column header="Detail" body={this.actionTemplate} />
                </DataTable>
                <Paginator
                  first={this.state.table.pagination.skipSize}
                  rows={this.state.table.pagination.pageSize}
                  totalRecords={
                    Math.ceil(this.state.table.pagination.totalPages) *
                    this.state.table.pagination.pageSize
                  }
                  onPageChange={this.handleOnPageChange}
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
              <div>
                <Row style={{
                  marginBottom: 10
                }}>
                  <Col
                    xs="3"
                    style={{
                      marginTop: 5
                    }}
                  >
                    Tanggal Rekap
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
                    <Calendar value={this.state.date} onChange={(e) => this.setState({date: e.value})}></Calendar>
                  </Col>
                </Row>
                <Row>
                  <Col
                    xs="3"
                  >
                    Kurir
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
            toggle={() => this.setState({ resiModalDetail: false })}
            className="modal-large" contentClassName="content-large"
          >
            <ModalHeader>
              <div className="row">
                <div className="text-left">
                  Data Resi COD
                </div>
                <div className="pull-right">
                  <Button style={{position: 'absolute', right: '25px', borderRadius: '5px'}} onClick={() => {this.exportDetailDataToExcel(this.state.data)}}>Export</Button>
                </div>
              </div>
            </ModalHeader>
            <ModalBody>
            
            <div className="col-md-3">
              <label className="sr-only" for="inlineFormInputGroup">OS Name</label>
              <div className="input-group mb-2">
                <div className="input-group-prepend">
                  <div className="input-group-text" ><i className="simple-icon-magnifier"></i></div>
                </div>
                <input type="text" style={{borderRadius: '0px 5px 5px 0px'}} className="form-control" id="inlineFormInputGroup" placeholder="OS Name" onChange={(e) => {this.handleSearchSellerName(e)}} />
              </div>
            </div>

              <DataTable value={this.state.data} responsive={true} resizableColumns={true} columnResizeMode="fit" footerColumnGroup={footerDetailFirst} scrollable={true} scrollHeight="300px">
                <Column body={this.loadDetailSellerFromBE} header="Nama Seller" />
                <Column field="package" header="Jumlah Paket"  body={this.columnFormat.emptyColumn}/>
                <Column field="totalAmount" header="Total" body={this.moneyFormat.currencyFormat} />
                <Column field="codFeeRp" header="Fee COD" body={this.moneyFormat.currencyFormat} />
                <Column field="totalReceive" header="Total Diterima" body={this.moneyFormat.currencyFormat} />
              </DataTable>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => this.setState({ resiModalDetail: false })} style={{borderRadius: '5px'}}>
                OK
              </Button>
            </ModalFooter>
          </Modal>
        )}

        {/* MODAL DATA RESI */}
        {this.state.resiModal && (
          <Modal isOpen={this.state.resiModal} size="lg" className="modal-large" contentClassName="content-large">
            <ModalHeader>
              <IntlMessages id="modal.receiptDataCOD" />
            </ModalHeader>
            <ModalBody>
            
              <div className="col-md-3">
                <label className="sr-only" for="inlineFormInputGroup">OS Name</label>
                <div className="input-group mb-2">
                  <div className="input-group-prepend">
                    <div className="input-group-text" ><i className="simple-icon-magnifier"></i></div>
                  </div>
                  <input type="text" style={{borderRadius: '0px 5px 5px 0px'}} className="form-control" id="inlineFormInputGroup" placeholder="OS Name" onChange={(e) => {this.handleSearchSellerName(e)}} />
                </div>
              </div>

              <DataTable value={this.state.data} responsive={true} resizableColumns={true} columnResizeMode="fit" footerColumnGroup={footerDetailFirst} scrollable={true} scrollHeight="300px">
                <Column body={this.loadDetailSellerFromExcel} header="Nama Seller" />
                <Column field="package" header="Jumlah Paket" body={this.columnFormat.emptyColumn} />
                <Column field="totalAmount" header="Total" body={this.moneyFormat.currencyFormat} />
                <Column field="codFeeRp" header="Fee COD" body={this.moneyFormat.currencyFormat} />
                <Column field="totalReceive" header="Total Diterima" body={this.moneyFormat.currencyFormat} />
              </DataTable>
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
          <div
            style={{
              maxHeight: 580
            }}
          >
            <Modal isOpen={this.state.resiModalSeller} className="modal-large" contentClassName="content-large">
              <ModalHeader>
                <IntlMessages id="modal.receiptDataCOD" />
              </ModalHeader>
              <ModalBody>
                <DataTable value={this.state.oneData} responsive={true} resizableColumns={true} columnResizeMode="fit" footerColumnGroup={footerDetailThird} scrollable={true} scrollHeight="300px">
                  <Column style={{ width: '250px' }} field="airwaybill" header="No Resi" body={this.columnFormat.emptyColumn} />
                  <Column style={{ width: '250px' }} field="statusDescription" header="Delivery Notes" body={this.columnFormat.emptyColumn} />
                  <Column style={{ width: '250px' }} field="lastReceiverName" header="Receiver Name" body={this.columnFormat.emptyColumn} />
                  <Column style={{ width: '250px' }} field="receiverAddress" header="Destination" body={this.columnFormat.emptyColumn} />
                  <Column style={{ width: '250px' }} field="notes" header="Note" body={this.columnFormat.emptyColumn} />
                  <Column style={{ width: '250px' }} field="goodsValue" header="Goods Value" body={this.moneyFormat.currencyFormat} />
                  <Column style={{ width: '250px' }} field="shippingCharge" header="Shipping Charge" body={this.moneyFormat.currencyFormat} />
                  <Column style={{ width: '250px' }} field="discount" header="Discount" body={this.moneyFormat.currencyFormat} />
                  <Column style={{ width: '250px' }} field="tax" header="Tax" body={this.moneyFormat.currencyFormat} />
                  <Column style={{ width: '250px' }} field="adjustment" header="Adjustment" body={this.moneyFormat.currencyFormat} />
                  <Column style={{ width: '250px' }} field="total" header="Total" body={this.moneyFormat.currencyFormat} />
                  <Column style={{ width: '250px' }} field="subTotalAmount" header="Sub Total Amount" body={this.moneyFormat.currencyFormat} />
                  <Column style={{ width: '250px' }} field="totalAmount" header="Total Amount" body={this.moneyFormat.currencyFormat} />
                  <Column style={{ width: '250px' }} field="insurance" header="Asuransi" body={this.moneyFormat.currencyFormat} />
                  <Column style={{ width: '250px' }} field="codFee" header="Fee COD (%)" body={this.columnFormat.emptyColumn} />
                  <Column style={{ width: '250px' }} field="codFeeRp" header="Fee COD (Rp)" body={this.moneyFormat.currencyFormat} />
                  <Column style={{ width: '250px' }} field="discountShippingChargePercentage" header="Diskon Ongkir (%)" body={this.columnFormat.emptyColumn} />
                  <Column style={{ width: '250px' }} field="totalShippingCharge" header="Total Ongkir" body={this.moneyFormat.currencyFormat} />
                  <Column style={{ width: '250px' }} field="totAmountCodFee" header="Total Diterima" body={this.moneyFormat.currencyFormat} />
                  <Column style={{ width: '250px' }} field="dateTime" header="Last Update Date"  />
                </DataTable>
              </ModalBody>

              <ModalFooter>
                <Button
                  onClick={() => this.setState({ resiModalSeller: false })}
                >
                  Back
                </Button>
              </ModalFooter>
            </Modal>
          </div>
        )}

        {/* MODAL DATA RESI SELLER DETAIL */}
        {this.state.resiModalSellerDetail && (
          <Modal isOpen={this.state.resiModalSellerDetail} className="modal-large" contentClassName="content-large">
            <ModalHeader>
              <div className="row">
                <div className="text-left">
                  Data Resi COD
                </div>
                <div className="pull-right">
                  <Button style={{position: 'absolute', right: '25px', borderRadius: '5px'}} onClick={() => {this.exportDetailSellerDataToExcel(this.state.oneData)}}>Export</Button>
                </div>
              </div>
            </ModalHeader>
            <ModalBody>
              <DataTable value={this.state.oneData} responsive={true} resizableColumns={true} columnResizeMode="fit" footerColumnGroup={footerDetailSecond} scrollable={true} scrollHeight="300px">
                <Column style={{ width: '250px' }} field="airwaybillNumber" header="No Resi" body={this.columnFormat.emptyColumn} />
                <Column style={{ width: '250px' }} field="deliveryNotes" header="Delivery Notes" body={this.columnFormat.emptyColumn} />
                <Column style={{ width: '250px' }} field="receiverName" header="Receiver Name" body={this.columnFormat.emptyColumn} />
                <Column style={{ width: '250px' }} field="destination" header="Destination" body={this.columnFormat.emptyColumn} />
                <Column style={{ width: '250px' }} field="notes" header="Note" body={this.columnFormat.emptyColumn} />
                <Column style={{ width: '250px' }} field="goodValue" header="Goods Value" body={this.moneyFormat.currencyFormat} />
                <Column style={{ width: '250px' }} field="shippingCharge" header="Shipping Charge" body={this.moneyFormat.currencyFormat} />
                <Column style={{ width: '250px' }} field="discount" header="Discount" body={this.moneyFormat.currencyFormat} />
                <Column style={{ width: '250px' }} field="tax" header="Tax" body={this.moneyFormat.currencyFormat} />
                <Column style={{ width: '250px' }} field="adjustment" header="Adjustment" body={this.moneyFormat.currencyFormat} />
                <Column style={{ width: '250px' }} field="total" header="Total" body={this.moneyFormat.currencyFormat} />
                <Column style={{ width: '250px' }} field="subTotalAmount" header="Sub Total Amount" body={this.moneyFormat.currencyFormat} />
                <Column style={{ width: '250px' }} field="totalAmount" header="Total Amount" body={this.moneyFormat.currencyFormat} />
                <Column style={{ width: '250px' }} field="insuranceAmount" header="Asuransi" body={this.moneyFormat.currencyFormat} />
                <Column style={{ width: '250px' }} field="codFeePercentage" header="Fee COD (%)" body={this.columnFormat.emptyColumn} />
                <Column style={{ width: '250px' }} field="codFeeValue" header="Fee COD (Rp)" body={this.moneyFormat.currencyFormat} />
                <Column style={{ width: '250px' }} field="discountShippingChargePercentage" header="Diskon Ongkir (%)" body={this.columnFormat.emptyColumn} />
                <Column style={{ width: '250px' }} field="totalShippingCharge" header="Total Ongkir" body={this.moneyFormat.currencyFormat} />
                <Column style={{ width: '250px' }} field="receiveAmount" header="Total Diterima" body={this.moneyFormat.currencyFormat} />
                <Column style={{ width: '250px' }} field="lastUpdateDate" header="Last Update Date" body={this.changeDateFormat} />
              </DataTable>
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
            <ModalHeader>Terjadi Kesalahan <br /> <b>Total Error: </b>{this.state.totalError}</ModalHeader>
            <ModalBody
              style={{
                maxHeight: '50vh',
                overflow: "auto"
              }}>{this._renderError()}</ModalBody>

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
