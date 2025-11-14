import React, { useCallback, useState } from "react";
import LogoutButton from "../authentication/logout.button";
import rocketUser from "../../assets/images/useronrocket.svg";
import coinsgroup from "../../assets/images/coinsgroup.svg";
import { clearUserInfo } from "../../reducers/userconfig.reducer";
import { userLogout } from "../../reducers/auth.reducer";
import { useDispatch } from "react-redux";
import AppLogo from "../layout/appLogo";
import Cases from "../../utils/cases";
import Case from "./case";

const OnboardingLayout = ({
  children,
  title,
  isSimpleLayout = true,
  blockStyles,
  topBgClass,
}) => {
  const dispatch = useDispatch();
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const beforeLogout = useCallback(() => {
    dispatch(clearUserInfo());
    dispatch(userLogout());
  }, []);
  const onClickHandler = useCallback((item) => {
    const id = item?.typeId;
    setSelectedCaseId(id);
  }, []);
  const onBack = useCallback(() => {
    setSelectedCaseId(null);
  }, []);
  return (
    <>
      {!isSimpleLayout && (
        <div className="relative">
          <div className="py-10 bg-signUpDarkBg min-h-[35vh] line-bg">
            <AppLogo/>
            <div className="md:flex items-center gap-20">
              <h2 className="text-2xl lg:text-4xl font-semibold text-lightWhite">
                {title}
              </h2>
              <img src={rocketUser} className="" />
            </div>
          </div>
          <div className="p-10 bg-screenBlackBg min-h-[35vh]">
            <img src={coinsgroup} className="" />
          </div>
          <div className="absolute right-14 top-[16vh] md:w-[400px] p-5 rounded-sm bg-screenBlackBg shadow-[0px_0px_4px_0px_rgba(255,255,255,0.25)]">
            {children}
          </div>
        </div>
      )}
      {isSimpleLayout && (
        <div className="relative w-full">
          <div
            className={`bg-bodyBg pt-4 h-screen mb-4 ${topBgClass}`}
          >
            <div className="py-4 min-h-[50px] flex justify-between w-[80%] m-auto">
              <button
                className="text-center cursor-pointer"
                onClick={() => window.open(window.location.origin, "_self")}
              >
                <AppLogo/>
              </button>
              <LogoutButton
                className={
                  "rounded-5 border border-inputDarkBorder text-sm font-medium hover:!text-titleColor h-[38px] min-!w-[100px] uppercase  disabled:!bg-btnDisabled disabled:cursor-not-allowed disabled:text-textBlack focus-visible:outline-none focus-visible:bg-cancelBtnHover w-full bg-logoutBtn hover:!bg-logoutBtnHover !text-lightWhite  max-w-[130px] text-center px-2.5 flex gap-2.5 items-center"
                }
                beforeLogout={beforeLogout}
              >
                <span className="icon logout-icon"></span>
                <span>Logout</span>
              </LogoutButton>
            </div>
            <div
              className={`mx-auto w-full ${blockStyles}`}
            >
              {!selectedCaseId && (<> 
                {/* <div className="register-form md:w-[80%] mx-auto px-4 py-4  rounded-5 flex-1"> */}
                  <Cases showBreadCrumb={false} navigation={false} onClickHandler={onClickHandler} />
                {/* </div> */}
              <div className="p-5 rounded-sm mb-5">
                <div className="register-form md:w-[80%] kpicardbg mx-auto px-4 py-4 lg:px-16 lg:py-12 rounded-5 flex-1">
                  <div>
                    <h2 className="text-[34px] font-semibold text-lightWhite text-center mb-6">
                    {title}
                  </h2>
                  {children}
                  </div>
                </div>
              </div>
              </>)}
              {selectedCaseId && (
              <div className="register-form md:w-[80%] mx-auto px-4 py-4  rounded-5 flex-1">
                <Case id={selectedCaseId} onBack={onBack}/> 
                </div>
              )}
            </div>
          </div>
          {/* <div className="p-10 bg-screenBlackBg min-h-[35vh]"></div> */}
        </div>
      )}
    </>
  );
};

export default OnboardingLayout;
