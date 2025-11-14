import { Skeleton } from "antd";
import React from "react";


const RewardsDashboardBannerLoader = ()=>{
return (
      <div className="flex-1">
          <div className="mt-2">
              <div className="mt-5 kpicardbg border border-StrokeColor rounded-5 p-6 shadow   mb-4 w-full mx-auto ">
                  <div className="grid grid-cols-2 items-center">
                    <Skeleton
                      active
                      paragraph={{ rows: 4 }}
                      title={false}
                      className="w-full"
                  />
                   <div className="w-full mx-auto flex justify-end items-end">
                  <Skeleton.Input
                      active
                      title={false}
                       style={{ height: 130 }}
                      className="mb-4"
                  />
                 </div>
                  
                  </div>
              </div>
          </div>
      </div>
  );
}
export default RewardsDashboardBannerLoader

