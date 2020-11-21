import React, { Component } from "react";
import { Card, CardTitle, Col, Row } from "reactstrap";


// REDUX

// COMPONENTS

// CONTAINERS

// SERVICES
// SERVICES::REST

// OTHERS
import { Formik } from "formik";

export default class UserComponent extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Row className="h-100">
        <Col xxs="12" md="6" lg="5" className="mx-auto my-auto">
          <Card className="auth-card">
            <div className="card-body">
              <span className="logo-single mb-0" />
              {/* <h5 className="font-weight-bold mb-5 text-center">ADMIN</h5> */}
              <CardTitle className="mb-4">
                Thispage user
                {/* {this.state.alert.isShow && (
                  <div className="mb-4" >

                  </div>
                )} */}
              </CardTitle>

              {/* <div id="loaderInverseWrapper" style={{ height: 200 }}>
              <Loader inverse center content="loading..." /> */}
              {/* <Formik
                initialValues={this.state.form}
                onSubmit={this.handleSubmit}
                validationSchema={LoginValidation}
                >
                  {(formik) => (
                    <Form>
                      <div className="form-group mb-4">
                        <Field name="username" >
                          {({ field, form, meta }) => (
                            <div>
                              <Input
                                name="username"
                                type="email"
                                {...field}
                                placeholder="Email"
                              />
                              <div className="error-field">{meta.error && meta.touched ? meta.error : null}</div>
                            </div>
                          )}
                        </Field>
                      </div>

                      <div className="form-group mb-4">
                        <Field name="password" >
                          {({ field, form, meta }) => (
                            <div>
                              <Input
                                name="password"
                                type="password"
                                {...field}
                                placeholder="Password"
                              />
                            </div>
                          )}
                        </Field>
                      </div>

                      <div className="d-flex float-right">
                        <Button
                          color="primary"
                          className="btn-shadow"
                          size="lg"
                          type="submit"
                          disabled={!formik.isValid}
                        >
                          Login
                        </Button>
                      </div>
                    </Form>
                  )}
              </Formik> */}
            </div>
          </Card>
        </Col>
        {/* {this.state.isLoading && (
          <SpinnerContainer />
        )} */}
      </Row>
    );
  }
}
