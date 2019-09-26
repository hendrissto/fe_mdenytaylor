import React, { Component, Fragment } from "react";
import { Row } from "reactstrap";
import BalanceCredit from "./credit-balance";
import CreditIssued from "./credit-issued";
import CODFee from "./cod-fee";
import FundReimbursement from "./fund-reimbursement";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import Breadcrumb from "../../../containers/navs/Breadcrumb";

const user = JSON.parse(localStorage.getItem("user"));
export default class Dashboard extends Component {

	render() {
		return (
			<Fragment>
				<Row>
					<Colxx xxs="12">
						<Breadcrumb heading="menu.dashboards" match={this.props.match} />
						<Separator className="mb-5" />
					</Colxx>
				</Row>
				<Row>
					<Colxx lg="12" xl="6">
						<CreditIssued />
						<BalanceCredit />
					</Colxx>
					<Colxx lg="12" xl="6">
						<CODFee />
						<FundReimbursement />
					</Colxx>
				</Row>
			</Fragment>
		)
	}
}