import React, { Component } from "react";
import IconCard from "../../../components/cards/IconCard";

class CreditBalance extends Component {
  constructor(){
    super();
    this.state = {
      value: 0
    };
  }

  static getDerivedStateFromProps(props, state) {
    if(props.value) {
      const {creditRemaining} = props.value;
      return {
        value: creditRemaining,
      };
    }
    return null;
  }

  render() {
    return (
      <div>
        <IconCard title='dashboards.cards.credit-balance' icon="iconsminds-money-bag"  value={'Rp. ' + this.state.value.toLocaleString('id-ID')} className="mb-4" isLoading={this.props.isLoading}/>
      </div>
    )
  }
}

export default CreditBalance;
