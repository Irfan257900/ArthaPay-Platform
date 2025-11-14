import React, { useCallback, useState } from "react";
import AppModal from "../shared/appModal";
import CustomButton from "../button/button";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserDetails } from "../../reducers/userconfig.reducer";
import AppAlert from "../shared/appAlert";
import { closeAccount } from "./http.services";
const CloseAccount = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const userProfile = useSelector((store) => store.userConfig.details);
  const userProfileLoading = useSelector(
    (store) => store.userConfig.userProfileLoading
  );
  const dispatch = useDispatch();
  const openConfirmationModal = useCallback(() => {
    setShowConfirmation(true);
  }, []);
  const closeConfirmationModal = useCallback(() => {
    setShowConfirmation(false);
  }, []);
  const onAccountClosure = useCallback(() => {
    dispatch(fetchUserDetails());
    setLoading("");
  }, []);
  const handleCloseAccount = useCallback(() => {
    setLoading("save");
    closeAccount(
      onAccountClosure,
      (error) => {
        setError(error);
        setLoading("");
      },
      { userProfile }
    );
  }, [userProfile]);
  const clearError = useCallback(() => {
    setError("");
  }, []);
  return (
    <>
      <CustomButton
        type="danger"
        className={'h-[32px] px-3 hover:!text-lightWhite'}
        onClick={openConfirmationModal}
      >
        Close Account
      </CustomButton>
      <AppModal
        isOpen={showConfirmation}
        title={
          <h1 className="text-2xl text-titleColor font-semibold">
            Confirm Account Closure
          </h1>
        }
        footer={null}
        onClose={closeConfirmationModal}
        closeIcon={<AppModal.CloseIcon onClose={closeConfirmationModal} />}
      >
        {error && (
          <div className="alert-flex withdraw-alert fiat-alert">
            <AppAlert
              type="error"
              description={error}
              showIcon
              closable
              afterClose={clearError}
            />
          </div>
        )}
        <div className={`w-full h-fit mt-12`}>
          <h1 className="mt-0 text-lg font-medium text-subTextColor">
          Are you sure you want to close your account?
            <br />
          </h1>
          <p className="text-descriptionGreyTwo mt-4">Please note that we will retain your data for financial records. If any assistance, contact the admin.</p>
        </div>
        <AppModal.Footer
          onCancel={closeConfirmationModal}
          cancelDisabled={loading !== "" || userProfileLoading}
          okDisabled={loading !== "" || userProfileLoading}
          loading={loading !== "" || userProfileLoading}
          onOk={handleCloseAccount}
          okText="Ok"
        />
      </AppModal>
    </>
  );
};

export default CloseAccount;
