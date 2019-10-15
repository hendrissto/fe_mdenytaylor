import React, { Component, Fragment } from "react";
import { Row } from "reactstrap";
import BalanceCredit from "./credit-balance";
import CreditIssued from "./credit-issued";
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
      data: null
    };
  }

  componentDidMount() {
    this.loadData();
  }

  loadData() {
    this.setState({ loading: true });
    this.dashboardRestService.getSummary({}).subscribe(response => {
			this.setState({ data: response, loading: false });
    });
  }

  render() {
    return (
      <Fragment>
        {this.state.loading && <Loading />}
        {this.state.data !== null && (
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
                <CreditIssued value={this.moneyFormat.numberFormat(this.state.data.creditCOD)} />
                <BalanceCredit value={this.moneyFormat.numberFormat(this.state.data.creditRemaining)} />
              </Colxx>
              <Colxx lg="12" xl="6">
                <CODFee value={this.moneyFormat.numberFormat(this.state.data.feeCOD)} />
                <FundReimbursement value={this.moneyFormat.numberFormat(this.state.data.creditTotal)} />
              </Colxx>
            </Row>
          </div>
        )}
      </Fragment>
    );
  }
}
