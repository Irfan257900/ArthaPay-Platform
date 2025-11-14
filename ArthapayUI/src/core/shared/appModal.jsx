import { Modal } from "antd";
import React from "react";
import CustomButton from "../button/button";

const AppModal = ({
  isOpen,
  title,
  footer,
  closable = true,
  closeIcon = null,
  onClose,
  children,
  ...otherProps
}) => {
  return (
    <Modal
      open={isOpen}
      title={title}
      footer={footer}
      closable={closable}
      closeIcon={closeIcon}
      onClose={onClose}
      onCancel={onClose}
      destroyOnClose={true}
      {...otherProps}
    >
      {children}
    </Modal>
  );
};
const Footer = ({
  onCancel = () => {},
  showCancel = true,
  footerClass = "mt-9 text-right",
  cancelDisabled = false,
  okDisabled = false,
  loading = false,
  onOk,
  cancelText = "Cancel",
  okText = "Save",
  showOk = true,
}) => {
  return (
    <div className={footerClass}>
      {showCancel && (
        <CustomButton
          type="secondary"
          onClick={onCancel}
          disabled={cancelDisabled}
        >
          {cancelText}
        </CustomButton>
      )}
      {showOk && (
        <CustomButton
          type="primary"
          className={"md:ml-2"}
          onClick={onOk}
          loading={loading}
          disabled={okDisabled}
        >
          {okText}
        </CustomButton>
      )}
    </div>
  );
};

const CloseIcon = ({ onClose,icon="lg close"}) => {
  return (
    <button onClick={onClose}>
      <span className={`icon ${icon} cursor-pointer`} title="close"></span>
    </button>
  );
};
AppModal.Footer = Footer;
AppModal.CloseIcon = CloseIcon;
export default AppModal;
