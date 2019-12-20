import React from "react";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import moment from "moment";

const fileType =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const fileExt = ".xlsx";
var wscols = [
  { wch: 5 },
  { wch: 7 },
  { wch: 20 },
  { wch: 20 },
  { wch: 20 },
  { wch: 20 },
  { wch: 20 },
  { wch: 10 },
  { wch: 13 },
  { wch: 13 },
  { wch: 15 },
  { wch: 15 },
  { wch: 15 }, // hide
  { wch: 15 }, // owner
  { wch: 15 },
  { wch: 15 },
  { wch: 15 },
  { wch: 25 },
  { wch: 25 },
  { wch: 25 },
  { wch: 25 },
  { wch: 25 },
  { wch: 25 }
];

export default class ExportSubscriptions extends React.Component {
  exportToCSV(csvData, fileName) {
    this.normalizeLine(csvData);
    const ws = XLSX.utils.json_to_sheet(csvData);
    ws["!cols"] = wscols;
    ws["!cols"][15] = { hidden: true };
    ws["!cols"][16] = { hidden: true };
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExt);
  }

  normalizeLine(data) {
    for (let i = 0; i < data.length; i++) {
      data[i].billingPeriodEndDate = data[i].billingPeriodEndDate ? moment(data[i].billingPeriodEndDate).format('DD-MM-YYYY') : '-';
      data[i].billingPeriodStartDate = data[i].billingPeriodStartDate ? moment(data[i].billingPeriodStartDate).format('DD-MM-YYYY') : '-';
      data[i].freeTrialEndDate =data[i].freeTrialEndDate ? moment(data[i].freeTrialEndDate).format('DD-MM-YYYY') : '-';
      data[i].companyName = data[i].companyInfo.name;
      data[i].companyPhone = data[i].companyInfo.phone;
      data[i].companyEmail = data[i].companyInfo.email;
      data[i].ownerName = data[i].ownerUser.fullName;
      data[i].ownerPhone = data[i].ownerUser.phoneNumber;
      data[i].ownerEmail = data[i].ownerUser.email;
    }
  }
}
