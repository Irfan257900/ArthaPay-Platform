import React from "react";
import CustomButton from "../../core/button/button"
function Confirm() {
  return (
    <div className="">
       <h2 className="text-2xl font-semibold text-titleColor"> Are you sure you want to Disable<br/>
        your team member?</h2>
          <div className="mt-10">
            <CustomButton type="primary" className="w-full">
            Yes
            </CustomButton>
            <CustomButton className="w-full mt-4">No</CustomButton>
          </div>
    </div>
  );
}

export default Confirm;