import { Skeleton } from "antd";
import React from "react";

const ActionPermissionloader =({actionsLength=3})=> {
  return (
    <div className="">
        <div className="flex items-center gap-2.5 justify-end action-loaders">
        {Array.from({ length: actionsLength }).map((_, index) => ( <Skeleton.Input key={index} active  className="!w-10 !rounded-[50%] !h-10" />))}
        </div>
    </div>
  );
}

export default ActionPermissionloader;
