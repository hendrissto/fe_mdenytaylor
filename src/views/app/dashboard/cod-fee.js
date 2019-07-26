import React from "react";
import IconCard from "../../../components/cards/IconCard";


const CODFee = () => {
    const card = { title: 'dashboards.cards.cod-fee', icon: "iconsminds-handshake", value: 20 };

  return (
    <IconCard {... card} className="mb-4" />
  );
};

export default CODFee;