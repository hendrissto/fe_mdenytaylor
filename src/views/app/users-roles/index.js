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
const MySwal = withReactContent(Swal);

export default class UserRoles extends Component {
    constructor(props) {
        super(props);
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
        this.isPermissionSelected = this.isPermissionSelected.bind(this);
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

    onSelectedPermission(e) {
        let uniqBy = [];
        this.setState({
            tempPerm: e.value
        });
        if (e.value.id) {
            this.state.permissions.push(e.value);
            uniqBy = _.uniqBy(this.state.permissions, 'id');
            this.setState({
                permissions: uniqBy,
                tempPerm: null
            });
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
            permissionOpts: suggestions,
        })
    }

    loadRelatedData() {
        this.userRestService.loadRelated()
            .subscribe(response => {
                if (response.accessPermissions) {
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
        let newPerms = [];
        this.userRestService.getSingleRole(data.id)
            .subscribe((data) => {
                data.permissionRoles.forEach(perm => {
                    const newPerm = {
                        id: perm.permissionId,
                        name: perm.permission.name
                    }
                    newPerms.push(newPerm)
                });

                data.permissionRoles = newPerms;
                this.setState({
                    rowVersion: data.rowVersion,
                    oneData: data,
                    permissions: data.permissionRoles,
                    rolesName: data.name,
                    description: data.description,
                    modalAddRoles: true,
                });
            });
    }

    validate() {
        const data = this.state;

        if (!data.permissions.length || !data.rolesName) {
            return true;
        } else {
            return false;
        }
    }

    submitData() {
        if (this.validate()) {
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
            this.setState({ modalAddRoles: false, loading: true });
            const data = this.state;
            const permissionIds = [];
            data.permissions.forEach(perm => {
                permissionIds.push(perm.id)
            });
            const payload = {
                name: data.rolesName,
                description: data.description,
                permissionIds: permissionIds,
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

    isPermissionSelected() {
        const data = [];

        const permission = this.state.permissions;
        if (permission.length) {
            for (let i = 0; i < permission.length; i++) {
                data.push(
                    <tr key={`${permission[i].id}`}>
                        <td colSpan={3}></td>
                        <td>{permission[i].name}</td>
                        <td>
                            <a
                                href
                                className="text-danger"
                                style={{ cursor: "pointer" }}
                                onClick={() => this.rmPermissionSelected(i)}>
                                Hapus
                            </a>
                        </td>
                    </tr>
                );
            }
        }
        return data;
    }

    rmPermissionSelected(i) {
        let permissions = [...this.state.permissions];
        permissions.splice(i, 1);

        this.setState({
            permissions
        });
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
                                    <Column
                                        style={{ width: "15%", verticalAlign: "top" }}
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
                                        <td colSpan={2}>Permissions</td>
                                        <td>:</td>
                                        <td colSpan={2}>
                                            <AutoComplete
                                                inputStyle={{
                                                    width: 150
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
                                            />
                                        </td>
                                    </tr>
                                    {this.state.permissions && (
                                        this.isPermissionSelected()
                                    )
                                    }
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
