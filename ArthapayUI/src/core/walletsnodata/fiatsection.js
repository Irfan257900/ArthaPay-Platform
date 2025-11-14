import React from "react";
import errorimg from  "../../assets/images/Fiat.png"
import { Link } from "react-router";

const FiatSection = ({ fiatBalance }) => {
  return (
      <div className="kpicardbg p-5 rounded-lg">
         <h4 className="text-lg font-semibold text-primaryColor mb-2 capitalize">
            <Link to="/view-all-wallets">View all wallets</Link>
         </h4>
        <p className="text-sm text-subTextColor text-left">
          Keep track of multiple balancos <br/>accoss different wallets
        </p>
        <div className="text-right">
            <span className="icon btn-arrow shrink-0 ml-2"></span>
        </div>
      </div>
  );
};

export default FiatSection;