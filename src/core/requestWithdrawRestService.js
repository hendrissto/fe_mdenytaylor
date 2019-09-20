import React from "react";
import RequestService from "../services/RequestService";

export default class WithdrawRestService extends React.Component {
  
  constructor() {
    super();
    this.request =  new RequestService();
  }

  getBallance(qParams) {
    return this.request.get('/wallet-balance', qParams);
  }

  postBallance(qParams) {
    return this.request.post('/debit-cod', qParams);
  }
}