import React, { Component } from "react";
import { Formik } from "formik";
import { Redirect } from "react-router-dom";
import BillingRestService from "../../../api/billingRestService";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import { Card, CardBody } from "reactstrap";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Row,
  Col,
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";
import moment from "moment";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import Spinner from "../../../containers/pages/Spinner";
import { Checkbox } from 'primereact/checkbox';
// import BaseAlert from "../../base/baseAlert";
// import { BaseAlert } from "../../../containers/pages/BaseAlert";
import "./style.scss";
const MySwal = withReactContent(Swal);

export default class FormTenantSubscription extends Component {
  constructor(props) {
    super(props);

    const today = new Date();

    this.billingRest = new BillingRestService();
    this.loadData = this.loadData.bind(this);
    this.loadRelatedData = this.loadRelatedData.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this._renderTable = this._renderTable.bind(this);
    this._renderPackage = this._renderPackage.bind(this);
    this.toggle = this.toggle.bind(this);
    this.toggleAll = this.toggleAll.bind(this);
    this.toggleModal = this.toggleModal.bind(this);

    this.state = {
      error: false,
      type: this.props.match.params.type,
      data: [],
      relatedData: [],
      loading: true,
      billingCycle: [
        { name: "1 Bulan", code: "monthlyPrice", status: "monthly" },
        { name: "3 Bulan", code: "quaterlyPrice", status: "quarterly" },
        { name: "6 Bulan", code: "semesterlyPrice", status: "semesterly" },
        { name: "12 Bulan", code: "yearlyPrice", status: "yearly" }
      ],
      dropdownOpen: false,
      dropdownOpenAll: false,
      discount: "Rp.",
      discountAll: "Rp.",
      today: moment(today).format("YYYY-MM-DD"),
      packageActive: [],
      modal: false,
      redirect: false,
      date: today,
      paymentMethod: null,
      isActivateProduct: false,
      isActivateUser: false,
    };
  }

