export class MoneyFormat {
    type = 'Rp. '

    numberFormat(number = 0){
        const result = this.type + number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return result;
    }

    discountFormat(number){
        const result = this.type + '-' + number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return result;
    }

    currencyFormat = (rowData, column) => {
        return 'Rp. ' + rowData[column.field].toLocaleString('id-ID') || '-';
    }

    currencyFormatOld = (rowData, column) => {
        switch(column.field) {
        case 'walletBalance.balance':
            return this.numberFormat(rowData.walletBalance.balance);
        default:
            return 0;
        }
    }
}