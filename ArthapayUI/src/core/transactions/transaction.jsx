import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import AppDefaults from "../../utils/app.config";
import CustomButton from "../button/button";
import AppAlert from "../shared/appAlert";
import AppNumber from "../shared/inputs/appNumber";
import { successToaster } from "../shared/toasters";
import CopyComponent from "../shared/copyComponent";
import { textStatusColors } from "../../utils/statusColors";
import SideDrawerLoader from "../skeleton/drawer.loaders/sidedrawer.loader";
import { useTranslation } from "react-i18next";
import { downloadTransaction, fetchTransactionDetails } from "./http.services";
import { decryptAES } from "../shared/encrypt.decrypt";
import moment from "moment";
import NumericText from "../shared/numericText";
const Transaction = ({ data, onClose }) => {
  const [state, setState] = useState({ loading: "", details: null, error: "" });
  const { t } = useTranslation();
  const navigateToDashboard = useCallback(() => {
    onClose(false);
  }, []);
  useEffect(() => {
    if (data?.id) {
      fetchTransactionDetails({
        setData: (data) => setState((prev) => ({ ...prev, details: data })),
        setLoader: (payload) =>
          setState((prev) => ({ ...prev, loading: payload ? "details" : "" })),
        setError: (error) => setState((prev) => ({ ...prev, error })),
        txId: data.id,
      });
    }
  }, [data]);

    const handleDownloadSuccess = useCallback(
    async (response) => {
      try {
        const fileResponse = await fetch(response);
        const blob = await fileResponse.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `${t("transactions.TransactionDetails")}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        successToaster({
          content: t("transactions.Downloaded successfully"),
          className: "custom-msg",
          duration: 4,
        });
      } catch (error) {
        setState((prev) => ({ ...prev, error: error.message }));
      }
    },
    [t, data?.id]);
  const handleDownload = useCallback(async () => {
    downloadTransaction({
      txId: data?.id,
      type: data?.type,
      setLoader: (payload) =>
        setState((prev) => ({ ...prev, loading: payload ? "download" : "" })),
      onSuccess: handleDownloadSuccess,
      onError: (error) => setState((prev) => ({ ...prev, error })),
    });
  }, [data?.id, data?.type, handleDownloadSuccess]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: "" }));
  }, []);

  const renderTransactionAmount = () => {
    const actionLower = state.details?.type?.toLowerCase() || '';
    let value = state.details?.volume;

    if (actionLower === "buy crypto" || actionLower === "sell crypto") {
      value = state.details?.amount;
      const amounts = (typeof value === 'string' && value) ? value.split("/") : [];
      //console.log('Amounts:', amounts); // Debug log
      if (amounts.length !== 2) {
        return "--";
      }

      let firstDecimalScale;
      let secondDecimalScale;

      if (actionLower === "buy crypto") {
        firstDecimalScale = AppDefaults.fiatDecimals; // Fiat
        secondDecimalScale = AppDefaults.cryptoDecimals; // Crypto
      } else { // sell crypto
        firstDecimalScale = AppDefaults.cryptoDecimals; // Crypto
        secondDecimalScale = AppDefaults.fiatDecimals; // Fiat
      }

      return (
        <div className="flex items-center">
          <NumericText
            className={"summary-text"}
            type="text"
            value={amounts[0]}
            localCurrency={""}
            prefixText={""}
            suffixText={""}
            decimalScale={firstDecimalScale}
            fixedDecimalScale={true}
            thousandSeparator={true}
            allowNegative={true}
          />
          <span> / </span>
          <NumericText
            className={"summary-text"}
            type="text"
            value={amounts[1]}
            localCurrency={""}
            prefixText={""}
            suffixText={""}
            decimalScale={secondDecimalScale}
            fixedDecimalScale={true}
            thousandSeparator={true}
            allowNegative={true}
          />
        </div>
      );
    } else {
      // Default rendering for other types like deposit/withdraw
      return (
        <NumericText
          className={"summary-text"}
          type="text"
          value={value || "--"}
          localCurrency={""}
          prefixText={""}
          suffixText={""}
          decimalScale={
            actionLower.includes("crypto") ? AppDefaults.cryptoDecimals : AppDefaults.fiatDecimals
          }
          thousandSeparator={true}
          allowNegative={true}
        />
      );
    }
  };

  const getTransactionLabel = () => {
    const actionLower = state.details?.type?.toLowerCase() || '';
    if (actionLower === "buy crypto" || actionLower === "sell crypto") {
      return "Transaction Amount";
    } else if (actionLower.includes("deposit") || actionLower.includes("payout") || actionLower.includes("payin")) {
      return t("transactions.Deposit Amount");
    } else {
      return t("transactions.Withdraw Amount");
    }
  };

  return (
    <>
      <div>
        {state.error && (
          <div className="alert-flex" style={{ width: "100%" }}>
            <AppAlert
              className="w-100 "
              type="error"
              description={state.error}
              showIcon
              closable={true}
              afterClose={clearError}
            />
          </div>
        )}
      </div>
      {state.loading === "details" ? (
        <SideDrawerLoader />
      ) : (
        <div className="dark:bg-screenBlackBg bg-menuhover mx-auto p-4  transactionsbreak-details rounded-5">
          <div className="">
            <div className="summary-list-item">
              <div className=" summary-label">
                {t("transactions.Transaction Date")}
              </div>
              <div className=" summary-text">
                {state.details?.date && moment.utc(state.details?.date).local().format("DD/MM/YYYY hh:mm:ss A") || '--'}
              </div>
            </div>
            <div className="summary-list-item">
              <div className=" summary-label">
                {t("transactions.Transaction ID")}
              </div>
              <div className=" summary-text">{state.details?.txId || "--"}</div>
            </div>
            <div className="summary-list-item">
              <div className=" summary-label">
                {t("transactions.Transaction Type")}
              </div>
              <div className=" summary-text">
                {state.details?.type || "--"}
              </div>
            </div>
            <div className="summary-list-item">
              <div className=" summary-label">
                {t("transactions.Transaction Wallet")}
              </div>
              <div className=" summary-text">
                {state.details?.wallet || "--"}
              </div>
            </div>
            {state.details?.cardName && (
              <div className="summary-list-item">
                <div className=" summary-label">
                  {t("transactions.Wallet Name")}
                </div>
                <div className=" summary-text">
                  {state.details?.cardName || "--"}
                </div>
              </div>
            )}
            {state.details?.vaultCardName && (
              <div className="summary-list-item">
                <div className=" summary-label">
                  {t("transactions.Vault Name")}
                </div>
                <div className=" summary-text">
                  {state.details?.vaultCardName || "--"}
                </div>
              </div>
            )}
            {state.details?.network && (
              <div className="summary-list-item">
                <div className=" summary-label">
                  {t("transactions.Network")}
                </div>
                <div className=" summary-text">
                  {state.details?.network || "--"}
                </div>
              </div>
            )}
            {state.details?.txRef && (
              <div className="summary-list-item">
                <div className=" summary-label">{t("transactions.Hash")}</div>
                <button
                  className="summary-text text-link cursor-pointer"
                  onClick={() =>
                    window.open(state.details?.explorer + state.details?.txRef)
                  }
                >
                  <div className=" summary-text w-[200px] inline-block wordbreak hash-hyperlink">
                    {
                      <CopyComponent
                        className="!text-primaryColor"
                        text={state.details?.txRef || "--"}
                        shouldTruncate={true}
                      />
                    }
                  </div>
                </button>
              </div>
            )}
            <div className="summary-list-item">
              <div className=" summary-label">
                {getTransactionLabel()}
              </div>
              <div className="summary-text">
                {renderTransactionAmount()}
              </div>
            </div>
            <div className="summary-list-item">
              <div className=" summary-label">{t("transactions.Fee")}</div>
              <div className=" summary-text">
                <NumericText
                  className={"summary-text"}
                  type="text"
                  value={state.details?.fee}
                  localCurrency={""}
                  prefixText={""}
                  suffixText={""}
                  decimalScale={
                    state.details?.type?.includes("Crypto")
                      ? AppDefaults.cryptoDecimals
                      : AppDefaults.fiatDecimals
                  }
                  fixedDecimalScale={AppDefaults.fiatDecimals}
                  thousandSeparator={true}
                  allowNegative={true}
                />
              </div>
            </div>
            {state.details?.amount && state.details?.type?.toLowerCase() !== 'buy crypto' && state.details?.type?.toLowerCase() !== 'sell crypto' && (
              <div className="summary-list-item">
                <div className=" summary-label">
                  {t("transactions.Net Amount")}
                </div>
                <div className=" summary-text">
                  <NumericText
                    className={"summary-text"}
                    type="text"
                    value={state.details?.amount || "--"}
                    localCurrency={""}
                    prefixText={""}
                    suffixText={""}
                    decimalScale={
                      state.details?.type?.includes("Crypto")
                        ? AppDefaults.cryptoDecimals
                        : AppDefaults.fiatDecimals
                    }
                    fixedDecimalScale={AppDefaults.fiatDecimals}
                    thousandSeparator={true}
                    allowNegative={true}
                  />
                </div>
              </div>
            )}
            {state.details?.accNoOrCryptoAddress && (
              <div className="summary-list-item">
                <div className=" summary-label">
                  {(state.details?.txSubType === "Fiat" && "Account Number") ||
                    (state.details?.txSubType === "Crypto" &&
                      "Receiver's Address")}
                </div>
                <div className=" summary-text w-[200px] inline-block wordbreak">
                  {(state.details?.txSubType === "Crypto" && (
                    <CopyComponent
                      className="!text-primaryColor"
                      text={state.details?.accNoOrCryptoAddress && decryptAES(state.details?.accNoOrCryptoAddress)}
                      shouldTruncate={true}
                    />
                  )) ||
                    (state.details?.txSubType === "Fiat" &&
                      state.details?.accNoOrCryptoAddress)}
                </div>
              </div>
            )}
            {(state.details?.state || state.details?.status) && (
              <div className="summary-list-item">
                <div className=" summary-label">{t("transactions.Status")}</div>
                <div
                  className={`summary-text ${textStatusColors[(state.details?.state?.toLowerCase() || state.details?.status?.toLowerCase())]
                    }`}
                >
                  {state.details?.state || state.details?.status || "--"}
                </div>
              </div>
            )}
            {state.details?.merchantName && (
              <div className="summary-list-item">
                <div className=" summary-label">
                  {t("transactions.MerchantName")}
                </div>
                <div className=" summary-text">
                  <div className="summary-text">
                    {state.details?.merchantName || "--"}
                  </div>
                </div>
              </div>
            )}
            {state.details?.remarks && (
              <div className="summary-list-item">
                <div className=" summary-label">
                  {t("transactions.Remarks")}
                </div>
                <div className=" summary-text">
                  <div className="summary-text">
                    {state.details?.remarks || "--"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="mt-9 text-right">
        <CustomButton
          className=""
          onClick={navigateToDashboard}
          disabled={state.loading === "download"}
        >
          {t("transactions.Cancel")}
        </CustomButton>
        {state.details?.status === "Approved" && (
          <CustomButton
            type="primary"
            className="md:ml-3.5"
            onClick={handleDownload}
            loading={state.loading === "download"}
            disabled={state.loading === "download"}
          >
            {t("transactions.Download")}
          </CustomButton>
        )}
      </div>
    </>
  );
};

Transaction.propTypes = {
  data: PropTypes.object,
  onClose: PropTypes.func,
};

export default Transaction;