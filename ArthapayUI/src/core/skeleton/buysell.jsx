import { Skeleton } from "antd";
import React from "react";
export const MinMaxLoader = () => {
  return (
    <div className="flex justify-between mb-5">
      <Skeleton.Input block={false} size="small" active style={{ height: 20 }} className="" />
      <Skeleton.Input block={false} size="small" active style={{ height: 20}} className="" />
    </div>
  );
};
export function BuySellViewLoader({
  withHeader = true,
  widgetClass = "mt-8 md:w-[465px] w-full m-auto p-2",
}) {
  return (
    <div>
      {withHeader && (
        <div className="mt-2">
          <Skeleton
            active
            avatar
            paragraph={{ rows: 2 }}
            title={false}
            className="w-36 mb-2"
          />
        </div>
      )}
      <div className={widgetClass}>
        <div>
          <Skeleton.Input
            active
            style={{ height: 80 }}
            className="!w-full mb-1"
          />
        </div>
        <MinMaxLoader />
        <div className="flex justify-center items-center space-x-5 mb-5">
          <Skeleton.Avatar active className="!w-10 !h-10 child-wfull" />
        </div>
        <Skeleton.Input
          active
          style={{ height: 80 }}
          className="!w-full mb-2"
        />
        <div className="mb-3 flex justify-between">
          <Skeleton.Input
            active
            style={{ height: 25 }}
            className="mb-0.5 !w-full"
          />
        </div>
        <Skeleton.Input
          active
          style={{ height: 45 }}
          className="!w-full mt-3"
        />
      </div>
    </div>
  );
}

export function BuySellSummaryLoader() {
  return (
    <div>
      <div className="mt-2">
        <Skeleton
          active
          avatar
          paragraph={{ rows: 2 }}
          title={false}
          className="w-36 mb-2"
        />
      </div>
      <div className="mt-8 md:w-[465px] w-full m-auto p-2">
        <div className="text-center">
          <Skeleton.Input active style={{ height: 25 }} className="mb-3" />
          <Skeleton.Input
            active
            style={{ height: 25 }}
            className="!w-full mb-3"
          />
        </div>
        <div className="grid md:grid-cols-2 gap-2 mb-7">
          <div className="p-2.5 border border-StrokeColor rounded-5 bg-menuhover">
            <Skeleton active paragraph={{ rows: 2 }} className="" />
          </div>
          <div className="p-2.5 border border-StrokeColor rounded-5 bg-menuhover">
            <Skeleton active paragraph={{ rows: 2 }} className="" />
          </div>
        </div>
        <Skeleton.Input
          active
          style={{ height: 45 }}
          className="!w-full mb-2"
        />
        <Skeleton.Input
          active
          style={{ height: 45 }}
          className="!w-full mb-2"
        />
      </div>
    </div>
  );
}
