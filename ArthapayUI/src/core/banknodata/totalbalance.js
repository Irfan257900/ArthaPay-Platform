import React from "react";
import { NumericFormat } from "react-number-format";
import { Link } from "react-router";

const TotalBalanceSection = ({ totalBalance }) => {
  return (
    <div className="kpicardbg p-5 rounded-lg">
      <h4 className="text-lg font-semibold capitalize text-primaryColor mb-2">
        <Link to="/create-crypto-wallet">Create a crypto wallet</Link>
      </h4>   
      <p className="text-base text-subTextColor mt-2">
        Eastly receive, Send and exchange <br/>your digital assets 
      </p>
    </div>
  );
};

export default TotalBalanceSection;