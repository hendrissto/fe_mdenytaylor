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
import * as _ from "lodash";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import Breadcrumb from "../../../containers/navs/Breadcrumb";
import { InputText } from 'primereact/inputtext';
import { AutoComplete } from 'primereact/autocomplete';
import { MultiSelect } from 'primereact/multiselect';
import Loading from "../../../containers/pages/Spinner";

import { DataTable } from "primereact/datatable";
import { Paginator } from "primereact/paginator";
import { Column } from "primereact/column";
import UsersRestService from "../../../api/usersRestService";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { ColumnFormat } from "../../../services/Format/ColumnFormat";
import { AclService } from "../../../services/auth/AclService";

import './users-roles.scss'
const MySwal = withReactContent(Swal);

export default class UserRoles extends Component {
    constructor(props) {
        super(props);
        this.acl = new AclService();
        this.userRestService = new UsersRestService();
        this.loadData = this.loadData.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.suggestPermissions = this.suggestPermissions.bind(this);
        this.submitData = this.submitData.bind(this);
        this.resetData = this.resetData.bind(this);
        this.editData = this.editData.bind(this);
        this.actionTemplate = this.actionTemplate.bind(this);
        this.columnFormat = new ColumnFormat();
        this.handleOnPageChange = this.handleOnPageChange.bind(this);
        this.onSelectedPermission = this.onSelectedPermission.bind(this);
        // this.isPermissionSelected = this.isPermissionSelected.bind(this);
        this.rmPermissionSelected = this.rmPermissionSelected.bind(this);
        this.loadRelatedData = this.loadRelatedData.bind(this);

        this.state = {
            loading: false,
            modalAddRoles: false,
            permissionOptions: null,
            permissionOpts: null,
            rolesName: "",
            permissions: [],
            description: null,
            tempPerm: null,
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

    onSelectedPermission(data) {
      if(_.get(data.value, 'menu')) {
        this.setState({
          tempPerm: null
        });
        return;
      }
      if (data) {
          const doc = data.value || data.permission;

          const parent = _.filter(this.state.permissionOptions, permissionOption => {
              return (_.startsWith(permissionOption.description, 'View') && permissionOption.permissionSubGroup === doc.permissionSubGroup)
          })[0];

          this.setState({
            tempPerm: doc
          });

          if (doc.id) {
              const permissions = this.state.permissions;
              const perm = {
                parent: parent,
                children: [doc],
                isValid: (doc.id === parent.id)
              }

              if (this.state.permissions.length) {

                  const permissionsExist = _.findIndex(permissions, ['parent.permissionSubGroup', parent.permissionSubGroup]);
                  if (permissions[permissionsExist]) {
                      permissions[permissionsExist].children.push(doc)
                      permissions[permissionsExist].children = _.uniqBy(permissions[permissionsExist].children, 'id');
                      if(!permissions[permissionsExist].isValid) {
                        permissions[permissionsExist].isValid = (doc.id === parent.id);
                      }

                  } else {
                      permissions.push(perm)
                      permissions.isValid = false;
                  }

              } else {
                  permissions.push(perm)
              }

              this.setState({
                  permissions: permissions,
                  tempPerm: null
              });

          }

      }
    }

    componentDidMount() {
        this.loadData();
        this.loadRelatedData();
    }


    loadData() {
        const table = { ...this.state.table };
        table.loading = true;
        this.setState({ table });

        const params = {
            "keyword": this.state.search || null,
            "options.take": this.state.table.pagination.pageSize,
            "options.skip": this.state.table.pagination.skipSize,
            "options.includeTotalCount": true
        };

        this.userRestService.loadDataRoles({ params }).subscribe(response => {
            response.data.forEach((doc, i) => {
                let listRoles = [];
                doc.permissionRoles.forEach(permissionRole => {
                    listRoles.push(permissionRole.permission.name);
                });
                response.data[i].listRoles = listRoles.toString().replace(/,/g, ', ')
            });

            const table = { ...this.state.table };
            table.data = response.data;
            table.pagination.totalPages = Math.ceil(response.total / response.take);
            table.loading = false;
            this.setState({ table });
        }, err => {
            table.loading = false;
            this.setState({ table });
            if (err.response.status === 401) {
                this.setState({ redirect: true });
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

    suggestPermissions(event, searchKey) {
        let record = this.state.permissionOptions;

        let query = event.query;
        record = _.castArray(record);
        searchKey = _.castArray(searchKey);
        let suggestions = record.filter(value => {
            const regEx = new RegExp(query, 'ig');
            return _.filter(searchKey, key => {
                const valueString = _.toString(_.get(value, key, ''));
                return regEx.test(valueString);
            }).length;
        });

        this.setState({
            permissionOpts: this.buildNestedPermission(suggestions),
        })
    }

    buildNestedPermission(suggestions) {
      let permissionGroup = '';

      _.map(suggestions, (permission, indexPermission) => {

        if (permission.permissionGroup !== permissionGroup) {

          permissionGroup = permission.permissionGroup;
          suggestions.splice(indexPermission, 0, {
            menu: permissionGroup
          });
        }
      });
      return suggestions;
    }

    loadRelatedData() {
      this.userRestService.loadRelated()
          .subscribe(response => {
              if (response.accessPermissions) {
                const ignorePermissions = [
                  'cod.cod_list.view',
                  'cod.cod_list.create',
                  'cod.cod_list.edit',
                  'cod.cod_list.delete',

                  // transfer_credit
                  'cod.transfer_credit.update',
                  'cod.transfer_credit.delete',


                  // tenant_bank
                  'wallet.tenant_bank.delete',

                  // tenant_wallet
                  'wallet.tenant_wallet.delete',

                  // withdrawal_history
                  'wallet.withdrawal_history.delete',

                  // tenant_list
                  'tenant.tenant_list.create',
                  'tenant.tenant_list.delete',

                  // subscription
                  'tenant.subscription.create',
                  'tenant.subscription.delete',

                  // role_admin
                  'admin.role_admin.delete',

                  // permission_admin
                  'admin.permission_admin.create',
                  'admin.permission_admin.edit',
                  'admin.permission_admin.delete'];
                response.accessPermissions = _.filter(response.accessPermissions, permission => {

                  return !_.includes(ignorePermissions, permission.id);
                });

                this.setState({
                    permissionOptions: response.accessPermissions,
                })
              }
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
                <Button
                    type="button"
                    icon="pi pi-search"
                    onClick={() => {
                        this.setState({ isEdit: true })
                        this.editData(rowData)
                    }}
                    className="p-button-success">
                    Edit
                </Button>
            </div>
        );
    }

    editData(data) {
        this.userRestService.getSingleRole(data.id)
            .subscribe((data) => {
                data.permissionRoles.forEach(perm => {
                  // this.buildNestedPermission(this.state.permissionOptions);

                  this.onSelectedPermission(perm);
                });

                this.setState({
                    rowVersion: data.rowVersion,
                    oneData: data,
                    rolesName: data.name,
                    description: data.description,
                    modalAddRoles: true,
                });
            });
    }

    validate() {
        const data = this.state;
        let invalids = [];
        if (data.permissions.length) {
            invalids = _.filter(data.permissions, permissionOption => {
                return !permissionOption.isValid
            });


        }
        if (!data.permissions.length || !data.rolesName || invalids.length) {
            return true;
        } else {
            return false;
        }
    }

    submitData() {
        if (this.validate()) {
            MySwal.fire({
                type: "error",
                title: "Pastikan semua data telah diisi dan memenuhi syarat.",
                toast: true,
                position: "top-end",
                timer: 2000,
                showConfirmButton: false,
                customClass: "swal-height"
            });
        } else {
            this.setState({ modalAddRoles: false, loading: true });
            const data = this.state;
            const permissions = [];
            data.permissions.forEach(perm => {
                perm.children.forEach(child => {
                    const permission = {
                        id: child.id,
                        sortOrder: child.sortOrder
                    }
                    permissions.push(permission)
                });
            });
            const payload = {
                name: data.rolesName,
                description: data.description,
                permissions: permissions,
                rowVersion: data.isEdit ? data.rowVersion : '',
            }

            if (!this.state.isEdit) {
                this.userRestService.createRoles(payload).subscribe(res => {
                    MySwal.fire({
                        type: "success",
                        title: "Berhasil Tambah Role.",
                        toast: true,
                        position: "top-end",
                        timer: 2000,
                        showConfirmButton: false,
                        customClass: "swal-height"
                    });

                    this.loadData();
                    this.setState({ loading: false, isEdit: false })
                }, err => {
                    MySwal.fire({
                        type: "error",
                        title: "Gagal Tambah Role.",
                        toast: true,
                        position: "top-end",
                        timer: 2000,
                        showConfirmButton: false,
                        customClass: "swal-height"
                    });

                    this.loadData();
                    this.setState({ loading: false, isEdit: false })
                });
            } else {
                this.userRestService.updateRoles(data.oneData.id, payload).subscribe(res => {
                    MySwal.fire({
                        type: "success",
                        title: "Berhasil Ubah Role.",
                        toast: true,
                        position: "top-end",
                        timer: 2000,
                        showConfirmButton: false,
                        customClass: "swal-height"
                    });
                    this.loadData();

                    this.setState({ loading: false, isEdit: false })
                }, err => {
                    MySwal.fire({
                        type: "error",
                        title: "Gagal Ubah Role.",
                        toast: true,
                        position: "top-end",
                        timer: 2000,
                        showConfirmButton: false,
                        customClass: "swal-height"
                    });
                    this.loadData();

                    this.setState({ loading: false, isEdit: false })
                });
            }
            this.resetData();
        }
    }

    resetData() {
        this.setState({
            tempPerm: null,
            permissions: [],
            description: null,
            rolesName: null,
            isEdit: false
        })
    }

    rmPermissionSelected(i, idx) {
        let permissions = [...this.state.permissions];
        if (_.startsWith(permissions[i].children[idx].name, 'View')) {
            permissions[i].isValid = false;
        }
        if (permissions[i].children.length <= 1) {
            permissions.splice(i, 1);
        } else {
            permissions[i].children.splice(idx, 1);
        }
        this.setState({
            permissions
        });
    }

    itemTemplate(item) {
      return (
        <>
          { item.menu &&
        <div className="label-option option p-clearfix" style={{ }}>
            <strong >{_.upperCase(item.menu)}</strong>
        </div>
          }
          { !item.menu &&
        <div className="p-clearfix option">
            <span>
              <strong>{_.startCase(item.permissionSubGroup)}:</strong> <span style={{fontSize: '13px'}}>{item.name}</span>
            </span>
        </div>
          }
        </>
      );
    }


    render() {
        return (
            <>
                <Row>
                    <Colxx xxs="12">
                        <Breadcrumb heading="User Admin" match={this.props.match} />
                        <Separator className="mb-5" />
                        <div className="card">
                            <div className="card-body">
                                <div className="row d-flex justify-content-between" style={{ marginBottom: 10 }}>
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
                                    { this.acl.can(['admin.role_admin.create']) &&
                                    <div>
                                        <Button
                                            className="default"
                                            color="primary"
                                            onClick={() => this.setState({ modalAddRoles: true })}
                                            style={{
                                                borderRadius: 6,
                                                marginRight: 14
                                            }}
                                        >
                                            Tambah User Roles
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
                                        style={{ "width": "20%", "verticalAlign": "top" }}
                                        field="name"
                                        header="Nama"
                                        className="text-left"

                                    />
                                    <Column
                                        style={{ "width": "60%", "verticalAlign": "top" }}
                                        field="listRoles"
                                        header="Permissions"
                                        className="text-left"

                                    />
                                    <Column
                                        style={{ "width": "20%", "verticalAlign": "top" }}
                                        field="description"
                                        header="Deskripsi"
                                        className="text-left"
                                    />
                                    { this.acl.can(['admin.role_admin.edit']) &&
                                    <Column
                                        style={{ width: "15%", verticalAlign: "top" }}
                                        header="Action"
                                        body={this.actionTemplate}
                                    />
                                    }
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

                {(this.state.modalAddRoles && this.state.permissionOptions) && (
                    <Modal isOpen={this.state.modalAddRoles} size="lg">
                        <ModalHeader>Tambah Roles</ModalHeader>
                        <ModalBody>

                            <Table>
                                <tbody>
                                    <tr>
                                        <td colSpan={2}>Name</td>
                                        <td>:</td>
                                        <td colSpan={2}>
                                            <InputText
                                                value={this.state.rolesName}
                                                onChange={e =>
                                                    this.setState({ rolesName: e.target.value })
                                                }
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2}>Permission</td>
                                        <td>:</td>
                                        <td colSpan={2}>


                                            <AutoComplete
                                                inputStyle={{
                                                    width: 350
                                                }}
                                                value={this.state.tempPerm}
                                                suggestions={this.state.permissionOpts}
                                                completeMethod={(e) => this.suggestPermissions(e, ['name'])}
                                                size={30}
                                                minLength={1}
                                                field="name"
                                                dropdown={true}
                                                onDropdownClick={(e) => this.suggestPermissions(e, ['name'])}
                                                onChange={this.onSelectedPermission}
                                                itemTemplate={this.itemTemplate}
                                            />
                                        </td>
                                    </tr>
                                    {this.state.permissions && (
                                        this.state.permissions.map((permission, i) => {
                                            return (
                                                <>
                                                    <tr>
                                                        <td colSpan={3}></td>
                                                        <td>
                                                            <div className="mb-3">
                                                                <label className="mr-2 title">
                                                                  <strong style={{fontSize: '15px'}}>Menu {_.startCase(permission.parent.permissionGroup)} > </strong> <span style={{fontSize: '13px'}}>{_.startCase(permission.parent.permissionSubGroup)}</span>
                                                                </label>

                                                                <span className={permission.isValid ? 'alert-roles success' : 'alert-roles warning'}>
                                                                    {permission.isValid ? 'Pilihan permissions sudah memenuhi syarat' : `Wajib memilih "View ${_.startCase(permission.parent.permissionSubGroup)}" terlebih dahulu`}
                                                                </span>
                                                            </div>
                                                            <ul className="mt-2">
                                                                {
                                                                    permission.children.map((child, idx) => {
                                                                        return (
                                                                            <>
                                                                                <li class="mb-2">
                                                                                    <label className="mr-2" style={{ width: '160px' }}>
                                                                                        {child.name}
                                                                                    </label>
                                                                                    <a className="text-danger text-right trash"
                                                                                        onClick={() => this.rmPermissionSelected(i, idx)}>
                                                                                        <img src="/assets/img/icon/trash.svg" alt="Hapus" />
                                                                                    </a>
                                                                                </li>
                                                                            </>
                                                                        )
                                                                    })
                                                                }
                                                            </ul>
                                                        </td>
                                                    </tr>
                                                </>
                                            )
                                        })
                                    )}
                                    <tr>
                                        <td colSpan={2}>Deskripsi</td>
                                        <td>:</td>
                                        <td colSpan={2}>
                                            <InputText
                                                value={this.state.description}
                                                onChange={e =>
                                                    this.setState({ description: e.target.value })
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
                                    this.setState({ isEdit: false, modalAddRoles: false });
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
