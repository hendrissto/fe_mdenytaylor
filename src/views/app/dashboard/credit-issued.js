import React, { Component } from "react";
import IconCard from "../../../components/cards/IconCard";


// const CreditIssued = () => {
//     const card = { title: 'dashboards.cards.credit-issued', icon: "iconsminds-coins", value: this.props.value };

//   return (
//     <IconCard {... card} className="mb-4" />
//   );
// };

class CreditIssued extends Component {
  constructor(...props){
    super(props);
  }

  render() {
    return (
      <div>
        <IconCard title='dashboards.cards.credit-issued' icon="iconsminds-coins" value={this.props.value} className="mb-4" />
      </div>
    )
  }
}

export default CreditIssued;
