import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import UserLayout from "../../layout/UserLayout";

import UserComponent from "./user";
// import login from "./login";
// import register from "./register";
// import forgotPassword from "./forgot-password";

const User = ({ match }) => {
  console.log(UserComponent)
  return (
    <UserLayout>
      <Switch>
        <Redirect exact from={`${match.url}`} to={`/user`} />
        <Route path={`/user`} component={UserComponent} />
        {/* <Route path={`${match.url}/register`} component={register} /> */}
        {/* <Route
          path={`${match.url}/forgot-password`}
          component={forgotPassword}
        /> */}
        <Redirect to="/error" />
      </Switch>
    </UserLayout>
  );
};

export default User;
