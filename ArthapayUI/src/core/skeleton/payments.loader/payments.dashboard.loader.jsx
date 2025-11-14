import React from "react";
import { Skeleton } from 'antd';
import AdvertisementLoader from "../adv.loader/adv.loader";
import KpiLoader from "../kpi.loader/kpi";
const PaymentsDashboardLoader =()=> {
  return (
    <div>
      <div><AdvertisementLoader /></div>
      <div className="mt-6">
      <KpiLoader itemCount={5} />
      </div>
      <Skeleton.Input active style={{  height: 40 }} className="!w-48 mb-2  mt-4" />
      <div className="mt-0 bg-inputBg rounded-sm p-4">
      <Skeleton.Input active style={{  height: 42 }} className="!w-full mb-2" />
                    <Skeleton.Input active style={{  height: 42 }} className="!w-full mb-2" />
                    <Skeleton.Input active style={{  height: 42 }} className="!w-full mb-2" />
                    <Skeleton.Input active style={{  height: 42 }} className="!w-full mb-2" />
                    <Skeleton.Input active style={{  height: 42 }} className="!w-full mb-2" />
                    <Skeleton.Input active style={{  height: 42 }} className="!w-full mb-2" />
                    <Skeleton.Input active style={{  height: 42 }} className="!w-full mb-2" />
      </div>
      <div className="mt-4"><AdvertisementLoader /></div>
     
      <div className='grid grid-cols-1 md:grid-cols-2 gap-5 mt-0'>
                    
                    <div className="mt-2 border-t border-r-0 border-l-0 border-b-0 border-t-borderLightGreen bg-sectionBG rounded-5 p-3">
                    <Skeleton.Input active style={{  height: 40 }} className="!w-full mb-2" />
                    <Skeleton.Input active style={{  height: 40 }} className="!w-full mb-2" />
                    <Skeleton.Input active style={{  height: 40 }} className="!w-full mb-2" />
                    <Skeleton.Input active style={{  height: 40 }} className="!w-full mb-2" />
                    <Skeleton.Input active style={{  height: 40 }} className="!w-full mb-2" />
                    <Skeleton.Input active style={{  height: 40 }} className="!w-full mb-2" />
                    <Skeleton.Input active style={{  height: 40 }} className="!w-full mb-2" />
                    </div>
                    
                    <div className="mt-2 border-t border-r-0 border-l-0 border-b-0 border-t-borderLightGreen bg-sectionBG rounded-5 p-3">
                    <Skeleton.Input active style={{  height: 30 }} className="!w-full mb-2" />
                    <Skeleton.Input active style={{  height: 320 }} className="!w-full mb-2" />
                    </div>
                    </div>
      
      
    </div>
  );
}

export default PaymentsDashboardLoader;
