import React, { Component } from "react";
import IconCard from "../../../components/cards/IconCard";

class SalesCODTotalAmount extends Component {
  constructor(...props){
    super(props);
  }

  render() {
    return (
      <div>
        <IconCard title='dashboards.cards.sales-cod-total-amount' icon="iconsminds-handshake" value={'Rp. ' + this.props.value.toLocaleString('id-ID')} className="mb-4" />
      </div>
    )
  }
}

export default SalesCODTotalAmount;
