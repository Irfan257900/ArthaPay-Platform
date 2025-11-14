import { Skeleton } from "antd";
import React from "react";
import ProfileImageLoader from "../profile.image.loader";

const ProfileInfoLoader =()=> {
  return (<div>
    <div className="border border-kbodyrowbr rounded-sm p-5 md:flex gap-5 mb-5">
      <ProfileImageLoader/>
        <div className="grid md:grid-cols-3 gap-2.5 flex-1">
        <Skeleton.Input active  className="!w-full !h-9" />
        <Skeleton.Input active  className="!w-full !h-9" />
        <Skeleton.Input active  className="!w-full !h-9" />
        <Skeleton.Input active  className="!w-full !h-9" />
        <Skeleton.Input active  className="!w-full !h-9" />
        <Skeleton.Input active  className="!w-full !h-9" />
        <Skeleton.Input active  className="!w-full !h-9" />
        <Skeleton.Input active  className="!w-full !h-9" />
        <Skeleton.Input active  className="!w-full !h-9" />
        </div>
       
    </div>
   
       <div className="grid md:grid-cols-3 gap-2.5 flex-1 border border-kbodyrowbr rounded-sm p-5">
       <Skeleton.Input active  className="!w-full !h-9" />
       <Skeleton.Input active  className="!w-full !h-9" />
       <Skeleton.Input active  className="!w-full !h-9" />
       <Skeleton.Input active  className="!w-full !h-9" />
       <Skeleton.Input active  className="!w-full !h-9" />
       <Skeleton.Input active  className="!w-full !h-9" />
       <Skeleton.Input active  className="!w-full !h-9" />
       <Skeleton.Input active  className="!w-full !h-9" />
       <Skeleton.Input active  className="!w-full !h-9" />
       </div>
      
   </div>
  );
}

export default ProfileInfoLoader;
