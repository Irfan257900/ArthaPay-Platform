import { QRCode } from "antd";
import React from "react";

const AppQrCode = ({
  type='svg',
  value,
  background = "#fff",
  color="#000",
  size=200,
  iconSize=0,
  icon = null,
  status="active",
  customStatusRender=undefined,
  onRefresh=undefined,
}) => {
  return (
    <QRCode
      type={type}
      status={status}
      value={value}
      bgColor={background}
      color={color}
      size={size}
      iconSize={iconSize}
      icon={icon}
      statusRender={customStatusRender}
      onRefresh={onRefresh}
    />
  );
};

export default AppQrCode;
