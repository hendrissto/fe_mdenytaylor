import React, { Component } from "react";
import {
  Row,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  Input,
  InputGroup
} from "reactstrap";

import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import Breadcrumb from "../../../containers/navs/Breadcrumb";
import { InputText } from 'primereact/inputtext';
import { AutoComplete } from 'primereact/autocomplete';
import Loading from "../../../containers/pages/Spinner";

import { DataTable } from "primereact/datatable";
import { Paginator } from "primereact/paginator";
import { Column } from "primereact/column";
import TenantRestService from "../../../api/tenantRestService";
import TenantsBankRestService from "../../../api/tenantsBankRestService";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { ColumnFormat } from "../../../services/Format/ColumnFormat";
import { AclService } from "../../../services/auth/AclService";
const MySwal = withReactContent(Swal);


export default class TenantsBank extends Component {
  constructor(props) {
    super(props);
    this.authentication = new AclService();
    this.tenantRestService = new TenantRestService();
    this.tenantBankRestService = new TenantsBankRestService();
    this.suggestTenants = this.suggestTenants.bind(this);
    this.loadData = this.loadData.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.suggestBank = this.suggestBank.bind(this);
    this.submitData = this.submitData.bind(this);
    this.resetData = this.resetData.bind(this);
    this.editData = this.editData.bind(this);
    this.actionTemplate = this.actionTemplate.bind(this);
    this.columnFormat = new ColumnFormat();
    this.handleOnPageChange = this.handleOnPageChange.bind(this);

    this.state = {
      loading: false,
      modalAddBank: false,
      tenantSelected: null,
      tenantOptions: null,
      bankSelected: null,
      bankOptions: null,
      bankDistrict: "",
      accountNumber: "",
      accountName: "",
      search: "",
      isEdit: false,
      oneData: null,
      table: {
        loading: true,
        data: [],
        pagination: {
          currentPage: 0,
          totalPages: 0,
          skipSize: 0,
          pageSize: 10
        }
      },
    };
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  componentDidMount() {
    this.loadData()
  }

  loadData() {
    const table = { ...this.state.table };
    table.loading = true;
    this.setState({ table });

    const params = {
      keyword: this.state.search || null,
      "options.take": this.state.table.pagination.pageSize,
      "options.skip": this.state.table.pagination.skipSize,
      "options.includeTotalCount": true
    };

    this.tenantBankRestService.loadData({ params }).subscribe(response => {
      const table = { ...this.state.table };
      table.data = response.data;
      table.pagination.totalPages = Math.ceil(response.total / response.take);
      table.loading = false;
      this.setState({ table });
    }, err => {
      table.loading = false;
      this.setState({ table });
      if (err.response.status === 401) {
        MySwal.fire({
          type: "error",
          title: "Unauthorized.",
          toast: true,
          position: "top-end",
          timer: 2000,
          showConfirmButton: false,
          customClass: "swal-height"
        });
      }
    });
  }

  suggestTenants(event) {
    const params = {
      keyword: event.query || null,
      "options.take": 30,
      "options.skip": 0
    };

    this.tenantRestService.getTenants({ params }).subscribe(response => {
      this.setState({
        tenantOptions: response.data
      });
    });
  }

  suggestBank(event) {
    const params = {
      keyword: event.query || null,
      "options.take": 30,
      "options.skip": 0
    };

    this.tenantBankRestService.loadRelatedData({ params }).subscribe(response => {
      this.setState({
        bankOptions: response.bank
      });
    });
  }

  handleOnPageChange(paginationEvent) {
    const table = { ...this.state.table };
    table.loading = true;
    table.pagination.pageSize = paginationEvent.rows;
    table.pagination.skipSize = paginationEvent.first;
    table.pagination.currentPage = paginationEvent.page + 1;

    this.setState({ table }, () => {
      this.loadData();
    });
  }

  actionTemplate(rowData, column) {
    return (
      <div>
        { this.authentication.can(['wallet.tenant_bank.edit']) &&
        <Button
          type="button"
          icon="pi pi-search"
          onClick={() => {
            this.setState({isEdit: true})
            this.editData(rowData)
          }}
          className="p-button-success"
        >
          Edit
        </Button>
        }
      </div>
    );
  }

  editData(data) {
    this.setState({
      oneData: data,
      tenantSelected: data.tenant,
      bankSelected: data.bank,
      bankDistrict: data.district,
      accountNumber: data.accountNumber,
      accountName: data.accountName,
      modalAddBank: true,
    });
  }

  validate() {
    const data = this.state;

    if (data.tenantSelected === null || data.bankSelected === null || data.bankDistrict === "" || data.accountNumber === "" || data.accountName === "") {
      return true;
    } else {
      return false;
    }
  }

  submitData() {
    if(this.validate()) {
      MySwal.fire({
        type: "error",
        title: "Pastikan semua data telah diisi.",
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
        customClass: "swal-height"
      });
    } else {
      this.setState({modalAddBank: false, loading: true});
      const data = this.state;

      const payload = {
        accountName: data.accountName,
        accountNumber: data.accountNumber,
        district: data.bankDistrict,
        description: data.bankSelected.description,
        inactive: false,
        bankId: data.bankSelected.id
      }

      if(!this.state.isEdit) {
        this.tenantBankRestService.submitData(data.tenantSelected.id, payload).subscribe(res => {
            MySwal.fire({
              type: "success",
              title: "Berhasil Tambah Bank.",
              toast: true,
              position: "top-end",
              timer: 2000,
              showConfirmButton: false,
              customClass: "swal-height"
            });

            this.loadData();
            this.setState({loading: false, isEdit: false})
        }, err => {
          MySwal.fire({
            type: "error",
            title:  "Gagal Tambah Bank.",
            toast: true,
            position: "top-end",
            timer: 2000,
            showConfirmButton: false,
            customClass: "swal-height"
          });

          this.loadData();
          this.setState({loading: false, isEdit: false})
        });
      } else {
        this.tenantBankRestService.editData(data.oneData.id, data.oneData.tenant.id, payload).subscribe(res => {
          MySwal.fire({
            type: "success",
            title: "Berhasil Ubah Bank.",
            toast: true,
            position: "top-end",
            timer: 2000,
            showConfirmButton: false,
            customClass: "swal-height"
          });
          this.loadData();

          this.setState({loading: false, isEdit: false})
      }, err => {
        MySwal.fire({
          type: "error",
          title:  "Gagal Ubah Bank.",
          toast: true,
          position: "top-end",
          timer: 2000,
          showConfirmButton: false,
          customClass: "swal-height"
        });
        this.loadData();

        this.setState({loading: false, isEdit: false})
      });
      }
      this.resetData();
    }
  }

  resetData() {
    this.setState({
      tenantSelected: null,
      tenantOptions: null,
      bankSelected: null,
      bankOptions: null,
      bankDistrict: "",
      accountNumber: "",
      accountName: "",
      isEdit: false
    })
  }

  render() {
    return (
      <>
        <Row>
          <Colxx xxs="12">
            <Breadcrumb heading="Tenants Bank" match={this.props.match} />
            <Separator className="mb-5" />
            <div className="card">
              <div className="card-body">
                <div className="row d-flex justify-content-between" style={{marginBottom: 10}}>
                  <div className="col-md-3">
                    <InputGroup>
                      <Input
                        placeholder="Search..."
                        name="search"
                        value={this.state.search}
                        onChange={this.handleInputChange}
                        onKeyPress={event => {
                          if (event.key === "Enter") {
                            this.loadData();
                          }
                        }}
                      />
                      <Button
                        className="default"
                        color="primary"
                        onClick={() => this.loadData()}
                        style={{
                          borderRadius: '0px 6px 6px 0px'
                        }}
                      >
                        <i className="simple-icon-magnifier" />
                      </Button>
                    </InputGroup>
                  </div>
                  { this.authentication.can(['wallet.tenant_bank.create']) &&
                  <div>
                    <Button
                      className="default"
                      color="primary"
                      onClick={() => this.setState({ modalAddBank: true })}
                      style={{
                        borderRadius: 6,
                        marginRight: 14
                      }}
                    >
                      Tambah Tenant Bank
                    </Button>
                  </div>
                  }
                </div>
                <DataTable
                  value={this.state.table.data}
                  className="noheader"
                  lazy={true}
                  responsive={true}
                  resizableColumns={true}
                  columnResizeMode="fit"
                  loading={this.state.table.loading}
                  scrollable={true}
                  scrollHeight="500px"
                >
                  {/*<Column style={{width:'250px'}} field="deliveryDate" header="Seller Name" frozen={true}/>*/}
                  <Column
                    style={{ width: "250px" }}
                    field="tenant.companyInfo.companyName"
                    header="Tenants"
                  />
                  <Column
                    style={{ width: "250px" }}
                    field="accountNumber"
                    header="No Rekening" body={this.columnFormat.emptyColumn}
                  />
                  <Column
                    style={{ width: "250px" }}
                    field="accountName"
                    header="Nama Rekening" body={this.columnFormat.emptyColumn}
                  />
                  <Column
                    style={{ width: "250px" }}
                    field="bank.bankName"
                    header="Bank"
                  />
                  <Column
                    style={{ width: "250px" }}
                    field="district"
                    header="Cabang Bank" body={this.columnFormat.emptyColumn}
                  />
                  <Column
                    style={{ width: "250px" }}
                    header="Action"
                    body={this.actionTemplate}
                  />
                </DataTable>
                <Paginator
                  first={this.state.table.pagination.skipSize}
                  rows={this.state.table.pagination.pageSize}
                  totalRecords={
                    Math.ceil(this.state.table.pagination.totalPages) *
                    this.state.table.pagination.pageSize
                  }
                  onPageChange={this.handleOnPageChange}
                />
              </div>
            </div>
          </Colxx>
        </Row>
        {this.state.loading && <Loading />}

        {this.state.modalAddBank && (
          <Modal isOpen={this.state.modalAddBank} size="lg">
            <ModalHeader>Tambah Tenant Bank</ModalHeader>
            <ModalBody>

              <Table>
                <tbody>
                  <tr>
                    <td>Tenant</td>
                    <td>:</td>
                    <td>
                    {!this.state.isEdit && (
                      <AutoComplete
                        inputStyle={{
                          width: 150
                        }}
                        value={this.state.tenantSelected}
                        suggestions={this.state.tenantOptions}
                        completeMethod={this.suggestTenants}
                        size={30}
                        minLength={1}
                        field="companyInfo.name"
                        dropdown={true}
                        onDropdownClick={this.suggestTenants}
                        onChange={e =>
                          this.setState({ tenantSelected: e.value })
                        }
                      />
                    )}
                    {this.state.isEdit && (
                      <AutoComplete
                        inputStyle={{
                          width: 150
                        }}
                        value={this.state.tenantSelected}
                        suggestions={this.state.tenantOptions}
                        completeMethod={this.suggestTenants}
                        size={30}
                        minLength={1}
                        field="companyInfo.companyName"
                        dropdown={true}
                        onDropdownClick={this.suggestTenants}
                        onChange={e =>
                          this.setState({ tenantSelected: e.value })
                        }
                        disabled
                      />
                    )}
                    </td>
                  </tr>
                  <tr>
                    <td>Nama Bank</td>
                    <td>:</td>
                    <td>
                      <AutoComplete
                        inputStyle={{
                          width: 150
                        }}
                        value={this.state.bankSelected}
                        suggestions={this.state.bankOptions}
                        completeMethod={this.suggestBank}
                        size={30}
                        minLength={1}
                        field="bankName"
                        dropdown={true}
                        onDropdownClick={this.suggestBank}
                        onChange={e =>
                          this.setState({ bankSelected: e.value })
                        }
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Cabang Kota / Kabupaten</td>
                    <td>:</td>
                    <td>
                      <InputText
                        value={this.state.bankDistrict}
                        onChange={e =>
                          this.setState({ bankDistrict: e.target.value })
                        }
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>No Rekening</td>
                    <td>:</td>
                    <td>
                      <InputText
                        keyfilter="pint"
                        value={this.state.accountNumber}
                        onChange={e =>
                          this.setState({ accountNumber: e.target.value })
                        }
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Nama Rekening</td>
                    <td>:</td>
                    <td>
                      <InputText
                        value={this.state.accountName}
                        onChange={e =>
                          this.setState({ accountName: e.target.value })
                        }
                      />
                    </td>
                  </tr>
                </tbody>
              </Table>
            </ModalBody>
            <ModalFooter>
            <Button
              color="primary"
              onClick={() => this.submitData()}
              style={{
                borderRadius: 6
              }}
            >
              Simpan
            </Button>
              <Button
                color="primary"
                outline
                onClick={() => {
                  this.resetData();
                  this.setState({ isEdit: false, modalAddBank: false });
                }}
                style={{
                  borderRadius: 6
                }}
              >
                Close
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </>
    );
  }
}
