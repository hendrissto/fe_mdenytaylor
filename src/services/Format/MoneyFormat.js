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
    // currencyFormatOld = (rowData, column) => {
    //   switch(column.field) {
    //     case 'totalAmount':
    //       return this.numberFormat(rowData.totalAmount);
    //     case 'amount':
    //       return this.numberFormat(rowData.amount);
    //     case 'codFeeRp':
    //       return this.numberFormat(rowData.codFeeRp);
    //     case 'totalReceive':
    //       return this.numberFormat(rowData.totalReceive);
    //     case 'goodsValue':
    //       return this.numberFormat(rowData.goodsValue);
    //     case 'shippingCharge':
    //       return this.numberFormat(rowData.shippingCharge);
    //     case 'discount':
    //       return this.numberFormat(rowData.discount);
    //     case 'tax':
    //       return this.numberFormat(rowData.tax);
    //     case 'adjustment':
    //       return this.numberFormat(rowData.adjustment);
    //     case 'total':
    //       return this.numberFormat(rowData.total);
    //     case 'subTotalAmount':
    //       return this.numberFormat(rowData.subTotalAmount);
    //     case 'totalShippingCharge':
    //       return this.numberFormat(rowData.totalShippingCharge);
    //     case 'totAmountCodFee':
    //       return this.numberFormat(rowData.totAmountCodFee);
    //     case 'goodValue':
    //       return this.numberFormat(rowData.goodValue);
    //     case 'codFeeValue':
    //       return this.numberFormat(rowData.codFeeValue);
    //     case 'receiveAmount':
    //       return this.numberFormat(rowData.receiveAmount);
    //     case 'balanceAmount':
    //       return this.numberFormat(rowData.balanceAmount);
    //     case 'feeTransfer':
    //       return this.numberFormat(rowData.feeTransfer);
    //     case 'insuranceAmount':
    //       return this.numberFormat(rowData.insuranceAmount);
    //     case 'insurance':
    //       return this.numberFormat(rowData.insurance);
    //     default:
    //       return 0;
    //   }
    // }
}