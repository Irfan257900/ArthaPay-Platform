import React, { useEffect, useState } from "react";
import AppKpis from "../../core/shared/AppKpis";
import { getTeamKpis } from "./httpServices";
import { useSelector } from "react-redux";
import KpiLoader from "../../core/skeleton/kpi.loaders";
const icons=['total-employees','approved','awaiting-payment']
const Kpis = ({isRefresh,state,setState}) => {
  const userProfile = useSelector((store) => store.userConfig.details);
  useEffect(() => {
    getTeamKpis(setState);
  }, [userProfile?.id,isRefresh]);
  return (
    <div>
      <div className="grid xl:grid-cols-5 md:grid-cols-3 gap-5 mb-5">
         {state.kpiLoading &&  <KpiLoader itemCount={3} />}
      </div>
      {!state.kpiLoading && state.KpiData && <AppKpis data={state.KpiData} loader={state.kpiLoading} icons={icons} />}
    </div>
  );
};
 
export default Kpis;