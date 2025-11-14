import React from "react";
import { Skeleton } from "antd";
import KpiLoader from "../kpi.loader/kpi";
const TransactionsLoader = ()=> {
  return (
    <div>
      <div className="mb-5">
        <KpiLoader />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 filters-loader mb-5">
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
      <div className="bg-sectionBG rounded-5 p-3">
        
        <div className="mt-10  overflow-x-auto">
           {[...Array(8)].map((_, index) => (
                      <div key={index} className="flex justify-between gap-2 mb-4">
                        <Skeleton.Input active className="!w-1/7" />
                        <Skeleton.Input active className="!w-1/7" />
                        <Skeleton.Input active className="!w-1/7" />
                        <Skeleton.Input active className="!w-1/7" />
                        <Skeleton.Input active className="!w-1/7" />
                        <Skeleton.Input active className="!w-1/7" />
                      </div>
                    ))}
        </div>
      </div>
    </div>
  );
}

export default TransactionsLoader;
