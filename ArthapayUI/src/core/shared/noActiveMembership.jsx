import React, { useCallback } from "react";
import CustomButton from "../button/button";
import purchaseImagedark from "../../assets/images/purchase-darkimg.svg";
import purchaseImagelight from "../../assets/images/purchase-lightimg.svg";
import { useNavigate } from "react-router";
const ActionControlMembership = ({ isModal, onCancel, path='/profile/fees/memberships/explore' }) => {
  const navigate = useNavigate();
  const onOk=useCallback(()=>navigate(path),[navigate,path])
  return (
    <>
      <div
        className={`flex flex-col justify-center items-center gap-4 text-center w-full ${
          isModal ? "h-fit" : ""
        }`}
      >
        <img src={purchaseImagedark} alt="Documents Review" className="h-32 mt-12 dark:block hidden" />
        <img src={purchaseImagelight} alt="Documents Review" className="h-32 mt-12 dark:hidden block" />
        <h1 className="mt-0 text-xl font-medium text-subTextColor">
        You don’t have an active membership
          <br />
          <span className="text-base text-paraColor">
          Choose a plan and start enjoying the benefits today!
          </span>
        </h1>
      </div>
      <div className={isModal ? "text-right mt-9" : 'text-center mt-4'}>
        {isModal && <CustomButton onClick={onCancel}>I will do it later</CustomButton>}
        <CustomButton
          onClick={onOk}
          type="primary"
          className={isModal ? "md:ml-3.5" : ""}
        >
          Purchase now
        </CustomButton>
      </div>
    </>
  );
};

export default ActionControlMembership;
