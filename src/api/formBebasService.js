import React from "react";
import RequestService from "../services/RequestService";

export default class FormBebasRestService extends React.Component {

    constructor() {
        super();
        this.request = new RequestService();
    }

    postBebas(qParams) {
        return this.request.post('/wallet/transaction', qParams);
    }
}