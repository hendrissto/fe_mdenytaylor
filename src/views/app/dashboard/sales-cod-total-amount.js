import React, { Component } from "react";
import IconCard from "../../../components/cards/IconCard";

class SalesCODTotalAmount extends Component {
  constructor(){
    super();
    this.state = {
      value: 0
    };
  }

  static getDerivedStateFromProps(props, state) {
    if(props.value) {
      const {total} = props.value;
      return {
        value: total,
      };
    }
    return null;
  }

  render() {
    return (
      <div>
        <IconCard title='dashboards.cards.sales-cod-total-amount' icon="iconsminds-tag-3" value={'Rp. ' + this.state.value.toLocaleString('id-ID')} className="mb-4" />
      </div>
    )
  }
}

export default SalesCODTotalAmount;
