import React, { Component } from "react";
import moment from "moment";
import {
    Row,
    Card,
    CardBody,
    Button,
    Input,
    InputGroup,
    Collapse,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from "reactstrap";
import ModalComponent from "../../../components/shared/modal.js";
import { Paginator } from "primereact/paginator";
import { Redirect } from "react-router-dom";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import Breadcrumb from "../../../containers/navs/Breadcrumb";
import MonitoringPickupRestService from "../../../api/monitoringPickupRestService";
import Spinner from "../../../containers/pages/Spinner";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { MultiSelect } from 'primereact/multiselect';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { ColumnFormat } from "../../../services/Format/ColumnFormat";
import * as _ from 'lodash';
import "./monitoring-pickup.scss";
const MySwal = withReactContent(Swal);

class MonitoringPickup extends Component {
    constructor(props) {
        super(props);
        this.monitoringPickupRestService = new MonitoringPickupRestService();
        this.handleOnPageChange = this.handleOnPageChange.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.awbTemplate = this.awbTemplate.bind(this);
        this.actionTemplate = this.actionTemplate.bind(this);
        this.loadRelatedDataCourier = this.loadRelatedDataCourier.bind(this);
        this.columnFormat = new ColumnFormat();

        this.state = {
            dataAWBHistory: null,
            awbDetailModal: false,
            awbHistoryModal: false,
            clientAppId: 'clodeo-admin-web',
            dataModal: {
                header: "",
                body: "",
                footer: ""
            },
            error: false,
            loadingSubmit: false,
            spinner: false,
            loading: false,
            collapse: false,
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
            shippingCourierChannelOptions: [
                // { label: 'SiCepat', value: 'sicepat' },
                // { label: 'SAP Express', value: 'sap' },
            ],
            shippingCourierChannelId: [],
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
        this.loadRelatedDataCourier();
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

    loadRelatedDataCourier() {
        this.monitoringPickupRestService.loadRelatedData(this.state.clientAppId)
            .subscribe(response => {
                this.setState({
                    shippingCourierChannelOptions: _.map(response.integratedShippings, courier => {
                        return {
                            label: courier.name,
                            value: courier.id,
                        }
                    }),
                })
            });
    }

    loadData() {
        const table = { ...this.state.table };
        table.loading = true;
        this.setState({ table });

        const params = {
            keyword: this.state.search || null,
            shippingCourierChannelId: _.join(this.state.shippingCourierChannelId || [], ',') || null,
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
                Header: "Status",
                accessor: "status",
                show: this.state.status,
                Cell: props => <p>{_.startCase(props.value)}</p>
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

    loadAWBHistory(rowData) {
        const table = { ...this.state.table };
        table.loading = true;
        this.setState({ table });
        this.monitoringPickupRestService.getAWBHistory(rowData.id).subscribe(response => {
            table.loading = false;
            this.setState({ table, dataAWBHistory: response, awbHistoryModal: true });
        }, err => {
            table.loading = false;
            this.setState({ table });
            let messages;
            if (err.status === 401) {
                messages = "Unauthorized.";
            } else if (Array.isArray(err.data)) {
                messages = err.data[0].errorMessage;
            } else if (Array.isArray(err.data.errors)) {
                messages = err.data.errors[0].error_message;
            } else {
                messages = err.data.message;
            }
            MySwal.fire({
                type: "error",
                title: messages || 'Tidak diketahui',
                toast: true,
                position: "top-end",
                timer: 2000,
                showConfirmButton: false,
                customClass: "swal-height"
            });
        });
    }

    loadAWBDetail(rowData) {
        const table = { ...this.state.table };
        table.loading = true;
        this.setState({ table });

        this.monitoringPickupRestService.getAWBDetail({
            courierCode: rowData.shippingCourierChannelId,
            waybill: rowData.shippingTrackingNumber
        }).subscribe(response => {
            table.loading = false;
            this.setState(table, () => {
                this.dataAWB(response.data);
            })
        }, err => {
            table.loading = false;
            this.setState({ table });
            let messages;
            if (err.status === 401) {
                messages = "Unauthorized.";
            } else if (Array.isArray(err.data)) {
                messages = err.data[0].errorMessage;
            } else if (Array.isArray(err.data.errors)) {
                messages = err.data.errors[0].error_message;
            } else {
                messages = err.data.message;
            }
            MySwal.fire({
                type: "error",
                title: messages || 'Tidak diketahui',
                toast: true,
                position: "top-end",
                timer: 2000,
                showConfirmButton: false,
                customClass: "swal-height"
            });
        });
    }

    dataAWB(data) {
        const dataModal = this.state.dataModal;

        dataModal.header = "Rincian Pengiriman";
        dataModal.body = (
            <div className="modal-awb">
                <div className="header-awb">
                    <div className="courier">{data.summary.courierName || "-"}</div>
                    <div className="title">No Resi</div>
                    <div className="airwaybill">
                        #{data.summary.trackingNumber || "-"}
                    </div>
                </div>

                <div>
                    <table className="data-awb">
                        <tr>
                            <th>Tanggal dikirim</th>
                            <th>Tanggal diterima</th>
                        </tr>
                        <tr>
                            <td>
                                {data.summary.shipDate === "" || data.summary.shipDate === null ? '-' : moment(data.summary.shipDate).format(
                                    "DD-MM-YYYY"
                                )}
                            </td>
                            <td>
                                {data.summary.deliveryDate === "" || data.summary.deliveryDate === null ? '-' : moment(
                                    data.summary.deliveryDate
                                ).format("YYYY-MM-DD")}
                            </td>
                        </tr>
                        <tr>
                            <th>Asal</th>
                            <th>Tujuan</th>
                        </tr>
                        <tr>
                            <td>{data.summary.origin || "-"}</td>
                            <td>{data.summary.destination || "-"}</td>
                        </tr>
                        <tr>
                            <th>Pengirim</th>
                            <th>Penerima</th>
                        </tr>
                        <tr>
                            <td>{data.summary.shipperName || "-"}</td>
                            <td>{data.summary.receiverName || "-"}</td>
                        </tr>
                    </table>
                </div>

                <div className="status-shipping">
                    <div className="title2">Status Pengiriman</div>

                    <div>
                        <table className="outbond">
                            <tr>
                                <th colSpan="3" className="text-left">Outbond</th>
                            </tr>
                            {this._renderOutbond(data)}
                        </table>
                    </div>

                    <div>
                        <table className="time-shipping">
                            <tr>
                                <th colSpan="3" className="text-left">Waktu Pengiriman</th>
                            </tr>
                            <tr>
                                <td className="text-left">
                                    {moment(
                                        data.deliveryStatus.podDate,
                                        "YYYY-MM-DD hh:mm"
                                    ).format("DD-MM-YYYY hh:mm") || "-"}
                                </td>
                                <td className="text-left">{data.deliveryStatus.podReceiver || "-"}</td>
                                <td className="text-left">{data.deliveryStatus.status || "-"}</td>
                            </tr>
                        </table>
                    </div>
                </div>
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
                    onClick={() => this.setState({ awbDetailModal: false })}
                >
                    Close
          </Button>
            </div>
        );

        this.setState({ dataModal, awbDetailModal: true });
    }

    _renderOutbond(data) {
        const list = [];

        if (data.summary.courierCode === 'jne') {
            for (let i = 0; i < data.outbounds.length; i++) {
                list.push(
                    <tr>
                        <td className="text-left">{data.outbounds[i].outboundDate}</td>
                        <td className="text-left">
                            {data.outbounds[i].outboundDescription === null
                                ? ""
                                : data.outbounds[i].outboundDescription}
                        </td>
                        <td className="text-left">{data.outbounds[i].outboundCode}</td>
                    </tr>
                );
            }
        } else if (data.summary.courierCode === 'J&T') {
            for (let i = 0; i < data.outbounds.length; i++) {
                list.push(
                    <tr>
                        <td className="text-left">{data.outbounds[i].outboundDate}</td>
                        <td className="text-left">
                            {data.outbounds[i].outboundDescription === null
                                ? ""
                                : data.outbounds[i].cityName}
                        </td>
                        <td className="text-left">{data.outbounds[i].outboundDescription}</td>
                    </tr>
                );
            }
        } else {
            for (let i = 0; i < data.outbounds.length; i++) {
                list.push(
                    <tr>
                        <td className="text-left">{data.outbounds[i].outboundDate}</td>
                        <td className="text-left">
                            {data.outbounds[i].cityName === null
                                ? ""
                                : data.outbounds[i].cityName}
                        </td>
                        <td className="text-left">{data.outbounds[i].outboundCode}</td>
                    </tr>
                );
            }
        }

        return list;
    }

    actionTemplate(rowData, column) {
        return (
            <div>
                <Button
                    outline
                    color="info"
                    onClick={() => {
                        this.loadAWBHistory(rowData);
                    }}
                >
                    Histori
            </Button>
            </div>
        );
    }

    awbTemplate(rowData, column) {
        return (
            <>
                <p style={{
                    color: 'blue',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    marginRight: '3px'
                }} onClick={() => this.loadAWBDetail(rowData)}>{rowData.shippingTrackingNumber}</p>
            </>
        );
    }

    generateRowAWBHistory() {
        let rows = [];
        const histories = this.state.dataAWBHistory
        if (!histories.length) {
            rows.push(
                <tr>
                    <td colSpan="3" className="text-center"> Tidak ada data </td>

                </tr>
            )
            return rows;
        }

        for (let i = 0; i < histories.length; i++) {
            rows.push(
                <tr>
                    <td> {histories[i].airwaybillNumber} </td>
                    <td> {_.startCase(histories[i].status)}</td>
                    <td> {
                        moment(
                            histories[i].lastUpdate,
                            "YYYY-MM-DD hh:mm"
                        ).format("DD-MM-YYYY hh:mm") || "-"}
                    </td>
                </tr>
            )
        }

        return rows;
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
                                            <Button
                                                className="default"
                                                color="primary"
                                                onClick={() => this.setState({ collapse: !this.state.collapse })}
                                                style={{ marginLeft: 10, borderRadius: 5 }}
                                            >
                                                Filter
                      </Button>
                                        </InputGroup>
                                    </div>
                                    {this.state.shippingCourierChannelOptions && (
                                        <Collapse isOpen={this.state.collapse} className="col-md-12">
                                            <div className="row">
                                                <div className="col-md-3">
                                                    <label>Kurir</label>
                                                    <div>
                                                        <MultiSelect value={this.state.shippingCourierChannelId} options={this.state.shippingCourierChannelOptions} style={{ width: '100%', height: 35 }} onChange={(e) => this.setState({ shippingCourierChannelId: e.value })} filter={true} maxSelectedLabels={2} />
                                                    </div>
                                                </div>

                                            </div>
                                            <div className="row">
                                                <div className="col-12 text-right my-3">
                                                    <Button
                                                        className="default"
                                                        color="primary"
                                                        style={{ borderRadius: 5, marginRight: 10 }}
                                                        onClick={() => {
                                                            this.setState({ collapse: false });
                                                            this.loadData();
                                                        }}
                                                    >
                                                        Terapkan
                          </Button>
                                                    <Button
                                                        className="default"
                                                        color="danger"
                                                        style={{ borderRadius: 5 }}
                                                        onClick={() => {
                                                            this.setState({
                                                                bankSelected: null,
                                                                lowDate: null,
                                                                highDate: null,
                                                            })
                                                        }}
                                                    >
                                                        Reset
                          </Button>
                                                </div>
                                            </div>
                                        </Collapse>
                                    )}
                                </div>

                                <DataTable value={this.state.table.data} className="noheader" lazy={true} loading={this.state.table.loading} responsive={true} resizableColumns={true} columnResizeMode="fit" scrollable={true} scrollHeight="500px">
                                    <Column style={{ width: '220px' }} field="transactionDate" header="Tanggal Transaksi" body={this.columnFormat.dateFormat} />
                                    <Column style={{ width: '250px' }} field="transactionNumber" header="No Transaksi" body={this.columnFormat.emptyColumn} />
                                    <Column style={{ width: '250px' }} field="shippingCourierChannelId" header="Kurir" body={this.columnFormat.emptyColumn} />
                                    <Column style={{ width: '200px' }} field="shippingCourierProduct" header="Layanan" body={this.columnFormat.emptyColumn} />
                                    <Column style={{ width: '250px' }} field="status" header="Status" body={this.columnFormat.startCase} />
                                    <Column style={{ width: '250px' }} field="shippingTrackingNumber" header="No Resi" body={this.awbTemplate}

                                    />
                                    <Column style={{ width: '250px' }} field="transactionType" header="Tipe Transaksi" body={this.columnFormat.startCase} />
                                    <Column style={{ width: '250px' }} field="shipmentStatus" header="Status Pengiriman" body={this.columnFormat.startCase} />
                                    <Column style={{ width: '150px' }} field="isSuccess" header="Berhasil" body={this.columnFormat.operationBoolean} />
                                    <Column style={{ width: '220px' }} field="lastAttempDateTimeUtc" header="Update Terakhir" body={this.columnFormat.dateTimeFormatterFromUtc} />
                                    <Column style={{ width: '250px' }} header="" body={this.actionTemplate} />
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

                    {/* DETAIL AWB */}
                    {this.state.awbHistoryModal && (
                        <Modal isOpen={this.state.awbHistoryModal}>
                            <ModalHeader>Histori</ModalHeader>
                            <ModalBody>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th scope="col">No Resi</th>
                                            <th scope="col">Status</th>
                                            <th scope="col">Pembaruan Terakhir</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.generateRowAWBHistory()}
                                    </tbody>
                                </table>

                            </ModalBody>

                            <ModalFooter className="text-center">
                                <Button onClick={() => this.setState({ awbHistoryModal: false })}>
                                    Close
                          </Button>
                            </ModalFooter>
                        </Modal>
                    )}
                    {this.state.awbDetailModal && (
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
                </Row>
            </>
        );
    }
}

export default MonitoringPickup;
