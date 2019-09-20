import React from "react";
import RequestService from "../services/RequestService";

export default class BillingRestService extends React.Component {
  constructor() {
    super();
    this.request = new RequestService();
  }

  getTenantsSubscriptions(qParams) {
    return this.request.get("/admin/tenant-subscriptions", qParams);
  }

  getTenantsSubscriptionsSummary(qParams) {
    return this.request.get("/admin/tenant-subscriptions-summary", qParams);
  }
}
