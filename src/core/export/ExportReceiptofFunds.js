import React from "react";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import moment from "moment";
import { MoneyFormat } from "../../services/Format/MoneyFormat";

const moneyFormat = new MoneyFormat();
const fileType =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const fileExt = ".xlsx";

export default class ExportReceiptofFunds extends React.Component {
  exportToCSV(csvData, fileName, allData) {
    if(allData) {
      this.normalizeLine(csvData);
    }
    const ws = XLSX.utils.json_to_sheet(csvData);
    // ws["!cols"] = wscols;
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExt);
  }

  normalizeLine(data) {
    for (let i = 0; i < data.length; i++) {
      data[i].uploadDate = data[i].uploadDate ? moment(data[i].uploadDate).format('DD-MM-YYYY hh:mm') : '-';
      data[i].adjustment = moneyFormat.numberFormat(data[i].adjustment);
      data[i].codFeeValue = moneyFormat.numberFormat(data[i].codFeeValue);
      data[i].codValue = moneyFormat.numberFormat(data[i].codValue);
      data[i].discount = moneyFormat.numberFormat(data[i].discount);
      data[i].goodValue = moneyFormat.numberFormat(data[i].goodValue);
      data[i].receiveAmount = moneyFormat.numberFormat(data[i].receiveAmount);
      data[i].shippingCharge = moneyFormat.numberFormat(data[i].shippingCharge);
      data[i].subTotalAmount = moneyFormat.numberFormat(data[i].subTotalAmount);
      data[i].tax = moneyFormat.numberFormat(data[i].tax);
      data[i].total = moneyFormat.numberFormat(data[i].total);
      data[i].totalAmount = moneyFormat.numberFormat(data[i].totalAmount);
    }
  }
}