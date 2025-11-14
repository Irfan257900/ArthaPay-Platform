import React from "react";
import { useSelector } from "react-redux";
import LogoLoader from "../skeleton/logo.loader";

const AppLogo = ({ readOnly = "" }) => {
  const loading = useSelector((store) => store.userConfig.userProfileLoading);
  const darkLogo = useSelector((store) => store.userConfig.details?.darkThemeLogo);
  const lightLogo = useSelector((store) => store.userConfig.details?.lightThemeLogo)
  return (
    <>
      {loading && <LogoLoader />}
      {!loading && !readOnly && (
        <>
          <img
            src={darkLogo}
            alt={window.runtimeConfig.VITE_CLIENT_NAME}
            className={`logo hidden dark:block h-9`}
          />
          <img
            src={lightLogo}
            alt={window.runtimeConfig.VITE_CLIENT_NAME}
            className={`logo dark:hidden  h-9`}
          />
        </>
      )}
      {!loading && readOnly && (
        <img
          src={readOnly === "light" ? lightLogo: darkLogo}
          alt={window.runtimeConfig.VITE_CLIENT_NAME}
          className="logo w-[100px]"
        />
      )}
    </>
  );
};

export default AppLogo;
