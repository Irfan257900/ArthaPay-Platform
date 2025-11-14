import React from "react";
import DashboardHeader from "./headercomponent";
import TotalBalanceSection from "./totalbalance";
import CardSection from "./cardsection";
import FiatSection from "./fiatsection";

const WalletnodataDashboard = () => {
  return (
    <div className="h-screen flex items-center">
      <div className="">
          <DashboardHeader />
          <div className="grid md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 xl:gap-5 lg:gap-3 gap-4">
              <TotalBalanceSection />
              <CardSection />
              <FiatSection />
          </div>
          </div>
      </div>
  );
};

export default WalletnodataDashboard;