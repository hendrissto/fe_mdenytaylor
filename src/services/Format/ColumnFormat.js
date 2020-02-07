export class ColumnFormat {
		emptyColumn(rowData, column) {
			return rowData[column.field] || '-';
		}
}