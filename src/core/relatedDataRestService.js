import React from "react";
import RequestService from "../services/RequestService";

export default class RelatedDataRestService extends React.Component {
  constructor() {
    super();
    this.request = new RequestService();
  }

  getCourierChannel(qParams) {
    return this.request.get('/credit-cod/entry-related-data', qParams);
  }

  getTenantBank(id, qParams) {
    return this.request.get(`/tenant-bank/${id}`, qParams);
  }
  
}