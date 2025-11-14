import React from "react";
import { Skeleton } from 'antd';
import AdvertisementLoader from "../adv.loader/adv.loader";
const CardsDashboardLoader =()=> {
  return (
    <div>
      <div><AdvertisementLoader /></div>
      <div className="mt-6">
      <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
      <Skeleton.Input active style={{  height: 40 }} className="!w-full mb-2" />
      <Skeleton.Input active style={{  height: 40 }} className="!w-full mb-2" />
      </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                    
                    <div className="mt-2 border-t border-r-0 border-l-0 border-b-0 border-t-borderLightGreen bg-sectionBG rounded-5 p-3">
                      <Skeleton.Input active style={{  height: 230 }} className="!w-full mb-2" />
                      <Skeleton.Input active style={{  height: 230 }} className="!w-full" />
                    </div>
                    <div>
                    
                    <div className="mt-2 border-t border-r-0 border-l-0 border-b-0 border-t-borderLightGreen bg-sectionBG rounded-5 p-3">
                    <Skeleton.Input active style={{  height: 60 }} className="!w-full mb-2" />
                    <Skeleton.Input active style={{  height: 60 }} className="!w-full mb-2" />
                    <Skeleton.Input active style={{  height: 60 }} className="!w-full mb-2" />
                    <Skeleton.Input active style={{  height: 60 }} className="!w-full mb-2" />
                    <Skeleton.Input active style={{  height: 60 }} className="!w-full mb-2" />
                    <Skeleton.Input active style={{  height: 60 }} className="!w-full mb-2" />
                    <Skeleton.Input active style={{  height: 60 }} className="!w-full mb-2" />
                    </div>
                    </div>
                    </div>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-5 mt-5'>
                    
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

export default CardsDashboardLoader;
