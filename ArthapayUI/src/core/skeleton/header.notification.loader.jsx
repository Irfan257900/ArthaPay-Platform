import { Skeleton } from "antd";
import React from "react";

const HeaderNotificationsLoader =({ itemCount = 1 })=> {
  return (
    <div className="">
        
        {Array.from({ length: itemCount }).map((_, index) => (
                  <div className="mb-2" key={index}>
                    <Skeleton.Input active style={{  height: 66 }} className="!w-full" />
                  </div>
                ))}
    </div>
  );
}

export default HeaderNotificationsLoader;
