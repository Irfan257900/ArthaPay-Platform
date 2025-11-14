import React, { useCallback, useEffect, useState } from "react";
import SummaryDetails from "../../../core/shared/summary.buysell.jsx";
import { useDispatch, useSelector } from "react-redux";
import AppTitle from "../../../core/shared/appTitle";
import AppParagraph from "../../../core/shared/appParagraph";
import AppAlert from "../../../core/shared/appAlert";
import { handleSellCrypto } from "../http.services";
import { fetchCryptoCoins, setSaveResponse } from "./store.reducer";
import CustomButton from "../../../core/button/button";
import SuccessComponentLoader from "../../../core/skeleton/common.page.loader/success.component.loader.jsx";
const note =
  "The output is an estimate and may vary due to market fluctuations and other factors.";
const Summary = ({
  onSuccess,
  onError,
  onClose,
  classNames = {},
  isCrypto,
}) => {
  const sellDivRef = React.useRef(null);
  const [state, setState] = useState({
    loading: "",
    errorMessage: "",
  });
  const dispatch = useDispatch();
  const userProfile = useSelector((store) => store.userConfig.details);
  const trackAuditLogData = useSelector(
    (store) => store.userConfig.trackAuditLogData
  );
  const summaryDetails = useSelector((state) => state.sellState.summaryDetails);
  const { loader } = useSelector((state) => state.sellState.cryptoCoins);
  const summaryClose = useCallback(() => {
    onClose?.();
  }, []);
  useEffect(() => {
    if (!summaryDetails) {
      summaryClose();
    }
  }, [summaryDetails]);
  const handleSubmit = useCallback(() => {
    handleSellCrypto(
      setState,
      (response) => {
        dispatch(setSaveResponse(response));
        dispatch(
          fetchCryptoCoins({ userId: userProfile?.id, step: "success" })
        );
        onSuccess?.();
      },
      onError,
      { summaryDetails, trackAuditLogData, userProfile }
    );
  }, [summaryDetails, userProfile, trackAuditLogData]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, errorMessage: "" }));
  }, []);
  return (
    <>
      {loader === "success" && <SuccessComponentLoader />}
      <div ref={sellDivRef}></div>
      {state.errorMessage && (
        <div className="alert-flex withdraw-alert fiat-alert m-3">
          <AppAlert
            type="error"
            description={state.errorMessage}
            showIcon
            closable
            afterClose={clearError}
          />
        </div>
      )}
      {loader !== "success" && (
        <>
          <div className={classNames.root || "summary md:w-[465px] w-full mx-auto mt-6"}>
            <AppTitle level={2} className="sm-card-title text-center">
              Summary
            </AppTitle>
            <SummaryDetails
              details={summaryDetails}
              flag={isCrypto}
              action="Sell"
            />
            <CustomButton
              block
              type="primary"
              style={{ margin: "auto" }}
              loading={state.loading === "save"}
              disabed={state.loading === "save"}
              onClick={handleSubmit}
            >
              <span>Confirm {summaryDetails?.fromAsset}</span>
            </CustomButton>
          </div>
          {note && (
            <AppParagraph className="note-text">
              <AppTitle
                level={5}
                className="note-heading !text-lightWhite font-medium mt-4"
              >
                Note :&nbsp;
                <span className="text-labelGrey text-sm font-normal">
                  {note}
                </span>
              </AppTitle>
            </AppParagraph>
          )}
        </>
      )}
    </>
  );
};

export default Summary;
