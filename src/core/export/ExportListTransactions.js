import React from "react";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import moment from "moment";
import { MoneyFormat } from "../../services/Format/MoneyFormat";

const moneyFormat = new MoneyFormat();
const fileType =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const fileExt = ".csv";
var wscols = [
  { wch: 40 }, // id
  { wch: 8 }, // tenant id
  { wch: 25 }, // seller name
  { wch: 15 }, // amount
  { wch: 15 }, // bank name
  { wch: 15 }, // bank district
  { wch: 15 }, // delivery date
  { wch: 10 }, // status
];

export default class ExportListTransactions extends React.Component {
  exportToCSV(csvData, fileName) {
    // this.normalizeLine(csvData);
    const ws = XLSX.utils.json_to_sheet(csvData);
    // ws["!cols"] = wscols;
    // ws['!cols'][8] = { hidden: true }
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "csv", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExt);
  }

  normalizeLine(data) {
    for (let i = 0; i < data.length; i++) {
      data[i].amount = moneyFormat.numberFormat(data[i].amount);
      data[i].deliveryDate = data[i].deliveryDate ? moment(data[i].deliveryDate).format('DD-MM-YYYY') : '-';
    }
  }
}
