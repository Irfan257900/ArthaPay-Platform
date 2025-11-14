import React from "react";
import { NumericFormat } from "react-number-format";
import { Link } from "react-router";

const TotalBalanceSection = ({ totalBalance }) => {
  return (
    <div className="kpicardbg p-5 rounded-lg">
      <h4 className="text-lg font-semibold capitalize text-primaryColor mb-2">
        <Link to="/create-crypto-wallet">Send an anvoice</Link>
      </h4>   
      <p className="text-base text-subTextColor mt-2">
        Request payments in your <br/>chosen currency
      </p>
    </div>
  );
};

export default TotalBalanceSection;