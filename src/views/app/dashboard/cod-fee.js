import React, { Component } from "react";
import IconCard from "../../../components/cards/IconCard";

class CODFee extends Component {
  constructor(){
    super();
    this.state = {
      value: 0
    };
  }

  static getDerivedStateFromProps(props, state) {
    if(props.value) {
      const {feeCOD} = props.value;
      return {
        value: feeCOD,
      };
    }
    return null;
  }

  render() {
    return (
      <div>
        <IconCard title='dashboards.cards.cod-fee' icon="iconsminds-handshake" value={'Rp. ' + this.state.value.toLocaleString('id-ID')} className="mb-4" isLoading={this.props.isLoading}/>
      </div>
    )
  }
}

export default CODFee;
