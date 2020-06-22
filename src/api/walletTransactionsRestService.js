import React from "react";
import RequestService from "../services/RequestService";

export default class WalletTransactionsRestService extends React.Component {

    constructor() {
        super();
        this.request = new RequestService();
    }

    approve(id, body) {
      return this.request.put(`/wallet/transaction/approve-withdraw-request/${id}`, body);
    }

    submitData(qParams) {
        return this.request.post('/wallet/transaction', qParams);
    }

    loadData(qParams) {
        return this.request.get('/wallet/transaction', qParams);
    }

    editData(id, qParams) {
        return this.request.put(`/wallet/transaction/${id}`, qParams);
    }

    loadDataTenantTransactions(qParams) {
        return this.request.get('/wallet/tenant-transaction', qParams);
    }

    loadOneDataTenantTransactions(id, qParams) {
        return this.request.get(`/wallet/tenant-transaction/${id}`, qParams);
    }
}
