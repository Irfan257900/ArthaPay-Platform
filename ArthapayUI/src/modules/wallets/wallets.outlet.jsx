import React, { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import ScreenTabs from "../../core/shared/screenTabs";
import ListDetailLayout from "../../core/module.layouts/listdetail.layout";
import { useDispatch, useSelector } from "react-redux";
import { fetchGraphDetails, fetchKpis, setActiveTab } from "../../reducers/vaults.reducer";
import { useNavigate } from "react-router";
import KpiLoader from "../../core/skeleton/kpi.loaders";
import ListLoader from "../../core/skeleton/common.page.loader/list.loader";
import RightboxTabs from "../../core/skeleton/rightboxskel";
import ViewHeaderLoader from "../../core/skeleton/view.header";

const Vaults = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const activeTab = useSelector((state) => state.withdrawReducer.activeTab);
    useEffect(() => {
    dispatch(fetchKpis());
    dispatch(fetchGraphDetails()); 
    return () => dispatch(setActiveTab(''));
  }, [dispatch]);
  const breadCrumbList = useMemo(() => {
    return [
      {
        id: "1",
        title: "Wallets",
      },
    ];
  }, []);
  const handleTabChange = useCallback((tab) => {
    dispatch(setActiveTab(tab));
    const actions = {
      "Crypto": () => navigate("/wallets/crypto"),
      "Fiat": () => navigate("/wallets/fiat"),
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
      ListComponent={<ListLoader/>}
    >
       <div className='layout-bg w-full min-h-[85vh]'>
        <ViewHeaderLoader/>
        <RightboxTabs />
       </div>
    </ListDetailLayout>
  );
};
export default Vaults;
