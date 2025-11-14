import React from "react";
import { Skeleton } from 'antd';
const ProfileImageLoader=()=> {
  return (
    <div>
      <Skeleton.Avatar active className="!w-28 !h-28 profileimg-loader rounded-full" />
        </div>
  );
}

export default ProfileImageLoader;