  componentDidMount() {
    this.loadRelatedData();
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  toggleModal() {
    this.setState({
      modal: !this.state.modal,
      redirect: !this.state.redirect
    });
  }

  toggleAll() {
    this.setState({
      dropdownOpenAll: !this.state.dropdownOpenAll
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
      const data = response.paymentMethodStr;
      const options = [];

      for (let i = 0; i < data.length; i++) {
        options.push({
          id: i,
          paymentMethod: data[i]
        });
      }

      this.setState({ relatedData: response, paymentMethod: options }, () => {
        this.loadData();
      });
    });
  }

  onBillingCycleChange(e) {
    this.setState({ billingCycle: e.value });
  }

  _renderText() {
    if (this.state.loading === false) {
      const data = this.state.data;

      const subscriptionPlan = data.subscriptionPlanId;
      const subscriptionPlanCapitalized =
        subscriptionPlan.charAt(0).toUpperCase() +
        subscriptionPlan.slice(1) +
        " Plan.";
      return (
        <h3>
          <b>{data.companyInfo.name}</b>
          {" sedang aktif di paket "}
          <b>{subscriptionPlanCapitalized}</b>
        </h3>
      );
    }
  }

  _renderPackage(props) {
    const data = { ...this.state.data };
    const options = { ...this.state.relatedData };
    for (let i = options.subscriptionPlan.length - 1; i >= 0; i--) {
      if (options.subscriptionPlan[i].id === data.subscriptionPlanId) {
        options.subscriptionPlan.splice(i, 1);
      }
    }

    return (
      <Dropdown
        value={props.values.package}
        options={this.state.relatedData.subscriptionPlan}
        onChange={props.handleChange}
        placeholder="Select a Package"
        name="package"
        optionLabel="name"
        style={{
          width: 204
        }}
      />
    );
  }

  _renderTable(props) {
    if (
      props.values.package.length === 0 ||
      props.values.billingCycle === undefined
    ) {
      props.values.prices = 0;
    } else {
      if (props.values.billingCycle.code === "monthlyPrice") {
        props.values.prices =
          props.values.package.monthlyPrice * props.values.qty;
      } else if (props.values.billingCycle.code === "quaterlyPrice") {
        props.values.prices =
          props.values.package.quaterlyPrice * props.values.qty;
      } else if (props.values.billingCycle.code === "semesterlyPrice") {
        props.values.prices =
          props.values.package.semesterlyPrice * props.values.qty;
      } else if (props.values.billingCycle.code === "yearlyPrice") {
        props.values.prices =
          props.values.package.yearlyPrice * props.values.qty;
      } else {
        props.values.prices = 0;
      }
    }

    if (props.values.discountType === "Rp.") {
      props.values.prices =
        props.values.prices - props.values.discountAmount * props.values.qty;
    } else if (props.values.discountType === "%") {
      const discAmount =
        (props.values.prices *
          props.values.discountPercent *
          props.values.qty) /
        100;
      props.values.prices = props.values.prices - discAmount;
    } else {
      props.values.prices = props.values.prices * 1;
    }

    return (
      <table
        className="table table-striped tableResponsive"
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
              width: 110
            }}
          >
            Package
          </th>
          <th
            style={{
              width: 130
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
          <th
            style={{
              width: 100
            }}
          >
            Price
          </th>
          <th
            style={{
              width: 300
            }}
          >
            Discount
          </th>
          <th
            style={{
              width: 107
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
              {props.values.package.length === 0 ||
              props.values.billingCycle === undefined
                ? "-"
                : props.values.billingCycle.code === "monthlyPrice"
                ? props.values.package.monthlyPrice
                : props.values.billingCycle.code === "quaterlyPrice"
                ? props.values.package.quaterlyPrice
                : props.values.billingCycle.code === "semesterlyPrice"
                ? props.values.package.semesterlyPrice
                : props.values.billingCycle.code === "yearlyPrice"
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
                        props.values.discountAmount = 0;
                        props.values.discountPercent = 0;
                        props.values.discountType = "Rp.";
                      }}
                    >
                      Rp.
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => {
                        this.setState({ discount: "%" });
                        props.values.discountAmount = 0;
                        props.values.discountPercent = 0;
                        props.values.discountType = "%";
                      }}
                    >
                      %
                    </DropdownItem>
                  </DropdownMenu>
                </ButtonDropdown>
                <InputText
                  name={
                    props.values.discountType === "Rp."
                      ? "discountAmount"
                      : "discountPercent"
                  }
                  onChange={props.handleChange}
                  value={
                    props.values.discountType === "Rp."
                      ? props.values.discountAmount
                      : props.values.discountPercent
                  }
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
    props.values.total = props.values.prices;

    if (props.values.discountTypeAll === "Rp.") {
      props.values.total =
        props.values.prices - props.values.discountTotalAmount;
    } else if (props.values.discountTypeAll === "%") {
      const discAmount =
        (props.values.total * props.values.discountTotalPercent) / 100;
      props.values.total = props.values.prices - discAmount;
    } else {
      props.values.total = props.values.prices;
    }

    if (props.values.taxRate > 0) {
      const taxRate =
        (props.values.total * parseInt(props.values.taxRate)) / 100;
      props.values.total = props.values.total + taxRate;
    }

    if (props.values.adjustmentAmount !== 0) {
      props.values.total =
        props.values.total + parseInt(props.values.adjustmentAmount);
    }

    if (props.values.adjustmentAmount === "") {
      props.values.adjustmentAmount = 0;
      props.values.total = props.values.prices;
    }
    return (
      <div style={{ width: "100%" }} >
        <div className="d-flex flex-row-reverse bd-highlight" style={{ marginRight: 85 }} >
          <Row style={{ width: 420 }} >
            <Col md="5" style={{ marginTop: 5 }}>
              <span style={{ marginLeft: 30 }} >
                Subtotal
              </span>
            </Col>
            <Col style={{ marginTop: 5, textAlign: "right" }} >
              {props.values.prices}
            </Col>
          </Row>
        </div>
        <div className="d-flex flex-row-reverse bd-highlight" style={{ marginRight: 85 }} >
          <Row style={{ width: 420 }} >
            <Col md="5" style={{ marginTop: 15 }} >
              <span style={{ marginLeft: 30 }} >
                Discount
              </span>
            </Col>
            <Col style={{ marginTop: 5, width: 500 }} >
              <Row>
                <ButtonDropdown isOpen={this.state.dropdownOpenAll} toggle={this.toggleAll} >
                  <DropdownToggle caret style={{
                      borderRadius: 0,
                      backgroundColor: "#848484",
                      border: 0,
                      width: 60
                    }}>
                    {this.state.discountAll}
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem
                      onClick={() => {
                        this.setState({ discountAll: "Rp." });
                        props.values.discountTotalAmount = 0;
                        props.values.discountTotalPercent = 0;
                        props.values.discountTypeAll = "Rp.";
                      }}
                    >
                      Rp.
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => {
                        this.setState({ discountAll: "%" });
                        props.values.discountTotalAmount = 0;
                        props.values.discountTotalPercent = 0;
                        props.values.discountTypeAll = "%";
                      }}
                    >
                      %
                    </DropdownItem>
                  </DropdownMenu>
                </ButtonDropdown>
                <InputText
                  name={
                    props.values.discountTypeAll === "Rp."
                      ? "discountTotalAmount"
                      : "discountTotalPercent"
                  }
                  onChange={props.handleChange}
                  value={
                    props.values.discountTypeAll === "Rp."
                      ? props.values.discountTotalAmount
                      : props.values.discountTotalPercent
                  }
                  style={{ textAlign: "right" }}
                />
              </Row>
            </Col>
          </Row>
        </div>
        <div className="d-flex flex-row-reverse bd-highlight" style={{ marginRight: 85 }}>
          <Row style={{ width: 420 }}>
            <Col md="5" style={{ marginTop: 5 }}>
              <span style={{ marginLeft: 30 }}>
                Tax
              </span>
            </Col>
            <Col style={{ marginTop: 5, textAlign: "right" }}>
              <InputText
                style={{
                  width: "45px",
                  height: "35px",
                  borderRadius: 5,
                  textAlign: "right"
                }}
                keyfilter="pint"
                value={props.values.taxRate}
                onChange={props.handleChange}
                name="taxRate"
              />
              <span style={{ fontSize: "20px", marginLeft: "5px" }}>%</span>
            </Col>
          </Row>
        </div>
        <div className="d-flex flex-row-reverse bd-highlight" style={{ marginRight: 85 }} >
          <Row style={{ width: 420 }}>
            <Col md="5" style={{ marginTop: 5 }}>
              <span style={{ marginLeft: 30 }}>
                Adjustment
              </span>
            </Col>
            <Col style={{ marginTop: 5, textAlign: "right" }}>
              <InputText
                name="adjustmentAmount"
                value={props.values.adjustmentAmount}
                onChange={props.handleChange}
                style={{ textAlign: "right" }}
              />
            </Col>
          </Row>
        </div>
        <div className="d-flex flex-row-reverse bd-highlight" style={{ marginRight: 85 }} >
          <Row style={{ width: 420 }}>
            <Col md="5" style={{ marginTop: 5 }}>
              <span
                style={{
                  marginLeft: 30,
                  fontSize: 20,
                  color: "#848484"
                }}
              >
                Total
              </span>
            </Col>
            <Col style={{ marginTop: 5, textAlign: "right" }}>
              <span style={{ fontSize: 20, color: "#848484" }} >
                {props.values.total}
              </span>
            </Col>
          </Row>
        </div>
        <div className="d-flex flex-row-reverse bd-highlight">
          <Row style={{ marginRight: 80 }}>
            <Button
              style={{
                borderRadius: "5px",
                marginRight: "10px",
                width: "110px"
              }}
              onClick={() => {
                this.setState({ redirect: true });
              }}
            >
              Cancel
            </Button>
            <Button
              style={{ borderRadius: "5px", width: "110px" }}
              onClick={props.handleSubmit}
            >
              Save
            </Button>
          </Row>
        </div>
      </div>
    );
  }

  validateError(props) {
    if (
      props.package.length === 0 ||
      props.billingCycle === undefined ||
      props.qty === "" ||
      parseInt(props.qty) === 0 ||
      props.paymentMethod === undefined
    ) {
      return true;
    } else {
      return false;
    }
  }

  handleSubmit(props) {
    if (this.validateError(props)) {
      MySwal.fire({
        type: "error",
        title: "Pastikan Semua Data Telah Terisi.",
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
        customClass: "swal-height"
      });
    } else {
      this.setState({ loading: true });
      if (props.billingCycle.code === "monthlyPrice") {
        props.packagePrice = props.package.monthlyPrice;
      } else if (props.billingCycle.code === "quaterlyPrice") {
        props.packagePrice = props.package.quaterlyPrice;
      } else if (props.billingCycle.code === "semesterlyPrice") {
        props.packagePrice = props.package.semesterlyPrice;
      } else if (props.billingCycle.code === "yearlyPrice") {
        props.packagePrice = props.package.yearlyPrice;
      } else {
        props.packagePrice = 0;
      }

      let data = {
        subscriptionPlanId: props.package.id,
        subscriptionStartDate: moment(this.state.date).format("YYYY-MM-DD"),
        isActivateProduct: this.state.isActivateProduct,
        isActivateUser: this.state.isActivateUser,
        invoiceNumber: props.invoiceNumber === "" ? null : props.invoiceNumber,
        invoiceDate: this.state.today,
        subtotal: props.prices,
        lastPaymentDate: this.state.today,
        discountPercent:
          parseInt(props.discountTotalPercent) === 0 ||
          isNaN(props.discountTotalPercent) === true ||
          props.discountTotalPercent === ""
            ? null
            : parseInt(props.discountTotalPercent),
        discountAmount:
          parseInt(props.discountTotalAmount) === 0 ||
          isNaN(props.discountTotalAmount) === true ||
          props.discountTotalAmount === ""
            ? 0
            : parseInt(props.discountTotalAmount),
        taxRate:
          isNaN(parseInt(props.taxRate)) === true ? 0 : parseInt(props.taxRate),
        amountPaid: props.total,
        adjustmentAmount:
          isNaN(parseInt(props.adjustmentAmount)) === true
            ? 0
            : parseInt(props.adjustmentAmount),
        paymentMethod: props.paymentMethod.paymentMethod,
        items: [
          {
            itemType: 0,
            billingCycle: props.billingCycle.status,
            description: props.package.description,
            qty: parseInt(props.qty),
            unitPrice: props.packagePrice,
            discountPercent:
              parseInt(props.discountPercent) === 0 ||
              isNaN(props.discountPercent) === true ||
              props.discountPercent === ""
                ? null
                : parseInt(props.discountPercent),
            discountAmount:
              parseInt(props.discountAmount) === 0 ||
              isNaN(props.discountAmount) === true ||
              props.discountAmount === ""
                ? 0
                : parseInt(props.discountAmount)
          }
        ]
      };
      
      this.billingRest
        .upgradeTenantsSubscriptions(
          parseInt(this.props.match.params.tenantId),
          data
        )
        .subscribe(response => {
          this.setState({ loading: false, redirect: true }, () => {
            MySwal.fire({
              type: "success",
              title: "Berhasil Upgrade tenant.",
              toast: true,
              position: "top-end",
              timer: 2000,
              showConfirmButton: false,
              customClass: "swal-height"
            });
          });
        });
    }
  }

  render() {
    if (this.state.redirect === true) {
      return <Redirect to="/app/billing" />;
    }
    return (
      <>
        <Row>
          <Colxx xxs="12">
            <h1>Upgrade</h1>
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
                        discountTypeAll: "Rp.",
                        discountAmount: 0,
                        discountPercent: 0,
                        discountTotalAmount: 0,
                        discountTotalPercent: 0,
                        packagePrice: 0,
                        prices: 0,
                        taxRate: 0,
                        adjustmentAmount: 0,
                        total: 0,
                        invoiceNumber: "",
                        package: this.state.packageActive
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
                              className="col-12 col-md-3"
                              style={{
                                marginTop: 5
                              }}
                            >
                              invoice Number
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
                              <InputText
                                name="invoiceNumber"
                                value={props.values.invoiceNumber}
                                onChange={props.handleChange}
                                style={{
                                  width: 204
                                }}
                                placeholder="- Auto -"
                              />
                            </Col>
                          </Row>
                          <Row
                            style={{
                              marginTop: 10,
                              width: "50%"
                            }}
                          >
                            <Col
                              xs="3"
                              className="col-12 col-md-3"
                              style={{
                                marginTop: 5
                              }}
                            >
                              Paymend Method
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
                                value={props.values.paymentMethod}
                                options={
                                  this.state.paymentMethod
                                }
                                onChange={props.handleChange}
                                placeholder="Select a Method"
                                name="paymentMethod"
                                optionLabel="paymentMethod"
                                style={{
                                  width: 204
                                }}
                              />
                            </Col>
                          </Row>
                          <Row
                            style={{
                              marginTop: 10,
                              width: "50%"
                            }}
                          >
                            <Col
                              xs="3"
                              className="col-12 col-md-3"
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
                            <Col>{this._renderPackage(props)}</Col>
                          </Row>
                          <Row
                            style={{
                              marginTop: 10,
                              width: "50%"
                            }}
                          >
                            <Col
                              xs="3"
                              className="col-12 col-md-3"
                              style={{
                                marginTop: 5
                              }}
                            >
                              Tanggal Mulai
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
                              style={{
                                width: 20
                              }}
                            >
                              <Calendar
                                dateFormat="dd/mm/yy"
                                value={this.state.date}
                                onChange={e => {
                                  this.setState({ date: e.value });
                                }}
                                showIcon={true}
                              />
                            </Col>
                          </Row>
                          <Row>
                            <Col className="responsive">
                              {this._renderTable(props)}
                            </Col>
                          </Row>
                          <div className="container">
                            <div className="row">
                              <div className="col align-self-end">
                                <div className="row">
                                  <Checkbox inputId="isActiveProduct" onChange={e => this.setState({isActivateProduct: e.checked})} checked={this.state.isActivateProduct}></Checkbox>
                                  <label htmlFor="isActiveProduct" className="p-checkbox-label" style={{ marginRight: 10, marginTop: 3 }}>Aktifkan Produk</label>

                                  <Checkbox inputId="isActiveUser" onChange={e => this.setState({isActivateUser: e.checked})} checked={this.state.isActivateUser}></Checkbox>
                                  <label htmlFor="isActiveUser" className="p-checkbox-label" style={{marginTop: 3}}>Aktifkan User</label>
                                </div>
                              </div>
                              <div className="col align-self-start">
                                {this._renderPrice(props)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Formik>
                  )}
                </Row>
                {this.state.loading && <Spinner />}
              </CardBody>
            </Card>
          </Colxx>

          {this.state.modal && (
            <Modal isOpen={this.state.modal}>
              <ModalHeader>Response</ModalHeader>
              <ModalBody>Berhasil.</ModalBody>
              <ModalFooter>
                <Button color="primary" outline onClick={this.toggleModal}>
                  Close
                </Button>
              </ModalFooter>
            </Modal>
          )}
        </Row>
      </>
    );
  }
}
