import React from "react";
import { Skeleton, Card, Avatar } from "antd";

const CardDetailsViewSkeleton = () => {
  return (
    <div className="bg-menuhover rounded-5 p-1">
      <div className="md:flex items-center justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <Skeleton.Avatar active size="large" />
          <div className="ml-4">
          <Skeleton.Input active style={{ width: "100%", height: 30 }} />
            <div className="mt-2">
            <Skeleton.Input active style={{ width: "100%", height: 20 }} />
            </div>
          </div>
        </div>
        <div className="flex space-x-4">
          <Skeleton.Avatar active size="large" />
          <Skeleton.Avatar active size="large" />
          <Skeleton.Avatar active size="large" />
        </div>
      </div>
      <Card className="bg-menuhover border border-coinBr mb-6">
        <div className="p-4 text-center">
          <Skeleton.Input
            title={{ width: "100%",}}
            active
            style={{height: 230,}} className="mx-auto !w-full md:!w-[400px]"
            paragraph={{ rows: 1, width: "50%",height:"100%"}}
          />
          <div className="mt-4">
            <Skeleton.Input active style={{  height: 40 }} className="!w-full md:!w-[400px] " />
          </div>
          <div className="mt-4">
          <Skeleton.Input active style={{  height: 40 }} className="!w-full md:!w-[400px]" />
          </div>
          <div className="mt-4">
          <Skeleton.Input active style={{  height: 40 }} className="!w-full md:!w-[400px]" />
          </div>
          <div className="mt-4">
          <Skeleton.Input active style={{  height: 40 }} className="!w-full md:!w-[400px]" />
          </div>
        </div>
      </Card>
      <div>
      <Skeleton.Input active style={{  height: 30 }} className="md:!w-[400px] w-full mb-3" />
        <div className="border border-coinBr p-4 rounded">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex justify-between gap-2 mb-4">
              <Skeleton.Input active className="!w-1/5" />
              <Skeleton.Input active className="!w-1/5" />
              <Skeleton.Input active className="!w-1/5" />
              <Skeleton.Input active className="!w-1/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardDetailsViewSkeleton;
