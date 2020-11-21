import Axios from "axios";
import React from "react";

import RequestService from "../shared/services/RequestService";
const qs = require('querystring');

export default class AuthRestService extends React.Component {

  constructor() {
    super();
    this.axios = Axios;
    this.request =  new RequestService(process.env.REACT_APP_API_AUTH_URL);
    this.config = {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
      }
    }
  }

  login(params) {
    return this.request.post('/token', qs.stringify(params), this.config);
  }
}
