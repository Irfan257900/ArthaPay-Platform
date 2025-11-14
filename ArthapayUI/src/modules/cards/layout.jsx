import React, { useCallback, useEffect, useMemo } from "react";
import ContentLoader from "../../core/skeleton/common.page.loader/content.loader";
import { useTranslation } from "react-i18next";
import ScreenTabs from "../../core/shared/screenTabs";
import ListDetailLayout from "../../core/module.layouts/listdetail.layout";
import { useDispatch, useSelector } from "react-redux";
import { setActiveTab } from "../../reducers/cards.reducer";
import { useNavigate } from "react-router";
import KpiLoader from "../../core/skeleton/kpi.loaders";

const Cards = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const activeTab = useSelector((state) => state.cardsStore.activeTab);
  useEffect(()=>{
    return ()=>dispatch(setActiveTab(''))
  },[])
  const breadCrumbList = useMemo(() => {
    return [
      {
        id: "1",
        title: `${t("cards.myCards.Cards")}`,
      },
    ];
  }, []);
  const handleTabChange = useCallback((tab) => {
    dispatch(setActiveTab(tab));
    const actions = {
      "My Cards": () => navigate("/cards/mycards"),
      "Apply Cards": () => navigate("/cards/apply"),
    };
    actions[tab]?.();
  }, []);
  return (
    <ListDetailLayout
      breadCrumbList={breadCrumbList}
      hasOverview={true}
      Overview={<div className="grid md:grid-cols-3 gap-7 mb-7"><KpiLoader itemCount={3}/></div>}
      ListHeader={
        <div className="flex-1">
          <div className="flex justify-between items-center p-3 ">
            <div className=" toggle-btn custom-tabs ">
              <ScreenTabs
                className="custom-crypto-tabs"
                activeKey={activeTab}
                onChange={handleTabChange}
              />
            </div>
          </div>
        </div>
      }
      ViewHeader={<></>}
      ListComponent={<></>}
    >
      <ContentLoader />
    </ListDetailLayout>
  );
};
export default Cards;
