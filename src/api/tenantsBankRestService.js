import React from "react";
import RequestService from "../services/RequestService";

export default class TenantsBankRestService extends React.Component {

    constructor() {
        super();
        this.request = new RequestService();
    }

    submitData(tenantId, qParams) {
        return this.request.post(`/tenant-bank?tenantId=${tenantId}`, qParams);
    }

    loadData(qParams) {
        return this.request.get('/tenant-bank', qParams);
    }

    loadRelatedData(qParams) {
        return this.request.get('/tenant-bank/entry-related-data', qParams);
    }
    
    editData(id, tenantId, qParams) {
        return this.request.put(`/tenant-bank/${id}?tenantId=${tenantId}`, qParams);
    }
}