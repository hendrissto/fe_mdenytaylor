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

}