import React from "react";
import { useSelector } from "react-redux";
import { Tooltip } from "antd";
import ActionController from "../../core/onboarding/action.controller";

const VaultsActions = ({ screen, vaults, handleAddClick }) => {
  const permissions = useSelector(
    (state) => state.userConfig?.permissions?.permissions?.tabs || []
  );
  const currentTabPermission = permissions.find((tab) => tab?.name === screen);
  const canAdd =
    currentTabPermission?.actions?.some(
      (action) => action?.name === "Add" && action?.isEnabled
    ) || false;
  return (
    <>
      {canAdd && !vaults?.loader && !vaults?.error && (
        <ActionController
          handlerType="button"
          onAction={handleAddClick}
          actionFrom="wallets"
          redirectTo={`/wallets/${screen}`}
          buttonType="normal"
          buttonClass="secondary-outline"
        >
          <Tooltip placement="top" title="Add Wallet">
            <button type="button">
              Add <span className="icon btn-add shrink-0 ml-2"></span>
            </button>
          </Tooltip>
        </ActionController>
      )}
    </>
  );
};

export default VaultsActions;
