import { Skeleton } from "antd";
import React from "react";


const QuestProgressLoader = ()=>{
return (
      <div className="flex-1">
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="col-span-1 md:col-span-2 ">
                  <div className="kpicardbg border border-StrokeColor rounded-5 p-6 shadow">
                     <div className="border-b border-inputDarkBorder mb-4">
                        <Skeleton.Input
                            active
                            title={false}
                            style={{ height: 30 }}
                            className=" mb-2 "
                        /> 
                    </div>
                    <div className="my-2">
                        <Skeleton.Input
                            active
                            title={false}
                            style={{ height: 20 }}
                            className=" mb-2 "
                        /> 
                    </div>
                    <div className="flex justify-center gap-4 mb-6">
                    <div className="text-center"><Skeleton.Avatar active className="!w-16 !h-16 child-wfull" /></div>
                    <Skeleton
                      active
                      paragraph={{ rows: 4 }}
                      title={false}
                      className="w-full mb-4"
                  />
                  </div>
                  </div>
                  <div>
                  </div>
              </div>
              <div className="col-span-1">
                 <div className="kpicardbg border border-StrokeColor rounded-5 p-6 shadow  mb-5">
                     <div className="border-b border-inputDarkBorder mb-4">
                        <Skeleton.Input
                            active
                            title={false}
                            style={{ height: 30 }}
                            className=" mb-2 "
                        /> 
                    </div>
                    <div className="px-4 ">
                        <Skeleton.Input
                            active
                            title={false}
                            style={{ height: 40 }}
                            className="!mx-auto !w-full mb-2"
                        />
                        <Skeleton.Input
                            active
                            title={false}
                            style={{ height: 40 }}
                            className="!mx-auto !w-full mb-4"
                        />
                        <Skeleton.Input
                            active
                            title={false}
                            style={{ height: 40 }}
                            className="!mx-auto !w-full"
                        />
                    </div>
                  </div>
                  <div className="kpicardbg border border-StrokeColor rounded-5 p-6 shadow  ">
                    <div className="border-b border-inputDarkBorder mb-4">
                        <Skeleton.Input
                            active
                            title={false}
                            style={{ height: 30 }}
                            className=" mb-2 "
                        /> 
                    </div>
                  <Skeleton.Input
                      active
                      title={false}
                      style={{ height: 20 }}
                      className="!w-full mb-2 "
                  /> 
                  <Skeleton.Input
                      active
                      title={false}
                      style={{ height: 20 }}
                      className="!w-full mb-2"
                  /> 
                  <Skeleton.Input
                      active
                      title={false}
                      style={{ height: 20 }}
                      className="!w-full"
                  /> 
                  </div>
                  
              </div>
          </div>
      </div>
  );
}
export default QuestProgressLoader