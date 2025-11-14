import React from "react";
import CustomButton from "../button/button";
import welcomeimg from "../../assets/images/welcome.png";
import { useNavigate } from "react-router";
import { useCallback} from "react";
import { useSelector } from "react-redux";
const DashboardHeader = () => {
  const navigate = useNavigate()
   const userInfo = useSelector((store) => store.userConfig.details);
    const applyCards = useCallback(()=>{
      navigate(`/cards/apply`)
    },[navigate])
    const deposit = useCallback(()=>{
      navigate(`/wallets/crypto/deposit`)
    },[navigate])
  return (
    <div className="kpicardbg rounded-lg mb-5 !p-0">
      <div className="grid grid-cols-2 gap-4 items-center">
        <div className="pl-4">
          <h1 className="text-2xl font-bold text-titleColor text-left">Welcome, {userInfo?.name}</h1>
          <p className="text-lg text-subTextColor text-left">Let’s get started</p>
          <div className="mt-4 flex justify-start gap-4">
            <CustomButton
              type="primary"
              className="px-5 py-2 rounded-md"
              onClick={deposit}
            >
              Add Funds
            </CustomButton>
            <CustomButton
              type="primary"
              className="px-5 py-2 rounded-md"
              onClick={applyCards}
            >
              Apply for Card
            </CustomButton>
          </div>
        </div>
          <img src={welcomeimg} className='mx-auto h-[200px]' alt='Not Found'></img>
      </div>
    </div>
  );
};

export default DashboardHeader;