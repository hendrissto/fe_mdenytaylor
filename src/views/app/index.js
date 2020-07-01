import React, { Component } from "react";
import { Route, withRouter, Switch, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { GuardProvider, GuardedRoute } from 'react-router-guards';
import { AclService } from "../../services/auth/AclService";

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
import WithdrawOfTenantFunds from './withdraw-of-tenant-funds'

// import dashboards from "../gogo/dashboards";
// import pages from "../gogo/pages";
// import applications from "../gogo/applications";
// import ui from "../gogo/ui";
// import menu from "../gogo/menu";
import ListTransactions from "./list-transactions";
import TenantsBank from "./tenants-bank";
import WalletTransactions from "./wallet-transactions/wallet-transactions";
import DetailWalletTransactions from "./wallet-transactions/detail-page";
import UserRoles from "./users-roles";
import Users from "./users";
import ListPermission from "./list-permission";

class App extends Component {
  render() {
    const { match } = this.props;
    this.acl = new AclService();


    const activateRouted = (to, from, next) => {
      const isValidRoles = this.acl.can(to.meta.permissions);
      if (isValidRoles) {
        next();

      } else {
        next.redirect(`/blank-page`);
      }
    };
    return (
      <AppLayout>
        <Switch>

        <GuardProvider guards={[activateRouted]}>
          {/* <Redirect exact from={`${match.url}/`}  to={`${match.url}/billing`} /> */}

          <GuardedRoute path={`${match.url}/dashboard`} component={dashboard} meta={{permissions: ['dashboard.general.view']}}/>
          <GuardedRoute path={`${match.url}/cod-receipt-number`} component={CODReceiptNumber} meta={{permissions: ['cod.transfer_credit.view']}} />
          <GuardedRoute path={`${match.url}/tenants`} component={Tenant} meta={{permissions: ['tenant.tenant_list.view']}} />
          <GuardedRoute path={`${match.url}/billing`} component={Billing} meta={{permissions: ['tenant.subscription.view']}} />
          <GuardedRoute path={`${match.url}/billings/upgrade/:tenantId`} component={FormTenantSubscription} meta={{permissions: ['tenant.subscription.edit']}} />
          <GuardedRoute path={`${match.url}/billings/renew/:tenantId`} component={FormTenantRenewSubscriptions} meta={{permissions: ['tenant.subscription.edit']}} />
          <GuardedRoute path={`${match.url}/request-withdraw-funds`} component={WithdrawFunds} meta={{permissions: ['wallet.withdrawal.view']}} />
          <GuardedRoute path={`${match.url}/tenants-bank`} component={TenantsBank} meta={{permissions: ['wallet.tenant_bank.view']}} />
          <GuardedRoute path={`${match.url}/debit-cod`} component={DebitCod} meta={{permissions: ['wallet.withdrawal_history.view']}} />
          <GuardedRoute path={`${match.url}/withdraw-of-tenant-funds`} component={WithdrawOfTenantFunds} meta={{permissions: ['wallet.withdrawal_history.view']}} />
          <GuardedRoute path={`${match.url}/receipt-of-funds`} component={ReceiptOfFunds} meta={{permissions: ['cod.transfer_credit.view']}} />
          <GuardedRoute path={`${match.url}/list-transactions`} component={ListTransactions} meta={{permissions: ['tenant.general.view']}} />
          <GuardedRoute path={`${match.url}/wallet-transactions`} component={WalletTransactions} meta={{permissions: ['wallet.tenant_wallet.view']}} />
          <GuardedRoute path={`${match.url}/detail-transactions/:walletId`} component={DetailWalletTransactions} meta={{permissions: ['wallet.tenant_wallet.view']}} />
          <GuardedRoute path={`${match.url}/users`} component={Users} meta={{permissions: ['admin.user_admin.view']}} />
          <GuardedRoute path={`${match.url}/roles`} component={UserRoles} meta={{permissions: ['admin.role_admin.view']}} />
          <GuardedRoute path={`${match.url}/permissions`} component={ListPermission} meta={{permissions: ['admin.permission_admin.view']}} />
      </GuardProvider>
          {/* route dummy */}
          {/* <GuardedRoute path={`${match.url}/dashboards`} component={dashboards} meta={{permissions: ['dashboard.general.view']}} />
          <GuardedRoute path={`${match.url}/applications`} component={applications} meta={{permissions: ['dashboard.general.view']}} />
          <GuardedRoute path={`${match.url}/pages`} component={pages} meta={{permissions: ['dashboard.general.view']}} />
          <GuardedRoute path={`${match.url}/ui`} component={ui} meta={{permissions: ['dashboard.general.view']}} />
          <GuardedRoute path={`${match.url}/menu`} component={menu} meta={{permissions: ['dashboard.general.view']}} /> */}
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
