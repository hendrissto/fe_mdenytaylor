import React, { Component, Fragment } from "react";
import { Row, Table, Card, CardBody, Button, Input } from "reactstrap";
import { Colxx } from "../../../components/common/CustomBootstrap";
import NumberFormat from "react-number-format";
import Loader from "react-loader-spinner";
import RelatedDataRestService from "../../../api/relatedDataRestService";
import PictureRestService from "../../../api/pictureRestService";
import { MoneyFormat } from "../../../services/Format/MoneyFormat";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import TenantRestService from "../../../api/tenantRestService";
import { RadioButton } from 'primereact/radiobutton';
import { AutoComplete } from 'primereact/autocomplete';
import Loading from "../../../containers/pages/Spinner";
import FormBebasRestService from "../../../api/formBebasService";
import { throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';


const MySwal = withReactContent(Swal);

class FormBebas extends Component {
    initialState = {
        amount: null,
        note: null,
        isCredit: true,
        feeAmount: null,

        image: null,
        loading: false,
        mainLoading: false,
        imageUrl: null,
        attachments: [],

        tenantOptions: null,
        tenantSelected: null,
    }
    constructor(props) {
        super(props);
        this.tenantRest = new TenantRestService();
        this.requestFormBebasRest = new FormBebasRestService();
        this.relatedDataRestService = new RelatedDataRestService();
        this.pictureRestService = new PictureRestService();
        this.moneyFormat = new MoneyFormat();
        this.fileHandler = this.fileHandler.bind(this);
        this.isAttachment = this.isAttachment.bind(this);
        this.rmAttachment = this.rmAttachment.bind(this);
        this.submitData = this.submitData.bind(this);
        this.suggestTenants = this.suggestTenants.bind(this);

        this.state = this.initialState;
    }

    validateError() {
        if (
            (this.state.amount === null || this.state.amount === '') ||
            (this.state.feeAmount === null || this.state.feeAmount === '') ||
            this.state.tenantSelected.length === 0 ||
            (this.state.attachments && (this.state.attachments.length === 0))
        ) {
            return true;
        } else {
            return false;
        }
    }

    suggestTenants(event) {
        const params = {
            keyword: event.query || null,
            "options.take": 30,
            "options.skip": 0,
        };


        this.tenantRest.getTenants({ params }).subscribe(
            response => {
                this.setState({
                    tenantOptions: response.data
                });
            }
        )
    }

    submitData() {
        if (this.validateError()) {
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
            this.setState({ mainLoading: true })
            const payload = {
                tenantId: this.state.tenantSelected.id,
                isCredit: this.state.isCredit,
                note: this.state.note,
                amount: Number.isInteger(this.state.amount) ? parseInt(this.state.amount) : parseFloat(this.state.amount.replace(/,/g, '')),
                feeAmount: Number.isInteger(this.state.feeAmount) ? parseInt(this.state.feeAmount) : parseFloat(this.state.feeAmount.replace(/,/g, '')),
                attachments: this.state.attachments,
            }

            this.requestFormBebasRest.postBebas(payload)
                .pipe(
                    catchError(error => {
                        return throwError(error);
                    }),
                    finalize(() => {
                        this.setState({ mainLoading: false });
                    })
                )
                .subscribe(() => {
                    MySwal.fire({
                        type: 'success',
                        title: "Berhasil input data.",
                        toast: true,
                        position: "top-end",
                        timer: 2000,
                        showConfirmButton: false,
                        customClass: "swal-height"
                    });

                    this.setState(this.initialState);
                    this.inputFile.value = '';
                });
        }
    }

    fileHandler = event => {
        this.setState({ loading: false, spinner: true });
        let fileObj = event.target.files[0];

        let data = new FormData();
        data.append("file", fileObj);

        this.pictureRestService.postPicture(data).subscribe(response => {
            // Create a new array based on current state:
            let attachments = [...this.state.attachments];

            // Add item to it
            attachments.push(response);

            this.setState({
                spinner: false,
                imageUrl: response.fileUrl,
                loading: true,
                image: response,
                attachments
            });
        });
    };


    rmAttachment(i) {
        let attachments = [...this.state.attachments];
        attachments.splice(i, 1);

        this.setState({
            attachments
        });
    }

    isAttachment() {
        const data = [];

        const attachment = this.state.attachments;
        if (attachment) {
            for (let i = 0; i < attachment.length; i++) {
                data.push(
                    <tr key={`${attachment[i].id}`}>
                        <td colSpan="1">
                            {i + 1} .
                </td>
                        <td colSpan="3">
                            {attachment[i].customFileName}
                        </td>
                        <td colSpan="1">
                            <a href
                                className="text-danger"
                                style={{ 'cursor': 'pointer' }}
                                onClick={() => this.rmAttachment(i)}>
                                Hapus
                  </a>
                        </td>
                    </tr >
                )
            }
        }

        return data;
    }

    render() {
        return (
            <Fragment>
                <Card className="mb-12 lg-12">
                    <CardBody>
                        <Row>
                            <Colxx xxs={6}>

                                <Table>
                                    <tbody>
                                        <tr>
                                            <td>Tenant</td>
                                            <td>:</td>
                                            <td>
                                                {/* <Dropdown
                                                    optionLabel="accountName"
                                                    value={this.state.tenantSelected}
                                                    options={this.state.tenantOptions}
                                                    onChange={e => {
                                                        this.setState({ tenantSelected: e.value });
                                                    }}
                                                    placeholder="Select a Tenant"
                                                /> */}


                                                {/* <Dropdown value={this.state.tenantSelected} options={this.state.tenantOptions} onChange={e => {
                                                    this.setState({ tenantSelected: e.value });
                                                }} dataKey="id" optionLabel="companyInfo.name" filter={true} filterPlaceholder="Select Tenant" filterBy="companyInfo.name" showClear={true} /> */}

                                                <AutoComplete value={this.state.tenantSelected} suggestions={this.state.tenantOptions} completeMethod={this.suggestTenants} size={30} minLength={1}
                                                    field="companyInfo.name" dropdown={true} onDropdownClick={this.suggestTenants} onChange={(e) => this.setState({ tenantSelected: e.value })} />

                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Transaction Type</td>
                                            <td>:</td>
                                            <td>

                                                <div className="p-col-12 mb-2">
                                                    <RadioButton value={true} name="isCredit" onChange={(e) => this.setState({ isCredit: e.value })} checked={this.state.isCredit === true} />
                                                    <label htmlFor="rb2" className="p-radiobutton-label">Credit</label>
                                                </div>

                                                <div className="p-col-12">
                                                    <RadioButton value={false} name="isCredit" onChange={(e) => this.setState({ isCredit: e.value })} checked={this.state.isCredit === false} />
                                                    <label htmlFor="rb2" className="p-radiobutton-label">Debit</label>
                                                </div>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>{this.state.isCredit ? 'Credit' : 'Debit'} Amount</td>
                                            <td>:</td>
                                            <td>
                                                <NumberFormat className="form-control" isNumericString={true} thousandSeparator={true} value={this.state.amount} onChange={event => {
                                                    this.setState({ amount: event.target.value });
                                                }} />
                                            </td>
                                        </tr>

                                        <tr>
                                            <td> Fee Amount</td>
                                            <td>:</td>
                                            <td>
                                                <NumberFormat className="form-control" isNumericString={true} thousandSeparator={true} value={this.state.feeAmount} onChange={event => {
                                                    this.setState({ feeAmount: event.target.value });
                                                }} />
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>Note</td>
                                            <td>:</td>
                                            <td>
                                                <Input
                                                    type="textarea" className="form-control"
                                                    onChange={event => {
                                                        this.setState({ note: event.target.value });
                                                    }}
                                                />
                                            </td>
                                        </tr>


                                        <tr>
                                            <td colSpan="3">
                                                <input
                                                    ref={(el) => {
                                                        this.inputFile = el;
                                                    }}
                                                    type="file"
                                                    onChange={this.fileHandler.bind(this)}
                                                />
                                            </td>
                                        </tr>
                                        {this.state.spinner && (
                                            <Loader
                                                type="Oval"
                                                color="#51BEEA"
                                                height={80}
                                                width={80}
                                            />
                                        )}
                                        {this.state.loading && (
                                            this.isAttachment()
                                        )}
                                    </tbody>
                                </Table>
                            </Colxx>

                            <Colxx xxs={12}>
                                <Button
                                    color="primary"
                                    onClick={() => {
                                        this.submitData();
                                    }}
                                >
                                    Simpan
                        </Button>
                            </Colxx>
                        </Row>
                    </CardBody>
                </Card>

                {this.state.mainLoading && <Loading />}
            </Fragment>
        );
    }
}

export default FormBebas;