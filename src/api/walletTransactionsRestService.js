import React from "react";
import RequestService from "../services/RequestService";

export default class WalletTransactionsRestService extends React.Component {

    constructor() {
        super();
        this.request = new RequestService();
    }

    submitData(qParams) {
        return this.request.post('/wallet/transaction', qParams);
    }

    loadData(qParams) {
        return this.request.get('/wallet/transaction', qParams);
    }
}