import { Skeleton } from "antd";
import React from "react";
export function TwoColFormLoader({
  itemCount = 4,
  inputsHeight = 45,
  showHeader = false,
  isDrawer=false
}) {
  return (
    <>
      {showHeader && (
        <div className="flex items-center justify-between mb-5">
          <div className="mb-2">
            <Skeleton.Input
              active
              style={{ height: inputsHeight }}
              className="!w-full"
            />
          </div>
        </div>
      )}
      <div className={`grid grid-cols-1 ${isDrawer ? 'md:grid-cols-1' :'md:grid-cols-2'} gap-4`}>
        {Array.from({ length: itemCount }).map((_, index) => (
          <div className="mb-2" key={index}>
            <Skeleton.Input
              active
              style={{ height: inputsHeight }}
              className="!w-full"
            />
          </div>
        ))}
      </div>
      <div className="md:flex items-center gap-2 justify-end mt-2">
        <div>
          <Skeleton.Input
            active
            style={{ height: inputsHeight }}
            className="!w-full"
          />
        </div>
        <div>
          <Skeleton.Input
            active
            style={{ height: inputsHeight }}
            className="!w-full"
          />
        </div>
      </div>
    </>
  );
}
