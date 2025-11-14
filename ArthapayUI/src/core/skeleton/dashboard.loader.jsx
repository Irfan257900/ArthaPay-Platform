import React from "react";
import { Skeleton } from 'antd';
import KpiLoader from "./kpi.loader/kpi";
import GridLoader from "./grid.loader/grid.loader";
import AdvertisementLoader from "./adv.loader/adv.loader";
import KpiCardsLoader from "./kpi.loader/kpi.cards.loader";
import KpiRightBorder from "./kpi.loader/kpirightBorder";
import MarketKpiLoader from "./kpi.loader/marketKpiLoader";
const DashboardLoader =()=> {
  return (
    <div>
      <div><KpiCardsLoader /></div>
      <div>
        <div className="mb-3">
          <Skeleton active paragraph={{ rows: 1 }} title={false} className="!w-44"/>
        </div>
        <KpiLoader itemCount={4} />
      </div>
      <div className="mt-6">
        <KpiRightBorder />
      </div>
      <div className="mt-6">
        <AdvertisementLoader/>
      </div>
      <div className="mt-6">
        <div className="mb-3">
          <Skeleton active paragraph={{ rows: 1 }} title={false} className="!w-44"/>
        </div>
       <KpiCardsLoader /></div>
      <div className="mt-8">
      <Skeleton active paragraph={{ rows: 1 }} title={false} className="!w-56 mb-4"/>
        <MarketKpiLoader />
        </div>
      
      <div className="mt-6">
        <GridLoader/>
      </div>
    </div>
  );
}

export default DashboardLoader;
