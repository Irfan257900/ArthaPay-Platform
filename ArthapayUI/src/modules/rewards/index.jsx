import React, { useMemo } from "react";
import RewardsTabs from "./rewards.tabs";
import PageHeader from "../../core/shared/page.header";
import { useLocation, useNavigate } from "react-router";

const Rewards = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathParts = location.pathname.split("/");
  const currentTab = pathParts[2] || "";
    const getTabTitle = (tab) => {
    if (tab === "quests") return "Quests";
    if (tab === "mysteryboxes") return "Mystery Boxes";
    return "Home";
  };
  const breadCrumbList = useMemo(() => {
    const defaultList = [
      {
        id: "1",
        title: `Rewards`,
        handleClick: () => navigateToDashboard(),
      },
      { id: "2", title: getTabTitle(currentTab) },
    ];
    let list = [...defaultList];
    return list;
  }, [currentTab]);
  const navigateToDashboard = () => {
    navigate(`/rewards`);
  };
  return (
    <div>
      <PageHeader breadcrumbList={breadCrumbList} />
      <RewardsTabs />
    </div>
  );
};

export default Rewards;