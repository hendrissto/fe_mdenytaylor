import React, { Component } from "react";
import {
  Row,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  Form,
  Input,
  InputGroup
} from "reactstrap";
import { Formik } from "formik";
import * as _ from "lodash";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import Breadcrumb from "../../../containers/navs/Breadcrumb";
import { InputText } from 'primereact/inputtext';
import Loading from "../../../containers/pages/Spinner";

import { DataTable } from "primereact/datatable";
import { Paginator } from "primereact/paginator";
import { Column } from "primereact/column";
import randomstring from "randomstring";

import { forkJoin, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { MessageParserService } from '../../../api/common/messageParserService';
import UsersRestService from "../../../api/usersRestService";

import validation from "./validation";
import * as css from "../../base/baseCss";
import Swal from "sweetalert2";
import "./user.scss";
import withReactContent from "sweetalert2-react-content";
const MySwal = withReactContent(Swal);

export default class Users extends Component {
  constructor(props) {
    super(props);
    this.userRestService = new UsersRestService();
    this.messageParserService = new MessageParserService();
    this.loadData = this.loadData.bind(this);
    this.submitData = this.submitData.bind(this);
    this.resetData = this.resetData.bind(this);
    this.editData = this.editData.bind(this);
    this.actionTemplate = this.actionTemplate.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleOnPageChange = this.handleOnPageChange.bind(this);

    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      nationalPhoneNumber: null,
      roles: [],
      selectedRoles: [],
      userName: '',
      loading: false,
      modalAddUsers: false,
      search: "",
      isEdit: false,
      doc: null,
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
    forkJoin(
      this.loadData(),
      this.loadRolesData(),
    ).pipe(
      catchError((error) => {
        this.setState({
          loading: false
        });
        MySwal.fire({
          type: "error",
          title: error.response.data[0] ? error.response.data[0].errorMessage : 'Tidak diketahui',
          toast: true,
          position: "top-end",
          timer: 2000,
          showConfirmButton: false,
          customClass: "swal-height"
        });
        return throwError(error);
      })
    ).subscribe();
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

    return this.userRestService.loadDataUsers({ params })
      .pipe(tap((response) => {
        response.data.forEach(user => {
          user.listRole = user.accessRoleAdmin.map((data, i) => {
            return data.roleName;
          });
        })
        const table = { ...this.state.table };
        table.data = response.data;
        table.pagination.totalPages = Math.ceil(response.total / response.take);
        table.loading = false;
        this.setState({ table });
      }));
  }

  loadRolesData() {
    const table = { ...this.state.table };
    table.loading = true;
    this.setState({ table });

    const params = {
      keyword: this.state.search || null,
      "options.take": this.state.table.pagination.pageSize,
      "options.skip": this.state.table.pagination.skipSize,
      "options.includeTotalCount": true
    };
    return this.userRestService.loadDataRoles({ params }).pipe(tap((response) => {
      this.setState({ roles: response.data });
    }));
  }


  handleOnPageChange(paginationEvent) {
    const table = { ...this.state.table };
    table.loading = true;
    table.pagination.pageSize = paginationEvent.rows;
    table.pagination.skipSize = paginationEvent.first;
    table.pagination.currentPage = paginationEvent.page + 1;

    this.setState({ table }, () => {
      this.loadData().subscribe();
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
    this.userRestService.getUser(data.id)
      .subscribe((data) => {
        let selectedRoles = [];
        this.state.roles.forEach(rolesMaster => {
          data.accessRoleAdmin.forEach(role => {
            if (rolesMaster.id === role.roleId) {
              selectedRoles = [...selectedRoles, rolesMaster];
            }
          })
        });

        const {
          firstName,
          lastName,
          email,
          nationalPhoneNumber,
          accessRolesAdmin,
          userName
        } = data;

        this.setState({
          selectedRoles,
          doc: data,
          firstName,
          lastName,
          email,
          nationalPhoneNumber,
          accessRolesAdmin,
          userName,
          modalAddUsers: true,
        });
      });
  }

  formIsValid() {
    const data = this.state;
    if (!data.selectedRoles.length) {
      MySwal.fire({
        type: "error",
        title: "Mohon pilih minimal 1 role.",
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
        customClass: "swal-height"
      });
      return false;
    } else {
      return true;
    }
  }

  submitData(formValue) {
    if (formValue && this.formIsValid()) {
      const {
        firstName,
        lastName,
        email,
        password,
        nationalPhoneNumber,
        userName,
      } = formValue;

      const roleIds = this.state.selectedRoles.map(data => data.id);
      let payload = {
        accessRolesAdmin: roleIds,
        firstName,
        lastName,
        email,
        nationalPhoneNumber: Number(nationalPhoneNumber),
        phoneNumberCountryId: "id",
        userName
      }

      this.setState({ loading: true, modalAddUsers: false });
      if (!this.state.isEdit) {
        payload = { ...payload, password };
        this.userRestService.createUsers(payload).subscribe(res => {
          MySwal.fire({
            type: "success",
            title: "Berhasil Menambahkan User.",
            toast: true,
            position: "top-end",
            timer: 2000,
            showConfirmButton: false,
            customClass: "swal-height"
          });

          this.loadData().subscribe();
          this.setState({ modalAddUsers: false, loading: false, isEdit: false })
          this.resetData();
        }, err => {
          const message = this.messageParserService.parse(err.data) || 'Gagal menambahkan User';

          MySwal.fire({
            type: "error",
            title: message[0],
            toast: true,
            position: "top-end",
            timer: 2000,
            showConfirmButton: false,
            customClass: "swal-height"
          });
          this.restoreForm({...formValue, selectedRoles: this.state.selectedRoles})

          this.setState({ loading: false, modalAddUsers: true, isEdit: false })
        });
      } else {
        payload = {
          ...payload,
          id: this.state.doc.id,
          // "dateOfBirth": "2020-06-12T14:43:27.551Z",
          // "gender": "",
        };
        this.userRestService.updateUsers(payload).subscribe(res => {
          MySwal.fire({
            type: "success",
            title: "Berhasil Ubah User.",
            toast: true,
            position: "top-end",
            timer: 2000,
            showConfirmButton: false,
            customClass: "swal-height"
          });
          this.loadData().subscribe();
          this.setState({ modalAddUsers: false, loading: false, isEdit: false });
          this.resetData();
        }, err => {
          const message = this.messageParserService.parse(err.data) || 'Gagal mengubah User';

          MySwal.fire({
            type: "error",
            title: message[0],
            toast: true,
            position: "top-end",
            timer: 2000,
            showConfirmButton: false,
            customClass: "swal-height"
          });
          this.restoreForm({...formValue, selectedRoles: this.state.selectedRoles})

          this.setState({ loading: false, modalAddUsers: true })
        });
      }
    }
  }

  resetData() {
    this.setState({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      nationalPhoneNumber: null,
      selectedRoles: [],
      userName: '',
    })
  }

  restoreForm({ firstName,
    lastName,
    email,
    password,
    nationalPhoneNumber,
    userName, selectedRoles}) {
    this.setState(
      {
        firstName,
        lastName,
        email,
        password,
        nationalPhoneNumber,
        userName,
        selectedRoles
      }
    )
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
                            this.loadData().subscribe();
                          }
                        }}
                      />
                      <Button
                        className="default"
                        color="primary"
                        onClick={() => this.loadData().subscribe()}
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
                      onClick={() => this.setState({
                        modalAddUsers: true, password: randomstring.generate({
                          length: 15,
                          charset: 'alphabetic'
                        })
                      })}
                      style={{
                        borderRadius: 6,
                        marginRight: 14
                      }}
                    >
                      Tambah User
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
                    style={{ width: "250px" }}
                    field="fullName"
                    header="Nama"
                    className="text-left"
                  />
                  <Column
                    style={{ width: "250px" }}
                    field="email"
                    header="Email"
                    className="text-left"
                  />
                  <Column
                    style={{ width: "250px" }}
                    field="nationalPhoneNumber"
                    header="Nomor"
                    className="text-left"
                  />
                  <Column
                    style={{ width: "250px" }}
                    field="listRole"
                    header="Roles"
                    className="text-left"
                  />
                  <Column
                    style={{ width: "250px" }}
                    header=""
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

        {this.state.modalAddUsers && (
          <Modal isOpen={this.state.modalAddUsers} size="lg">
            <ModalHeader>{this.state.isEdit ? 'Ubah' : 'Tambah'} User</ModalHeader>
            <Formik
                initialValues = {{
                  firstName: this.state.firstName,
                  lastName:  this.state.lastName,
                  email:  this.state.email,
                  password:  this.state.password,
                  nationalPhoneNumber:  this.state.nationalPhoneNumber,
                  userName:  this.state.userName,
                }}
                onSubmit={this.submitData}
                validationSchema={validation}
              >
                {props => (
                <form onSubmit={props.handleSubmit}>
                <ModalBody>
                  <Table>
                    <tbody>
                      <tr>
                        <td colSpan={3}>UserName</td>
                        <td>:</td>
                        <td colSpan={1}>
                          <InputText
                            name="userName"
                            type="text"
                            value={props.values.userName}
                            onChange={props.handleChange}
                          />
                          <p style={css.style.required}>{props.errors && props.touched
                            ? props.errors.userName
                            : null}</p>
                        </td>
                        <td colSpan={2}>Email</td>
                        <td>:</td>
                        <td colSpan={2}>
                          <InputText
                            name="email"
                            type="email"
                            value={props.values.email}
                            onChange={props.handleChange}
                          />

                          <p style={css.style.required}>{props.errors && props.touched
                            ? props.errors.email
                            : null}</p>
                        </td>
                      </tr>

                      <tr>
                        <td colSpan={3}>Nama Awal</td>
                        <td>:</td>
                        <td colSpan={1}>
                          <InputText

                            name="firstName"
                            type="text"
                            value={props.values.firstName}
                            onChange={props.handleChange}
                          />

                          <p style={css.style.required}>{props.errors && props.touched
                            ? props.errors.firstName
                            : null}</p>
                        </td>
                        <td colSpan={2}>Nama Akhir</td>
                        <td>:</td>
                        <td colSpan={2}>
                          <InputText

                            name="lastName"
                            type="text"
                            value={props.values.lastName}
                            onChange={props.handleChange}
                          />
                          <p style={css.style.required}>{props.errors.lastName && props.touched
                            ? props.errors.lastName
                            : null}</p>
                        </td>
                      </tr>

                      <tr>
                        <td colSpan={3}>Nomor</td>
                        <td>:</td>
                        <td colSpan={this.state.isEdit ? 6 : 1}>
                          <InputText

                            name="nationalPhoneNumber"
                            type="text"
                            value={props.values.nationalPhoneNumber}
                            onChange={props.handleChange}
                           />
                          <p style={css.style.required}>{props.errors && props.touched
                            ? props.errors.nationalPhoneNumber
                            : null}</p>
                        </td>
                        {!this.state.isEdit &&
                          <>
                            <td colSpan={2}>Password</td>
                            <td>:</td>
                            <td colSpan={2}>
                              <InputText
                                readOnly
                                name="password"
                                type="text"
                                value={props.values.password}
                              />
                            </td>
                          </>
                        }
                      </tr>

                      <tr>
                        <td colSpan={2}>Roles</td>
                        <td>:</td>
                        <td colSpan={6}>
                          <DataTable value={this.state.roles} className="user-table"
                            selection={this.state.selectedRoles} onSelectionChange={e => this.setState({ selectedRoles: e.value })}>
                            <Column selectionMode="multiple" style={{ width: '3em' }} />
                            <Column field="name" header="Nama" />
                            <Column field="description" header="Deskripsi" />
                          </DataTable>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
              </ModalBody>
                <ModalFooter>
                  <Button
                      color="primary"
                      type="submit"
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
                      this.setState({ isEdit: false, modalAddUsers: false });
                    }}
                    style={{
                      borderRadius: 6
                    }}
                  >
                  Close
                </Button>
                </ModalFooter>
              </form>
            )}
            </Formik>
          </Modal>
        )}
      </>
    );
  }
}