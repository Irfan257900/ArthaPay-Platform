import React from "react";
import { Skeleton, Card, Avatar } from "antd";
const CriptoFiatLoader = () => {
  return ( 
 <div className="md:w-[465px] w-full mx-auto">
 <div className="">
   <div className="title-left">
     <div className="input-left mt-8 bg-coinListBg border border-coinBr  px-4 py-4">
      <Skeleton.Input active className="!w-full" />
     </div>
     <div className="mt-4 flex gap-3">
     <Skeleton.Input active className="" />
     <Skeleton.Input active className="" />
     </div>
   </div>

   <Card className="bg-coinListBg border border-coinBr mt-7">
   <div>
     <div className="h-64">
     <div className="flex justify-between gap-2 py-2 rounded-md ">
       <Skeleton.Input active className="!w-full" />
       <Skeleton.Avatar active />
     </div>
     <div className="input-left mt-8 bg-coinListBg border border-coinBr  px-4 py-4">
        <Skeleton.Input active className="!w-full" />
     </div>
     <div className="input-left mt-8 bg-coinListBg border border-coinBr  px-4 py-4">
        <Skeleton.Input active className="!w-full" />
     </div>
     </div>
   </div>
 </Card>
   <div className="input-left mt-8 bg-advcard border border-coinBr  px-4 py-4">
     <Skeleton.Input active className="!w-full" />
   </div>
   <div className="input-left mt-8 bg-advcard border border-coinBr  px-4 py-4">
   <Skeleton.Input active className="!w-full" />
   </div>
 </div>
</div>
  );
}
export default CriptoFiatLoader;

export function PayoutDetailsLoaders() {
  return (
    <div>
      <div className="mt-8 md:w-[465px] w-full m-auto p-2">
        <div className="text-center">
          <Skeleton.Input active style={{ height: 25 }} className="mb-3" />
          <Skeleton.Input active style={{ height: 25 }} className="!w-full mb-3" />
        </div>
          <Skeleton.Input active style={{ height: 45 }} className="!w-full mb-2" />
          <Skeleton.Input active style={{ height: 45 }} className="!w-full mb-2" />
          <Skeleton.Input active style={{ height: 45 }} className="!w-full mb-2" />
          <Skeleton.Input active style={{ height: 45 }} className="!w-full mb-2" />
          <Skeleton.Input active style={{ height: 45 }} className="!w-full mb-2" />
          <Skeleton.Input active style={{ height: 45 }} className="!w-full mb-2" />
          <div className="flex justify-end"><Skeleton.Input active style={{ height: 45 }} className="mb-3" /></div>
        </div>
    </div>
  );
}
