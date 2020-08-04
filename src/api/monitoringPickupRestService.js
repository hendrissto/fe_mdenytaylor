import React from "react";
import RequestService from "../services/RequestService";

export default class MonitoringPickupRestService extends React.Component {
    constructor() {
        super();
        this.request = new RequestService();
    }

    getListData(qParams) {
        return this.request.get('/monitoring-pickup', qParams);
    }

    getAWBDetail(payloads) {
      return this.request.post('/monitoring-pickup/waybill-detail', payloads);
    }

    getAWBHistory(salesTransactionID, qParams) {
      return this.request.get(`/monitoring-pickup/waybill-history/${salesTransactionID}`, qParams);
    }
}
