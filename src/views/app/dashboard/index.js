import moment from "moment";
import React, { Component, Fragment } from "react";
import { Row } from "reactstrap";
import { forkJoin, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import DashboardRestService from "../../../api/dashboardRestService";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import Breadcrumb from "../../../containers/navs/Breadcrumb";
import { MoneyFormat } from "../../../services/Format/MoneyFormat";
import CODFee from "./cod-fee";
import BalanceCredit from "./credit-balance";
import CreditIssued from "./credit-issued";
import FundReimbursement from "./fund-reimbursement";
import SalesCODCount from "./sales-cod-count";
import SalesCODTotalAmount from "./sales-cod-total-amount";

const MySwal = withReactContent(Swal);

export default class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.dashboardRestService = new DashboardRestService();
    this.moneyFormat = new MoneyFormat();
    this.loadData = this.loadData.bind(this);

    this.state = {
      loading: false,
      data: {
        summary: null,
        salesCODCount: 0,
        salesCODTotalAmount: 0,
      }
    };
  }

  componentDidMount() {
    this.setState({ loading: true });

    forkJoin(
      this.loadData(),
      this.loadSalesCODCount(),
      this.loadSalesCODTotalAmount()
    ).pipe(
      catchError((error)=>{
        this.setState({
          loading: false
        });
        MySwal.fire({
          type: "error",
          title:  error.response.data[0] ? error.response.data[0].errorMessage : 'Tidak diketahui',
          toast: true,
          position: "top-end",
          timer: 2000,
          showConfirmButton: false,
          customClass: "swal-height"
        });
        return throwError(error);
      })
    )
      .subscribe((response => {
        const data = {...this.state.data}
        data.summary = response[0];
        data.salesCODCount = response[1];
        data.salesCODTotalAmount = response[2];
        this.setState({
          data,
          loading: false
        });
      }));
  }

  loadData() {
    return this.dashboardRestService.getSummary({});
  }

  loadSalesCODCount() {
    const params = {
      lowDate: moment().format('YYYY-MM-DD'),
      highDate: moment().day(+7).format('YYYY-MM-DD')
    }
    return this.dashboardRestService.getSalesCODCount({params});
  }

  loadSalesCODTotalAmount() {
    const params = {
      lowDate: moment().format('YYYY-MM-DD'),
      highDate: moment().day(+7).format('YYYY-MM-DD')
    }
    return this.dashboardRestService.getSalesCODTotalAmount({params});
  }

  render() {
    return (
      <Fragment>
          <div>
            <Row>
              <Colxx xxs="12">
                <Breadcrumb
                  heading="menu.dashboards"
                  match={this.props.match}
                />
                <Separator className="mb-5" />
              </Colxx>
            </Row>
            <Row>
              <Colxx lg="12" xl="6">
                <CreditIssued value={this.state.data.summary} isLoading={this.state.loading}/>
                <BalanceCredit value={this.state.data.summary} isLoading={this.state.loading}/>
                <SalesCODCount value={this.state.data.salesCODCount} isLoading={this.state.loading}/>
              </Colxx>
              <Colxx lg="12" xl="6">
                <CODFee value={this.state.data.summary} isLoading={this.state.loading}/>
                <FundReimbursement value={this.state.data.summary} isLoading={this.state.loading}/>
                <SalesCODTotalAmount value={this.state.data.salesCODTotalAmount} isLoading={this.state.loading}/>

              </Colxx>
            </Row>
          </div>
      </Fragment>
    );
  }
}
