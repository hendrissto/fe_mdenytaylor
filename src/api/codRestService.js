import React from "react";
import RequestService from "../services/RequestService";

export default class CODRestService extends React.Component {
  
  constructor() {
    super();
    this.request =  new RequestService();
  }

  getReceiptFunds(qParams) {
      return this.request.get('/credit-cod', qParams);
  }

  getCODReceipts(qParams) {
    return this.request.get('/cod-list', qParams);
  }

  postCOD(qParams) {
    return this.request.post('/credit-cod', qParams);
  }

  getdDetailCod(id, qParams) {
    return this.request.get(`/credit-cod/${id}`, qParams);
  }
}