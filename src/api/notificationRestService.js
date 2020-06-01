import Axios from "axios";
import React from "react";
import RequestService from "../services/RequestService";

export default class NotificationRestService extends React.Component {
  constructor() {
    super();
    this.axios = Axios;
    const baseUrl = `${process.env.REACT_APP_API_ADDON_URL}/notifications`;
    this.request = new RequestService(baseUrl);
  }

  getNotifications(qParams) {
    return this.request.post('/q', qParams);
  }

}
