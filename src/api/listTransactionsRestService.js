import React from "react";
import RequestService from "../services/RequestService";

export default class ListTransactionsService extends React.Component {
  constructor() {
    super();
    this.request = new RequestService();
  }

  getAWBDetail(qParams) {
    return this.request.post('/admin/waybill-detail', qParams);
  }
}
