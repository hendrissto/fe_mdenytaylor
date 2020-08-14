import React, { Component } from "react";
import IconCard from "../../../components/cards/IconCard";


// const CreditIssued = () => {
//     const card = { title: 'dashboards.cards.credit-issued', icon: "iconsminds-coins", value: this.props.value };

//   return (
//     <IconCard {... card} className="mb-4" />
//   );
// };

class CreditIssued extends Component {
  constructor(){
    super();
    this.state = {
      value: 0
    };
  }

  static getDerivedStateFromProps(props, state) {
    if(props.value) {
      const {creditCOD} = props.value;
      return {
        value: creditCOD,
      };
    }
    return null;
  }

  render() {
    return (
      <div>
        <IconCard title='dashboards.cards.fund-reimbursement' icon="iconsminds-financial" value={'Rp. ' + this.state.value.toLocaleString('id-ID')} className="mb-4" isLoading={this.props.isLoading}/>
      </div>
    )
  }
}

export default CreditIssued;
