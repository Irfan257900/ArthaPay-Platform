import React, { useCallback, useEffect, useMemo } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  clearErrorMessage,
  fetchAvailable,
  fetchCompleted,
  fetchInProgress
} from "../../../reducers/quests.reducer";
import AppTabs from "../../../core/shared/appTabs";
import QuestTransactions from "./quest.transactions";

const tabs = [
  { id: "available", name: "Available" },
  { id: "inprogress", name: "In Progress" },
  { id: "completed", name: "Completed" }
];


const QuestsTab = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.userConfig?.details);
  const tab=location.pathname.split("/")[3]
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const isQuestDetailPage = pathSegments.length > 3;

  const currentTab = useMemo(() => {
  return tab || "available";
}, [tab]);

  // Fetch quests when the tab changes
  useEffect(() => {
    if (!user?.id) return;

    switch (currentTab) {
      case "available":
        dispatch(fetchAvailable({ id: user.id }));
        break;
      case "inprogress":
        dispatch(fetchInProgress({ id: user.id }));
        break;
      case "completed":
        dispatch(fetchCompleted({ id: user.id }));
        break;
      default:
        break;
    }
  }, [currentTab, user?.id, dispatch]);

  const handleTabChange = useCallback(
    (selectedTab) => {
      if (selectedTab) {
        dispatch(clearErrorMessage(["allQuests", "inProgress", "completed"]));
        navigate(`/rewards/quests/${selectedTab}`);
      }
    },
    [navigate, dispatch]
  );

  return (
    <div className="w-full mt-4">
      {!isQuestDetailPage && (
        <div className="md:flex justify-between items-center !py-4 md:space-y-0 space-y-3 border-b border-StrokeColor">
          <div>
            <h4 className="text-2xl font-semibold text-lightWhite">Quests & Challenges</h4>
            <p className="text-paraColor text-base">Complete tasks to earn rewards</p>
          </div>
          <div className="custom-rewards-quest-tabs !mb-0">
            <AppTabs
              list={tabs}
              itemFields={{ title: "name", key: "id" }}
              onChange={handleTabChange}
              activeKey={currentTab}
              className="custom-crypto-tabs"
            />
          </div>
        </div>
      )}
      <Outlet />
      {!isQuestDetailPage && (<div className="mt-4">
    <div className="kpicardbg">
      <QuestTransactions screenName={"Quest"} />
    </div>
    </div>)}
    </div>
  );
};

export default QuestsTab;
