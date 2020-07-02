import React from "react";
import RequestService from "../services/RequestService";

export default class UsersRestService extends React.Component {

    constructor() {
        super();
        this.request = new RequestService(process.env.REACT_APP_API_DEV_ADMIN_URL);
        this.requestUser = new RequestService(process.env.REACT_APP_API_AUTH_URL);
    }

    loadDataUsers(qParams) {
      return this.requestUser.get('/admin', qParams);
    }

    createUsers(payload) {
      return this.requestUser.post('/admin', payload);
    }

    updateUsers(payload) {
      return this.requestUser.put(`/admin`, payload);
    }

    getUser(id) {
      return this.requestUser.get(`/admin/${id}`);
    }

    deleteUser(id, payload) {
      return this.requestUser.delete(`/admin/${id}`, payload);
    }

    loadDataRoles(qParams) {
        return this.request.get('/access-roles', qParams);
    }

    loadRelated() {
        return this.request.get('/access-roles/entry-related-data');
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

    loadDataPermissions(qParams) {
        return this.request.get('/access-permissions', qParams);
    }

    getSinglePermissions(id) {
        return this.request.get(`/access-permissions/${id}`);
    }

    markActive(id, active) {
      return this.requestUser.put(`/admin/${id}/mark-active?active=${active}`);
    }

    resetUserPassword(id, payload) {
      return this.requestUser.put(`/admin/${id}/reset-password`, payload)
    }
    
    changePassword(payload) {
      return this.requestUser.put(`/admin/me/change-password`, payload)
    }
}
