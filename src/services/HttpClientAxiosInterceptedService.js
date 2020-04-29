// import { Observable } from "rxjs";
import Axios from 'axios';
import * as _ from "lodash";
import { HttpClientAxiosService } from './HttpClientAxiosService';
const qs = require('querystring');

export class HttpClientAxiosInterceptedService extends HttpClientAxiosService {
  constructor(baseURL, headers) {
    const axios = Axios.create({headers: headers});
    super(!_.isEmpty(axios) ? axios : Axios);
    this.axios.defaults.baseURL = baseURL;
    this.setInterceptor(this.axios);
  }

  setInterceptor(axios) {
    // TODO: Continue last request without refresh page.
    axios.interceptors.response.use(undefined, async error => {
      const response = error.response;
      if (response && response.status === 401) {
        let newToken = '';
        const config = {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
        
        const tokenUrl = process.env.REACT_APP_API_AUTH_URL + '/token';
        const refreshToken = JSON.parse(localStorage.getItem('user')).refresh_token;
        const payload = this.requestNewToken(refreshToken);
        Axios.post(tokenUrl, qs.stringify(payload), config).then(res => {
          newToken = res.data.access_token;
          if (newToken) {
            localStorage.setItem('user', JSON.stringify(res.data));
            window.location.reload();
            // response.config.headers.Authorization = `Bearer ${newToken}`;
            // return axios.request(response.config);
          }
        }, error => {
          window.location.href = "/user/login"
          throw error;
        })
      }
      throw error;
    });
  }

  requestNewToken(refreshToken) {
    let data = {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: "clodeo-admin-web"
    };
    return data;
  }
}
