import React from "react";
import RequestService from "../services/RequestService";

export default class CODRestService extends React.Component {
  
  constructor() {
    super();
    this.request =  new RequestService();
  }

  getReceiptFunds(qParams) {
      return this.request.get('/cod', qParams);
  }

  getCODReceipts(qParams) {
    return this.request.get('/cod-list', qParams);
  }

  postCOD(qParams) {
    return this.request.post('/cod', qParams);
  }
}