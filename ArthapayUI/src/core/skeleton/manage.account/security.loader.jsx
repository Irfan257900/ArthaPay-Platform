import { Skeleton } from "antd";
import React from "react";

const SecurityLoader =()=> {
  return (<div>
    <div className="border border-kbodyrowbr rounded-sm p-5 md:flex gap-5 mb-5">
        <div className="grid md:grid-cols-1 gap-2.5 flex-1">
        <Skeleton.Input active  className="!w-48 !h-9" />
        <Skeleton.Input active  className="!w-full lg:!w-2/3 !h-6 " />
        <Skeleton.Input active  className="!w-full lg:!w-3/4 !h-9" />
        </div>
       
    </div>
   
       <div className="grid md:grid-cols-1 gap-2.5 flex-1 border border-kbodyrowbr rounded-sm p-5">
       <Skeleton.Input active  className="!w-48 !h-9" />
       <Skeleton.Input active  className="!w-full lg:!w-2/3 !h-6 " />
       <Skeleton.Input active  className="!w-40 !h-40" />
       <Skeleton.Input active  className="!w-48 !h-9" />
       </div>
      
   </div>
  );
}

export default SecurityLoader;
