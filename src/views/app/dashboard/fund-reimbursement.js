import React, { Component } from "react";
import IconCard from "../../../components/cards/IconCard";

class FundReimbursement extends Component {
  constructor(){
    super();
    this.state = {
      value: 0
    };
  }

  static getDerivedStateFromProps(props, state) {
    if(props.value) {
      const {creditTotal} = props.value;
      return {
        value: creditTotal,
      };
    }
    return null;
  }

  render() {
    return (
      <div>
        <IconCard title='dashboards.cards.fund-reimbursement' icon="iconsminds-financial" value={'Rp. ' + this.state.value.toLocaleString('id-ID')} className="mb-4" />
      </div>
    )
  }
}

export default FundReimbursement;
