import React, { Component } from "react";
import { Button, Card, CardTitle, Col, Form, FormGroup, Input, Row } from "reactstrap";
import { connect } from "react-redux";
import { loginUser } from "../../redux/actions";
// import IntlMessages from "../../helpers/IntlMessages";
import { Formik } from "formik";
import validate from "./login-validation";

// import menuItems from "../../constants/menu";


// import BaseAlert from '../base/baseAlert'
// import * as css from "../base/baseCss"


class LoginComponent extends Component {
  data = {
    grant_type: "password",
    username: "",
    password: "",
    client_id: "clodeo-admin-web"
  };
  constructor(props) {
    super(props);

    this.state = {
      error: false,
      errorMessage: '',
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(values) {
    console.log('yooy')
    this.props.history.push("/user");
    // if (this.state.username !== "" && this.state.password !== "") {
      // this.authRest.login(values).subscribe(response => {
      //   this.props.loginUser(response, this.props.history);

      //   const { history } = this.props;
      //   this.acl.redirectAllowedMenu(history);

      //   this.setState({ loading: false })

      // }, err => {
      //   this.setState({ error: false, errorMessage: ''});
      //   const errorMessage = _.get(err, 'data.error_description', '');
      //   this.setState({ errorMessage ,loading: false, error: true })
      // });
    // }
  }

  // handleInputChange(event) {
  //   const target = event.target;
  //   const value = target.value;
  //   const name = target.name;

  //   this.setState({
  //     [name]: value
  //   });
  // }

  showMsg() {
    this.messages.show({ severity: 'success', summary: 'Success Message', detail: 'Order submitted' });
  }

  render() {
    return (
      <Row className="h-100">
        <Col xxs="12" md="3" className="m-auto">
          <Formik
            initialValues={this.data}
            onSubmit={this.handleSubmit}
            // validationSchema={validate}
          >
            {props => (
              <Card className="p-3">
                <CardTitle className="mb-4 text-center">
                  <strong>FE MDenny Tailor</strong>
                </CardTitle>
                  <Form onSubmit={props.handleSubmit}>
                    <FormGroup>
                      <Input type="text" name="username" value={props.values.username}
                        onChange={props.handleChange} id="email" placeholder="Email" />
                    </FormGroup>
                    <FormGroup>
                      <Input
                        name="password"
                        type="password"
                        value={props.values.password}
                        onChange={props.handleChange} id="password" placeholder="Password" />
                    </FormGroup>
                    <Button
                      color="primary"
                      type="submit"
                      block
                      >
                        Login
                      {/* onClick={props.handleSubmit} */}
                      {/* <IntlMessages id="user.login-button" /> */}
                    </Button>
                  </Form>
              </Card>
            )}
            </Formik>
        </Col>
        {/* {this.state.loading && (
          <Loading />
        )} */}
      </Row>
    );
  }
}
const mapStateToProps = ({ authUser }) => {
  const { user } = authUser;
  return { user };
};

export default connect(
  mapStateToProps,
  { loginUser }
)(LoginComponent);
