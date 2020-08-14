import React, { Component } from "react";
import IconCard from "../../../components/cards/IconCard";

class SalesCODCount extends Component {
  constructor(){
    super();
    this.state = {
      value: 0
    };
  }

  static getDerivedStateFromProps(props, state) {
    if(props.value) {
      const {count} = props.value;
      return {
        value: count,
      };
    }
    return null;
  }

  render() {
    return (
      <div>
        <IconCard title='dashboards.cards.sales-cod-count' icon="iconsminds-basket-coins" value={this.state.value} className="mb-4" isLoading={this.props.isLoading}/>
      </div>
    )
  }
}

export default SalesCODCount;
