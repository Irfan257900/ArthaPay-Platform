import { Button } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { connect } from "react-redux";
import moment from "moment/moment";
import AppAlert from "../../../core/shared/appAlert";
import CopyComponent from "../../../core/shared/copyComponent";
import { useParams } from "react-router";
import { fetchTranscationDetails, transactionDetailsDwd } from "../httpServices";
import darknoData from '../../../assets/images/dark-no-data.svg';
import lightnoData from '../../../assets/images/light-no-data.svg';
import { successToaster } from "../../../core/shared/toasters";
import { toasterMessages } from "./payout.constants";
import { PayoutDetailsLoaders } from "../../../core/skeleton/cripto.fiat.loader";
import { statusColorsPayout } from "../../../utils/statusColors";

const PayoutTransactionDetails = () => {
  const { id, transactionType } = useParams();
  const [loader, setLoader] = useState(false);
  const [transaction, setTransaction] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [btnLoader, setBtnLoader] = useState(false);

  const transactionDate = useMemo(() => {
    return transaction?.txDate ? moment.utc(transaction.txDate).local().format("DD/MM/YYYY hh:mm:ss A") : transaction?.txDate;
  }, [transaction]);

  const getDetails = useCallback(async () => {
    const urlParams = {
      id: id,
    };
    await fetchTranscationDetails(setTransaction, setErrorMessage, setLoader, urlParams);
  }, [id]);

  useEffect(() => {
    if (id !== 'undefined' && id !== 'null') {
      getDetails();
    }
  }, [id, getDetails]);

  useEffect(() => {
    errorMessage && window.scrollTo(0, 0);
  }, [errorMessage]);


  const renderTxRef = (transactionData) => {
    const txRef = transactionData?.txRef;
    if (txRef) {
      return (
        <CopyComponent text={txRef} />
      );
    } else {
      return <div className="text-sm font-medium">--</div>;
    }
  };

  const setGetdownloadTransaction = (response) => {
    setBtnLoader(false);
    const link = document.createElement('a');
    link.href = response;
    link.download = 'TransactionDetails.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    successToaster({ content: toasterMessages.download });
  };

  const downloadTransaction = useCallback(async () => {
    const urlParams = {
      id: id,
      type: transactionType
    };
    await transactionDetailsDwd(setBtnLoader, setGetdownloadTransaction, setErrorMessage, urlParams);
  }, [id, transactionType]);

  return (
    <>
      {errorMessage && (
        <div className="alert-flex">
          <AppAlert
            className="w-100 "
            type="warning"
            description={errorMessage}
            showIcon
          />
          <span
            className="icon sm alert-close"
            onClick={() => setErrorMessage(null)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setErrorMessage(null);
              }
            }}
            role="button"
            tabIndex={0}
          ></span>
        </div>
      )}
      {!transaction && !loader && (
        <div className="nodata-content loader-position">
          <div className="no-data">
            <img src={darknoData} width="100px" alt="" className="dark:block hidden" />
            <img src={lightnoData} width="100px" alt="" className="dark:hidden block" />
            <p className="mb-0 mt-2 text-lightWhite text-sm">No Data Found</p>
          </div>
        </div>
      )}

      {loader && <PayoutDetailsLoaders />}
      {!loader && transaction && (
        <div className='mt-3 md:w-[465px] w-full p-3 mx-auto'>
          <h1 className="text-2xl font-semibold text-titleColor text-center mb-7">Transaction Details</h1>
          <div className="mt-3">
            <div className="flex justify-between items-center border-b border-StrokeColor pb-4">
              <div className="text-sm font-normal text-paraColor">Transaction Date</div>
              <div className="text-sm font-medium text-subTextColor">{transactionDate}</div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center border-b border-StrokeColor py-4">
              <div className="text-sm font-normal text-paraColor">Transaction Type</div>
              <div className="text-sm font-medium text-subTextColor">{transaction?.txType} - {transaction?.txSubType}</div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center border-b border-StrokeColor py-4">
              <div className="text-sm font-normal text-paraColor">Transaction Wallet</div>
              <div className="text-sm font-medium text-subTextColor">{transaction?.txWallet}</div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center border-b border-StrokeColor py-4">
              <div className="text-sm font-normal text-paraColor">Network</div>
              <div className="text-sm font-medium text-subTextColor">{transaction?.network}</div>
            </div>
          </div>
          {transaction?.txSubType !== "Fiat" && <div>
            <div className="flex justify-between items-center border-b border-StrokeColor py-4">
              <div className="text-sm font-normal text-paraColor">Hash</div>
              {renderTxRef(transaction)}
            </div>
          </div>}
          {transaction?.txType !== "Withdraw" && <div>
            <div className="flex justify-between items-center border-b border-StrokeColor py-4">
              <div className="text-sm font-normal text-paraColor">Deposit Amount</div>
              <div className="text-sm font-medium text-subTextColor">{parseFloat(transaction?.volume).toLocaleString(undefined, { maximumFractionDigits: 20 }) || "--"} {transaction?.txWallet}</div>
            </div>
          </div>}
          {transaction?.txType === "Withdraw" && <div>
            <div className="flex justify-between items-center border-b border-StrokeColor py-4">
              <div className="text-sm font-normal text-paraColor">Withdraw Amount</div>
              <div className="text-sm font-medium text-subTextColor">{parseFloat(transaction?.volume).toLocaleString(undefined, { maximumFractionDigits: 20 }) || "--"} {transaction?.txWallet}</div>
            </div>
          </div>}
          {
            transaction?.fee && <div>
              <div className="flex justify-between items-center border-b border-StrokeColor py-4">
                <div className="text-sm font-normal text-paraColor">Fee</div>
                <div className="text-sm font-medium text-subTextColor">{parseFloat(transaction?.fee).toLocaleString(undefined, { maximumFractionDigits: 20 }) || "--"} {transaction?.txWallet}</div>
              </div>
            </div>
          }
          <div>
            <div className="flex justify-between items-center border-b border-StrokeColor py-4">
              <div className="text-sm font-normal text-paraColor">{transaction?.txSubType === "Crypto" ? "Net Amount" : "Received Fiat"}</div>
              <div className="text-sm font-medium text-subTextColor">{transaction?.amount} {transaction?.walletCode}</div>
            </div>
          </div>

          {transaction?.txType !== "Withdraw" && <div>
            <div className="flex justify-between items-center border-b border-StrokeColor py-4">
              <div className="text-sm font-normal text-paraColor">Sender&apos;s Name</div>
              <div className="text-sm font-medium text-subTextColor">{transaction?.senderName}</div>
            </div>
          </div>}

          <div>
            <div className="flex justify-between items-center pt-4">
              <div className="text-sm font-normal text-paraColor">Status</div>
              <div className={`text-sm font-medium ${statusColorsPayout[transaction?.state]}`}>{transaction?.state}</div>
            </div>
          </div>
          <div className="mt-7 text-end">
            {transaction?.state === "Approved" && <Button className="rounded-5 border-0 bg-primaryColor hover:!bg-buttonActiveBg h-[38px] dark:hover:!bg-buttonActiveBg text-sm font-medium !text-lightDark md:min-w-[100px] disabled:!bg-btnDisabled disabled:cursor-not-allowed disabled:text-lightDark" onClick={downloadTransaction} loading={btnLoader}>
              Download
            </Button>
            }
          </div>
        </div>
      )}
    </>
  );
};
const connectStateToProps = ({ userConfig }) => {
  return {
    userConfig: userConfig.details
  };
};
export default connect(connectStateToProps)(PayoutTransactionDetails);