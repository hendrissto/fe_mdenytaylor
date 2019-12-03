import React from 'react';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
	
const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const fileExt = '.xlsx';
var wscols = [
	{wch:5},
	{wch:17},
	{wch:35},
	{wch:10},
	{wch:11},
	{wch:13},
	{wch:13},
	{wch:10},
	{wch:15},
	{wch:15},
	{wch:7},
	{wch:50},
	{wch:5}, // hide
	{wch:25}, // owner
	{wch:25},
	{wch:17},
	{wch:35},
];

export default class ExportTenants extends React.Component {

    exportToCSV(csvData, fileName) {
			this.normalizeLine(csvData);
			const ws = XLSX.utils.json_to_sheet(csvData);
			ws['!cols'] = wscols
			ws['!cols'][12] = { hidden: true }
			const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
			const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
			const data = new Blob([excelBuffer], { type: fileType });
			FileSaver.saveAs(data, fileName + fileExt);
		}
		
		normalizeLine(data) {
			for(let i = 0; i < data.length; i++) {
				const user = [];
				// data[i].companyInfo = data[i].companyInfo.name + ', ' + data[i].companyInfo.phone + ', ' + data[i].companyInfo.email;
				data[i].companyName = data[i].companyInfo.name;
				data[i].companyPhone = data[i].companyInfo.phone;
				data[i].companyEmail = data[i].companyInfo.email;
				data[i].owner = data[i].owner.fullName;
				for(let j = 0; j < data[i].users.length; j++) {
					user.push(data[i].users[j].fullName)
				}
				data[i].users = user.join(',');
		}
		}
    
}