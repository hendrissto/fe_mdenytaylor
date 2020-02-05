import React, { Component } from "react";
import { Route, withRouter, Switch, Redirect } from "react-router-dom";
import { connect } from "react-redux";

import AppLayout from "../../layout/AppLayout";
import dashboard from "./dashboard";
import CODReceiptNumber from "./cod-receipt-number";
import Tenant from "./tenants";
import Billing from "./billings";
import FormTenantSubscription from "./billings/form-tenant-subscription";
import FormTenantRenewSubscriptions from './billings/form-tenant-renew-subscriptions';
import WithdrawFunds from "./request-withdraw-funds";
import ReceiptOfFunds from "./receipt-of-funds";
import DebitCod from './debit-cod'

import dashboards from "../gogo/dashboards";
import pages from "../gogo/pages";
import applications from "../gogo/applications";
import ui from "../gogo/ui";
import menu from "../gogo/menu";
import blankPage from "./blank-page";
import ListTransactions from "./list-transactions";
import TenantsBank from "./tenants-bank";
import WalletTransactions from "./wallet-transactions/wallet-transactions";

class App extends Component {
  render() {
    const { match } = this.props;

    return (
      <AppLayout>
        <Switch>
          <Redirect exact from={`${match.url}/`} to={`${match.url}/billing`} />
          <Route path={`${match.url}/dashboard`} component={dashboard} />
          <Route path={`${match.url}/cod-receipt-number`} component={CODReceiptNumber} />
          <Route path={`${match.url}/tenants`} component={Tenant} />
          <Route path={`${match.url}/billing`} component={Billing} />
          <Route path={`${match.url}/billings/upgrade/:tenantId`} component={FormTenantSubscription} />
          <Route path={`${match.url}/billings/renew/:tenantId`} component={FormTenantRenewSubscriptions} />
          <Route path={`${match.url}/request-withdraw-funds`} component={WithdrawFunds} />
          <Route path={`${match.url}/tenants-bank`} component={TenantsBank} />
          <Route path={`${match.url}/debit-cod`} component={DebitCod} />
          <Route path={`${match.url}/receipt-of-funds`} component={ReceiptOfFunds} />
          <Route path={`${match.url}/list-transactions`} component={ListTransactions} />
          <Route path={`${match.url}/wallet-transactions`} component={WalletTransactions} />

          {/* route dummy */}
          <Route path={`${match.url}/dashboards`} component={dashboards} />
          <Route path={`${match.url}/applications`} component={applications} />
          <Route path={`${match.url}/pages`} component={pages} />
          <Route path={`${match.url}/ui`} component={ui} />
          <Route path={`${match.url}/menu`} component={menu} />
          <Route path={`${match.url}/blank-page`} component={blankPage} />\
          <Redirect to="/error" />
        </Switch>
      </AppLayout>
    );
  }
}
const mapStateToProps = ({ menu }) => {
  const { containerClassnames } = menu;
  return { containerClassnames };
};

export default withRouter(
  connect(
    mapStateToProps,
    {}
  )(App)
);
