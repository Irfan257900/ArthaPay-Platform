import React from "react";
import { Skeleton } from "antd";
import KpiLoader from "../kpi.loader/kpi";
const GridLoader = ({iskpi=true })=> {
  return (
    <div>
      {iskpi && 
      <div className="mb-7">
        <KpiLoader />
      </div>}
      <div className="bg-sectionBG rounded-5 p-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-4 filters-loader">
            <Skeleton active
          paragraph={{ rows: 1 }}
          title={false} />
         
            <Skeleton active
          paragraph={{ rows: 1 }}
          title={false} />
            <Skeleton active
          paragraph={{ rows: 1 }}
          title={false} />
            <Skeleton active
          paragraph={{ rows: 1 }}
          title={false} />
            <Skeleton active
          paragraph={{ rows: 1 }}
          title={false} />
        </div>
        <div className="mt-10">
          <Skeleton
            active
            paragraph={{ rows: 10 }}
            title={false}
            className="skeleton-custom"
          />
        </div>
      </div>
    </div>
  );
}

export default GridLoader;
