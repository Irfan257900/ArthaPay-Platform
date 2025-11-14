import React from "react";
import { Skeleton, Card, Avatar } from "antd";
const ContentLoader = () => {

  return (
    <div>
      
    <Card className="bg-menuhover border-transparent">
      <div className="title-left flex">
      <Skeleton
        active
        title={{ width: "30%" }}
        paragraph={{ rows: 1, width: "20%" }}
      />
        <div className="flex justify-end px-4 py-2 space-x-4 rounded-md ">
        <Skeleton.Avatar active />
        <Skeleton.Avatar active />
        <Skeleton.Avatar active />
        </div>
      </div>

      <Card className="border border-StrokeColor bg-menuhover mt-7">
      <div>
        <div className="h-64">
        {/* Info */}
        <div className="mt-2">
          <Skeleton paragraph={{ rows: 5 }} active />
        </div>
        </div>
      </div>
    </Card>
    <div className="input-left mt-8 border border-StrokeColor  px-4 py-4">
      <Skeleton.Input active className="!w-full" />
      </div>
      <div className="input-left mt-8 border border-StrokeColor px-4 py-4">
      <Skeleton.Input active className="!w-full" />
      </div>
      <Skeleton paragraph={{ rows: 3 }} active className="mt-4" />
    </Card>
  </div>
  );
}

export default ContentLoader;
