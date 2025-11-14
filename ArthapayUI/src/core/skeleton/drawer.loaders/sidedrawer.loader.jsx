import { Skeleton } from "antd";
import React from "react";

const SideDrawerLoader =()=> {
  return (
    <div className="">
        <div className="text-center mb-3">
        <Skeleton.Input active style={{  height:46 }} className="!w-2/3 mx-auto" />
        </div>
        <div className="text-center mb-3">
        <Skeleton.Input active style={{  height:24 }} className="!w-3/4 mx-auto" />
        </div>
      
        <div className="border border-kbodyrowbr gap-4 p-5 rounded-sm">
         <Skeleton
            active
            paragraph={{ rows: 2 }}
            title={false}
            className="custom-skel w-full mb-0"
          />
          
         
         </div>
         <div className="border border-kbodyrowbr grid grid-cols-2 gap-4 p-5 mt-5 rounded-sm">
         <Skeleton
            active
            paragraph={{ rows: 2 }}
            title={false}
            className="custom-skel w-full mb-0"
          />
          <Skeleton
            active
            paragraph={{ rows: 2 }}
            title={false}
            className="custom-skel w-full mb-0"
          />
           <Skeleton
            active
            paragraph={{ rows: 2 }}
            title={false}
            className="custom-skel w-full mb-0"
          />
          <Skeleton
            active
            paragraph={{ rows: 2 }}
            title={false}
            className="custom-skel w-full mb-0"
          />
          
         </div>
         <Skeleton
            active
            paragraph={{ rows: 2 }}
            title={false}
            className="custom-skel w-full mb-0 mt-5"
          />
         
    </div>
  );
}

export default SideDrawerLoader;
