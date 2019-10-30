import React from "react";
import RequestService from "../services/RequestService";

export default class DebitRestService extends React.Component {
  constructor() {
    super();
    this.request = new RequestService();
  }

  getDebitCod(qParams) {
      return this.request.get('/debit-cod', qParams);
  }

  putDebitCod(id, qParams) {
      return this.request.put(`/debit-cod/${id}`, qParams);
  }
}
