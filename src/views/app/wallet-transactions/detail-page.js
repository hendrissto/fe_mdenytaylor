import React, { Component, Fragment } from "react";
import * as moment from 'moment';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { ColumnFormat } from "../../../services/Format/ColumnFormat";
import { MoneyFormat } from "../../../services/Format/MoneyFormat";
import WalletTransactionsRestService from "../../../api/walletTransactionsRestService";
import { Separator } from "../../../components/common/CustomBootstrap";
import Breadcrumb from "../../../containers/navs/Breadcrumb";
// import Spinner from "../../../containers/pages/Spinner";
import { Redirect } from "react-router-dom";
import { MultiSelect } from 'primereact/multiselect';
import {
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    Table,
    Input,
    ModalFooter
} from 'reactstrap';
import * as _ from 'lodash';
import Loader from "react-loader-spinner";
import PictureRestService from "../../../api/pictureRestService";
const MySwal = withReactContent(Swal);

class DetailWalletTransactions extends Component {

    constructor(props) {
        super(props);
        this.walletTransactionsRestService = new WalletTransactionsRestService();
        this.pictureRestService = new PictureRestService();
        this.columnFormat = new ColumnFormat();
        this.moneyFormat = new MoneyFormat();
        this.actionTemplateForEditAttachment = this.actionTemplateForEditAttachment.bind(this);
        this.editData = this.editData.bind(this);
        this.showAttachment = this.showAttachment.bind(this);
        this.isAttachment = this.isAttachment.bind(this);
        this.onColumnToggle = this.onColumnToggle.bind(this);
        this.showTotalCount = this.showTotalCount.bind(this);

        this.state = {
            loading: false,
            walletId: this.props.match.params.walletId,
            tableDetail: {
                loading: false,
                data: [],
                pagination: {
                    currentPage: 0,
                    totalPages: 0,
                    skipSize: 0,
                    pageSize: 10
                }
            },
            detailTenant: {
                id: 0,
                companyInfo: {
                    companyName: '',
                    phone: '',
                    email: ''
                },
                walletBalance: {
                    balance: 0
                }
            },
            realAttachments: [],
            attachments: [],
            columns: [
                { field: 'transactionDate', header: 'Tanggal Transaksi', body: this.changeDateFormat },
                { field: 'transactionType', header: 'Tipe Transaksi', body: this.columnFormat.emptyColumn },
                { field: 'accountNumber', header: 'No Rekening', body: this.columnFormat.emptyColumn },
                { field: 'accountName', header: 'Nama Rekening', body:this.columnFormat.emptyColumn },
                { field: 'bankName', header: 'Nama Bank', body: this.columnFormat.emptyColumn },
                { field: 'bankDistrict', header: 'Cabang Bank', body: this.columnFormat.emptyColumn },
                { field: 'amount', header: 'Amount', body: this.moneyFormat.currencyFormat},
                { field: 'feeTransfer', header: 'Fee Transfer', body: this.moneyFormat.currencyFormat},
                { field: 'note', header: 'Note', body: this.columnFormat.emptyColumn},
                { field: 'Action', header: 'Action', body: this.actionTemplateForEditAttachment},
            ],
            selectedColumns: [
                { field: 'transactionDate', header: 'Tanggal Transaksi', body: this.changeDateFormat },
                { field: 'transactionType', header: 'Tipe Transaksi', body: this.columnFormat.emptyColumn },
                { field: 'accountNumber', header: 'No Rekening', body: this.columnFormat.emptyColumn },
                { field: 'accountName', header: 'Nama Rekening', body:this.columnFormat.emptyColumn },
                { field: 'bankName', header: 'Nama Bank', body: this.columnFormat.emptyColumn },
                { field: 'bankDistrict', header: 'Cabang Bank', body: this.columnFormat.emptyColumn },
                { field: 'amount', header: 'Amount', body: this.moneyFormat.currencyFormat},
                { field: 'feeTransfer', header: 'Fee Transfer', body: this.moneyFormat.currencyFormat},
                { field: 'note', header: 'Note', body: this.columnFormat.emptyColumn},
                { field: 'Action', header: 'Action', body: this.actionTemplateForEditAttachment},
            ],
        }
    }

    componentDidMount() {
        if( this.state.walletId !== null || this.state.walletId !== "" ) {
            this.loadData();
        } else {
            return false
        }
    }

