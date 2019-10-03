import { HttpClientAxiosInterceptedService } from "./HttpClientAxiosInterceptedService";

export default class RequestLoginService extends HttpClientAxiosInterceptedService {
  constructor(baseUrl) {
    let headers;
    if (localStorage.getItem('user')) {
      const user = JSON.parse(localStorage.getItem('user'));
      headers = {
        "Authorization": 'Bearer ' + user.access_token,
        "Timezone-Offset": new Date().getTimezoneOffset(),
        "Content-Type": "application/json;charset=UTF-8",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "id-ID"
      }
    }

    super(!baseUrl ? process.env.REACT_APP_API_ADMIN_URL : baseUrl, !baseUrl ? headers : {});
  }
}