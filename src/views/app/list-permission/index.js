import React, { Component } from "react";
import {
    Col,
    Row,
    Button,
    Input,
    InputGroup
} from "reactstrap";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import Breadcrumb from "../../../containers/navs/Breadcrumb";
import ModalComponent from "../../../components/shared/modal.js";
import Loading from "../../../containers/pages/Spinner";

import { DataTable } from "primereact/datatable";
import { Paginator } from "primereact/paginator";
import { Column } from "primereact/column";
import UsersRestService from "../../../api/usersRestService";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { ColumnFormat } from "../../../services/Format/ColumnFormat";
const MySwal = withReactContent(Swal);

export default class ListPermission extends Component {
    constructor(props) {
        super(props);
        this.userRestService = new UsersRestService();
        this.loadData = this.loadData.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.actionTemplate = this.actionTemplate.bind(this);
        this.columnFormat = new ColumnFormat();
        this.handleOnPageChange = this.handleOnPageChange.bind(this);

        this.state = {
            loading: false,
            permissions: [],
            description: null,
            search: "",
            isDetail: false,
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
            dataModal: {
                header: "",
                body: "",
                footer: ""
            },
            modal: false,
            modalTransactions: false,

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
        this.loadData();
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

        this.userRestService.loadDataPermissions({ params }).subscribe(response => {
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

    // Action template
    actionTemplate(rowData, column) {
        return (
            <div>
                <Button
                    type="button"
                    icon="pi pi-search"
                    onClick={() => {
                        this.ModalDetailPermission(rowData)
                    }}
                    className="p-button-success">
                    Detail
                </Button>
            </div>
        );
    }

    // Modal detail permission
    ModalDetailPermission(data) {
        const dataModal = this.state.dataModal;

        dataModal.header = `Permission`;
        dataModal.body = (
            <div>
                <Row>
                    <Col xs="5"> Id Permission </Col>
                    <Col xs="1">:</Col>
                    <Col> {data.id} </Col>
                </Row>
                <Row>
                    <Col xs="5"> Group </Col>
                    <Col xs="1">:</Col>
                    <Col> {data.permissionGroup} </Col>
                </Row>
                <Row>
                    <Col xs="5"> Sub Group </Col>
                    <Col xs="1">:</Col>
                    <Col> {data.permissionSubGroup} </Col>
                </Row>
                <Row>
                    <Col xs="5"> Nama </Col>
                    <Col xs="1">:</Col>
                    <Col> {data.name} </Col>
                </Row>
                <Row>
                    <Col xs="5"> Deskripsi </Col>
                    <Col xs="1">:</Col>
                    <Col> {data.description} </Col>
                </Row>
            </div>
        );
        dataModal.footer = (
            <div>
                <Button
                    className="default btn-search"
                    color="primary"
                    style={{
                        borderRadius: 6
                    }}
                >
                    Close
            </Button>
            </div>
        );

        this.setState({ dataModal, modal: true });
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
                                        style={{ width: "200px" }}
                                        field="permissionGroup"
                                        header="Group"
                                        className="text-left"
                                    />
                                    <Column
                                        style={{ width: "200px" }}
                                        field="permissionSubGroup"
                                        header="Sub Group"
                                        className="text-left"
                                    />
                                    <Column
                                        style={{ width: "200px" }}
                                        field="name"
                                        header="Nama"
                                        className="text-left"
                                    />
                                    <Column
                                        style={{ width: "200px" }}
                                        field="description"
                                        header="Deskripsi"
                                        className="text-left"
                                    />
                                    <Column
                                        style={{ width: "200px" }}
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
                {this.state.modal && (
                    <div>
                        <ModalComponent
                            header={this.state.dataModal.header}
                            body={this.state.dataModal.body}
                            footer={this.state.dataModal.footer}
                            close={() => {
                                this.setState({ modal: false });
                            }}
                        />
                    </div>
                )}
            </>
        );
    }
}
