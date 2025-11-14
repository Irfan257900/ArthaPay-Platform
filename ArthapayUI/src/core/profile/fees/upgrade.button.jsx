import React, { useCallback } from "react";
import CustomButton from "../../button/button";
import { useSelector } from "react-redux";
import { membershipUpgradeTexts } from "../membership/services";

const UpgradeButton = ({
  handleClick,
  membership,
  buttonType = "primary",
  className = "",
  loading,
  disabled,
}) => {
  const isSubscribed = useSelector((store) => store.userConfig.isSubscribed);
  const onUpgrade = useCallback(() => {
    handleClick(membership);
  }, [membership]);
  return (
    <CustomButton
      className={className}
      type={buttonType}
      onClick={onUpgrade}
      loading={loading}
      disabled={loading || disabled}
    >
      {membershipUpgradeTexts('upgradeButtonText',isSubscribed)}
    </CustomButton>
  );
};

export default UpgradeButton;
