import React, { useCallback, useEffect, useState } from "react";
import moment from "moment/moment";
import PropTypes from "prop-types";
import AppAlert from "../../../core/shared/appAlert";
import CustomButton from "../../../core/button/button";
import { downloadTransaction, getTransactionDetails } from "../httpServices";
import { textStatusColors } from "../../../utils/statusColors";
import TransactionLoader from "../../../core/skeleton/drawer.loaders/transaction.loader";

const TransactionDetails = ({ data, onCancel }) => {
  const [state, setState] = useState({
    loading: "data",
    details: null,
    errorMessage: "",
  });
  useEffect(() => {
    if (data.transactionId) {
      getTransactionDetails(setState, { id: data.id });
    }
  }, [data]);
  const handleDownload = useCallback(() => {
    downloadTransaction(setState, {
      id: data?.id,
      type: data?.transactionType,
    });
  },[])
  const closeError = useCallback(() => {
    setState((prev) => ({ ...prev, errorMessage: "" }))
    }, [])
  return (
    <>
      <div>
        {state.errorMessage && (
          <div className="alert-flex">
            <AppAlert
              type="error"
              description={state.errorMessage}
              showIcon
              closable
              afterClose={closeError}
            />
          </div>
        )}
      </div>
      {state.loading === "data" ? (
        <TransactionLoader />
      ) : (
        <div className="bg-screenBlackBg mx-auto p-4 transaction-details rounded-5">
          <div className="">
            {state.details?.transactionId && (
              <div className="summary-list-item">
                <div className=" summary-label">Transaction ID</div>
                <div className=" summary-text">
                  {state.details?.transactionId || "--"}
                </div>
              </div>
            )}
            {state.details?.vaultOrCardName && (
              <div className="summary-list-item">
                <div className=" summary-label">Card/Vault Name</div>
                <div className=" summary-text">
                  {state.details?.vaultOrCardName || "--"}
                </div>
              </div>
            )}
            {state.details?.transactionDate && (
              <div className="summary-list-item">
                <div className=" summary-label">Transaction Date</div>
                <div className=" summary-text">
                  {moment
                    .utc(state.details?.transactionDate)
                    .local()
                    .format("DD/MM/YYYY hh:mm:ss A") || "--"}
                </div>
              </div>
            )}
            {state.details?.cardName && (
              <div className="summary-list-item">
                <div className=" summary-label">Card Name</div>
                <div className=" summary-text">
                  {state.details?.cardName || "--"}
                </div>
              </div>
            )}
            {state.details?.vaultName && (
              <div className="summary-list-item">
                <div className=" summary-label">Vault Name</div>
                <div className=" summary-text">
                  {state.details?.vaultName || "--"}
                </div>
              </div>
            )}
            {state.details?.transactionType && (
              <div className="summary-list-item">
                <div className=" summary-label">Transaction Type</div>
                <div className=" summary-text">
                  {state.details?.transactionType || "--"}
                </div>
              </div>
            )}
            {state.details?.amount && (
              <div className="summary-list-item">
                <div className=" summary-label">Amount</div>
                <div className=" summary-text">
                  {state.details?.amount || "--"}
                </div>
              </div>
            )}
             {state.details?.currency && (
              <div className="summary-list-item">
                <div className=" summary-label">Currency</div>
                <div className=" summary-text">
                  {state.details?.currency || "--"}
                </div>
              </div>
            )}
            {state.details?.wallet && (
              <div className="summary-list-item">
                <div className=" summary-label">Wallet</div>
                <div className=" summary-text">
                  {state.details?.wallet || "--"}
                </div>
              </div>
            )}
            {state.details?.network && (
              <div className="summary-list-item">
                <div className=" summary-label">Network</div>
                <div className=" summary-text">
                  {state.details?.network || "--"}
                </div>
              </div>
            )}
            {state.details?.type && (
              <div className="summary-list-item">
                <div className=" summary-label"> Action</div>
                <div className=" summary-text">
                  {state.details?.type || "--"}
                </div>
              </div>
            )}
            {state.details?.accNoOrCryptoAddress && (
              <div className="summary-list-item">
                <div className=" summary-label">Card Number/Address</div>
                <div className=" summary-text">
                  {state.details?.accNoOrCryptoAddress || "--"}
                </div>
              </div>
            )}
            {state.details?.state && (
              <div className="summary-list-item">
                <div className=" summary-label">Status</div>
                <div className={`summary-text ${textStatusColors[state.details?.state || "Approved"]}`}>
                  {state.details?.state || "--"}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="mt-9 text-right ">
        <CustomButton className="" onClick={onCancel}>
          Cancel
        </CustomButton>
        {state.details?.state === "Approved" && (
          <CustomButton
            type="primary"
            className="md:ml-3.5"
            onClick={handleDownload}
            loading={state.loading === "download"}
          >
            Download
          </CustomButton>
        )}
      </div>
    </>
  );
};
TransactionDetails.propTypes = {
  data: PropTypes.object,
  onCancel: PropTypes.func,
};
export default TransactionDetails;
