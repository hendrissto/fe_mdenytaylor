import React, { Component } from "react";
import IconCard from "../../../components/cards/IconCard";

class CODFee extends Component {
  constructor(...props){
    super(props);
  }

  render() {
    return (
      <div>
        <IconCard title='dashboards.cards.cod-fee' icon="iconsminds-handshake" value={'Rp. ' + this.props.value.toLocaleString('id-ID')} className="mb-4" />
      </div>
    )
  }
}

export default CODFee;