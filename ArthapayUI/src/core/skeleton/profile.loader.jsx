import React from "react";
import { Skeleton } from 'antd';
const ProfileLoader=()=> {
  return (
    <div>
      <div className="rounded-sm bg-sectionBG md:p-5 p-2.5 mb-5 md:flex gap-6">
      <div className="text-center"><Skeleton.Avatar active className="!w-44 !h-40 mb-2 child-wfull" /></div>
        
        <Skeleton
          active
          paragraph={{ rows: 5 }}
          title={false}
          className="w-full"
        />
        <div className="block md:hidden mt-4">
        <Skeleton
          active
          paragraph={{ rows: 5 }}
          title={false}
          className="w-full"
        />
        </div>
      </div>
    </div>
  );
}

export default ProfileLoader;
