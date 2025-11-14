import React from "react";
import { Skeleton,  } from 'antd';
const AddressLoader =()=> {
  return (
    <div className="py-6 px-3.5 bg-cardbackground rounded-5 mb-4">       
        <div className="flex items-start justify-between">
                <Skeleton active paragraph={{ rows:'1'}}className=""/>
                <div className="flex gap-3 items-center justify-end action-loaders">
                <Skeleton.Input active  className="!w-10 !rounded-[50%] !h-10" />
                <Skeleton.Input active  className="!w-10 !rounded-[50%] !h-10" />
                </div>
              </div>
    </div>
  );
}

export default AddressLoader;