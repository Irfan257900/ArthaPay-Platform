import { Skeleton } from "antd";
import React from "react";

const RightboxTabs =()=> {
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 gap-5">
        <div className="mt-2">
        <div className="border border-kbodyrowbr">
        <div className="mt-5 mb-4 w-96 mx-auto ">
        <div className="text-center !block">
          <Skeleton.Input active style={{ height: 25 }} className="mb-3 !block !mx-auto" />
          <Skeleton.Input active style={{ height: 25 }} className="md:!w-44 !w-full mb-3" />
          <Skeleton.Input active style={{ height: 45 }} className="!block !mx-auto mb-4" />
        </div>
        <Skeleton
            active
            paragraph={{ rows: 1 }}
            title={false}
            className="custom-skeleton w-full mb-4"
          />
         <Skeleton
            active
            paragraph={{ rows: 3 }}
            title={false}
            className="custom-skel w-full mb-6"
          />
           <Skeleton
            active
            paragraph={{ rows: 2 }}
            title={false}
            className="w-full"
          />
         </div>
        </div>
        <div className="p-3">
                
                <div className="mt-6  overflow-x-auto">
                   {[...Array(5)].map((_, index) => (
                              <div className="flex justify-between gap-2 mb-4">
                                <Skeleton.Input active className="!w-1/7" />
                                <Skeleton.Input active className="!w-1/7" />
                                <Skeleton.Input active className="!w-1/7" />
                                <Skeleton.Input active className="!w-1/7" />
                              </div>
                            ))}
                </div>
              </div>

             
        </div>
    </div>
  );
}
export default RightboxTabs;

export function PayeesFiatLoader() {
  return (
    <div>
      <div className="mt-8 md:w-[465px] w-full m-auto p-2">
        <div className="text-start">
          <Skeleton.Input active style={{ height: 25 }} className="mb-3" />
          <Skeleton.Input active style={{ height: 25 }} className="!w-full mb-3" />
        </div>
          <Skeleton.Input active style={{ height: 45 }} className="!w-full mb-2" />
          <Skeleton.Input active style={{ height: 45 }} className="!w-full mb-2" />
          <Skeleton.Input active style={{ height: 45 }} className="!w-full mb-2" />
          <Skeleton.Input active style={{ height: 45 }} className="!w-full mb-2" />
          <Skeleton.Input active style={{ height: 45 }} className="!w-full mb-2" />
          <Skeleton.Input active style={{ height: 45 }} className="!w-full mb-2" />
        <div className="text-start mt-3">
          <Skeleton.Input active style={{ height: 25 }} className="mb-3" />
          <Skeleton.Input active style={{ height: 25 }} className="!w-full mb-3" />
        </div>
          <Skeleton.Input active style={{ height: 45 }} className="!w-full mb-2" />
          <Skeleton.Input active style={{ height: 45 }} className="!w-full mb-2" />
          <Skeleton.Input active style={{ height: 45 }} className="!w-full mb-2" />
          <Skeleton.Input active style={{ height: 45 }} className="!w-full mb-2" />
          <Skeleton.Input active style={{ height: 45 }} className="!w-full mb-2" />
          <Skeleton.Input active style={{ height: 45 }} className="!w-full mb-2" />
        </div>
    </div>
  );
}
