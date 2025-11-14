// components/CustomButton.jsx
import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { Button } from "antd";

const CustomButton = ({
  type = "",
  shape = "default",
  size = "middle",
  block = false,
  loading = false,
  disabled = false,
  children,
  onClick,
  onClickParams = [],
  icon,
  danger = false,
  className,
  style,
  htmlType,
  name = "",
  passEvent = "start",
}) => {
  const handleClick = useCallback(
    (e) => {
      if (!onClick) return;

      const callWithParams = (params) =>
        passEvent === "start" ? onClick(e, ...params) : onClick(...params, e);

      if (Array.isArray(onClickParams)) {
        callWithParams(onClickParams);
      } else if (onClickParams !== undefined) {
        callWithParams([onClickParams]);
      } else {
        onClick(e);
      }
    },
    [onClick, onClickParams, passEvent]
  );
  if (type === "primary") {
    return (
      <Button
        name={name}
        type={type}
        shape={shape}
        size={size}
        htmlType={htmlType}
        block={block}
        loading={loading}
        disabled={disabled}
        onClick={handleClick}
        icon={icon}
        danger={danger}
        className={`primary-btn rounded-5 border-0 bg-primaryColor hover:!bg-primaryColor h-[38px]  text-sm font-medium !text-textWhite  md:min-w-[100px]  disabled:!bg-disableBtnBg disabled:opacity-60 disabled:cursor-not-allowed disabled:!text-subTextColor focus-visible:bg-buttonActiveBg focus-within:bg-buttonActiveBg focus-visible:outline-none min-w-full md:mt-0 mt-2.5 hoveranim ${className}`}
        style={style}
      >
        {children}
      </Button>
    );
  }
  if (type === "danger") {
    return (
      <Button
        name={name}
        type={type}
        shape={shape}
        size={size}
        htmlType={htmlType}
        block={block}
        loading={loading}
        disabled={disabled}
        onClick={onClick}
        icon={icon}
        danger={danger}
        className={`rounded-5 border !border-textRed !text-textRed hover:!text-lightDark hover:!bg-textRed h-[38px] dark:hover:!bg-textRed text-sm font-medium md:min-w-[100px] disabled:!bg-textRed disabled:opacity-50 disabled:cursor-not-allowed disabled:!text-lightDark  focus-visible:bg-textRed focus-visible:outline-none min-w-full md:mt-0 mt-2.5 hoveranim ${className}`}
        style={style}
      >
        {children}
      </Button>
    );
  }
  if (type === "plain") {
    return (
      <Button
        name={name}
        htmlType={htmlType}
        type={type}
        shape={shape}
        size={size}
        block={block}
        loading={loading}
        disabled={disabled}
        onClick={handleClick}
        icon={icon}
        danger={danger}
        className={`${className}`}
        style={style}
      >
        {children}
      </Button>
    );
  }
  if (type === "normal") {
    return (
      <button
        className={`${className} disabled:!cursor-not-allowed`}
        type={htmlType || "button"}
        onClick={handleClick}
        disabled={disabled}
      >
        {children}
      </button>
    );
  }
  return (
    <Button
      name={name}
      htmlType={htmlType}
      type={type}
      shape={shape}
      size={size}
      block={block}
      loading={loading}
      disabled={disabled}
      onClick={handleClick}
      icon={icon}
      danger={danger}
      className={`cancel-btn rounded-5 border border-primaryColor !bg-transparent hover:!border-primaryColor text-sm font-medium text-primaryColor h-[38px] md:min-w-[100px]  disabled:opacity-50 disabled:cursor-not-allowed disabled:text-lightWhite focus-visible:outline-none focus-visible:!bg-primaryColor  focus-within:!text-primaryColor focus-visible:!text-textWhite min-w-full md:mt-0 mt-2.5 hoveranim ${className}`}
      style={style}
    >
      {children}
    </Button>
  );
};

CustomButton.propTypes = {
  type: PropTypes.oneOf(["primary", "default", "dashed", "link", "text"]),
  shape: PropTypes.oneOf(["default", "circle", "round"]),
  size: PropTypes.oneOf(["small", "middle", "large"]),
  block: PropTypes.bool,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  icon: PropTypes.node,
  danger: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  htmlType: PropTypes.string,
  onClickParams: PropTypes.array | PropTypes.any,
};

export default CustomButton;
