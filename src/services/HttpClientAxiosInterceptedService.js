// import { Observable } from "rxjs";
import Axios from 'axios';
import * as _ from "lodash";

import { HttpClientAxiosService } from './HttpClientAxiosService';
const user = JSON.parse(localStorage.getItem('user'));
export class HttpClientAxiosInterceptedService extends HttpClientAxiosService {
  constructor(baseURL, headers) {
    const axios = Axios.create({headers: headers});
    super(!_.isEmpty(axios) ? axios : Axios);
    this.axios.defaults.baseURL = baseURL;
    this.handleRefreshToken();
  }

  handleRefreshToken(event) {
    // const { companyId } = event.data;
    // console.log(user);
    // if (!user) {
    //   return Observable.throw(new Error('User is not logged in.'));
    // }

    // const tokenUrl = process.env.REACT_APP_API_AUTH_URL + '/token';

    // const data = this.buildRefreshInfo(user.refresh_token, companyId);

    // this.refreshTokenRunning = true;

    // return Observable.fromPromise(
    //   this.axios.post(tokenUrl, data)
    // ).catch(error => {
    //   this.refreshTokenRunning = false;

    //   const urlCheck = this._router.url.substr(0, 6);
    //   if (urlCheck !== '/login') {
    //     this._router.navigate(['/login'], { queryParams: { tokenExpired: 'true', destination: this._router.url } });
    //   }

    //   return Observable.throw(error);
    // }).switchMap(response => Observable.of(response.data)).do(response => {
    //   this.refreshTokenRunning = false;
    //   this.attachRole(response);
    //   user = response;

    //   this._event.emit('CORE:AUTHENTICATION:TOKENCHANGED', response.access_token);

    // }).switchMap(response => Observable.of(response.access_token));
  }
}
