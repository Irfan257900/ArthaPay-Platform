import { Skeleton } from "antd";
import React from "react";
import QuestBoxLoader from "./questbox.loader";


const RewardsDashboardHomeLoader = ()=>{
return (
      <div className="flex-1">
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="col-span-1 md:col-span-2 ">
                  <div>
                    <div className="flex justify-between items-center mt-5">
                   <Skeleton.Input
                      active
                      title={false}
                      style={{ height: 30 }}
                      className=""
                  /> 
                  <Skeleton.Input
                      active
                      title={false}
                      style={{ height: 30 }}
                      className=""
                  /> 
                    </div>
                    <div>
                        <QuestBoxLoader />
                    </div>
                  </div>
              </div>
              <div className="col-span-1">
                  <div className="kpicardbg border border-StrokeColor rounded-5 p-6 shadow  ">
                  <Skeleton.Input
                      active
                      title={false}
                      style={{ height: 50 }}
                      className="!w-full mb-2 "
                  /> 
                  <Skeleton.Input
                      active
                      title={false}
                      style={{ height: 50 }}
                      className="!w-full mb-2"
                  /> 
                  <Skeleton.Input
                      active
                      title={false}
                      style={{ height: 50 }}
                      className="!w-full"
                  /> 
                  </div>
                   <div className="kpicardbg border border-StrokeColor rounded-5 p-6 shadow  mt-5">
                 <div className="text-center"><Skeleton.Avatar active className="!w-24 !h-24 child-wfull mx-auto" /></div>
                    <div className="px-4 mt-4">
                        <Skeleton
                            active
                            paragraph={{ rows: 3 }}
                            title={false}
                            className="w-full mb-4"
                        />
                        <Skeleton.Input
                            active
                            title={false}
                            style={{ height: 40 }}
                            className="!mx-auto !w-full"
                        />
                    </div>
                  </div>
              </div>
          </div>
      </div>
  );
}
export default RewardsDashboardHomeLoader