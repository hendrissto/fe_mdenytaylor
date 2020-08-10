import * as _ from "lodash";
import { useState } from 'react';
import { forkJoin, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import moment from "moment";
import "moment/locale/id";
import { Redirect } from "react-router-dom";
import React, { Component, Fragment } from "react";
import ReactTable from "react-table";
import "react-table/react-table.css";
import withFixedColumns from "react-table-hoc-fixed-columns";
import "react-table-hoc-fixed-columns/lib/styles.css";
import { Paginator } from "primereact/paginator";
import { Dropdown } from "primereact/dropdown";
import { InputText } from 'primereact/inputtext';

import ExportTenants from "../../../core/export/ExportTenants";
import NormalizeData from "../../../core/export/NormalizeData";
import Loader from "react-loader-spinner";

import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import Breadcrumb from "../../../containers/navs/Breadcrumb";
import {
  InputGroup,
  Button,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Row,
  Col,
  Card,
  CardBody,
  UncontrolledPopover,
  PopoverBody,
  CustomInput,
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledTooltip,
  Tooltip
} from "reactstrap";
import TenantRestService from "../../../api/tenantRestService";
import BillingRestService from "../../../api/billingRestService";
import Spinner from "../../../containers/pages/Spinner";
import IconCard from "../../../components/cards/IconCard";
import "./tenants.css";

import Switch from "rc-switch";
import "rc-switch/assets/index.css";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
const MySwal = withReactContent(Swal);

const ReactTableFixedColumn = withFixedColumns(ReactTable);

export default class Tenant extends Component {
  constructor(props) {
    super(props);
    this.billingRest = new BillingRestService();
    this.tenantRest = new TenantRestService();
    this.normalize = new NormalizeData();
    this.exportService = new ExportTenants();
    this.onChangeFormShipping = this.onChangeFormShipping.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.loadTenantsSummmary = this.loadTenantsSummmary.bind(this);
    this.togglePopOver = this.togglePopOver.bind(this);
    this.editStatusCOD = this.editStatusCOD.bind(this);
    this.editStatusSapCOD = this.editStatusSapCOD.bind(this);
    this.toggleFilterPopOver = this.toggleFilterPopOver.bind(this);
    this.toggle = this.toggle.bind(this);
    this.exportData = this.exportData.bind(this);
    this.loadAllData = this.loadAllData.bind(this);
    this.loadFilterData = this.loadFilterData.bind(this);
    this.toggleExport = this.toggleExport.bind(this);
    this.toggleShippingSettingsModal = this.toggleShippingSettingsModal.bind(this);
    this.toggleWarehouseChannelsModal = this.toggleWarehouseChannelsModal.bind(this);
    this.loadOneData = this.loadOneData.bind(this);

    this.state = {
      tableFilter: {
        companyInfo: true,
        email: true,
        phone: true,
        totalSku: true,
        totalOrder: true,
        totalReceipt: true,
        totalUser: true,
        lastLoginDateUtc: true,
        joinDateUtc: true,
        siCepatMemberId: true,
        siCepatCOD: true,
        isRealColumn: true,
        status: true,
        isCOD: true,
        shippingSettings: true,
        warehouseChannels: true,
        companyStatus: true,
      },
      totalSku: true,
      totalOrder: true,
      totalReceipt: true,
      totalUser: true,
      lastLoginDateUtc: true,
      joinDateUtc: true,
      siCepatCOD: true,
      isCOD: true,
      siCepatMemberId: true,
      status: true,
      isRealColumn: true,
      popoverOpen: false,
      filterPopover: false,
      totalTenants: 0,
      totalCODTenants: 0,
      data: [],
      table: {
        loading: true,
        data: [],
        sort: null,
        pagination: {
          currentPage: 0,
          totalPages: 0,
          skipSize: 0,
          pageSize: 10
        }
      },
      tenantsSummary: [],
      dropdownOpen: false,
      modal: false,
      oneData: "",
      search: "",
      redirect: false,
      loading: false,
      error: false,
      errorMessage: null,
      isReal: true,
      isCod: "",
      filterIsReal: true,
      totalData: 0,
      allData: false,
      exportButton: false,
      shippingSettingsModal: false,
      shippingSettingsData: [],
      warehouseChannelsModal: false,
      warehouseChannelsData: [],
      loadingShippings: false,
      loadingWarehouses: false,
      formShippingSetting: null
    };
  }

  togglePopOver() {
    this.setState(prevState => ({
      popoverOpen: !prevState.popoverOpen
    }));
  }

  toggleFilterPopOver() {
    this.setState(prevState => ({
      filterPopover: !prevState.filterPopover
    }));
  }

  handleFilterChange(event) {
    const tableFilter = { ...this.state.tableFilter };
    const target = event.target;
    const value = target.checked;
    const name = target.name;
    tableFilter[name] = value;
    this.setState({
      tableFilter: tableFilter
    });
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleOnPageChange = paginationEvent => {
    const table = { ...this.state.table };
    table.loading = true;
    table.pagination.pageSize = paginationEvent.rows;
    table.pagination.skipSize = paginationEvent.first;
    table.pagination.currentPage = paginationEvent.page + 1;

    this.setState({ table }, () => {
      this.loadData().subscribe();
    });
  };

  handleOnPageSizeChange(newPageSize, newPage) {
    const table = { ...this.state.table };
    table.loading = true;
    table.pagination.pageSize = newPageSize;
    this.setState({ table });
    this.loadData().subscribe();
  }

  handleSortedChange(newSorted, column, additive) {
    const sort = [];
    sort.push({
      field: newSorted[0].id,
      dir: newSorted[0].desc === true ? "desc" : "asc"
    });
    // this.setState({sort: sort}, () => {
    //   this.loadData()
    // })
  }

  loadData() {
    const table = { ...this.state.table };
    table.loading = true;
    this.setState({ table });
    const params = {
      keyword: this.state.search || null,
      isCod: this.state.isCod || null,
      isReal: this.state.isReal || null,
      "options.take": this.state.table.pagination.pageSize,
      "options.skip": this.state.table.pagination.skipSize,
      "options.includeTotalCount": true
    };

    return this.tenantRest.getTenants({ params }).pipe(
      tap((response) => {
        const table = { ...this.state.table };
        table.data = response.data;
        table.pagination.totalPages = Math.ceil(response.total / response.take);
        table.loading = false;
        for (let i = 0; i < response.data.length; i++) {
          if (response.data[i].siCepatCOD === true) {
            this.setState({ totalCODTenants: this.state.totalCODTenants + 1 });
          }
        }
        this.setState({ totalTenants: response.total });
        this.setState({ table });
      }),
      catchError((error) => {
        if (error.response.status === 401) {
          MySwal.fire({
            type: "error",
            title: "Unauthorized.",
            toast: true,
            position: "top-end",
            timer: 2000,
            showConfirmButton: false,
            customClass: "swal-height"
          });
        } else {
          MySwal.fire({
            type: "error",
            title: "Maaf atas kesalahan tidak terduga.",
            toast: true,
            position: "top-end",
            timer: 4000,
            showConfirmButton: false,
            customClass: "swal-height"
          });
        }
      })
    );
  }

  loadRelatedData() {
    return this.billingRest.getRelatedData().pipe(tap(response => {
      const relatedData = response;
      const validshippingServices = [];
      const shippingServices = response.shippingServices;
      for (let index = 0; index < shippingServices.length; index++) {
        shippingServices[index].shippingServiceStr = _.startCase(shippingServices[index].shippingServiceStr);
        validshippingServices[index] = shippingServices[index];
      }
      relatedData.shippingServices = validshippingServices;
      this.setState({ relatedData: relatedData });
    }));
  }

  loadOneData(id) {
    this.tenantRest.getOneTenants(id).subscribe(res => {
      this.setState({ oneData: res })
    }, err => {
      console.log(err)
    })
  }

  componentDidMount() {
    this.setState({ loading: true });
    forkJoin(
      this.loadData(),
      this.loadRelatedData(),
      this.loadTenantsSummmary()
    ).pipe(
      catchError((error)=>{
        this.setState({
          loading: false
        });
        MySwal.fire({
          type: "error",
          title:  error.response.data[0] ? error.response.data[0].errorMessage : 'Tidak diketahui',
          toast: true,
          position: "top-end",
          timer: 2000,
          showConfirmButton: false,
          customClass: "swal-height"
        });
        return throwError(error);
      })
    ).subscribe((() => {
      this.setState({loading: false});
    }));

  }

  loadTenantsSummmary() {
    return this.tenantRest.getTenantsSummary().pipe(tap(response => {
      this.setState({ tenantsSummary: response });
    }));
  }

  toggle() {
    this.setState(prevState => ({
      modal: !prevState.modal
    }));
  }

  toggleShippingSettingsModal() {
    this.setState({
      shippingSettingsModal: false,
      formShippingSetting: null
    });
  }

  toggleWarehouseChannelsModal() {
    this.setState({ warehouseChannelsModal: false });
  }

  dataTable() {
    moment.locale("id");
    const tableFilter = { ...this.state.tableFilter };
    return [
      {
        Header: "ID Tenant",
        accessor: "id",
        fixed: "left",
        width: 70,
        show: false,
        Cell: props => (
          // <Button color="link" className="text-primary" onClick={() => {
          //   this.toggle();
          //   this.setState({ oneData: props.original });
          // }}>
          //   <p>{props.value}</p>
          // </Button>
          <p>{props.value}</p>
        )
      },
      {
        Header: "Nama Perusahaan",
        accessor: "companyInfo.name",
        fixed: "left",
        width: 150,
        show: tableFilter.companyInfo
      },
      {
        Header: "Email Tenant",
        accessor: "email",
        // fixed: "left",
        width: 170,
        show: tableFilter.email,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "No Telp",
        accessor: "phone",
        // fixed: "left",
        width: 140,
        show: tableFilter.phone,
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Total SKU",
        accessor: "totalSku",
        width: 70,
        show: tableFilter.totalSku,
        Cell: props => (
          <p
            style={{
              textAlign: "center"
            }}
          >
            {props.value}
          </p>
        )
      },
      {
        Header: "Total Order",
        accessor: "totalOrder",
        width: 80,
        show: tableFilter.totalOrder,
        Cell: props => (
          <p
            style={{
              textAlign: "center"
            }}
          >
            {props.value}
          </p>
        )
      },
      {
        Header: "Total Receipt",
        accessor: "totalReceipt",
        width: 80,
        show: tableFilter.totalReceipt,
        Cell: props => (
          <p
            style={{
              textAlign: "center"
            }}
          >
            {props.value}
          </p>
        )
      },
      {
        Header: "Total User",
        accessor: "totalUser",
        width: 80,
        show: tableFilter.totalUser,
        Cell: props => (
          <div
            color="link"
            className="text-primary hover"
            style={{
              textAlign: "center"
            }}
            onClick={() => {
              this.toggle();
              this.setState({ oneData: props.original });
            }}
          >
            <p>{props.value}</p>
          </div>
        )
      },
      {
        Header: "Last Login",
        accessor: "owner.lastLoginDateUtc",
        width: 200,
        show: tableFilter.lastLoginDateUtc,
        Cell: props => <p>{moment(props.value).format("DD MMMM YYYY HH:mm")}</p>
      },
      {
        Header: "Join Date",
        accessor: "owner.joinDateUtc",
        width: 200,
        show: tableFilter.joinDateUtc,
        Cell: props => <p>{moment(props.value).format("DD MMMM YYYY HH:mm")}</p>
      },
      {
        Header: "Shipping Settings",
        width: 200,
        show: tableFilter.shippingSettings,
        Cell: props => (
          <div>
            <Button
              color="secondary"
              style={{ width: 150 }}
              onClick={() => {
                this.setState({ shippingSettingsData: props.original, oneData: props.original, shippingSettingsModal: true })
              }}
            >
              Shipping Settings
            </Button>
          </div>
        )
      },
      {
        Header: "Warehouse Channels",
        width: 200,
        show: tableFilter.warehouseChannels,
        Cell: props => (
          <div>
            <Button
              color="info"
              onClick={() => {
                this.setState({ warehouseChannelsData: props.original, oneData: props.original, warehouseChannelsModal: true })
              }}
            >
              Warehouse Channels
            </Button>
          </div>
        )
      },
      {
        Header: "Is Real",
        accessor: "isReal",
        show: tableFilter.isRealColumn,
        Cell: props => (
          <Switch
            className="custom-switch custom-switch-secondary"
            checked={props.original.isReal}
            onChange={() => {
              this.editIsReal(props.original);
            }}
          />
        )
      },
      {
        Header: "Status",
        accessor: "isActive",
        show: tableFilter.status,
        Cell: props => (
          <Switch
            className="custom-switch custom-switch-secondary"
            checked={props.original.isActive}
            onChange={() => {
              this.editIsActive(props.original);
            }}
          />
        )
      },
      {
        Header: "Keterangan",
        accessor: "companyInfo.companyStatus",
        show: tableFilter.companyStatus,
        width: 200,
        Cell: props =>
          <div>
            <p id={`UncontrolledTooltipExample${props.index}`} style={{
              color: 'blue',
              cursor: 'pointer',
            }}>{props.value || '-'}</p>
            {props.value &&
              <UncontrolledTooltip placement="right" target={`UncontrolledTooltipExample${props.index}`} style={{
                maxWidth: 1000,
              }}>
                <div style={{ width: '200px', wordBreak: "break-word", textAlign: 'left' }}>{props.value || '-'}</div>
              </UncontrolledTooltip>
            }
          </div>
      },
    ];
  }

  editStatusCOD(data) {
    const table = { ...this.state.table };

    table.loading = true;
    this.setState({ table }, () => {
      this.tenantRest.activeCOD(data.id, !data.siCepatCOD).subscribe(
        response => {
          this.loadData().subscribe();
          this.loadTenantsSummmary().subscribe();
          if (!data.siCepatCOD) {
            MySwal.fire({
              type: "success",
              title: "COD SiCepat telah diaktifkan.",
              toast: true,
              position: "top-end",
              timer: 2000,
              showConfirmButton: false,
              customClass: "swal-height"
            });
          } else {
            MySwal.fire({
              type: "success",
              title: "COD SiCepat telah dinonaktifkan.",
              toast: true,
              position: "top-end",
              timer: 2000,
              showConfirmButton: false,
              customClass: "swal-height"
            });
          }
        },
        error => {
          this.setState({
            errorMessage: error.data[0].errorMessage,
            error: true
          });
        }
      );
    });
  }

  editStatusSapCOD(data) {
    const table = { ...this.state.table };
    let payload = {
      isPickup: false,
      isCOD: !data.isCOD
    }

    table.loading = true;
    this.setState({ table }, () => {
      this.tenantRest.activeSapCOD(data.id, payload).subscribe(
        response => {
          this.loadData().subscribe();
          this.loadTenantsSummmary().subscribe();
          if (!data.isCOD) {
            MySwal.fire({
              type: "success",
              title: "COD SAP telah diaktifkan.",
              toast: true,
              position: "top-end",
              timer: 2000,
              showConfirmButton: false,
              customClass: "swal-height"
            });
          } else {
            MySwal.fire({
              type: "success",
              title: "COD SAP telah dinonaktifkan.",
              toast: true,
              position: "top-end",
              timer: 2000,
              showConfirmButton: false,
              customClass: "swal-height"
            });
          }
        },
        error => {
          this.setState({
            errorMessage: error.data[0].errorMessage,
            error: true
          });
        }
      );
    });
  }

  editIsReal(data) {
    const table = { ...this.state.table };

    table.loading = true;
    this.setState({ table }, () => {
      this.tenantRest.isRealUser(data.id, !data.isReal).subscribe(
        response => {
          this.loadData().subscribe();
          this.loadTenantsSummmary().subscribe();
          MySwal.fire({
            type: "success",
            title: "Berhasil.",
            toast: true,
            position: "top-end",
            timer: 2000,
            showConfirmButton: false,
            customClass: "swal-height"
          });
        },
        error => {
          this.setState({
            errorMessage: error.data[0].errorMessage,
            error: true
          });
        }
      );
    });
  }

  editIsActive(data) {
    const table = { ...this.state.table };

    MySwal.fire({
      type: 'info',
      title: 'Ubah status Tenant',
      text: data.isActive ? 'Berikan Alasan' : '',
      input: data.isActive ? 'text' : '',
      showCancelButton: true,
      allowOutsideClick: false,
      showConfirmButton: true
    }).then((res) => {
      if (!res.dismiss) {
        const companyStatus = res.value === true ? '-' : res.value;
        const payload = {
          companyStatus: companyStatus || ''
        };
        table.loading = true;
        this.setState({ table }, () => {
          this.tenantRest.isActiveUser(data.id, !data.isActive, payload).subscribe(
            response => {
              this.loadData().subscribe();
              this.loadTenantsSummmary().subscribe();
              MySwal.fire({
                type: "success",
                title: "Berhasil.",
                toast: true,
                position: "top-end",
                timer: 2000,
                showConfirmButton: false,
                customClass: "swal-height"
              });
            },
            error => {
              this.setState({
                errorMessage: error.data[0].errorMessage,
                error: true
              });
            }
          );
        });
      }
    })

  }

  oneData() {
    let dataTable = [];
    const data = this.state.oneData.users;

    for (let i = 0; i < data.length; i++) {
      dataTable.push(
        <div
          style={{
            marginBottom: 10
          }}
        >
          <Row>
            <Col xs="3"> ID User </Col>
            <Col xs="1">:</Col>
            <Col> {data[i].id} </Col>
          </Row>
          <Row>
            <Col xs="3"> User Name </Col>
            <Col xs="1">:</Col>
            <Col> {data[i].fullName} </Col>
          </Row>
        </div>
      );
    }

    return dataTable;
  }

  shippingSettingsModal() {
    let temp = [];
    const couriresNotCOD = ['anteraja', 'gosend'];
    const listShippingSettings = this.state.relatedData.integratedShippings;
    const data = this.state.oneData;

    for (let i = 0; i < listShippingSettings.length; i++) {
      const courier = _.find(data.shippingSettings, ['courierChannelId', listShippingSettings[i].id]);
      let services = this.state.relatedData.shippingServices;
      if(_.includes(couriresNotCOD,listShippingSettings[i].id)) {
        services = _.reject(services, ['shippingServiceStr', 'Cod']);
      }
      temp.push(
        <tr>
          <td>
            {listShippingSettings[i].name}
            { _.includes(couriresNotCOD,listShippingSettings[i].id) &&
              <div className="tooltip-cstm"><i className="pi pi-info-circle"></i>
                <span className="tooltiptext">Kurir ini belum menyediakan layanan COD</span>
              </div>
            }
          </td>
          <td>
            { this.state.formShippingSetting && this.state.formShippingSetting.courierId === listShippingSettings[i].id &&
            <div>
              <Input
                type="text"
                id="memberId"
                name="memberId"
                value={this.state.formShippingSetting.memberId}
                onChange={event => {
                  this.onChangeFormShipping(event, 'memberId');
                }}
              />

            </div>
            }
            { (!this.state.formShippingSetting || this.state.formShippingSetting.courierId !== listShippingSettings[i].id) && <label>
              {_.get(courier, 'memberId') || '-'}
            </label>
            }
          </td>
          <td>
            { this.state.formShippingSetting && this.state.formShippingSetting.courierId === listShippingSettings[i].id &&
              <Switch
                className="custom-switch custom-switch-secondary"
                checked={this.state.formShippingSetting.isAlreadyMember}
                onChange={event => {
                  this.onChangeFormShipping(event, 'isAlreadyMember');
                }}
              />
            }
            { (!this.state.formShippingSetting || this.state.formShippingSetting.courierId !== listShippingSettings[i].id) && <label>
                {_.get(courier, 'isAlreadyMember') ? 'Ya' : 'Tidak' || '-'}
              </label>
            }
          </td>
          <td>
            { this.state.formShippingSetting && this.state.formShippingSetting.courierId === listShippingSettings[i].id &&
              (<Dropdown
                value={this.state.formShippingSetting.shippingService}
                options={services}
                onChange={this.onChangeFormShipping.bind(this, 'shippingService')}
                placeholder="Pilih Layanan"
                name="shippingService"
                optionLabel="shippingServiceStr"
                style={{
                  width: 204
                }}
              />)
            }
            { (!this.state.formShippingSetting || this.state.formShippingSetting.courierId !== listShippingSettings[i].id) && <label>
              {_.startCase(_.get(courier, 'shippingServiceStr')) || '-'}
            </label>
            }
          </td>
          <td>
            { this.state.formShippingSetting && this.state.formShippingSetting.courierId === listShippingSettings[i].id &&
              <Input
                type="textarea"
                id="registrationInfo"
                name="registrationInfo"
                defaultValue={this.state.formShippingSetting.registrationInfo}
                rows="5"
                onChange={event => {
                  this.onChangeFormShipping(event, 'registrationInfo');
                }}
              />
            }
            { (!this.state.formShippingSetting || this.state.formShippingSetting.courierId !== listShippingSettings[i].id) &&
            <label style={{
              width: 250,
              wordBreak: 'break-word'
            }}>
              {_.get(courier, 'registrationInfo') || '-'}
            </label>
            }
          </td>
          <td>
            {this.renderButtonShippingSettings(data, courier, listShippingSettings[i].id)}
          </td>
        </tr>
      )
    }

    return temp;
  }

  onChangeFormShipping (event, extraEvent) {
    let value;
    let field = extraEvent;

    // condition for dropdown
    if(_.get(extraEvent, 'value')) {
      value = extraEvent.value;
      field = event

      // condition for switch input
    } else if(_.isBoolean(event)) {
      value = event;

    } else {
      const target = event.target;
      value = target.value;
    }
    const formValue = {
      ...this.state.formShippingSetting
    }
    formValue[field] = value;
    this.setState({formShippingSetting: formValue});
  }

  renderButtonShippingSettings(rowData, courierData, courierChannelId) {
    return  (
      <>
      { (!this.state.formShippingSetting || this.state.formShippingSetting.courierId !== courierChannelId)  &&
        <Button
          type="button"
          icon="pi pi-search"
          onClick={() => {
            this.setState({isEdit: true})
            this.editShippingSetting(rowData, courierData, courierChannelId)
          }}
          className="p-button-info"
        >
          Edit
        </Button>
      }
      { this.state.formShippingSetting && this.state.formShippingSetting.courierId === courierChannelId &&
        <>
        <Button
            type="button"
            icon="pi pi-search"
            onClick={() => this.setState({formShippingSetting: null})}
            className="p-button-danger"
            style={{
              marginRight: 5,
              background: '#F22556',
              borderColor: '#F22556'
            }}
          >
          Cancel
        </Button>
        <Button
          type="button"
          icon="pi pi-search"
          onClick={() => this.updateShippingSettings()}
          className="p-button-success"
        >
          Simpan
        </Button>
        </>
      }
      </>
    )
  }

  updateShippingSettings(event, courierChannelId) {
    this.setState({ loadingShippings: true });
    const payload = {...this.state.formShippingSetting};
    payload.shippingService = _.get(payload.shippingService, 'shippingService') || 0;
    this.tenantRest.updateShippingSettings(this.state.oneData.id, [payload]).subscribe(() => {
      this.loadOneData(this.state.oneData.id);
      this.loadData().subscribe()
      MySwal.fire({
        type: "success",
        title: `Berhasil merubah pengaturan pengiriman.`,
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
        customClass: "swal-height"
      });
      this.setState({ loadingShippings: false, formShippingSetting: null })
    }, error => {
      MySwal.fire({
        type: "error",
        title:  _.get(error.response) ? error.response.data[0].errorMessage : _.isArray(error.data) ? error.data[0].errorMessage : 'Tidak diketahui',
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
        customClass: "swal-height"
      });
      this.setState({ loadingShippings: false })
    });
  }

  editShippingSetting(doc, courierData, courierChannelId) {
    const defaultValue = {
      shippingService: null,
      courierId: courierChannelId,
      registrationInfo: '',
      isAlreadyMember: false,
      memberId: ''
    }

    if(courierData) {
      defaultValue.shippingService = _.find(this.state.relatedData.shippingServices, ['shippingService', courierData.shippingService]);
      defaultValue.registrationInfo = courierData.registrationInfo;
      defaultValue.isAlreadyMember = courierData.isAlreadyMember;
      defaultValue.memberId = courierData.memberId;
    }
    this.setState({formShippingSetting: defaultValue});
  }

  warehouseChannelsModal() {
    let temp = [];
    const listWarehouseChannels = this.state.oneData.warehouseChannels;
    const data = this.state.oneData;

    for (let i = 0; i < listWarehouseChannels.length; i++) {
      temp.push(
        <tr>
          <td> {listWarehouseChannels[i].channelWarehouseName || '-'} </td>
          <td> {listWarehouseChannels[i].warehouseName || '-'} </td>
          <td>
            <Switch
              className="custom-switch custom-switch-secondary"
              checked={listWarehouseChannels[i].isAlreadyMember}
              onChange={(event) => {
                this.setState({ loadingWarehouses: true })
                const params = {
                  tenantId: data.id,
                  warehouseId: listWarehouseChannels[i].warehouseId,
                  active: !listWarehouseChannels[i].isAlreadyMember
                }
                this.tenantRest.updateWarehouses(params.tenantId, params.warehouseId, params.active).subscribe(() => {
                  this.loadOneData(data.id);
                  this.loadData().subscribe()
                  if (listWarehouseChannels[i].isAlreadyMember) {
                    MySwal.fire({
                      type: "success",
                      title: `Is Already Member ${listWarehouseChannels[i].warehouseName} telah dinonaktifkan.`,
                      toast: true,
                      position: "top-end",
                      timer: 2000,
                      showConfirmButton: false,
                      customClass: "swal-height"
                    });
                  } else {
                    MySwal.fire({
                      type: "success",
                      title: `Is Already Member ${listWarehouseChannels[i].warehouseName} telah diaktifkan.`,
                      toast: true,
                      position: "top-end",
                      timer: 2000,
                      showConfirmButton: false,
                      customClass: "swal-height"
                    });
                  }
                  this.setState({ loadingWarehouses: false })
                }, err => {
                  console.log(err)
                  this.setState({ loadingWarehouses: false })
                })
              }}
            />
          </td>
        </tr>
      )
    }

    return temp;
  }

  exportData() {
    this.setState({ loading: true });
    const params = {
      "options.includeTotalCount": true
    };

    this.tenantRest.getTenants({ params }).subscribe(
      response => {
        this.setState({ totalData: response.total }, () => {
          if (this.state.allData) {
            this.loadAllData();
          } else {
            this.loadFilterData();
          }
        });
      },
      error => {
        this.setState({ redirect: true });
      }
    );
  }

  loadAllData() {
    const params = {
      "options.includeTotalCount": true,
      "options.take": this.state.totalData
    };

    this.tenantRest.getTenants({ params }).subscribe(res => {
      this.exportService.exportToCSV(res.data, "Tenants", false);
      this.setState({ loading: false });
    });
  }

  loadFilterData() {
    const params = {
      keyword: this.state.search || null,
      isCod: this.state.isCod || null,
      isReal: this.state.isReal || null,
      "options.take": this.state.totalData,
      "options.skip": 0,
      "options.includeTotalCount": true
    };

    this.tenantRest.getTenants({ params }).subscribe(res => {
      this.exportService.exportToCSV(res.data, "Tenants", false);
      this.setState({ loading: false });
    });
  }

  toggleExport() {
    this.setState({
      exportButton: !this.state.exportButton
    })
  }

  render() {
    const tableFilter = { ...this.state.tableFilter };
    if (this.state.redirect === true) {
      this.setState({ redirect: false });
      return <Redirect to="/user/login" />;
    }
    return (
      <Fragment>
        <Row>
          <Colxx xxs="12">
            <Breadcrumb heading="menu.tenants" match={this.props.match} />
            <Separator className="mb-5" />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <Card
              className="mb-12 lg-12"
              style={{
                borderRadius: 10
              }}
            >
              <CardBody>
                <Row>
                  <Colxx
                    xxs="6"
                    onClick={() => {
                      const table = { ...this.state.table };

                      table.pagination.skipSize = 0;
                      this.setState({ isCod: "", isReal: this.state.isReal, table }, () => {
                        this.loadData().subscribe();
                      });
                    }}
                  >
                    <IconCard
                      title="Total Registered Tenants"
                      value={this.state.tenantsSummary.totalRealTenant}
                      className="mb-4 hover"
                    />
                  </Colxx>
                  <Colxx
                    xxs="6"
                    onClick={() => {
                      const table = { ...this.state.table };

                      table.pagination.skipSize = 0;
                      this.setState({ isCod: true, isReal: this.state.isReal, table }, () => {
                        this.loadData().subscribe();
                      });
                    }}
                  >
                    <IconCard
                      title="Total Registered COD Tenants"
                      value={this.state.tenantsSummary.totalTenantRegisteredCOD}
                      className="mb-4 hover"
                    />
                  </Colxx>
                </Row>
              </CardBody>
            </Card>
          </Colxx>
        </Row>
        <Row style={{ marginTop: 20 }}>
          <Colxx xxs="12">
            <Card
              className="mb-12 lg-12"
              style={{
                borderRadius: 10
              }}
            >
              <CardBody>
                <div className="row">
                  <div className="mb-3 col-md-5">
                    <InputGroup>
                      <Input
                        placeholder="Search..."
                        name="search"
                        value={this.state.search}
                        onChange={this.handleInputChange}
                        onKeyPress={event => {
                          if (event.key === "Enter") {
                            this.loadData().subscribe();
                          }
                        }}
                        style={{
                          borderRadius: "6px 0px 0px 6px"
                        }}
                      />
                      <Button
                        className="default"
                        color="primary"
                        onClick={() => this.loadData().subscribe()}
                        style={{
                          borderRadius: "0px 6px 6px 0px"
                        }}
                      >
                        <i className="simple-icon-magnifier" />
                      </Button>
                      <div
                        style={{
                          margin: "10px 0px 0px 20px"
                        }}
                      >
                        <CustomInput
                          type="checkbox"
                          id="isReal"
                          label="Is Real"
                          checked={
                            this.state.filterIsReal === "" ||
                              this.state.filterIsReal === false
                              ? false
                              : true
                          }
                          onClick={e => {
                            const isReal =
                              e.target.checked === true ? e.target.checked : "";
                            this.setState(
                              {
                                filterIsReal: e.target.checked,
                                isReal: isReal
                              },
                              () => {
                                this.loadData().subscribe();
                              }
                            );
                          }}
                        />
                      </div>
                    </InputGroup>
                  </div>
                  <div className="col-md-7">
                    <Button
                      className="float-right default"
                      color="primary"
                      id="Popover1"
                      type="button"
                      style={{
                        marginLeft: 10,
                        borderRadius: 6
                      }}
                    >
                      <i className="simple-icon-menu mr-2" />
                    </Button>
                    <UncontrolledPopover
                      trigger="legacy"
                      placement="bottom"
                      isOpen={this.state.popoverOpen}
                      target="Popover1"
                      toggle={this.togglePopOver}
                    >
                      <PopoverBody className="custom-popover">
                        <div>
                          <input
                            name="companyInfo"
                            type="checkbox"
                            checked={tableFilter.companyInfo}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                        Nama Perusahaan
                      </div>
                        <div>
                          <input
                            name="email"
                            type="checkbox"
                            checked={tableFilter.email}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                        Email
                      </div>
                        <div>
                          <input
                            name="phone"
                            type="checkbox"
                            checked={tableFilter.phone}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          No Telepon
                        </div>
                        <div>
                          <input
                            name="totalSku"
                            type="checkbox"
                            checked={tableFilter.totalSku}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Total SKU
                        </div>
                        <div>
                          <input
                            name="totalOrder"
                            type="checkbox"
                            checked={tableFilter.totalOrder}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Total Order
                        </div>
                        <div>
                          <input
                            name="totalReceipt"
                            type="checkbox"
                            checked={tableFilter.totalReceipt}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Total Receipt
                        </div>
                        <div>
                          <input
                            name="totalUser"
                            type="checkbox"
                            checked={tableFilter.totalUser}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Total User
                        </div>
                        <div>
                          <input
                            name="lastLoginDateUtc"
                            type="checkbox"
                            checked={tableFilter.lastLoginDateUtc}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Last Login
                        </div>
                        <div>
                          <input
                            name="joinDateUtc"
                            type="checkbox"
                            checked={tableFilter.joinDateUtc}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Join Date
                        </div>
                        <div>
                          <input
                            name="shippingSettings"
                            type="checkbox"
                            checked={tableFilter.shippingSettings}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Shipping Settings
                        </div>
                        <div>
                          <input
                            name="warehouseChannels"
                            type="checkbox"
                            checked={tableFilter.warehouseChannels}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Warehouse Channels
                        </div>
                        <div>
                          <input
                            name="isRealColumn"
                            type="checkbox"
                            checked={tableFilter.isRealColumn}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Is Real
                        </div>
                        <div>
                          <input
                            name="status"
                            type="checkbox"
                            checked={tableFilter.status}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Status
                        </div>
                        <div>
                          <input
                            name="Keterangan"
                            type="checkbox"
                            checked={tableFilter.companyStatus}
                            onChange={this.handleFilterChange.bind(this)}
                          />
                          Keterangan
                        </div>
                      </PopoverBody>
                    </UncontrolledPopover>

                    <Button
                      className="float-right default"
                      color="primary"
                      onClick={() => {
                        const table = { ...this.state.table };

                        table.pagination.skipSize = 0;
                        this.setState(
                          {
                            packageFilter: "",
                            search: "",
                            isCod: "",
                            isReal: "",
                            table
                          },
                          () => {
                            this.loadData().subscribe();
                            this.loadTenantsSummmary().subscribe();
                          }
                        );
                        this.setState({ collapse: false });
                      }}
                      style={{
                        borderRadius: 6
                      }}
                    >
                      <i className="simple-icon-refresh" />
                    </Button>
                    <ButtonDropdown
                      className="float-right default"
                      isOpen={this.state.exportButton}
                      toggle={this.toggleExport}
                    >
                      <DropdownToggle
                        caret
                        color="primary"
                        style={{
                          marginRight: 10,
                          borderRadius: 6
                        }}
                      >
                        Export
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem onClick={() => {
                          this.setState({ allData: true }, () => {
                            this.exportData();
                          });
                        }}>Export Semua Data</DropdownItem>
                        <DropdownItem onClick={() => {
                          this.setState({ allData: false }, () => {
                            this.exportData();
                          });
                        }}>Export berdasarkan Filter</DropdownItem>
                      </DropdownMenu>
                    </ButtonDropdown>
                  </div>
                </div>

                <ReactTableFixedColumn
                  minRows={0}
                  showPagination={false}
                  showPaginationTop={false}
                  showPaginationBottom={false}
                  data={this.state.table.data}
                  columns={this.dataTable()}
                  className="-striped"
                  loading={this.state.table.loading}
                  onSortedChange={(newSorted, column, additive) => {
                    this.handleSortedChange(newSorted, column, additive);
                  }}
                  manual // this would indicate that server side pagination has been enabled
                  onFetchData={(state, instance) => {
                    const newState = { ...this.state.table };

                    newState.pagination.currentPage = state.page;
                    newState.pagination.pageSize = state.pageSize;
                    newState.pagination.skipSize = state.pageSize * state.page;
                    this.setState({ newState });
                    this.loadData().subscribe();
                  }}
                />
                <Paginator
                  first={this.state.table.pagination.skipSize}
                  rows={this.state.table.pagination.pageSize}
                  totalRecords={
                    Math.ceil(this.state.table.pagination.totalPages) *
                    this.state.table.pagination.pageSize
                  }
                  onPageChange={this.handleOnPageChange}
                />
              </CardBody>
            </Card>
          </Colxx>
          {this.state.loading && <Spinner />}
        </Row>

        {this.state.oneData && (
          <div
            style={{
              maxHeight: 580
            }}
          >
            <Modal isOpen={this.state.modal} toggle={this.toggle}>
              <ModalHeader toggle={this.toggle}>Detail User</ModalHeader>
              <ModalBody
                style={{
                  maxHeight: 380,
                  overflow: "auto"
                }}
              >
                {this.oneData()}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" outline onClick={this.toggle}>
                  Close
                </Button>
              </ModalFooter>
            </Modal>
          </div>
        )}

        {this.state.error && (
          <div
            style={{
              maxHeight: 580
            }}
          >
            <Modal isOpen={this.state.error}>
              <ModalHeader>Error</ModalHeader>
              <ModalBody
                style={{
                  maxHeight: 380,
                  overflow: "auto"
                }}
              >
                {this.state.errorMessage}
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  outline
                  onClick={() => {
                    this.setState({ error: false });
                  }}
                >
                  Close
                </Button>
              </ModalFooter>
            </Modal>
          </div>
        )}

        {this.state.shippingSettingsModal && (
          <div
            style={{
              maxHeight: 580,
            }}
          >
            <Modal isOpen={this.state.shippingSettingsModal} toggle={this.toggleShippingSettingsModal} className="modal-large" contentClassName="content-large">
              <ModalHeader toggle={this.toggleShippingSettingsModal}>Detail User</ModalHeader>
              <ModalBody
                style={{
                  maxHeight: 380,
                  overflow: "auto"
                }}
              >
                {!this.state.loadingShippings && (
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">Kurir</th>
                        <th scope="col">Member ID</th>
                        <th scope="col">Status Member</th>
                        <th scope="col">Layanan</th>
                        <th scope="col" width="250px">Info Registrasi</th>
                        <th width="200px"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.shippingSettingsModal()}
                    </tbody>
                  </table>
                )}

                {this.state.loadingShippings && (
                  <div style={{ paddingLeft: '40%' }}>
                    <Loader type="Oval" color="#51BEEA" height={80} width={80} />
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" outline onClick={this.toggleShippingSettingsModal}>
                  Close
                </Button>
              </ModalFooter>
            </Modal>
          </div>
        )}
        {this.state.warehouseChannelsModal && (
          <div
            style={{
              maxHeight: 580
            }}
          >
            <Modal isOpen={this.state.warehouseChannelsModal} toggle={this.toggleWarehouseChannelsModal}>
              <ModalHeader toggle={this.toggleWarehouseChannelsModal}>Warehouse Channels</ModalHeader>
              <ModalBody
                style={{
                  maxHeight: 380,
                  overflow: "auto"
                }}
              >
                {!this.state.loadingWarehouses && (
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">Warehouse Channel</th>
                        <th scope="col">Warehouse Name</th>
                        <th scope="col">Is Already Member</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.warehouseChannelsModal()}
                    </tbody>
                  </table>
                )}

                {this.state.loadingWarehouses && (
                  <div style={{ paddingLeft: '40%' }}>
                    <Loader type="Oval" color="#51BEEA" height={80} width={80} />
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" outline onClick={this.toggleWarehouseChannelsModal}>
                  Close
                </Button>
              </ModalFooter>
            </Modal>
          </div>
        )}
      </Fragment>
    );
  }
}
