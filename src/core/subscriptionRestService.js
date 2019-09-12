import React from "react";
import RequestService from "../services/RequestService";

export default class SubscriptionRestService extends React.Component {
  
  constructor() {
    super();
    this.request =  new RequestService();
  }

  getTenants(qParams) {
    return this.request.get('/admin/tenants', qParams);
  }

  getCODReceipts(qParams) {
    return this.request.get('/cod-list', qParams);
  }
}