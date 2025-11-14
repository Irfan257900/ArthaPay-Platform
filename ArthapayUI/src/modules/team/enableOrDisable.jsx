import React, { useCallback, useState } from "react";
import { enableOrDisable } from "./httpServices";
import AppAlert from "../../core/shared/appAlert";
import CustomButton from "../../core/button/button";
import CommonDrawer from "../../core/shared/drawer";

const EnableOrDisable = ({
  isOpen,
  handleModalClose,
  selection = {},
  onSuccess,
  reducerState,
  setReducerState
}) => {
  const [state, setState] = useState({ loading: "", error: "" });

  const activateText = selection?.status === "Inactive" ? "Enable" : "Disable";
  const handleSuccess = () => {
    onSuccess()
    handleClose()
    setReducerState({ type: "setRefresh", payload: true });
  }
  const handleSave = useCallback(async (e) => {
    e.preventDefault();
    await enableOrDisable(setState, handleSuccess, { selection });
  }, [setState, handleSuccess, selection]);
  const handleClose = useCallback(() => {
    setState({ loading: "", error: "" });
    handleModalClose();
  }, []);
  const closeError = useCallback(() => {
    setState((prev) => ({ ...prev, error: '' }))
  }, [])
  return (
    <CommonDrawer
      destroyOnClose={true}
      title={`Confirm ${activateText}`}
      isOpen={isOpen}
      onClose={handleClose}
    >
      {state.error && (
        <AppAlert
          type={"error"}
          className="alert-flex"
          description={state.error}
          showIcon
          closable
          onClose={closeError}
        >
          <p>
            <span className="icon error-alert me-2"></span>
            {state.error}
          </p>
        </AppAlert>
      )}
      <p className="text-2xl font-semibold text-titleColor">
        Are you sure you want to {activateText?.toLowerCase()} your team member?
      </p>
      <div className="mt-4 w-full ">
        <CustomButton
          type="primary"
          className="w-full mb-3.5"
          onClick={handleSave}
          loading={state.loading === "save"}
        >
          Yes
        </CustomButton>
        <CustomButton
          type="cancel"
          className="w-full"
          onClick={handleModalClose}
        >
          No
        </CustomButton>
      </div>
    </CommonDrawer>
  );
};

export default EnableOrDisable;