    actionTemplateForEditAttachment(rowData, column) {
        return <div>
            <Button
                type="button"
                icon="pi pi-search"
                onClick={() => {
                    // this.setState({realAttachments: []});

                    let attachments = this.state.attachments;
                    let realAttachments = this.state.realAttachments;
                    attachments = [];
                    realAttachments = [];
                    if(rowData.attachments) {
                    for(let i = 0; i < rowData.attachments.length; i++) {
                        attachments.push(rowData.attachments[i]);
                        realAttachments.push(rowData.attachments[i]);
                    }
                    }
                    this.setState({
                        attachments,
                        realAttachments,
                        note: rowData.note,
                        oneData: rowData,
                        modalDetailWallet: true
                    })
                }}
                className="p-button-success"
            >
                Update
            </Button>
        </div>;
    }

    loadData() {
        this.setState({loading: true});
        const tableDetail = { ...this.state.tableDetail };
        tableDetail.loading = true;
        this.setState({tableDetail});

        const params = {
            keyword: this.state.search || null,
            "options.take": this.state.tableDetail.pagination.pageSize,
            "options.skip": this.state.tableDetail.pagination.skipSize,
            "options.includeTotalCount": true
        };

        this.walletTransactionsRestService.loadOneDataTenantTransactions(this.state.walletId, {params}).subscribe(response => {
            const tableDetail = { ...this.state.tableDetail };
            tableDetail.data = response.data;
            tableDetail.pagination.totalPages = Math.ceil(response.total / response.take);
            tableDetail.loading = false;
            this.setState({detailTenant: response.data[0].tenant ,tableDetail, modalDetailOneTenants: true, loading: false });
        }, err => {
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
            this.setState({loading: false});
        })
    }

    editData() {
        const tableDetail = { ...this.state.tableDetail };
        tableDetail.loading = true;
        this.setState({tableDetail, modalDetailWallet: false });

        const data = this.state;
        const oneData = data.oneData;
        const attachments = [];
        for(let i = 0; i < data.attachments.length; i++) {
        attachments.push({
            id: data.attachments[i].id,
            isMain: i === 0 ? true : false,
            customFileName: data.attachments[i].customFileName,
        })
        }

        const payload = {
        tenantId: oneData.tenantId,
        isCredit: oneData.transactionType === 'credit' ? true : false,
        note: data.note,
        amount: oneData.amount,
        feeTransfer: oneData.feeTransfer,
        attachments: attachments,
        }

        this.walletTransactionsRestService.editData(oneData.id, payload).subscribe(res => {
            tableDetail.loading = false;
            MySwal.fire({
                type: "success",
                title: "Sukses Edit Data.",
                toast: true,
                position: "top-end",
                timer: 2000,
                showConfirmButton: false,
                customClass: "swal-height"
            });
            this.loadData();
        }, err => {
            MySwal.fire({
                type: "error",
                title: "Gagal Edit Data.",
                toast: true,
                position: "top-end",
                timer: 2000,
                showConfirmButton: false,
                customClass: "swal-height"
            });
            this.loadData();
            this.setState({mainLoading: false});
        })
    }

    showAttachment() {
        const view = [];
        if (this.state.attachments) {
            this.state.attachments.map(function (attachment, i) {
            view.push(
                <>
                <tr>
                    <td colSpan={4}>
                    <a rel="noopener noreferrer" target="_blank" href={attachment.fileUrl}>{attachment.customFileName}</a>
                    </td>
                </tr>
                </>
            )
            return true;
            })
        }
        return view;
    }

    isAttachment() {
        const data = [];

        const attachment = this.state.attachments;
        if (attachment) {
            for (let i = 0; i < attachment.length; i++) {
            data.push(
                <tr key={`${attachment[i].id}`}>
                <td colSpan={3}>{attachment[i].customFileName}</td>
                <td>
                    <a
                    href
                    className="text-danger"
                    style={{ cursor: "pointer" }}
                    onClick={() => this.rmAttachment(i)}
                    >
                    Hapus
                    </a>
                </td>
                </tr>
            );
            }
        }

        return data;
    }

