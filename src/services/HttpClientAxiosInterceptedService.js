import Axios from 'axios';
import * as _ from "lodash";

import { HttpClientAxiosService } from './HttpClientAxiosService';

export class HttpClientAxiosInterceptedService extends HttpClientAxiosService {
  constructor(baseURL, headers) {
    const axios = Axios.create({headers: headers});
    super(!_.isEmpty(axios) ? axios : Axios);
    this.axios.defaults.baseURL = baseURL;
  }
}
