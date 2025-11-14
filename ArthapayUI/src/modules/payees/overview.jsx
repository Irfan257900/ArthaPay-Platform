import React, { memo } from "react";
import Kpis from "./kpis";
import RecentActivity from "./recentActivity";

const Overview = () => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 md:grid-cols-2  gap-5 mb-5 custom-kpi-section">
      <Kpis />
      <RecentActivity />
    </div>
  );
};

export default memo(Overview);
