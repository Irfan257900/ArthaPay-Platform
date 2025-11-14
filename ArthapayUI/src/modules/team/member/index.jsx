import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate, useParams, useSearchParams } from "react-router";
import PageHeader from "../../../core/shared/page.header";
import ScreenTabs from "../../../core/shared/screenTabs";
import MemberProfile from "./profile";
import CustomButton from "../../../core/button/button";
const basePath = "/settings/team/member/";

const tabs = [
  {
    name: "Cards",
    icon: "team-cards",
  },
  {
    name: "Transactions",
    icon: "team-transactions",
  },
];
const Member = () => {
  const navigate = useNavigate();
  const { memberId, refId, cardName, cardId } = useParams();
  const [urlParams] = useSearchParams();
  const currentTab = useMemo(() => {
    return urlParams.get("mainTab") || "Cards";
  }, [urlParams.get("mainTab")]);
  const [activeTab, setActiveTab] = useState();
  useEffect(() => {
    handleTabChange(currentTab || tabs[0].title);
  }, []);
  useEffect(() => {
    setActiveTab(currentTab);
  }, [currentTab]);
  const handleTabChange = useCallback(
    (key) => {
      const keyToSet = encodeURIComponent(key);
      switch (key) {
        case "Cards":
          return navigate(
            `${basePath}${memberId}/${encodeURIComponent(
              refId
            )}/cards?mainTab=${keyToSet}`
          );
        case "Transactions":
          return navigate(
            `${basePath}${memberId}/${encodeURIComponent(
              refId
            )}/transactions?mainTab=${keyToSet}`
          );
        default:
          return navigate(
            `${basePath}${memberId}/${encodeURIComponent(
              refId
            )}/profile?mainTab=${keyToSet}`
          );
      }
    },
    [navigate, memberId, refId]
  );
  const breadCrumbList = useMemo(() => {
    const baseList = [
      {
        id: "1",
        title: "Team",
        handleClick: () => {
          navigate(`/settings/team`);
        },
      },
      { id: "2", title: refId !== "null" ? refId : "Member" },
      { id: "3", title: activeTab },
    ];
    if (cardName) {
      baseList.push({ id: "4", title: cardName });
    }
    return baseList;
  }, [refId, activeTab, cardName]);
  const backTo = useCallback(() => {
    cardId ? navigate(
      `/settings/team/member/${memberId}/${encodeURIComponent(refId)}/cards?mainTab=${encodeURIComponent(currentTab)}`
    ) : navigate(
      `/settings/team?mainTab=${encodeURIComponent('Registered')}`
    );
  }, [cardId, currentTab])
  return (
    <div>
      <PageHeader breadcrumbList={breadCrumbList} />
      <MemberProfile />
      <div className="team-tabs mt-2 custom-member-profile">
        <ScreenTabs
          activeKey={activeTab}
          onChange={handleTabChange}
          list={tabs}
          shouldUsePropsList={true}
        />
        <Outlet />
      </div>
      <div className="text-end flex justify-end mt-4">
        <CustomButton
          type="primary"
          className=""
          onClick={backTo}
        >
          BACK
        </CustomButton>
      </div>
    </div>
  );
};

export default Member;
