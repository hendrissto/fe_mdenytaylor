import React from 'react';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
	
const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const fileExt = '.xlsx';
var wscols = [
	{wch:25},
	{wch:25},
	{wch:25},
	{wch:25},
	{wch:25},
	{wch:25},
	{wch:25},
	{wch:25},
	{wch:25},
	{wch:25},
	{wch:25},
	{wch:25},
	{wch:25}, // hide
	{wch:25}, // owner
	{wch:25},
	{wch:25},
	{wch:25},
];

export default class ExportTenants extends React.Component {

    exportToCSV(csvData, fileName, filter) {
			if(!filter) {
				this.normalizeLine(csvData);
			} else {
				this.normalizeFilterLine(csvData);
			}

			const ws = XLSX.utils.json_to_sheet(csvData);
			ws['!cols'] = wscols
			const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
			const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
			const data = new Blob([excelBuffer], { type: fileType });
			FileSaver.saveAs(data, fileName + fileExt);
		}
		
		normalizeLine(data) {
			for(let i = 0; i < data.length; i++) {
				const user = [];
				data[i].companyName = data[i].companyInfo.name;
				data[i].companyPhone = data[i].companyInfo.phone;
				data[i].companyEmail = data[i].companyInfo.email;
				data[i].owner = data[i].owner.fullName;
				for(let j = 0; j < data[i].users.length; j++) {
					user.push(data[i].users[j].fullName)
				}
				data[i].users = user.join(',');
				delete data[i].users;
				delete data[i].companyInfo;
				delete data[i].owner;
			}
		}
		
		normalizeFilterLine(data) {
			for(let i = 0; i < data.length; i++) {
				const user = [];
				if(data[i].companyInfo) {
					data[i].companyName = data[i].companyInfo.name;
					data[i].companyPhone = data[i].companyInfo.phone;
					data[i].companyEmail = data[i].companyInfo.email;
					delete data[i].companyInfo;
				}

				if(data[i].owner) {
					data[i].owner = data[i].owner.fullName;
					delete data[i].owner;
				}

				if(data[i].users) {
					for(let j = 0; j < data[i].users.length; j++) {
						user.push(data[i].users[j].fullName)
					}
					data[i].users = user.join(',');
					delete data[i].users;
				}
			}
		}
    
}