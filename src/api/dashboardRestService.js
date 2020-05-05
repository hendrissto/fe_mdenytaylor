import React from "react";
import RequestService from "../services/RequestService";

export default class DashboardRestService extends React.Component {

  constructor() {
    super();
    this.request =  new RequestService();
  }

  getSummary(qParams) {
      return this.request.get('/dashboard/cod-credit');
  }

  getSalesCODCount(qParams) {
    return this.request.get('/dashboard/sales-cod-count', qParams);
  }

  getSalesCODTotalAmount(qParams) {
    return this.request.get('/dashboard/sales-cod-total-amount', qParams);
  }
}
