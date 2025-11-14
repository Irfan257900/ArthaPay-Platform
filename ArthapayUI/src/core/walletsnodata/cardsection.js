import React from "react";
import cardPlaceholderImglight from "../../assets/images/card-img.svg"; 
import cardPlaceholderImg from "../../assets/images/card-img-dark.svg"; 
import CustomButton from "../button/button";
import { Link } from "react-router";

const CardSection = () => {
  return (
    <div className="kpicardbg p-5 rounded-lg">
      <h4 className="text-lg font-semibold text-primaryColor mb-2 capitalize">
        <Link to="/create-fiat-wallet">Create a fiat wallet</Link>
      </h4>
      <p className="text-sm text-subTextColor text-left">
        Safeguard your traditional <br/>currency in one place
      </p>
    </div>
  );
};

export default CardSection;