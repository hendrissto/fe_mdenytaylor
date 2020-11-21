import React, { Component } from "react";
import { connect } from "react-redux";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import { IntlProvider } from "react-intl";
import AppLocale from "./assets/lang";
// import main from "./components";
import app from "./components/app";
import main from "./components";
import LoginComponent from "./components/login/login";
import UserComponent from "./components/app/user/user";
import { ErrorComponent } from "./components/error-component";

// import BlankPage from "./components/app/blank-page";

const AuthRoute = ({ component: Component, authUser, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      true ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            to: "/login",
            state: { from: props.location }
          }}
        />
      )
    }
  />
);

class App extends Component {

  render() {
    const { locale, loginUser } = this.props;
    const currentAppLocale = AppLocale[locale];

    return (
      <div className="h-100">
        <IntlProvider
          locale={currentAppLocale.locale}
          messages={currentAppLocale.messages}
        >
          <React.Fragment>
            <Router>
              <Switch>
                {/* <AuthRoute path="/" authUser={loginUser} component={app} /> */}
                <Route path="/login" component={LoginComponent} />
                <Route path="/user" exact component={UserComponent} />
                <Route path="/error" exact component={ErrorComponent} />
                <Route path="/" exact component={main} />
                {/* <Route path={"/blank-page"} component={BlankPage} />\ */}
                <Redirect to="/error" />
              </Switch>
            </Router>
          </React.Fragment>
        </IntlProvider>
      </div>
    );
  }
}

const mapStateToProps = ({ authUser, settings }) => {
  const { user } = authUser;
  const loginUser = user;
  console.log('mapStateToProps -> loginUser', loginUser)
  const { locale } = settings;
  return { loginUser, locale };
};
const mapActionsToProps = {};

export default connect(
  mapStateToProps,
  mapActionsToProps
)(App);
