import React from "react";
import RequestService from "../services/RequestService";

export default class PictureRestService extends React.Component {
  constructor() {
    super();
    this.request = new RequestService("http://clodeo-server:9094");
  }

  postPicture(qParams) {
    return this.request.post('/upload/admin', qParams);
  }
}
