import React from "react";
import CustomButton from "../button/button";
import successImg from "../../assets/images/gifSuccess.gif";
const SuccessComponent = ({ message, onOk, okButtonText='Ok' }) => {
  return (
    <div className="lg:px-2 py-0 md:px-6 sm:px-2 text-secondaryColor mt-6 border-0 success-drawer">
      <div className=" ">
        <div className="basicinfo-form rounded-5 pb-9">
          <div className="text-center relative">
            <div className=" h-[167px]">
              <div className="w-[260px] mx-auto relative">
                <img
                  src={successImg}
                  className="mx-auto absolute  h-24 w-24 left-20 top-[50px] "
                  alt=""
                />
              </div>
            </div>
            <h2 className="text-base font-semibold text-titleColor text-center md:w-64 w-full mx-auto">
              {message}
            </h2>
            <div className="text-center mb-9 mt-5">
              <CustomButton
                type="primary"
                className={"w-[300px]"}
                onClick={onOk}
              >
                {okButtonText}
              </CustomButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessComponent;
