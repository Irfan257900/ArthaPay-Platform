import React from "react";
import { useSelector } from "react-redux";
import CustomButton from "./button/button";
import { useTranslation } from "react-i18next";
import AppText from "./shared/appText";
import AppAlert from "./shared/appAlert";
import { Link } from "react-router";
const Description = ({
  className,
  linkClass,
  linkUrl,
  buttonClass,
  actionType = "link",
  onAction,
  actionParams,
}) => {
  const { t: translator } = useTranslation();
  return (
    <AppText className={className || "ant-alert-description"}>
      Please enable the Two-Step Verification in the {" "}
      {actionType === "link" && (
        <Link to={linkUrl || "/profile/security"} className={linkClass || ""}>
          {" "}
          {translator("common.verifications.noVerificationsAlert.suffix")}
        </Link>
      )}
      {actionType === "button" && (
        <CustomButton
          type="normal"
          className={buttonClass || "text-link"}
          onClick={onAction}
          onClickParams={actionParams || []}
        >
          {translator("common.verifications.noVerificationsAlert.suffix")}
        </CustomButton>
      )}
    </AppText>
  );
};
const VerificationsHandler = ({
  loader,
  actionType = "link",
  onAction,
  navigateTo = "/profile/security",
  descriptionRootClass = "!py-2",
  className = "alert-flex withdraw-alert fiat-alert !mt-8",
  descriptionClass,
  linkClass,
  buttonClass,
  description = null,
  children,
  displayError = true,
  displayNoteAsAlert = true,
  actionParams = [],
}) => {
  const { loading, hasVerifications, error } = useSelector(
    (store) => store.userConfig.verifications
  );
  return (
    <>
      {loading && loader}
      {!loading && error && displayError && (
        <AppAlert
          type="error"
          className={descriptionRootClass}
          description={error}
          showIcon
        />
      )}
      {!loading && !hasVerifications && !error && (
        <div className={className}>
          {displayNoteAsAlert && (
            <AppAlert
              type="error"
              className={descriptionRootClass}
              description={
                description || (
                  <Description
                    actionType={actionType}
                    onAction={onAction}
                    linkUrl={navigateTo}
                    className={descriptionClass}
                    linkClass={linkClass}
                    buttonClass={buttonClass}
                    actionParams={actionParams}
                  />
                )
              }
              showIcon
            />
          )}
          {!displayNoteAsAlert && (
            <div className={descriptionRootClass}>
              {description || (
                <Description
                  actionType={actionType}
                  onAction={onAction}
                  linkUrl={navigateTo}
                  className={descriptionClass}
                  linkClass={linkClass}
                  buttonClass={buttonClass}
                  actionParams={actionParams}
                />
              )}
            </div>
          )}
        </div>
      )}
      {!loading && hasVerifications && !error && <>{children}</>}
    </>
  );
};
VerificationsHandler.Description = Description;
export default VerificationsHandler;
