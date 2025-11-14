import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Tabs, Typography } from "antd";
import { useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router";
import PageHeader from "../shared/page.header";
const { TabPane } = Tabs;
const { Text } = Typography;
const basePath = "/profile/";
const tabPaths = {
  Profile: "details",
  Security: "security",
  KYC: "kyc",
  KYB: "kyb",
  Addresses: "addresses",
  Fees: "fees",
  Memberships: "memberships",
  "Your Rewards": "yourrewards"
};
const UserProfile = () => {
  const navigate = useNavigate();
  const [breadCrumbList,setBreadCrumbList] = useState([]);
  const { pathname } = useLocation();
  const currentTab = useMemo(() => {
    switch (true) {
      case pathname.startsWith(`${basePath}details`):
        return "Profile";
      case pathname.startsWith(`${basePath}security`):
        return "Security";
      case pathname.startsWith(`${basePath}kyc`):
        return "KYC";
      case pathname.startsWith(`${basePath}kyb`):
        return "KYB";
      case pathname.startsWith(`${basePath}addresses`):
        return "Addresses";
      case pathname.startsWith(`${basePath}fees`):
        return "Fees";
      case pathname.startsWith(`${basePath}memberships`):
        return "Memberships";
      case pathname.startsWith(`${basePath}yourrewards`):
          return "Your Rewards";
      default:
        return null;
    }
  }, [pathname]);
  const userConfig = useSelector((state) => state.userConfig.details);
  const userRole = useSelector((state) => state.userConfig.currentRole);
  const enabledModules = useSelector(
      (state) => state.userConfig.enabledModules
    );
  const navigateToDashboard = () => {
    navigate(`/`);
  };
  useEffect(() => {
    !currentTab && handleTabChange("Profile");
  }, [currentTab]);
  const tabs = useMemo(() => {
    const base = [
      {
        title: "Profile",
        icon: "team-cards",
      },
      {
        title: "Security",
        icon: "team-transactions",
      },
    ];
    if (
      userConfig?.accountType === "Personal" ||
      userConfig?.accountType === "Employee"
    ) {
      base.push({
        title: "KYC",
        icon: "team-transactions",
      });
    }
    if (userConfig?.accountType === "Business") {
      base.push({
        title: "KYB",
        icon: "team-transactions",
      });
    }
    base.push(
      ...[
        {
          title: "Fees",
          icon: "team-transactions",
        },
      ]
    );
    if (userRole === "Affiliate") {
      base.push({
        title: "Memberships",
        icon: "team-transactions",
      });
    }
    const rewardsEnabled = enabledModules.includes("Rewards");
    if (rewardsEnabled) {
      base.push({
        title: "Your Rewards",
        icon: "team-transactions",
      });
    }
    return base;
  }, [userConfig?.accountType, userRole]);
  const baseBreadCrumb=useMemo(()=>{
    return [
      { id: "1", title: "Dashboard", handleClick: navigateToDashboard },
      { id: "2", title: "Manage Account" },
    ]
  },[]);
  const handleTabChange = useCallback((key) => {
    const tabPath = tabPaths[key] || "details";
    navigate(`${basePath}${tabPath}`);
  },[basePath]);

  const outletContext=useMemo(()=>{
    return {
      setBreadCrumb:setBreadCrumbList,
      baseBreadCrumb
    }
  },[baseBreadCrumb])
  return (
    <div>
      <PageHeader breadcrumbList={breadCrumbList} />
      <div className="manage-profile md:flex gap-0.5">
        <Tabs
          tabPosition="left"
          className="gap-4"
          activeKey={currentTab}
          onTabClick={handleTabChange}
          destroyInactiveTabPane={true}
        >
          {tabs.map((tab) => (
            <TabPane
              tab={
                <span>
                  <Text className="text-xs xl:text-sm font-medium text-lightWhite mb-0 capitalize">
                    {tab.title}
                  </Text>
                </span>
              }
              key={tab.title}
            />
          ))}
        </Tabs>
        <div className="xl:w-[78%] lg:w-[73%] md:w-[73%] w-full">
          <Outlet context={outletContext} />
        </div>
      </div>
    </div>
  );
};
export default UserProfile;
