import React, { Component } from "react";
import IconCard from "../../../components/cards/IconCard";

class FundReimbursement extends Component {
  constructor(props){
    super(props);
  }

  render() {
    return (
      <div>
        <IconCard title='dashboards.cards.fund-reimbursement' icon="iconsminds-financial" value={this.props.value} className="mb-4" />
      </div>
    )
  }
}

export default FundReimbursement;