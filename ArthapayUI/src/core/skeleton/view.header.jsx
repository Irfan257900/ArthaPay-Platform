import { Skeleton } from "antd";
import React from "react";

const ViewHeaderLoader = () => {
  return (
    <div className="mt-2">
      <Skeleton
        active
        avatar
        paragraph={{ rows: 2 }}
        title={false}
        className="w-36 mb-2"
      />
    </div>
  );
};

export default ViewHeaderLoader;