    fileHandler = event => {
        this.setState({ spinner: true });
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
            image: response,
            attachments
            });
        });
    };

    changeDateFormat(rowData, column) {
        return moment(rowData['transactionDate']).format('DD-MM-YYYY') || '-';
    }

    showTotalCount(e) {
        console.log(e)
        let total = 0;
        if(e) {
            ++total
        }

        console.log(total)
        return this.state.selectedColumns.length
    }

    onColumnToggle(event) {
        let selectedColumns = event.value;
        let orderedSelectedColumns = _.sortBy(selectedColumns, x => _.findIndex(this.state.columns, y => x.field === y.field))
        this.setState({selectedColumns: orderedSelectedColumns});
        // console.log('1', this.state.selectedColumns)
        // console.log('2', this.state.columns)
        // const sortedByInitialValues = _.sortBy(event.value, x => _.findIndex(this.state.columns, y => x.field === y.field))
    }

    render() {
        if (this.state.redirect === true) {
            this.setState({ redirect: false });
            return <Redirect to="/user/login" />;
        }

        const columnComponents = this.state.selectedColumns.map(col=> {
            return <Column style={{width:'250px'}} key={col.field} field={col.field} header={col.header} body={col.body} />;
        });

        return (
            <>
                <div className="card col-md-12">
                    <div className="card-body">
                    <Breadcrumb
                        heading="menu.detail-transactions"
                        match={this.props.match}
                    />
                    <Separator className="mb-5" />
                    {this.state.loading && (
                        <div style={{
                            textAlign: 'center'
                        }}>
                            <Loader type="Oval" color="#51BEEA" height={80} width={80}/>
                        </div>
                    )}
                    {!this.state.loading && (
                        <div>
                            <div className="row">
                                <div className="col-md-5">
                                    <table className="table">
                                        <tbody>
                                            <tr>
                                                <td>Nama Perusahaan</td>
                                                <td>:</td>
                                                <td>{this.state.detailTenant.companyInfo.companyName}</td>
                                            </tr>
                                            <tr>
                                                <td>No. Telp</td>
                                                <td>:</td>
                                                <td>{this.state.detailTenant.companyInfo.phone}</td>
                                            </tr>
                                            <tr>
                                                <td>Email</td>
                                                <td>:</td>
                                                <td>{this.state.detailTenant.companyInfo.email}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="col-md-7" style={{
                                    textAlign: 'right'
                                }}>
                                    <h1>
                                        {'Rp. ' + this.state.detailTenant.walletBalance.balance.toLocaleString('id-ID')}
                                    </h1>
                                </div>
                            </div>

                            <div style={{textAlign:'left', display: 'flex', justifyContent: 'flex-end', marginBottom: 15}}>
                                <MultiSelect value={this.state.selectedColumns} options={this.state.columns} optionLabel="header" onChange={this.onColumnToggle} style={{width:'250px'}} maxSelectedLabel={0} />
                            </div>
                            {this.state.selectedColumns.length && (
                                <>
                                    <DataTable value={this.state.tableDetail.data} className="noheader" lazy={true} loading={this.state.tableDetail.loading} responsive={true} resizableColumns={true} columnResizeMode="fit" scrollable={true} scrollHeight="150px">
                                        {columnComponents}
                                    {/*
                                        <Column style={{width:'220px'}} field="transactionDate" header="Tanggal Transaksi" body={this.changeDateFormat} />
                                        <Column style={{width:'200px'}} field="transactionType" header="Type Transaksi" body={this.columnFormat.emptyColumn}/>
                                        <Column style={{width:'200px'}} field="accountNumber" header="No Rekening" body={this.columnFormat.emptyColumn}/>
                                        <Column style={{width:'250px'}} field="accountName" header="Nama Rekening" body={this.columnFormat.emptyColumn}/>
                                        <Column style={{width:'200px'}} field="bankName" header="Nama Bank" body={this.columnFormat.emptyColumn}/>
                                        <Column style={{width:'200px'}} field="bankDistrict" header="Cabang Bank" body={this.columnFormat.emptyColumn}/>
                                        <Column style={{width:'200px'}} field="amount" header="Amount" body={this.moneyFormat.currencyFormat}  />
                                        <Column style={{width:'200px'}} field="feeTransfer" header="Fee Transfer" body={this.moneyFormat.currencyFormat}  />
                                        <Column style={{width:'200px'}} field="note" header="Note" body={this.columnFormat.emptyColumn}/>
                                        <Column style={{width:'250px'}} header="Action" body={this.actionTemplateForEditAttachment}/>
                                    */}
                                    </DataTable>
                                    <Paginator
                                        first={this.state.tableDetail.pagination.skipSize}
                                        rows={this.state.tableDetail.pagination.pageSize}
                                        totalRecords={
                                            Math.ceil(this.state.tableDetail.pagination.totalPages) *
                                            this.state.tableDetail.pagination.pageSize
                                        }
                                        onPageChange={this.handleOnPageDetailChange}
                                    />
                                </>
                            )}
                        </div>
                    )}
                    </div>
                </div>

                {this.state.modalDetailWallet && (
                    <Modal isOpen={this.state.modalDetailWallet} >
                        <ModalHeader>Detail</ModalHeader>
                        <ModalBody
                            style={{
                            maxHeight: 380,
                            overflow: "auto"
                            }}>
                            <Table>
                            <tbody>
                                <tr>
                                    <td>Nama Rekening</td>
                                    <td>:</td>
                                    <td>{this.state.oneData.bankName}</td>
                                </tr>
                                <tr>
                                    <td>
                                        No Rekening
                                    </td>
                                    <td>:</td>
                                    <td>{this.state.oneData.accountNumber}</td>
                                </tr>
                                <tr>
                                    <td>
                                        Nama Bank
                                    </td>
                                    <td>:</td>
                                    <td>{this.state.oneData.bankName}</td>
                                </tr>
                                <tr>
                                    <td>
                                        Cabang Bank
                                    </td>
                                    <td>:</td>
                                    <td>{this.state.oneData.bankDistrict}</td>
                                </tr>
                                <tr>
                                    <td>Amount</td>
                                    <td>:</td>
                                    <td>
                                        Rp. {this.state.oneData.amount.toLocaleString('id-ID')}
                                    </td>
                                </tr>
                                <tr>
                                    <td>Fee Transfer</td>
                                    <td>:</td>
                                    <td>
                                        Rp. {this.state.oneData.feeTransfer.toLocaleString('id-ID')}
                                    </td>
                                </tr>
                                {!this.state.isEdit && (
                                <tr>
                                    <td>Note</td>
                                    <td>:</td>
                                    <td>
                                    {this.state.oneData.note}
                                    </td>
                                </tr>
                                )}
                                {this.state.isEdit && (
                                <tr>
                                    <td>Note</td>
                                    <td>:</td>
                                    <td>
                                    <Input
                                        type="textarea"
                                        className="form-control"
                                        onChange={event => {
                                        this.setState({ note: event.target.value });
                                        }}
                                        value={this.state.note}
                                    />
                                    </td>
                                </tr>
                                )}
                                {this.state.isEdit && (
                                    <tr>
                                    <td colSpan="3">
                                    <input
                                        type="file"
                                        onChange={this.fileHandler.bind(this)}
                                    />
                                    </td>
                                </tr>
                                )}

                                {this.state.spinner && (
                                <Loader
                                    type="Oval"
                                    color="#51BEEA"
                                    height={80}
                                    width={80}
                                />
                                )}

                                {!this.state.isEdit && this.showAttachment() && (
                                <tr>
                                    <td>Lampiran</td>
                                    <td>:</td>
                                    <td></td>
                                </tr>
                                )}
                                {!this.state.isEdit &&  this.showAttachment()}
                                {this.state.isEdit && (
                                this.isAttachment()
                                )}
                            </tbody>
                            </Table>
                    </ModalBody>
                    <ModalFooter>
                        {this.state.isEdit && (
                        <div>
                            <Button
                            className="default"
                            color="primary"
                            style={{
                                borderRadius: 6,
                                marginRight: 10
                            }}
                            onClick={() => {
                                this.setState({ isEdit: false });
                                this.editData();
                            }}
                            >
                            Save
                            </Button>
                            <Button
                            className="default"
                            color="primary"
                            style={{
                                borderRadius: 6
                            }}
                            onClick={() => {
                                this.setState({ attachments: this.state.realAttachments, isEdit: false })
                            }}
                            >
                            Cancel
                        </Button>
                        </div>
                        )}
                        {!this.state.isEdit && (
                        <Button
                            className="default"
                            color="primary"
                            style={{
                            borderRadius: 6
                            }}
                            onClick={() => {
                            this.setState({ isEdit: true })
                            }}
                        >
                            Edit
                        </Button>

                        )}
                        <Button
                            color="primary"
                            outline
                            style={{
                                borderRadius: 6
                            }}
                            onClick={() => this.setState({ attachments: [], modalDetailWallet: false, isEdit: false })}
                        >
                        Close
                        </Button>
                    </ModalFooter>
                    </Modal>
                )}
            </>
        )
    }
}

export default DetailWalletTransactions;
