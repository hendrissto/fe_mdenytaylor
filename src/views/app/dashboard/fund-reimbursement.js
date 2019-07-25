import React from "react";
import IconCard from "../../../components/cards/IconCard";


const FundReimbursement = () => {
    const card = { title: 'dashboards.cards.fund-reimbursement', icon: "iconsminds-clock", value: 17 };

  return (
    <IconCard {... card} className="mb-4" />
  );
};

export default FundReimbursement;