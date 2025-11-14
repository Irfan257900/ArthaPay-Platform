// CommonDrawer.js
import React from "react";
import { Drawer } from "antd";
import PropTypes from "prop-types";

const CommonDrawer = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  placement = "right",
  closable = false,
  maskClosable= false,
}) => {
  return (
    <Drawer
      title={
        <div className="side-drawer-header lg:mt-0  mt-12">
          <h2 className="text-2xl text-titleColor font-semibold">{title}</h2>
          <span onClick={onClose} className="icon lg close cursor-pointer" title="Close" />
        </div>
      }
      placement={placement}
      closable={closable}
      onClose={onClose}
      open={isOpen}
      className={`!bg-sidedrawerBg custom-sidedrawer ${className}`}
      maskClosable={maskClosable}
      destroyOnClose={true}
    >
      {children}
    </Drawer>
  );
};

CommonDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  placement: PropTypes.oneOf(["top", "right", "bottom", "left"]),
  closable: PropTypes.bool,
  maskClosable:PropTypes.bool,
};

export default CommonDrawer;