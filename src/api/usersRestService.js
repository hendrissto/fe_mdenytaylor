import React from "react";
import RequestService from "../services/RequestService";

export default class UsersRestService extends React.Component {

    constructor() {
        super();
        this.request = new RequestService(process.env.REACT_APP_API_DEV_ADMIN_URL);
    }

    loadDataRoles(qParams) {
        return this.request.get('/access-roles', qParams);
    }

    loadRelated(qParams) {
        return this.request.get('/access-roles/entry-related-data', qParams);
    }

    createRoles(payload) {
        return this.request.post('/access-roles', payload);
    }

    updateRoles(id, payload) {
        return this.request.put(`/access-roles/${id}`, payload);
    }

    getSingleRole(id) {
        return this.request.get(`/access-roles/${id}`);
    }

}