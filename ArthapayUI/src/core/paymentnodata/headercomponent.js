import React from "react";
import CustomButton from "../button/button";
import welcomeimg from "../../assets/images/payment-img.png";

const DashboardHeader = () => {
  return (
    <div className="kpicardbg rounded-lg mb-5 !p-0">
      <div className="grid grid-cols-2 gap-4 items-center">
        <div className="pl-4">
          <h1 className="text-2xl font-bold text-titleColor text-left">Start accepting and sending payments</h1>
          <p className="text-lg text-subTextColor text-left">Easily manage your invoices and payouts to get paid quickly.</p>
          <div className="mt-4 flex justify-start gap-4">
            <CustomButton
              type="primary"
              className="px-5 py-2 rounded-md"
              onClick={() => console.log("Add Funds clicked")}
            >
              Create Invoice
            </CustomButton>            
          </div>
        </div>
          <img src={welcomeimg} className='mx-auto h-[200px]' alt='Not Found'></img>
      </div>
    </div>
  );
};

export default DashboardHeader;