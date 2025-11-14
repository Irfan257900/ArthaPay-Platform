import { useAuth0 } from "@auth0/auth0-react";
import React, { useCallback, useState } from "react";
import AppModal from "../shared/appModal";
import { logoutAuditlogs } from "../../reducers/userconfig.reducer";
import { useDispatch, useSelector } from "react-redux";
const LogoutButton = ({ className, children, beforeLogout, skipConfirm = false }) => {
  const trackAuditLogData = useSelector(
    (store) => store.userConfig.trackAuditLogData);
  const userid = useSelector((store) => store.userConfig.details?.id)
  const dispatch = useDispatch();

  const [showConfirmation, setShowConfirmation] = useState(false);
  const { logout } = useAuth0();
  const payload = {
    id: userid,
    metadata: JSON.stringify(trackAuditLogData)
  };
  const logoutUser = useCallback((e) => {
    e?.preventDefault();
    beforeLogout?.();
    logout({
      logoutParams: {
        federated: true,
        returnTo: `${window.runtimeConfig.VITE_REDIRECT_URI}#logout`,
      },
    });
  }, []);
  const openConfirmationModal = useCallback(() => {
    if (skipConfirm) {
      logoutUser();
      return;
    }
    setShowConfirmation(true);
  }, [skipConfirm, logoutUser]);
  const closeConfirmationModal = useCallback(() => {
    setShowConfirmation(false);
  }, []);
  return (
    <>
      <button
        className={`w-full bg-logoutBtn hover:!bg-logoutBtnHover border-0 hover:!text-textWhite hover:opacity-80 hover:!border-textWhite justify-start rounded-5 text-sm font-medium dark:text-textWhite h-[38px] min-w-[100px] disabled:!bg-btnDisabled disabled:cursor-not-allowed disabled:text-textBlack focus-visible:outline-none focus-visible:bg-cancelBtnHover px-2 ${className}`}
        onClick={openConfirmationModal}
      >
        {children}
      </button>
      { !skipConfirm && (
      <AppModal
        isOpen={showConfirmation}
        title={
          <h1 className="text-2xl text-titleColor font-semibold">
            Confirm Logout
          </h1>
        }
        footer={null}
        onClose={closeConfirmationModal}
        closeIcon={<AppModal.CloseIcon onClose={closeConfirmationModal} />}
      >
        <div
          className={`w-full h-fit mt-12`}
        >
          <h1 className="mt-0 text-lg font-medium text-subTextColor">
            Are you sure you want to log out? You will need to sign in again to
            access your account.
            <br />
          </h1>
        </div>
        <AppModal.Footer
          onCancel={closeConfirmationModal}
          onOk={logoutUser}
          okText="Confirm"
        />
      </AppModal>
      )}
    </>
  );
};
export default LogoutButton;