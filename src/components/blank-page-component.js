import * as _ from "lodash";
import React, { Component, Fragment } from "react";

import { Row, Card, Button } from "reactstrap";
import { NavLink } from "react-router-dom";
import { Colxx } from "../../components/common/CustomBootstrap";
import IntlMessages from "../../helpers/IntlMessages";
import menuItems from "../../constants/menu";
import { AclService } from "../../shared/services/auth/AclService";

export default class BlankPageComponent extends Component {

  constructor(props) {
    super(props);

    this.acl = new AclService();
    this.redirectValidRoute = this.redirectValidRoute.bind(this);

  }

  redirectValidRoute() {
    const { history } = this.props;
    this.acl.redirectAllowedMenu(history);

  }

  render() {
    return (
      <Row className="h-100">
        <Colxx xxs="12" md="10" className="mx-auto my-auto">
          <Card className="auth-card">
            <div className="position-relative image-side ">
              {/* <p className="text-white h2">MAGIC IS IN THE DETAILS</p>
              <p className="white mb-0">
                Please use your credentials to login.
                <br />
                If you are not a member, please{" "}
                <NavLink to={`/register`} className="white">
                  register
                </NavLink>
                .
              </p> */}
            </div>

            <div className="form-side">
              <NavLink to={`/`} className="white">
                <span className="logo-single" />
              </NavLink>
              <p className="mb-0 text-muted mb-0">
                Anda tidak memiliki akses ke halaman ini
              </p>
              <p className="display-3 font-weight-bold mb-5">403</p>
              <Button
                onClick={e => this.redirectValidRoute()}
                color="primary"
                className="btn-shadow"
                size="lg"
              >
                <IntlMessages id="pages.go-back-home" />
              </Button>
            </div>
          </Card>
        </Colxx>
      </Row>
    );
  }
}
