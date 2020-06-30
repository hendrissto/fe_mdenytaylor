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

  getTenantsSubscriptionsById(id, qParams) {
    return this.request.get(`/admin/tenant-subscriptions/${id}`, qParams);
  }

  getTenantsSubscriptionsSummary(qParams) {
    return this.request.get("/admin/tenant-subscriptions-summary", qParams);
  }

  getRelatedData(clientAppId) {
    return this.request.get(`/admin/entry-related-data?clientAppId=${clientAppId}`);
  }

  upgradeTenantsSubscriptions(id, qParams) {
    return this.request.put(`/admin/tenants/${id}/upgrade-subscription`, qParams);
  }

  renewTenantsSubscriptions(id, qParams) {
    return this.request.put(`/admin/tenants/${id}/renew-subscription`, qParams);
  }
}
