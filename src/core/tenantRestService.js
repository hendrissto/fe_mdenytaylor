import React from "react";
import RequestService from "../services/RequestService";

export default class TenantRestService extends React.Component {
  
  constructor() {
    super();
    this.request =  new RequestService();
  }

  getTenants(qParams) {
    return this.request.get('/admin/tenants', qParams);
  }
}