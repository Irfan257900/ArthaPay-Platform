import React from "react";
import DashboardHeader from "./headercomponent";
import TotalBalanceSection from "./totalbalance";
import FiatSection from "./fiatSection";
import CardSectionNoData from "./cardsection";
import NoTransactionsSection from "./notransactions";
import RecentActivity from "./recentactivity";
import FiatSection from "./fiatSection";

const StaticDashboard = () => {
  return (
    <div className="flex items-center">
    <div className="">
      <DashboardHeader />
      <div className="grid md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 xl:gap-5 lg:gap-3 gap-4">
        <TotalBalanceSection />
        <CardSectionNoData />
        <FiatSection />
      </div>
      <div className="grid md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 xl:gap-5 lg:gap-3 gap-4 mt-4">
        <NoTransactionsSection />
        <RecentActivity activities={[]} />
      </div>
    </div>
    </div>
  );
};

export default StaticDashboard;