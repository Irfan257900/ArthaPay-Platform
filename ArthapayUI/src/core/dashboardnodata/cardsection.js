import React from "react";
import cardPlaceholderImglight from "../../assets/images/card-img.svg"; 
import cardPlaceholderImg from "../../assets/images/card-img-dark.svg"; 
import CustomButton from "../button/button";
import { useNavigate } from "react-router";
import { useCallback} from "react";
const CardSectionNoData = () => {
  const navigate = useNavigate()
  const applyCards = useCallback(()=>{
    navigate(`/cards/apply`)
  },[navigate])
  return (
    <div className="kpicardbg p-5 rounded-lg">
      <h4 className="text-lg font-semibold text-titleColor mb-4">My Cards</h4>
      <div className="flex flex-col items-start gap-y-2.5">
        <div className="flex flex-row items-center justify-center gap-5">
        <img
          src={cardPlaceholderImg}
          alt="Card Placeholder"
          className="w-36 mb-4 hidden dark:block"
        />
        <img
          src={cardPlaceholderImglight}
          alt="Card Placeholder"
          className="w-36 mb-4 dark:hidden block"
        />
        <p className="text-base text-subTextColor text-left">
          No cards yet
        </p>   
        </div>     
        <p className="text-sm text-subTextColor text-left">
          Apply to enjoy instant transactions and exclusive benefits
        </p>
        <CustomButton
          type="primary"
          className="px-5 py-2 rounded-md w-full"
          onClick={applyCards}
        >
          Apply Cards
        </CustomButton>
      </div>
    </div>
  );
};

export default CardSectionNoData;