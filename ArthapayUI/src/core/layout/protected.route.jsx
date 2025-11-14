import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import NoAccess from "./noAccess";
import { useLocation } from "react-router";
import PlainLoader from "../shared/loaders/plain.loader";
import AccessDenied from "./accessDenied";

const ProtectedRoute = ({ children,canIgnoreAccess=false }) => {
  const { pathname } = useLocation();
  const userProfile = useSelector((store) => store.userConfig.details);
  const userRole = useSelector((store) => store.userConfig.currentRole);
  const fetchingAppMenu = useSelector(
    (store) => store.userConfig.fetchingAppMenu
  );
  const screens = useSelector((store) => store.userConfig.screens);
  const currentScreen = useSelector((store) => store.userConfig.currentScreen);

  const hasAccess = useMemo(()=>{
    return fetchingAppMenu || screens?.some(
      (screen) => screen?.id === currentScreen?.id && screen.isEnabled
    ) || canIgnoreAccess;
  },[fetchingAppMenu,screens?.length,pathname,currentScreen,canIgnoreAccess])

  if (fetchingAppMenu) {
    return <PlainLoader />;
  }

  // Role-based hard block: Admins cannot access User app
  if (userRole === "Admin") {
    return <AccessDenied />;
  }

  if (
    !userProfile?.id ||
    !hasAccess ||
    (pathname.includes("/profile/memberships") && userRole !== "Affiliate") ||
    (pathname.includes("/kyc") && userProfile?.accountType === "Business") ||
    (pathname.includes("/kyb") && userProfile?.accountType !== "Business")
  ) {
    return <NoAccess />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
