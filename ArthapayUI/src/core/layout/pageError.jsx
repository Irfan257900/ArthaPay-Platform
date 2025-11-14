import React, { useCallback } from "react";
import { useRouteError } from "react-router";
import CustomButton from "../button/button";
import objectImg from "../../assets/images/OBJECT.svg";
import { clearUserInfo } from "../../reducers/userconfig.reducer";
import { userLogout } from "../../reducers/auth.reducer";
import LogoutButton from "../authentication/logout.button";
import { useDispatch } from "react-redux";

const PageError = ({ errorToDisplay = "Something went wrong, Please try again!" }) => {
  const error = useRouteError();
  const dispatch = useDispatch();
  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);
  let message = error?.message || errorToDisplay;
  const newUpdatesMessage = "We’ve just rolled out some exciting new updates! Please refresh the page to experience the latest improvements.";
  if (message.toLowerCase().includes("failed to fetch dynamically imported")) {
    message = newUpdatesMessage;
  }
  const beforeLogout = useCallback(() => {
    dispatch(clearUserInfo());
    dispatch(userLogout());
  }, []);
  return (
    <>
      <div className="py-10 min-h-[50px] flex justify-end w-[80%] m-auto">
        <LogoutButton
          className={
            "rounded-5 border border-inputDarkBorder text-sm font-medium hover:!text-textWhite h-[38px] min-!w-[100px] uppercase  disabled:!bg-btnDisabled disabled:cursor-not-allowed disabled:text-textBlack focus-visible:outline-none focus-visible:bg-cancelBtnHover w-full bg-logoutBtn hover:!bg-logoutBtnHover !text-lightWhite  max-w-[130px] text-center px-2.5 flex gap-2.5 items-center"
          }
          beforeLogout={beforeLogout}
        >
          <span className="icon logout-icon"></span>
          <span>Logout</span>
        </LogoutButton>
      </div>

      <div className="flex flex-col gap-4 justify-center items-center  w-[80%] m-auto h-[80vh]">
        <div className="p-4">
          <div className="mb-7"><img src={objectImg} alt="" className="mx-auto" /></div>
          <p className="text-lightWhite font-medium text-xl text-center">{message}</p>
          <div className="mt-4 w-1/2 !mx-auto">
            <CustomButton type="primary" className="w-full" onClick={handleRefresh}>
              Refresh Now
            </CustomButton>
          </div>
        </div>

      </div>
    </>
  );
};

export default PageError;
