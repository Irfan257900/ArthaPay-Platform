import React from "react";
import CustomButton from "../button/button";
import welcomeimg from "../../assets/images/bank-img.png";

const DashboardHeader = () => {
  return (
    <div className="kpicardbg rounded-lg mb-5 !p-0">
      <div className="grid grid-cols-2 gap-4 items-center">
        <div className="pl-4">
          <h1 className="text-2xl font-bold text-titleColor text-left">Manage your bank accounts</h1>
          <p className="text-lg text-subTextColor text-left">Securely deposit and withdraw flat currency on our platform.</p>
          <div className="mt-4 flex justify-start gap-4">
            <CustomButton
              type="primary"
              className="px-5 py-2 rounded-md"
              onClick={() => console.log("Add Funds clicked")}
            >
              Create Account
            </CustomButton>            
          </div>
        </div>
          <img src={welcomeimg} className='mx-auto h-[200px]' alt='Not Found'></img>
      </div>
    </div>
  );
};

export default DashboardHeader;