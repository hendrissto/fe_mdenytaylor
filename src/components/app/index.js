import React, { Component } from "react";
import { BrowserRouter as Router, withRouter, Switch, Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { GuardProvider } from 'react-router-guards';
import { AclService } from "../../shared/services/auth/AclService";

import AppLayout from "../../layout/AppLayout";
import UserComponent from "./user/user";

// // import dashboard from "./dashboard";

class App extends Component {
  render() {
    // const { match } = this.props;
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
        <Router>
          <Switch>
            <Route path="/user" component={UserComponent} />

          {/* <GuardProvider guards={[activateRouted]}> */}
            {/* {/* {/* <GuardedRoute path={`${match.url}/dashboard`} component={dashboard} meta={{permissions: ['dashboard.general.view']}}/> */}
          {/* </GuardProvider> */}
            {/* <Redirect to="/error" /> */}
          </Switch>
        </Router>
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
