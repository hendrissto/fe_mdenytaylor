import React, { Component } from "react";
import { Formik } from "formik";
import BillingRestService from "../../../core/billingRestService";

import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import { Card, CardBody } from "reactstrap";
import Breadcrumb from "../../../containers/navs/Breadcrumb";
import {
  InputGroup,
  Button,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Row,
  Col,
  Collapse,
  CardFooter,
  Popover,
  PopoverHeader,
  PopoverBody,
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";

import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import Spinner from "../../../containers/pages/Spinner";

export default class FormTenantSubscription extends Component {
  constructor(props) {
    super(props);

    this.billingRest = new BillingRestService();
    this.loadData = this.loadData.bind(this);
    this.loadRelatedData = this.loadRelatedData.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this._renderTable = this._renderTable.bind(this);
    this.toggle = this.toggle.bind(this);

    this.state = {
      type: this.props.match.params.type,
      data: [],
      relatedData: [],
      loading: true,
      billingCycle: [
        { name: "1 Bulan", code: "monthlyPrice" },
        { name: "3 Bulan", code: "quaterlyPrice" },
        { name: "6 Bulan", code: "semesterlyPrice" },
        { name: "12 Bulan", code: "yearlyPrice" }
      ],
      dropdownOpen: false,
      discount: "Rp."
    };
  }

  componentDidMount() {
    this.loadData();
    this.loadRelatedData();
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  loadData() {
    const tenantId = parseInt(this.props.match.params.tenantId);
    this.billingRest
      .getTenantsSubscriptionsById(tenantId, {})
      .subscribe(response => {
        this.setState({ data: response, loading: false });
      });
  }

  loadRelatedData() {
    this.billingRest.getRelatedData({}).subscribe(response => {
      this.setState({ relatedData: response });
    });
  }

  onBillingCycleChange(e) {
    this.setState({ billingCycle: e.value });
  }

  _renderText() {
    if (this.state.loading === false) {
      const data = this.state.data;

      return (
        <h3>
          {data.companyInfo.name +
            " sedang aktif dipaket " +
            data.subscriptionPlanId}
        </h3>
      );
    }
  }

  _renderTable(props) {
    console.log(props);

    if (
      props.values.package === undefined ||
      props.values.billingCycle === undefined
    ) {
      props.values.prices = 0;
    } else {
      if (props.values.billingCycle.code == "monthlyPrice") {
        props.values.prices =
          props.values.package.monthlyPrice * props.values.qty;
      } else if (props.values.billingCycle.code == "quaterlyPrice") {
        props.values.prices =
          props.values.package.quaterlyPrice * props.values.qty;
      } else if (props.values.billingCycle.code == "semesterlyPrice") {
        props.values.prices =
          props.values.package.semesterlyPrice * props.values.qty;
      } else if (props.values.billingCycle.code == "yearlyPrice") {
        props.values.prices =
          props.values.package.yearlyPrice * props.values.qty;
      } else {
        props.values.prices = 0;
      }
    }

    if (props.values.discountType == "Rp.") {
      props.values.prices = props.values.prices - props.values.discountAmount;
    } else if (props.values.discountType == "%") {
      const discAmount =
        (props.values.prices * props.values.discountAmount) / 100;
      props.values.prices = props.values.prices - discAmount;
    } else {
      props.values.prices = props.values.prices;
    }

    return (
      <table
        className="table table-striped"
        style={{
          width: "100%"
        }}
      >
        <thead>
          <th
            style={{
              width: 10
            }}
          >
            #
          </th>
          <th
            style={{
              width: 200
            }}
          >
            Package
          </th>
          <th
            style={{
              width: 200
            }}
          >
            Description
          </th>
          <th
            style={{
              width: 200
            }}
          >
            Billing Cycle
          </th>
          <th
            style={{
              width: 50
            }}
          >
            Qty
          </th>
          <th>Price</th>
          <th>Discount</th>
          <th
            style={{
              width: 200
            }}
          >
            Total
          </th>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>
              {props.values.package === undefined
                ? "-"
                : props.values.package.name}
            </td>
            <td>
              {props.values.package === undefined
                ? "-"
                : props.values.package.description}
            </td>
            <td
              style={{
                width: 50
              }}
            >
              <Dropdown
                value={props.values.billingCycle}
                options={this.state.billingCycle}
                onChange={props.handleChange}
                placeholder="Select a Billing Cycle"
                name="billingCycle"
                optionLabel="name"
              />
            </td>
            <td>
              <InputText
                name="qty"
                value={props.values.qty}
                onChange={props.handleChange}
                style={{
                  width: 40
                }}
              />
            </td>
            <td>
              {props.values.package === undefined ||
              props.values.billingCycle === undefined
                ? "-"
                : props.values.billingCycle.code == "monthlyPrice"
                ? props.values.package.monthlyPrice
                : props.values.billingCycle.code == "quaterlyPrice"
                ? props.values.package.quaterlyPrice
                : props.values.billingCycle.code == "semesterlyPrice"
                ? props.values.package.semesterlyPrice
                : props.values.billingCycle.code == "yearlyPrice"
                ? props.values.package.yearlyPrice
                : "Wrong Value"}
            </td>
            <td>
              <Row>
                <ButtonDropdown
                  isOpen={this.state.dropdownOpen}
                  toggle={this.toggle}
                >
                  <DropdownToggle
                    caret
                    style={{
                      borderRadius: 0,
                      backgroundColor: "#848484",
                      border: 0,
                      width: 60
                    }}
                  >
                    {this.state.discount}
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem
                      onClick={() => {
                        this.setState({ discount: "Rp." });
                        props.values.discountType = "Rp.";
                      }}
                    >
                      Rp.
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => {
                        this.setState({ discount: "%" });
                        props.values.discountType = "%";
                      }}
                    >
                      %
                    </DropdownItem>
                  </DropdownMenu>
                </ButtonDropdown>
                <InputText
                  name="discountAmount"
                  onChange={props.handleChange}
                  value={props.values.discountAmount}
                />
              </Row>
            </td>
            <td>{props.values.prices}</td>
          </tr>
        </tbody>
      </table>
    );
  }

  _renderPrice(props) {
    return (
      <div
        style={{
          width: "100%"
        }}
      >
        <div
          class="d-flex flex-row-reverse bd-highlight"
          style={{ marginRight: 50 }}
        >
          <Row
            style={{
              width: 250
            }}
          >
            <Col
              md="5"
              style={{
                marginTop: 5
              }}
            >
              Subtotal
            </Col>
            <Col
              xs="1"
              style={{
                marginTop: 5
              }}
            >
              :
            </Col>
            <Col
              md="5"
              style={{
                marginTop: 5
              }}
            >
              1000000
            </Col>
          </Row>
        </div>
        <div
          class="d-flex flex-row-reverse bd-highlight"
          style={{ marginRight: 50 }}
        >
          <Row
            style={{
              width: 250
            }}
          >
            <Col
              md="5"
              style={{
                marginTop: 5
              }}
            >
              Subtotal
            </Col>
            <Col
              xs="1"
              style={{
                marginTop: 5
              }}
            >
              :
            </Col>
            <Col
              md="5"
              style={{
                marginTop: 5
              }}
            >
              1000000
            </Col>
          </Row>
        </div>
        <div
          class="d-flex flex-row-reverse bd-highlight"
          style={{ marginRight: 50 }}
        >
          <Row
            style={{
              width: 250
            }}
          >
            <Col
              md="5"
              style={{
                marginTop: 5
              }}
            >
              Subtotal
            </Col>
            <Col
              xs="1"
              style={{
                marginTop: 5
              }}
            >
              :
            </Col>
            <Col
              md="5"
              style={{
                marginTop: 5
              }}
            >
              1000000
            </Col>
          </Row>
        </div>
      </div>
    );
  }

  handleSubmit(values) {
    console.log(values);
  }

  render() {
    return (
      <>
        <Row>
          <Colxx xxs="12">
            <h1>
              {this.state.type.charAt(0).toUpperCase() +
                this.state.type.substring(1)}
            </h1>
            <Separator className="mb-5" />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <Card className="mb-12 lg-12">
              <CardBody>
                {this._renderText()}
                {this.state.loading && <Spinner />}
              </CardBody>
            </Card>

            <Card
              className="mb-12 lg-12"
              style={{
                marginTop: 10
              }}
            >
              <CardBody>
                <Row>
                  {this.state.loading === false && (
                    <Formik
                      initialValues={{
                        qty: 1,
                        discountType: "Rp.",
                        discountAmount: 0,
                        prices: 0
                      }}
                      onSubmit={this.handleSubmit}
                      enableReinitialize={true}
                    >
                      {props => (
                        <div
                          style={{
                            width: "100%"
                          }}
                        >
                          <Row
                            style={{
                              marginTop: 10,
                              width: "50%"
                            }}
                          >
                            <Col
                              xs="3"
                              style={{
                                marginTop: 5
                              }}
                            >
                              Upgrade to
                            </Col>
                            <Col
                              xs="1"
                              style={{
                                marginTop: 5
                              }}
                            >
                              :
                            </Col>
                            <Col>
                              <Dropdown
                                value={props.values.package}
                                options={
                                  this.state.relatedData.subscriptionPlan
                                }
                                onChange={props.handleChange}
                                placeholder="Select a Package"
                                name="package"
                                optionLabel="name"
                              />
                            </Col>
                          </Row>
                          <Row>
                            <Col>{this._renderTable(props)}</Col>
                          </Row>
                          <Row>
                            <Col>{this._renderPrice(props)}</Col>
                          </Row>
                        </div>
                      )}
                    </Formik>
                  )}
                </Row>
                {this.state.loading && <Spinner />}
              </CardBody>
            </Card>
          </Colxx>
        </Row>
      </>
    );
  }
}
