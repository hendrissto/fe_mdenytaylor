import React from "react";
import RequestService from "../services/RequestService";

export default class TenantRestService extends React.Component {
  
  constructor() {
    super();
    this.request =  new RequestService(process.env.REACT_APP_API_DEV_ADMIN_URL);
  }

  getTenants(qParams) {
    return this.request.get('/admin/tenants', qParams);
  }

  getTenantsSummary(qParams) {
    return this.request.get('/admin/tenants-summary', qParams);
  }
}