import { Skeleton } from "antd";
import React from "react";


const QuestBoxLoader = ()=>{
return (
      <div className="flex-1">
          <div className="mt-2 grid md:grid-cols-2 gap-4">
              <div className="mt-5 kpicardbg border border-StrokeColor rounded-5 p-6 shadow   mb-6 w-full mx-auto ">
                  <div className="items-center">
                    <Skeleton
                      active
                      paragraph={{ rows: 3 }}
                      title={false}
                      className="w-full"
                  />
                  </div>
                  <div className="w-full flex justify-between gap-4 my-5">
                      <div className="flex items-center gap-4">
                        <Skeleton.Input active title={false} style={{height:28}} className=""/>
                      </div>
                      <div>
                        <Skeleton.Input active title={false} style={{height:28}} className=""/>
                      </div>
                 </div>
              </div>
               <div className="mt-5 kpicardbg border border-StrokeColor rounded-5 p-6 shadow   mb-6 w-full mx-auto ">
                  <div className="items-center">
                    <Skeleton
                      active
                      paragraph={{ rows: 3 }}
                      title={false}
                      className="w-full"
                  />
                  </div>
                  <div className="w-full flex justify-between gap-4 my-5">
                      <div className="flex items-center gap-4">
                        <Skeleton.Input active title={false} style={{height:28}} className=""/>
                      </div>
                      <div>
                        <Skeleton.Input active title={false} style={{height:28}} className=""/>
                      </div>
                 </div>
              </div>
              <div className="mt-5 kpicardbg border border-StrokeColor rounded-5 p-6 shadow   mb-6 w-full mx-auto ">
                  <div className="items-center">
                    <Skeleton
                      active
                      paragraph={{ rows: 3 }}
                      title={false}
                      className="w-full"
                  />
                  </div>
                  <div className="w-full flex justify-between gap-4 my-5">
                      <div className="flex items-center gap-4">
                        <Skeleton.Input active title={false} style={{height:28}} className=""/>
                      </div>
                      <div>
                        <Skeleton.Input active title={false} style={{height:28}} className=""/>
                      </div>
                 </div>
              </div>
               <div className="mt-5 kpicardbg border border-StrokeColor rounded-5 p-6 shadow   mb-6 w-full mx-auto ">
                  <div className="items-center">
                    <Skeleton
                      active
                      paragraph={{ rows: 3 }}
                      title={false}
                      className="w-full"
                  />
                  </div>
                  <div className="w-full flex justify-between gap-4 my-5">
                      <div className="flex items-center gap-4">
                        <Skeleton.Input active title={false} style={{height:28}} className=""/>
                      </div>
                      <div>
                        <Skeleton.Input active title={false} style={{height:28}} className=""/>
                      </div>
                 </div>
              </div>
          </div>
      </div>
  );
}
export default QuestBoxLoader
