import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import successImg from "../../assets/images/gifSuccess.gif";
import CustomButton from "../button/button";
import StepProgress from "./kyc/step.progress";
import { useNavigate, useSearchParams } from "react-router";
import { fetchUserDetails } from "../../reducers/userconfig.reducer";

const steps = {
  KYC: [
    {
      number: 1,
      label: "Basic Information",
      isActive: true,
      isCompleted: true,
    },
    {
      number: 2,
      label: "Identification Document",
      isActive: true,
      isCompleted: true,
    },
    { number: 3, label: "Review", isActive: true, isCompleted: true },
  ],
  KYB: [
    { number: 1, label: "Company Data", isActive: true, isCompleted: true },
    { number: 2, label: "UBOs Details", isActive: true, isCompleted: true },
    {
      number: 3,
      label: "Directors Details",
      isActive: true,
      isCompleted: true,
    },
    { number: 4, label: "Review", isActive: true, isCompleted: true },
  ],
};
function KycKybStatus({
  type,
  setShowStatus,
  urlKeys = { actionFrom: "actionFrom", redirectTo: "redirectTo" },
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [urlParams] = useSearchParams();
  const metadata = useSelector(
    (store) => store.userConfig.metadata || {}
  );
  const isInitialKycRequired = metadata.IsInitialKycRequired
  const userProfileLoading = useSelector(
    (store) => store.userConfig.userProfileLoading
  );
  const onOk = useCallback(
    (e) => {
      e.preventDefault();
      setShowStatus(false);
      const redirectTo = urlParams?.get(urlKeys?.["redirectTo"]);
      if (isInitialKycRequired === true) {
        dispatch(fetchUserDetails());
      } else if (
        !redirectTo ||
        redirectTo === "null" ||
        redirectTo === "undefined"
      ) {
        navigate("/");
      } else {
        navigate(redirectTo);
      }
    },
    [urlParams, isInitialKycRequired]
  );
  return (
    <div>
      <StepProgress steps={steps[type]} />
      <div className="lg:px-2 py-0 md:px-6 sm:px-2 text-secondaryColor mt-6">
        <div className="border border-StrokeColor rounded-5 h-full">
          <div className="basicinfo-form bg-bodyBg border border-StrokeColor rounded-5">
            <div className="text-center relative">
              <div className=" h-[262px]">
                <div className="w-[260px] mx-auto relative">
                  <img
                    src={successImg}
                    className="mx-auto absolute  h-24 w-24 left-20 top-[149px] "
                    alt=""
                  />
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-titleColor text-center">
                {type} Information <br />
                Submitted Successfully{" "}
              </h2>
              <div className="text-center mb-9 mt-5">
                <CustomButton
                  type="primary"
                  onClick={onOk}
                  className={"md:w-2/5"}
                  loading={isInitialKycRequired === true && userProfileLoading}
                >
                  {isInitialKycRequired === true
                    ? "Continue"
                    : `Back to ${
                        urlParams.get(urlKeys?.["actionFrom"]) || "Dashboard"
                    }`}
                </CustomButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KycKybStatus;
