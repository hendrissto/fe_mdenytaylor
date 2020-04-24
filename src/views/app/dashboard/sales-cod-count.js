import React, { Component } from "react";
import IconCard from "../../../components/cards/IconCard";

class SalesCODCount extends Component {
  constructor(...props){
    super(props);
  }

  render() {
    return (
      <div>
        <IconCard title='dashboards.cards.sales-cod-count' icon="iconsminds-handshake" value={'Rp. ' + this.props.value.toLocaleString('id-ID')} className="mb-4" />
      </div>
    )
  }
}

export default SalesCODCount;
