import React, { Component } from "react";
import {
    Row,
    Card,
    CardBody,
    Button,
    Input,
    InputGroup,
} from "reactstrap";
import { Paginator } from "primereact/paginator";
import { Redirect } from "react-router-dom";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import Breadcrumb from "../../../containers/navs/Breadcrumb";
import MonitoringPickupRestService from "../../../api/monitoringPickupRestService";
import Spinner from "../../../containers/pages/Spinner";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { ColumnFormat } from "../../../services/Format/ColumnFormat";
const MySwal = withReactContent(Swal);

class MonitoringPickup extends Component {
    constructor(props) {
        super(props);
        this.monitoringPickupRestService = new MonitoringPickupRestService();
        this.handleOnPageChange = this.handleOnPageChange.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.columnFormat = new ColumnFormat();

        this.state = {
            error: false,
            loadingSubmit: false,
            spinner: false,
            loading: false,
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
            errorData: "",
            oneData: null,
            redirect: false,
            search: "",
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

    handleFilterChange(event) {
        const target = event.target;
        const value = target.checked;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    componentDidMount() {
        this.loadData();
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

        this.monitoringPickupRestService.getListData({ params }).subscribe(response => {
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
        });
    }

    dataTable() {
        return [
            {
                Header: "Id",
                accessor: "id",
                show: false,
                Cell: props => <p>{props.value}</p>
            },
            {
                Header: "Tanggal Transaksi",
                accessor: "transactionDate",
                show: this.state.transactionDate,
                Cell: props => <p>{props.value === null ? "-" : props.value}</p>
            },
            {
                Header: "No Transaksi",
                accessor: "transactionNumber",
                show: this.state.transactionNumber,
                Cell: props => <p>{props.value}</p>
            },
            {
                Header: "Kurir",
                accessor: "shippingCourierChannelId",
                show: this.state.shippingCourierChannelId,
                Cell: props => <p>{props.value}</p>
            },
            {
                Header: "Layanan",
                accessor: "shippingCourierProduct",
                show: this.state.shippingCourierProduct,
                Cell: props => <p>{props.value}</p>
            },
            {
                Header: "No Resi",
                accessor: "shippingTrackingNumber",
                show: this.state.shippingTrackingNumber,
                Cell: props => <p>{props.value}</p>
            },
            {
                Header: "Tipe Transaksi",
                accessor: "transactionType",
                show: this.state.transactionType,
                Cell: props => <p>{props.value}</p>
            },
            {
                Header: "Status Pengiriman",
                accessor: "shipmentStatus",
                show: this.state.shipmentStatus,
                Cell: props => <p>{props.value}</p>
            },
            {
                Header: "Berhasil",
                accessor: "isSuccess",
                show: this.state.isSuccess,
                Cell: props => <p>{props.value}</p>
            },
            {
                Header: "Update Terakhir",
                accessor: "lastAttempDateTimeUtc",
                show: this.state.lastAttempDateTimeUtc,
                Cell: props => <p>{props.value}</p>
            },
        ];
    }

    render() {
        if (this.state.redirect === true) {
            this.setState({ redirect: false });
            return <Redirect to="/user/login" />;
        }
        return (
            <>
                <Row>
                    <Colxx xxs={12}>
                        <Breadcrumb heading="Monitoring Pickup" match={this.props.match} />
                        <Separator className="mb-5" />
                    </Colxx>
                    <Colxx xxs={12}>
                        <Card className="mb-12 lg-12">
                            <CardBody>
                                <div className="row">
                                    <div className="mb-3 col-md-5">
                                        <InputGroup>
                                            <Input
                                                placeholder="Search No Resi"
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
                                            >
                                                <i className="simple-icon-magnifier" />
                                            </Button>
                                        </InputGroup>
                                    </div>
                                </div>

                                <DataTable value={this.state.table.data} className="noheader" lazy={true} loading={this.state.table.loading} responsive={true} resizableColumns={true} columnResizeMode="fit" scrollable={true} scrollHeight="500px">
                                    <Column style={{ width: '220px' }} field="transactionDate" header="Tanggal Transaksi" body={this.columnFormat.dateFormat} />
                                    <Column style={{ width: '250px' }} field="transactionNumber" header="No Transaksi" body={this.columnFormat.emptyColumn} />
                                    <Column style={{ width: '250px' }} field="shippingCourierChannelId" header="Kurir" body={this.columnFormat.emptyColumn} />
                                    <Column style={{ width: '200px' }} field="shippingCourierProduct" header="Layanan" body={this.columnFormat.emptyColumn} />
                                    <Column style={{ width: '250px' }} field="shippingTrackingNumber" header="No Resi" body={this.columnFormat.emptyColumn} />
                                    <Column style={{ width: '250px' }} field="transactionType" header="Tipe Transaksi" body={this.columnFormat.startCase} />
                                    <Column style={{ width: '250px' }} field="shipmentStatus" header="Status Pengiriman" body={this.columnFormat.startCase} />
                                    <Column style={{ width: '150px' }} field="isSuccess" header="Berhasil" body={this.columnFormat.operationBoolean} />
                                    <Column style={{ width: '220px' }} field="lastAttempDateTimeUtc" header="Update Terakhir" body={this.columnFormat.dateTimeFormatterFromUtc} />
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
                            </CardBody>
                        </Card>
                    </Colxx>
                    {this.state.loadingSubmit && <Spinner />}
                </Row>
            </>
        );
    }
}

export default MonitoringPickup;
