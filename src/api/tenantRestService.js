import React from "react";
import RequestService from "../services/RequestService";

export default class TenantRestService extends React.Component {

  constructor() {
    super();
    this.request = new RequestService(process.env.REACT_APP_API_DEV_ADMIN_URL);
  }

  getTenants(qParams) {
    return this.request.get('/admin/tenants', qParams);
  }

  getOneTenants(id) {
    return this.request.get(`/admin/tenants/${id}`);
  }

  getTenantsSummary(qParams) {
    return this.request.get('/admin/tenants-summary', qParams);
  }

  activeCOD(id, status) {
    return this.request.put(`/admin/tenants/${id}/sicepat-cod/${status}`);
  }

  activeSapCOD(id, payload) {
    return this.request.put(`/admin/tenants/${id}/shipping-service`, payload);
  }

  isRealUser(id, status) {
    return this.request.put(`/admin/tenants/${id}/mark-isreal/${status}`);
  }

  updateShippingSettings(id, data) {
    return this.request.post(`/admin/tenants/${id}/shipping-service`, data);
  }

  updateWarehouses(tenantId, warehouseId, active) {
    return this.request.post(`/admin/tenants/${tenantId}/wms/${warehouseId}/is-already-member/${active}`);
  }
}