import React from "react";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
// import moment from "moment";
import { MoneyFormat } from "../../services/Format/MoneyFormat";

const moneyFormat = new MoneyFormat();
const fileType =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const fileExt = ".xlsx";
var wscols = [
  { wch: 8 }, // id
  { wch: 15 }, // balance Amount
  { wch: 15 }, // wallet ballance
  { wch: 20 }, // balanceTransaction
  { wch: 25 }, // user email
  { wch: 20 }, // username
  { wch: 25 }, // fullname
  { wch: 25 }, // company name
  { wch: 20 }, // industry
  { wch: 15 }, // phone
  { wch: 25 }, // company email
  { wch: 25 }, // websites
];

export default class ExportWithdrawFunds extends React.Component {
  exportToCSV(csvData, fileName) {
    this.normalizeLine(csvData);
    const ws = XLSX.utils.json_to_sheet(csvData);
    ws["!cols"] = wscols;
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExt);
  }

  normalizeLine(data) {
    for (let i = 0; i < data.length; i++) {
      data[i].balanceAmount = moneyFormat.numberFormat(data[i].balanceAmount);
      data[i].walletBalance = moneyFormat.numberFormat(data[i].walletBalance);
      data[i].balanceTransaction = moneyFormat.numberFormat(data[i].balanceTransaction);
    }
  }
}
