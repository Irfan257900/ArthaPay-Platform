import { Skeleton } from "antd";
import React from "react";
export function FiatDetailsLoader() {
  return (
    <div className="md:px-12 mt-5">
      <div className="border border-StrokeColor rounded-5 p-4">
        <Skeleton.Input active style={{ height: 24 }} className="" />
        <div className="grid md:grid-cols-2 gap-4 mt-5">
          <Skeleton.Input
            active
            style={{ height: 24 }}
            className="!mb-2 !w-full"
          />
          <Skeleton.Input
            active
            style={{ height: 24 }}
            className="!mb-2 !w-full"
          />
          <Skeleton active paragraph={{ rows: 2 }} className="" />
          <Skeleton active paragraph={{ rows: 2 }} className="" />
        </div>
      </div>
    </div>
  );
}
function FiatRightboxLoader() {
  return (
    <div>
      <div className="mt-5 md:p-4 p-2 bg-tableheaderBlack border border-StrokeColor rounded-5 lg:w-1/2 mx-auto w-full overflow-auto">
        <div className="flex justify-between space-x-3">
          <Skeleton.Input active style={{ height: 24 }} className="" />
          <Skeleton.Input active style={{ height: 24 }} className="" />
        </div>
      </div>
      <div className="md:px-12 mt-5">
        <div className="border border-StrokeColor rounded-5 p-4">
          <Skeleton.Input active style={{ height: 24 }} className="" />
          <div className="grid md:grid-cols-2 gap-4 mt-5">
            <Skeleton.Input
              active
              style={{ height: 24 }}
              className="!mb-2 !w-full"
            />
            <Skeleton.Input
              active
              style={{ height: 24 }}
              className="!mb-2 !w-full"
            />
            <Skeleton active paragraph={{ rows: 2 }} className="" />
            <Skeleton active paragraph={{ rows: 2 }} className="" />
          </div>
        </div>
        <div className="mt-5">
          <Skeleton.Input
            active
            style={{ height: 24 }}
            className="!mb-4 !w-full"
          />
          <Skeleton.Input active style={{ height: 24 }} className="!mb-2" />
          <Skeleton.Input active style={{ height: 24 }} className="!w-full" />
        </div>
      </div>
    </div>
  );
}

export default FiatRightboxLoader;
