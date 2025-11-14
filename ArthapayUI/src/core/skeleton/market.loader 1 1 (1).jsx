import React from "react"
import { Skeleton } from "antd";
export const MarketCryptoLoaders = ()=>{
    return(
    <>
     <div className="mt-4 overflow-hidden">
            <div className="rounded-5 border border-StrokeColor w-[800px] overflow-auto md:w-full">
                        <div className="p-4 border border-StrokeColor bg-profileTabActiveBg w-full">
                          <div className="flex space-x-6 px-2 items-center text-center w-full">
                          <Skeleton active paragraph={{ rows: 1 }} title={false} className="w-12"/>
                          <div className="w-1/4"><Skeleton active paragraph={{ rows: 1 }} title={false} className="w-36"/></div>
                            <div className="flex space-x-3 overflow-hidden">
                            <Skeleton active paragraph={{ rows: 1 }} title={false} className="w-36"/>
                            <Skeleton active paragraph={{ rows: 1 }} title={false} className="w-36"/>
                            <Skeleton active paragraph={{ rows: 1 }} title={false} className="w-36"/>
                            <Skeleton active paragraph={{ rows: 1 }} title={false} className="w-36"/>
                            <Skeleton active paragraph={{ rows: 1 }} title={false} className="w-56"/>
                            </div>
                          </div>
                          </div>
                          <div className="p-2 border border-StrokeColor">
                          <div className="flex space-x-6 px-4 items-center text-center">
                            <Skeleton active paragraph={{ rows: 1 }} title={false} className="w-12"/>
                            <div className="w-1/4"><Skeleton avatar active paragraph={{ rows: 2 }} title={false} className="w-36"/></div>
                            <div className="flex space-x-3 overflow-hidden">
                            <Skeleton active paragraph={{ rows: 1 }} title={false} className="w-36"/>
                            <Skeleton active paragraph={{ rows: 1 }} title={false} className="w-36"/>
                            <Skeleton active paragraph={{ rows: 1 }} title={false} className="w-36"/>
                            <Skeleton active paragraph={{ rows: 1 }} title={false} className="w-36"/>
                            <Skeleton active paragraph={{ rows: 1 }} title={false} className="w-56"/>
                            </div>
                          </div>
                          </div>
                          <div className="p-2 border border-StrokeColor">
                          <div className="flex space-x-6 px-4 items-center text-center">
                            <Skeleton active paragraph={{ rows: 1 }} title={false} className="w-12"/>
                            <div className="w-1/4"><Skeleton avatar active paragraph={{ rows: 2 }} title={false} className="w-36"/></div>
                            <div className="flex space-x-3 overflow-hidden">
                            <Skeleton active paragraph={{ rows: 1 }} title={false} className="w-36"/>
                            <Skeleton active paragraph={{ rows: 1 }} title={false} className="w-36"/>
                            <Skeleton active paragraph={{ rows: 1 }} title={false} className="w-36"/>
                            <Skeleton active paragraph={{ rows: 1 }} title={false} className="w-36"/>
                            <Skeleton active paragraph={{ rows: 1 }} title={false} className="w-56"/>
                            </div>
                          </div>
                          </div>
                          <div className="p-2 border border-StrokeColor">
                          <div className="flex space-x-6 px-4 items-center text-center">
                            <Skeleton active paragraph={{ rows: 1 }} title={false} className="w-12"/>
                            <div className="w-1/4"><Skeleton avatar active paragraph={{ rows: 2 }} title={false} className="w-36"/></div>
                            <div className="flex space-x-3 overflow-hidden">
                            <Skeleton active paragraph={{ rows: 1 }} title={false} className="w-36"/>
                            <Skeleton active paragraph={{ rows: 1 }} title={false} className="w-36"/>
                            <Skeleton active paragraph={{ rows: 1 }} title={false} className="w-36"/>
                            <Skeleton active paragraph={{ rows: 1 }} title={false} className="w-36"/>
                            <Skeleton active paragraph={{ rows: 1 }} title={false} className="w-56"/>
                            </div>
                          </div>
                          </div>
                          <div className="p-2 border border-StrokeColor">
                          <div className="flex space-x-6 px-4 items-center text-center">
                            <Skeleton active paragraph={{ rows: 1 }} title={false} className="w-12"/>
                            <div className="w-1/4"><Skeleton avatar active paragraph={{ rows: 2 }} title={false} className="w-36"/></div>
                            <div className="flex space-x-3 overflow-hidden">
                            <Skeleton active paragraph={{ rows: 1 }} title={false} className="w-36"/>
                            <Skeleton active paragraph={{ rows: 1 }} title={false} className="w-36"/>
                            <Skeleton active paragraph={{ rows: 1 }} title={false} className="w-36"/>
                            <Skeleton active paragraph={{ rows: 1 }} title={false} className="w-36"/>
                            <Skeleton active paragraph={{ rows: 1 }} title={false} className="w-56"/>
                            </div>
                          </div>
                          </div>
                          <div className="p-2 border border-StrokeColor">
                          <div className="flex space-x-6 px-4 items-center text-center">
                            <Skeleton active paragraph={{ rows: 1 }} title={false} className="!w-full"/>
                          </div>
                          </div>
                        </div>
     </div>
    </>
    )
}

export const MarketDetailsLoaders = ()=>{
    return(
    <>
     <div className="mt-4">
          <div className="w-full rounded-5 border border-StrokeColor p-5 mb-5">
              <Skeleton active paragraph={{ rows: 1 }} title={false} className="w-56 filters-loader mb-3"/>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              <Skeleton active paragraph={{ rows: 3 }} title={false} className="rounded-5 border border-StrokeColor p-5"/>
              <Skeleton active paragraph={{ rows: 3 }} title={false} className="rounded-5 border border-StrokeColor p-5"/>
              <Skeleton active paragraph={{ rows: 3 }} title={false} className="rounded-5 border border-StrokeColor p-5"/>
            </div>
            <div className="rounded-5 border border-StrokeColor p-5 mb-5">
                <div className="md:flex justify-between items-center">
                    <div>
                    <Skeleton.Avatar active paragraph={{ rows: 0 }} title={false} className="mb-2"/>  
                    <Skeleton active paragraph={{ rows: 2 }} title={false} className="w-24"/>  
                    </div>
                    <div className="flex justify-end mt-2 md:mt-0">
                    <Skeleton active paragraph={{ rows: 1 }} title={false} className="w-96 filters-loader mb-3"/>
                    </div>
                </div>
                <div className="mt-4">
                  <Skeleton active paragraph={{ rows: 1 }} title={false} className="custom-skeleton mb-3"/>   
                  <Skeleton active paragraph={{ rows: 1 }} title={false} className="mb-3"/>   
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 p-4 gap-4 mb-5 rounded-5 border border-StrokeColor">
              <Skeleton active paragraph={{ rows: 2 }} title={false} className="border-r border-StrokeColor p-5"/>
              <Skeleton active paragraph={{ rows: 2 }} title={false} className="border-r border-StrokeColor p-5"/>
              <Skeleton active paragraph={{ rows: 2 }} title={false} className="border-r border-StrokeColor p-5"/>
              <Skeleton active paragraph={{ rows: 2 }} title={false} className="p-5"/>
            </div>
          </div>
     </div>
    </>
    )
}