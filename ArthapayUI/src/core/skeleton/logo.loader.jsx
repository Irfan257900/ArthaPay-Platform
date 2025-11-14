import React from "react";
import { Skeleton } from "antd";
const LogoLoader = () => {
  return (
    <div>
      <Skeleton.Input
        active
        style={{ height: 30 }}
        className="!w-full mb-2 mt-3"
      />
    </div>
  );
};
export default LogoLoader;
