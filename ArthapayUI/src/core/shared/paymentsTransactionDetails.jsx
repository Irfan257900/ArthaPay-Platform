import React, { useCallback, useEffect, useState } from "react";
import moment from "moment/moment";
import PropTypes from 'prop-types';
import AppDefaults from "../../utils/app.config";
import AppAlert from "./appAlert";
import { successToaster } from "./toasters";
import CustomButton from "../button/button";
import AppNumber from "./inputs/appNumber";
import CopyComponent from "./copyComponent";
import { textStatusColors } from "../../utils/statusColors";
import SideDrawerLoader from '../../core/skeleton/drawer.loaders/sidedrawer.loader'
import { useTranslation } from "react-i18next";
import { paymentsTransactionDetails, downloadTransaction } from "../transactions/http.services";

const PaymentsTransactionDetails = ({ data, isCloseDrawer }) => {
  const [loader, setLoader] = useState(false);
  const [transaction, setTransaction] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [btnLoader, setBtnLoader] = useState(false);
  const useDivRef = React.useRef(null);
  const { t } = useTranslation();
  const navigateToDashboard = useCallback(() => {
    isCloseDrawer(false)
  },[])
  useEffect(() => {
    if (data.id) {
      getDetails();
    }
  }, [data])
  const getDetails = async () => {
    setLoader(true)
    try {
      const response = await paymentsTransactionDetails(data.id);
      setTransaction(response.data);
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoader(false)
    }

  }

  const handleDownloadSuccess=useCallback((response)=>{
    try{
      const link = document.createElement('a');
      link.href = response;
      link.target = '_blank';
      link.download = t('transactions.TransactionDetails.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      successToaster({ content: t("transactions.Downloaded successfully"), className: "custom-msg", duration: 4 })
    }catch(error){
      setErrorMessage(error.message)
    }
  },[])
  const handleDownload = useCallback(async () => {
      await downloadTransaction({
        setLoader:setBtnLoader,
        onSuccess:handleDownloadSuccess,
        onError:setErrorMessage,
        txId:data?.id,
        type:data?.type || data?.txType
      });
  },[data]);
  const handleScrollTop = () => { // NOSONAR
    useDivRef.current.scrollIntoView(0, 0);
  }
  return (<>
    <div>
      <div ref={useDivRef}></div>
      {errorMessage && (<div className="px-4">
        <div className="alert-flex" style={{ width: "100%" }}>
          <AppAlert
            className="w-100 "
            type="warning"
            description={errorMessage}
            showIcon
          />
          <button className="icon sm alert-close" onClick={() => setErrorMessage(null)}></button>
        </div>
      </div>)}</div>
    {loader ? <SideDrawerLoader /> : <div className="bg-screenBlackBg mx-auto p-4 transaction-details rounded-5">
      <div className=''>
        {transaction?.txDate && <div className="summary-list-item">
          <div className=" summary-label">{t("transactions.Transaction Date")}</div>
          <div className=" summary-text">{moment.utc(transaction?.txDate).local().format("DD/MM/YYYY hh:mm:ss A") || "--"}</div>
        </div>}

        {transaction?.txId && <div className="summary-list-item">
          <div className=" summary-label">{t("transactions.Transaction ID")}</div>
          <div className=" summary-text">{transaction?.txId || "--"}</div>
        </div>}

        <div className="summary-list-item">
          <div className=" summary-label">{t("transactions.Transaction Type")}</div>
          <div className=" summary-text">{transaction?.txType || "--"}</div>
        </div>
        <div className="summary-list-item">
          <div className=" summary-label">{t("transactions.Transaction Wallet")}</div>
          <div className=" summary-text">{transaction?.txWallet || "--"}</div>
        </div>
       {transaction?.txSource === "Payments" && <div className="summary-list-item">
          <div className=" summary-label">{t("transactions.Network")}</div>
          <div className=" summary-text">{transaction?.network || "--"}</div>
        </div>}
        {transaction?.txRef && <div className="summary-list-item">
          <div className="summary-label">{t("transactions.Hash")}</div>
          <button className="summary-text text-link cursor-pointer" onClick={() => window.open(transaction?.explorer + transaction?.txRef)}>
            <div className=" summary-text w-[200px] inline-block wordbreak hash-hyperlink">{<CopyComponent className="!text-primaryColor" text={transaction?.txRef || '--'} shouldTruncate={true} />}</div>
          </button>
        </div>}
        {transaction?.volume && <div className="summary-list-item">
          <div className=" summary-label">{transaction?.txType == "Deposit" && t("transactions.Deposit Amount") || t("transactions.Withdraw Amount")}</div>
          <div className="summary-text">{transaction?.volume || "--"}</div>
        </div>}
       <div className="summary-list-item">
          <div className=" summary-label">{t("transactions.Fee")}</div>
          <div className=" summary-text">{transaction?.fee || "0"}</div>
        </div>
        {
          <div className="summary-list-item">
            <div className=" summary-label">{t("transactions.Net Amount")}</div>
            <div className=" summary-text"><AppNumber
              className={"summary-text"}
              type="text"
              defaultValue={transaction?.amount || "--"}
              localCurrency={""}
              prefixText={''}
              suffixText={''}
              decimalScale={AppDefaults.fiatDecimals}
              fixedDecimalScale={AppDefaults.fiatDecimals}
              thousandSeparator={true}
              allowNegative={true}
            /></div>
          </div>
        }
        { transaction?.accNoOrCryptoAddress &&<div className="summary-list-item">
          <div className=" summary-label">{transaction?.txSubType=="Fiat"&&"Account Number"||transaction?.txSubType=="Crypto"&&"Receiver's Address"}</div>
          <div className=" summary-text">{transaction?.txSubType=="Crypto"&&<CopyComponent className="!text-primaryColor" text={transaction?.accNoOrCryptoAddress} shouldTruncate={true} />||transaction?.txSubType=="Fiat"&&transaction?.accNoOrCryptoAddress}</div>
        </div>}
        <div className="summary-list-item">
          <div className=" summary-label">{t("transactions.Status")}</div>
          <div className={`summary-text ${textStatusColors[transaction?.state?.toLowerCase()]}`}>{transaction?.state || "--"}</div>
        </div>
      </div>
    </div>}
    <div className="text-right mt-9">
      <CustomButton className="" onClick={navigateToDashboard} >
        {t("transactions.Cancel")}
      </CustomButton>
      {transaction?.state === "Approved" && <CustomButton type="primary" className="md:ml-3.5" onClick={handleDownload} loading={btnLoader}>
        {t("transactions.Download")}
      </CustomButton>
      }

    </div>
  </>
  )
}
PaymentsTransactionDetails.propTypes = {
  data: PropTypes.object.isRequired,
  isCloseDrawer: PropTypes.bool
};
export default PaymentsTransactionDetails