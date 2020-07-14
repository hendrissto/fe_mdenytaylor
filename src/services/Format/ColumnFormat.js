import * as _ from 'lodash';
import * as moment from 'moment';

export class ColumnFormat {

	emptyColumn(rowData, column) {
		return rowData[column.field] || '-';
	}

	operationBoolean(rowData, column) {
		return rowData[column.field] ? 'Ya' : 'Tidak';
	}

	startCase(rowData, column) {
		return _.startCase(rowData[column.field]) || '-';
	}

	dateFormat(rowData, column) {
		return rowData[column.field] ? moment(rowData[column.field]).format('DD/MM/YYYY') : '';
	}

	dateTimeFormatterFromUtc(rowData, column) {
		if (rowData[column.field]) {
			const dateUtc = new Date(rowData[column.field]);
			const offset = (new Date().getTimezoneOffset() * -1);
			dateUtc.setMinutes(dateUtc.getMinutes() + offset);
			return moment(dateUtc).format('DD/MM/YYYY HH:mm:ss');
		}
		return '';
	}
}