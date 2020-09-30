import React from "react";
import RequestService from "../services/RequestService";

export default class VerificationRequestRestService extends React.Component {

    constructor() {
        super();
        this.request = new RequestService();
    }

    getDataVerificationRequest(qParams) {
        return this.request.get('/admin/shipping-integration/requests', qParams);
    }

    verificationRequest(id, payload) {
        return this.request.post(`/admin/shipping-integration/${id}`, payload);
    }
}