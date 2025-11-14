import React from "react";
import { useParams } from "react-router";
import ActionWidgetLoader from "../../../core/skeleton/actionWidgets.loader";
import { useSelector } from "react-redux";
import AppEmpty from "../../../core/shared/appEmpty";
import ViewHeaderLoader from "../../../core/skeleton/view.header";
import RightboxTabs from "../../../core/skeleton/rightboxskel";
const RightPanelFallback = () => {
  const { actionType } = useParams();
  const { loader, data } = useSelector(
    (store) => store.vaultsAccordion?.vaults
  );

  return (
    <div className="layout-bg right-panel withdraw-rightpanel min-h-[85vh]">
      {loader && (
        <>
          <ViewHeaderLoader />
          {actionType !== "withdraw" && <RightboxTabs />}
          {actionType === "withdraw" && <ActionWidgetLoader />}
        </>
      )}
      {!loader && !data?.length<=0&& (
        <div className="nodata-content loader-position">
          <AppEmpty />
        </div>
      )}
    </div>
  );
};

export default RightPanelFallback;
