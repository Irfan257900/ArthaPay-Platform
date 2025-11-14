import React from "react";
import AppAlert from "./appAlert";
import AppText from "./appText";
import { Link } from "react-router";

const NoVerifications = ({boxClass='!mt-8',textClass="ant-alert-description"}) => {
  return (
    <div className={`alert-flex withdraw-alert fiat-alert ${boxClass || ''}`}>
      <AppAlert
        type="error"
        className="!py-8"
        description={
          <AppText className={textClass}>
            Without verifications, you can't proceed. Please complete the
            required verifications in the{" "}
            <Link to="/profile/security"> security section.</Link>
          </AppText>
        }
        showIcon
      />
    </div>
  );
};

export default NoVerifications;
