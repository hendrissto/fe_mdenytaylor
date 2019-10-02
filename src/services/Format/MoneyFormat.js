export class MoneyFormat {
    type = 'Rp. '

    numberFormat(number){
        const result = this.type + number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return result;
    }

    discountFormat(number){
        const result = this.type + '-' + number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return result;
    }

}