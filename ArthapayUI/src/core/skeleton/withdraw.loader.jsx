import { Skeleton } from "antd";
import React from "react";

export function WithdrawWidgetLoader() {
  return (
    <div>
      <div className="mt-8 w-full m-auto">
        <div>
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
          <Skeleton.Input
            active
            style={{ height: 45 }}
            className="!w-full mb-4"
          />
          <Skeleton.Input
            active
            style={{ height: 60 }}
            className="!w-full mb-1"
          />
        </div>
        <div className="!w-full flex justify-between mb-5">
          <Skeleton.Input
            active
            style={{ height: 20 }}
            className="mb-2"
          />
          <Skeleton.Input
            active
            style={{ height: 20 }}
            className="mb-2"
          />
        </div>
        <div className="text-center mt-3">
        <Skeleton.Input
          active
          style={{ height: 45 }}
          className="!w-full mb-2"
        />
        </div>
      </div>
    </div>
  );
}
