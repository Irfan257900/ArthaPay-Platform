import React from 'react'
import { Skeleton } from "antd";
import FeesLoader from './fees.loader';
function MembershipAccordianLoader() {
    return (
        <div>
             <div className="w-full rounded-md bg-inputDarkBorder p-5 mb-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-10">
                      <Skeleton avatar active paragraph={{ rows: 2 }} title={false} className="!w-60"/>
                      <Skeleton avatar active paragraph={{ rows: 2 }} title={false} className="!w-60"/>
                      <Skeleton avatar active paragraph={{ rows: 2 }} title={false} className="!w-60"/>
                    </div>
                  </div>
            <div className="flex justify-between items-center rounded-md p-5 mb-6 bg-loginGreyBorder">
              <Skeleton active paragraph={{ rows: 1 }} title={false} className="!w-1/5"/>
              <Skeleton active paragraph={{ rows: 1 }} title={false}className="!w-10"/>
            </div> 
            <div className="flex justify-between items-center rounded-md p-5 mb-6 bg-loginGreyBorder">
              <Skeleton active paragraph={{ rows: 1 }} title={false} className="!w-1/5"/>
              <Skeleton active paragraph={{ rows: 1 }} title={false}className="!w-10"/>
            </div> 
            <div className="flex justify-between items-center rounded-md p-5 mb-6 bg-loginGreyBorder">
              <Skeleton active paragraph={{ rows: 1 }} title={false} className="!w-1/5"/>
              <Skeleton active paragraph={{ rows: 1 }} title={false}className="!w-10"/>
            </div> 
            <FeesLoader />
        </div>
       
    )
}

export default MembershipAccordianLoader
