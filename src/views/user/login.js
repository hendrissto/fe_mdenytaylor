import React, { Component } from "react";
import { Row, Card, CardTitle, Form, Label, Input, Button } from "reactstrap";
import { NavLink } from "react-router-dom";
import { connect } from "react-redux";

import { loginUser } from "../../redux/actions";
import { Colxx } from "../../components/common/CustomBootstrap";
import IntlMessages from "../../helpers/IntlMessages";
import AuthRestService from "../../core/authRestService";
import Loading from '../../containers/pages/Spinner'
import { Formik } from "formik";
import validate from "./login-validation";

import BaseAlert from '../base/baseAlert'
import * as css from "../base/baseCss"

class Login extends Component {
  data = {
    grant_type: "password",
    username: "",
    password: "",
    client_id: "clodeo-admin-web"
  };
  constructor(props) {
    super(props);
    this.authRest = new AuthRestService();

    this.state = {
      loading: false,
      error: false,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleSubmit(values) {
    if (this.state.username !== "" && this.state.password !== "") {
      this.setState({ loading: true })
      this.authRest.login(values).subscribe(response => {
        this.props.loginUser(response, this.props.history);
        this.setState({ loading: false })
      }, err => {
        this.setState({ loading: false, error: true })
      });
    }
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  showMsg() {
    this.messages.show({ severity: 'success', summary: 'Success Message', detail: 'Order submitted' });
  }

  render() {
    return (
      <Row className="h-100">
        <Colxx xxs="12" md="10" className="mx-auto my-auto">
          <Card className="auth-card">
            <div className="position-relative image-side ">
              <p className="text-white h2">MAGIC IS IN THE DETAILS</p>
              <p className="white mb-0">
                Please use your credentials to login.
                <br />
                If you are not a member, please{" "}
                <NavLink to={`/register`} className="white">
                  register
                </NavLink>
                .
              </p>
            </div>
            <div className="form-side">
              <NavLink to={`/`} className="white">
                <span className="logo-single" />
              </NavLink>
              <CardTitle className="mb-4">
                <strong style={css.style.login}><IntlMessages id="user.login-title" /></strong>
                {this.state.error && (
                <BaseAlert
                  onClick={() => {
                    this.setState({error: false});
                  }}
                  text={'Username & password salah, silahkan periksa kembali..'}
                />
              )}
              </CardTitle>
              <Formik
                initialValues={this.data}
                onSubmit={this.handleSubmit}
                validationSchema={validate}
              >
                {props => (
                  <Form>
                    <Label className="form-group has-float-label mb-4">
                      <Input
                        name="username"
                        type="email"
                        value={props.values.username}
                        onChange={props.handleChange}
                      />
                      <strong style={css.style.required}>{props.errors && props.touched
                        ? props.errors.username
                        : null}</strong>
                    </Label>

                    <Label className="form-group has-float-label mb-4">
                      <Input
                        name="password"
                        type="password"
                        value={props.values.password}
                        onChange={props.handleChange}
                      />
                      <strong style={css.style.required}>{props.errors && props.touched
                        ? props.errors.password
                        : null}</strong>
                    </Label>
                    <div className="d-flex justify-content-between align-items-center">
                      <Button
                        color="primary"
                        className="btn-shadow"
                        size="lg"
                        onClick={props.handleSubmit}
                      >
                        <IntlMessages id="user.login-button" />
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </Card>
        </Colxx>
        {this.state.loading && (
          <Loading />
        )}
      </Row>
    );
  }
}
const mapStateToProps = ({ authUser }) => {
  const { user, loading } = authUser;
  return { user, loading };
};

export default connect(
  mapStateToProps,
  {
    loginUser
  }
)(Login);
