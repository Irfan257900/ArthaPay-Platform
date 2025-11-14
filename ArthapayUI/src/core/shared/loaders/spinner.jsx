import { Spin } from "antd";
import React from "react";
import { LoadingOutlined } from "@ant-design/icons";
const Spinner = ({ size = "default", className = "" }) => {
  return (
    <Spin
      className={className}
      size={size}
      indicator={<LoadingOutlined spin />}
    />
  );
};

export default Spinner;
