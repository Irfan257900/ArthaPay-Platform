import { Skeleton } from "antd";
import React from "react";

const CompanyDataloader =()=> {
  return (
    <div className="">
        <div className="text-center mb-3">
        <Skeleton.Input active style={{  height:46 }} className="!w-1/2 mx-auto" />
        </div>
        <div className="text-center mb-3">
        <Skeleton.Input active style={{  height:24 }} className="!w-2/3 mx-auto" />
        </div>
       <div className="flex items-center gap-10 justify-center action-loaders mb-10">
               <Skeleton.Input active  className="!w-14 !rounded-[50%] !h-14" />
               <Skeleton.Input active  className="!w-14 !rounded-[50%] !h-14" />
               <Skeleton.Input active  className="!w-14 !rounded-[50%] !h-14" />
               </div>
        <div className="border border-kbodyrowbr grid grid-cols-2 gap-4 p-5 rounded-sm">
         <Skeleton
            active
            paragraph={{ rows: 3 }}
            title={false}
            className="custom-skel w-full mb-0"
          />
          <Skeleton
            active
            paragraph={{ rows: 3 }}
            title={false}
            className="custom-skel w-full mb-0"
          />
         
         </div>
         <div className="border border-kbodyrowbr grid grid-cols-2 gap-4 p-5 mt-5 rounded-sm">
         <Skeleton
            active
            paragraph={{ rows: 3 }}
            title={false}
            className="custom-skel w-full mb-0"
          />
          <Skeleton
            active
            paragraph={{ rows: 3 }}
            title={false}
            className="custom-skel w-full mb-0"
          />
           <Skeleton
            active
            paragraph={{ rows: 3 }}
            title={false}
            className="custom-skel w-full mb-0"
          />
          <Skeleton
            active
            paragraph={{ rows: 3 }}
            title={false}
            className="custom-skel w-full mb-0"
          />
         </div>
    </div>
  );
}

export default CompanyDataloader;
