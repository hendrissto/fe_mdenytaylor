import React from "react";
import IconCard from "../../../components/cards/IconCard";


const CreditBalance = () => {
    const card = { title: 'dashboards.cards.credit-balance', icon: "iconsminds-money-bag", value: 17 };

  return (
    <IconCard {... card} className="mb-4" />
  );
};

export default CreditBalance;