import React, { Component } from "react";
import {
    Col,
    Row,
    Button,
    Input,
    InputGroup,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from "reactstrap";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import Breadcrumb from "../../../containers/navs/Breadcrumb";
import ModalComponent from "../../../components/shared/modal.js";
import Loading from "../../../containers/pages/Spinner";

import { DataTable } from "primereact/datatable";
import { Paginator } from "primereact/paginator";
import { Column } from "primereact/column";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { ColumnFormat } from "../../../services/Format/ColumnFormat";
import VerificationRequestRestService from "../../../api/verificationRequestRestService";
import './verificationRequest.scss'
import 'react-inner-image-zoom/lib/InnerImageZoom/styles.css';
import InnerImageZoom from 'react-inner-image-zoom';
const MySwal = withReactContent(Swal);

export default class VerificationRequest extends Component {
    constructor(props) {
        super(props);
        this.VerificationRequestRest = new VerificationRequestRestService();
        this.loadData = this.loadData.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
        this.actionTemplate = this.actionTemplate.bind(this);
        this.columnFormat = new ColumnFormat();
        this.handleOnPageChange = this.handleOnPageChange.bind(this);
        this.submitData = this.submitData.bind(this);
        this.statusColumn = this.statusColumn.bind(this);

        this.state = {
            loading: false,
            search: "",
            oneData: null,
            table: {
                loading: true,
                data: [],
                sort: "RegistrationDate%20desc",
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
            rejectModal: false,

            // declare data verification request
            isIdCardAndDataMatched: false,
            isIdCardImageSelfie: false,
            isSignatureImageId: false,
            other: ""
        };
    }

    handleCheckboxChange(event) {
        const target = event.target;
        const name = target.name;
        this.setState({
            [name]: !this.state[name]
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

    componentDidMount() {
        this.loadData();
    }


    loadData() {
        const table = { ...this.state.table };
        table.loading = true;
        this.setState({ table });

        const params = {
            "keyword": this.state.search || null,
            "options.sort": this.state.table.sort,
            "options.take": this.state.table.pagination.pageSize,
            "options.skip": this.state.table.pagination.skipSize,
            "options.includeTotalCount": true
        };

        this.VerificationRequestRest.getDataVerificationRequest({ params }).subscribe(response => {
            const table = { ...this.state.table };
            table.data = response.datas;
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

    statusColumn(rowData) {
        if (rowData.statusApproval === 'approved') {
            return (
                <span style={{ color: "#24fc03" }} >Approved</span>
            )
        } else if (rowData.statusApproval === 'rejected') {
            return (
                <span style={{ color: "#cc0000" }} >Rejected</span>
            )
        } else {
            return (
                <span>Pending</span>
            )

        }
    }

    // Action template
    actionTemplate(rowData) {
        return (
            <div>
                <Button
                    type="button"
                    icon="pi pi-search"
                    onClick={() => {
                        this.modalOpenVerificationRequest(rowData)
                    }}
                    className="p-button-success">
                    {rowData.statusApproval === 'pending' ? 'Open Data' : 'Detail'}
                </Button>
            </div>
        );

    }

    // Modal Open Data Verification
    modalOpenVerificationRequest(data) {
        const dataModal = this.state.dataModal;

        dataModal.header = `Verification Request`;
        dataModal.body = (
            <div>
                <Row>
                    <Col>
                        <div className="box-id mb-4">
                            <Row>
                                <Col xs="2">NIK</Col>
                                <Col>: {data.idCardNumber} </Col>
                            </Row>
                            <Row>
                                <Col xs="2">Nama</Col>
                                <Col>: {data.idCardName} </Col>
                            </Row>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <div className="text-center">
                            <h2>KTP</h2>
                            <div>
                                <InnerImageZoom src={data.idCardImage.fileUrl} />
                            </div>
                        </div>
                    </Col>
                    <Col>
                        <div className="text-center">
                            <h2>Selfie + KTP</h2>
                            <div>
                                <InnerImageZoom src={data.idCardImageSelfie.fileUrl} />
                            </div>
                        </div>
                    </Col>
                    <Col>
                        <div className="text-center">
                            <h2>Sign</h2>
                            <div>
                                <InnerImageZoom src={data.signatureImage.fileUrl} />
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        );
        dataModal.footer = (
            <div>
                {data.statusApproval === 'pending' && (
                    <>
                        <Button
                            className="default btn-search mr-2"
                            color="danger"
                            onClick={() => this.modalVerificationReject(data)}
                            style={{
                                borderRadius: 6
                            }}
                        >
                            Tolak
                        </Button>
                        <Button
                            className="default btn-search mr-2"
                            color="success"
                            onClick={() => this.submitData(data, true)}
                            style={{
                                borderRadius: 6
                            }}
                        >
                            Terima
                        </Button>
                    </>
                )}
            </div>
        );

        this.setState({ dataModal, modal: true, oneData: data });
    }

    // MOdal Verifikasi Reject
    modalVerificationReject(data) {
        this.setState({ rejectModal: true, oneData: data });
    }

    // submit request to server
    requestToServer(tenantId, payload) {
        this.VerificationRequestRest.verificationRequest(tenantId, payload).subscribe(res => {
            MySwal.fire({
                type: "success",
                title: "Data berhasil disimpan.",
                toast: true,
                position: "top-end",
                timer: 2000,
                showConfirmButton: false,
                customClass: "swal-height"
            });
            this.loadData();
            this.resetAftersubmit();
        }, err => {
            MySwal.fire({
                type: "error",
                title: "Gagal disimpan.",
                toast: true,
                position: "top-end",
                timer: 2000,
                showConfirmButton: false,
                customClass: "swal-height"
            });

            this.loadData();
            this.resetAftersubmit();
        })
    }

    resetAftersubmit() {
        this.setState({
            loading: false,
            isEdit: false,
            isIdCardAndDataMatched: false,
            isIdCardImageSelfie: false,
            isSignatureImageId: false,
            other: "",
            rejectModal: false,
        });
    }

    // Submit Data
    submitData(isApprove = false) {
        const data = this.state.oneData;
        let payload = {}
        if (isApprove) {
            MySwal.fire({
                title: 'Konfirmasi Data',
                text: 'Apakah anda yakin untuk mem-verifikasi data tenant ?',
                icon: 'info',
                showCancelButton: true,
                reverseButtons: true
            }).then((result) => {
                if (result.value) {
                    // set status 2 for approv data
                    payload = {
                        status: 2,
                        isIdCardAndDataMatched: true,
                        isIdCardImageSelfie: true,
                        isSignatureImageId: true,
                    }
                    console.log(payload)
                    this.requestToServer(data.tenantId, payload);
                }
            });
        } else {
            // set status 9 for reject data
            payload = {
                status: 9,
                isIdCardAndDataMatched: !this.state.isIdCardAndDataMatched,
                isIdCardImageSelfie: !this.state.isIdCardImageSelfie,
                isSignatureImageId: !this.state.isSignatureImageId,
                other: this.state.other
            }
            this.requestToServer(data.tenantId, payload);
        }
    }



    render() {
        return (
            <>
                <Row>
                    <Colxx xxs="12">
                        <Breadcrumb heading="menu.verification-request" match={this.props.match} />
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
                                        field="registrationDate"
                                        header="Register Date"
                                        className="text-left"
                                    />

                                    <Column
                                        style={{ width: "200px" }}
                                        field="companyName"
                                        header="Nama Perusahaan"
                                        className="text-left"
                                    />
                                    <Column
                                        style={{ width: "200px" }}
                                        field="email"
                                        header="E-mail"
                                        className="text-left"
                                    />
                                    <Column
                                        style={{ width: "200px" }}
                                        field="phoneNumber"
                                        header="No. Telp"
                                        className="text-left"
                                    />
                                    <Column
                                        style={{ width: "200px", }}
                                        header="Status"
                                        className="text-left"
                                        body={this.statusColumn}
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
                            toggle={true}
                            footer={this.state.dataModal.footer}
                            close={() => {
                                this.setState({ modal: false });
                            }}
                        />
                    </div>
                )}
                {this.state.rejectModal && (
                    <Modal isOpen={true} size={'md'}>
                        <ModalHeader toggle={() => this.setState({ rejectModal: false, modal: true })}>Detail Verification</ModalHeader>
                        <ModalBody
                            style={{
                                maxHeight: 400,
                                overflow: "auto"
                            }}
                        >
                            <div>
                                <Row>
                                    <div style={{ fontSize: "20px" }}>
                                        <form>
                                            <input type="checkbox" checked={this.state.isIdCardAndDataMatched}
                                                onChange={this.handleCheckboxChange}
                                                id="isIdCardAndDataMatched" name="isIdCardAndDataMatched" className="mr-3" />
                                            <label>Foto KTP tidak jelas</label><br />
                                            <input type="checkbox"
                                                onChange={this.handleCheckboxChange}
                                                id="isIdCardImageSelfie" name="isIdCardImageSelfie" checked={this.state.isIdCardImageSelfie} className="mr-3" />
                                            <label>Foto selfie + KTP tidak jelas</label><br />
                                            <input type="checkbox"
                                                onChange={this.handleCheckboxChange}
                                                id="isSignatureImageId" name="isSignatureImageId" checked={this.state.isSignatureImageId} className="mr-3" />
                                            <label>Tanda tangan berbeda dengan KTP</label><br /><br />
                                            <div>
                                                <label className="mr-3">Lainnya : </label>
                                                <input
                                                    type="text"
                                                    name="other"
                                                    className="other-input"
                                                    value={this.state.other}
                                                    onChange={this.handleInputChange}
                                                />
                                            </div>
                                        </form>
                                    </div>
                                </Row>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <div>
                                <Button
                                    className="default btn-search mr-2"
                                    color="success"
                                    onClick={() => this.submitData()}
                                    style={{
                                        borderRadius: 6
                                    }}
                                >
                                    Simpan
                                </Button>
                            </div>
                        </ModalFooter>


                    </Modal>


                )}
            </>
        );
    }
}
