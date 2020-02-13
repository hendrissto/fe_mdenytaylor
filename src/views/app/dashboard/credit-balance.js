import React, { Component } from "react";
import IconCard from "../../../components/cards/IconCard";

class CreditBalance extends Component {
  constructor(...props){
    super(props);
  }

  render() {
    return (
      <div>
        <IconCard title='dashboards.cards.credit-balance' icon="iconsminds-money-bag"  value={'Rp. ' + this.props.value.toLocaleString('id-ID')} className="mb-4" />
      </div>
    )
  }
}

export default CreditBalance;