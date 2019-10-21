import React from "react";
import RequestService from "../services/RequestService";

export default class PictureRestService extends React.Component {
  constructor() {
    super();
    this.request = new RequestService(process.env.REACT_APP_API_FILESERVER_URL);
  }

  postPicture(qParams) {
    return this.request.post('/upload/admin', qParams);
  }
}
