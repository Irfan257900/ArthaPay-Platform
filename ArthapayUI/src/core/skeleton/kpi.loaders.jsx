import { Skeleton } from "antd";
import React from "react";
const KpiLoader = () => {
    return (
        <>
            <div className="kpicardbg ">
                <div className="flex items-center gap-3">
                    <Skeleton.Avatar active />
                    <Skeleton active paragraph={{ rows: 2, width: [107, 134] }} title={false} />


                </div>
            </div>
             <div className="kpicardbg ">
                <div className="flex items-center gap-3">
                    <Skeleton.Avatar active />
                    <Skeleton active paragraph={{ rows: 2, width: [107, 134] }} title={false} />


                </div>
            </div>
            <div className="kpicardbg ">
                <div className="flex items-center gap-3">
                    <Skeleton.Avatar active />
                    <Skeleton active paragraph={{ rows: 2, width: [107, 134] }} title={false} />


                </div>
            </div>

            {/* <div className="kpicardbg ">
            <div className=" justify-between">
            <Skeleton active paragraph={{rows:1, width:[107]}}  title={false} />
            <div className="ml-">
            <Skeleton active paragraph={{rows:1, width:[107]}}  title={false} />
            </div>
            </div>
            <div className="flex mt-5 gap-3.5">
            <Skeleton.Avatar active/>
            <div>
            <Skeleton.Input active className="!w-full "  style={{height:20}} />
            <Skeleton.Input active className="!w-full mt-1" style={{height:20}}  />
            <Skeleton.Input active className="!w-full mt-1" style={{height:20}}  />
            </div>
            </div>
            <div>
            
        </div>
        </div> */}
        </>
    )
}
export default KpiLoader;  