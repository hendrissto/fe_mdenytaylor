import React from "react";
import IconCard from "../../../components/cards/IconCard";


const CreditIssued = () => {
    const card = { title: 'dashboards.cards.credit-issued', icon: "iconsminds-coins", value: 14 };

  return (
    <IconCard {... card} className="mb-4" />
  );
};

export default CreditIssued;
