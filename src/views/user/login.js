import React, { Component } from "react";
import { Row, Card, CardTitle, Form, Label, Input, Button } from "reactstrap";
import { NavLink } from "react-router-dom";
import { connect } from "react-redux";

import { loginUser } from "../../redux/actions";
import { Colxx } from "../../components/common/CustomBootstrap";
import IntlMessages from "../../helpers/IntlMessages";
import AuthRestService from "../../core/authRestService";
class Login extends Component {
  constructor(props) {
    super(props);
    this.authRest =  new AuthRestService();
    
    this.state = {
      grant_type: "password",
      username: "admin@clodeo.com",
      password: "HVVbPz64e5ejvsvm",
      client_id: "clodeo-admin-web"
    };
    
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }
  
  handleSubmit() {
    if (this.state.username !== "" && this.state.password !== "") {
      this.authRest.login(this.state).subscribe((response) => {
        this.props.loginUser(response, this.props.history);
      })
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
                <IntlMessages id="user.login-title" />
              </CardTitle>
              <Form onSubmit={this.handleSubmit}>
                <Label className="form-group has-float-label mb-4">
                  <Input 
                    name="username"   
                    type="email" 
                    value={this.state.username} 
                    onChange={this.handleInputChange} />
                  <IntlMessages id="user.username" />
                </Label>

                <Label className="form-group has-float-label mb-4">
                  <Input 
                    name="password"
                    type="password"
                    value={this.state.password}
                    onChange={this.handleInputChange} />
                  <IntlMessages id="user.password"/>
                </Label>
                <div className="d-flex justify-content-between align-items-center">
                  {/* <NavLink to={`/forgot-password`}>
                    <IntlMessages id="user.forgot-password-question" />
                  </NavLink> */}
                  <Button
                    color="primary"
                    className="btn-shadow"
                    size="lg"
                    onClick={() => this.handleSubmit()}>
                    <IntlMessages id="user.login-button" />
                  </Button>
                </div>
              </Form>
            </div>
          </Card>
        </Colxx>
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
