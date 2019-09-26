import React from "react";
import RequestService from "../services/RequestService";

export default class BillingRestService extends React.Component {
  constructor() {
    super();
    this.request = new RequestService(process.env.REACT_APP_API_DEV_ADMIN_URL);
  }

  getTenantsSubscriptions(qParams) {
    return this.request.get("/admin/tenant-subscriptions", qParams);
  }

  getTenantsSubscriptionsSummary(qParams) {
    return this.request.get("/admin/tenant-subscriptions-summary", qParams);
  }
}
