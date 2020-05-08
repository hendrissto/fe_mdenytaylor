import React from "react";
import RequestService from "../services/RequestService";

export default class UsersRestService extends React.Component {

    constructor() {
        super();
        this.request = new RequestService(process.env.REACT_APP_API_DEV_ADMIN_URL);
    }

}