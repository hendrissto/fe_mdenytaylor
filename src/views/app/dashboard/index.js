import React, { Component, Fragment } from "react";
import { Row } from "reactstrap";
import { forkJoin } from 'rxjs';
import BalanceCredit from "./credit-balance";
import CreditIssued from "./credit-issued";
import SalesCODCount from "./sales-cod-count";
import SalesCODTotalAmount from "./sales-cod-total-amount";
import CODFee from "./cod-fee";
import FundReimbursement from "./fund-reimbursement";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import Breadcrumb from "../../../containers/navs/Breadcrumb";
import DashboardRestService from "../../../api/dashboardRestService";

import Loading from "../../../containers/pages/Spinner";
import { MoneyFormat } from "../../../services/Format/MoneyFormat"

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
    return this.dashboardRestService.getSalesCODCount({});
  }

  loadSalesCODTotalAmount() {
    return this.dashboardRestService.getSalesCODTotalAmount({});
  }

  render() {
    return (
      <Fragment>
        {this.state.loading && <Loading />}
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
                <CreditIssued value={this.state.data.summary} />
                <BalanceCredit value={this.state.data.summary} />
                <SalesCODCount value={this.state.data.salesCODCount} />
              </Colxx>
              <Colxx lg="12" xl="6">
                <CODFee value={this.state.data.summary} />
                <FundReimbursement value={this.state.data.summary} />
                <SalesCODTotalAmount value={this.state.data.salesCODTotalAmount} />

              </Colxx>
            </Row>
          </div>
      </Fragment>
    );
  }
}
