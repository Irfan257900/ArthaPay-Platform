import React, { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router";
import CustomButton from "../button/button";
import ActionControlModal from "./actionControl.modal";
import ActionControlKyc from "./actionControl.kyc";
const ActionController = ({
  children,
  handlerType = "route",
  onAction,
  actionParams = [],
  allowWithoutMembership = false,
  allowWithoutKyc = false,
  actionFrom = "default",
  redirectTo = "/",
  buttonType = "primary",
  buttonClass,
  ...otherProps
}) => {
  const userProfile = useSelector(
    (store) => store.userConfig.details || {}
  );
  const currentKycStatus = useSelector((store) => store.userConfig.kycStatus);
  const isSubscribed = useSelector((store) => store.userConfig.isSubscribed);
  const [modalOpen, setModalOpen] = useState('');
  const basePath = useMemo(() => {
    return userProfile?.accountType === "Business" ? "/kyb?" : "/kyc?";
  }, [userProfile?.accountType]);
  const handleClick = useCallback(() => {
    if (currentKycStatus !== "Approved" && !allowWithoutKyc) {
      setModalOpen('kyc');
      return;
    }
    if(!isSubscribed && actionFrom!=='Purchase/Upgrade Membership' && !allowWithoutMembership) {
      setModalOpen('subscribeMembership');
      return;
    }
    onAction?.(...actionParams);
  }, [currentKycStatus, basePath, onAction, actionParams, actionFrom]);

  if (
    (currentKycStatus === null || currentKycStatus === "Draft") &&
    handlerType === "route"
  ) {
    return (
      <Navigate
        to={`${basePath}actionFrom=${encodeURIComponent(
          actionFrom
        )}&redirectTo=${encodeURIComponent(redirectTo)}`}
        replace={true}
      />
    );
  }

  if (currentKycStatus !== "Approved" && handlerType === "route") {
    return (
      <ActionControlKyc
        userProfile={userProfile}
        currentStatus={currentKycStatus}
        path={`${basePath}actionFrom=${encodeURIComponent(
          actionFrom
        )}&redirectTo=${encodeURIComponent(redirectTo)}`}
      />
    );
  }

  if (handlerType === "button") {
    return (
      <>
        <CustomButton
          {...otherProps}
          type={buttonType}
          className={buttonClass}
          onClick={handleClick}
        >
          {children}
        </CustomButton>
        <ActionControlModal isOpen={modalOpen!==''} modal={modalOpen} setModalOpen={setModalOpen} actionFrom={actionFrom} redirectTo={redirectTo}/>
        </>
    );
  }
  return <>{children}</>;
};

export default ActionController;
