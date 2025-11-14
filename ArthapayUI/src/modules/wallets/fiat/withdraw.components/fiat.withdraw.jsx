import React, { useCallback, useEffect, useState } from "react";
import { Typography } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import AppAlert from "../../../../core/shared/appAlert";
import { getVerificationFields } from "../../../../core/verification.component/http.services";
import WithdrawFaitWidget from "../../../../core/shared/withdrawFiat.widget";
import {
  fetchVaultsdetails,
  setPayeeFiat,
  setSelectedCoin,
  setWithdrawFiatSaveObj,
  setWithdrawObject,
} from "./withdrawFiatReducer";
import AppEmpty from "../../../../core/shared/appEmpty";
import { saveFiatWithdrawl } from "./httpServices";
import VerificationsHandler from "../../../../core/verifications.handler";
import CriptoFiatLoader from "../../../../core/skeleton/cripto.fiat.loader";
function WithdrawFiat() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { Text } = Typography;
  const [loading, setLoading] = useState(null);
  const [verificationLoader, setVerificationLoader] = useState(false);
  const [isVerification, setIsVerification] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const userInfo = useSelector((storeInfo) => storeInfo?.userConfig?.details);
  const currency = useSelector((state) => state.withdrawFiat?.fiatCoins);
  const selectedCoin = useSelector(
    (storeInfo) => storeInfo?.withdrawFiat?.selectedCoin
  );

  const PayeeId= useSelector((state) => state.withdrawFiat?.selectedPayee);
  const _witdrawDetails = useSelector(
    (store) => store?.withdrawFiat?.withdrawObj
  );
  const [btnLoader, setBtnLoader] = useState(false);
  useEffect(() => {
    if (selectedCoin && !_witdrawDetails) {
      dispatch(setWithdrawObject(null));
      dispatch(setPayeeFiat(null));
      dispatch(setWithdrawFiatSaveObj(null));
    }
    setErrorMsg(null);
    setLoading(false);
  }, [userInfo?.id, _witdrawDetails, selectedCoin]);

  const { actionType } = useParams();
  const vaultsdetails = useSelector(
    (state) => state.withdrawFiat?.faitvaluts?.data
  );
  // useEffect(() => {
  //   getVerification();
  // }, []);

  useEffect(() => {
    if (actionType === "withdraw") {
      dispatch(fetchVaultsdetails(true, selectedCoin?.id));
    }
  }, [selectedCoin]);

  const getVerification = async () => {
    try {
      setVerificationLoader(true);
      let response = await getVerificationFields();
      if (response?.data) {
        const allFalseOrNull = Object.entries(response?.data).every(
          ([, value]) => value === false || value === null
        );
        setIsVerification(!allFalseOrNull);
      } else {
        setErrorMsg(
          "Without Verifications you can't withdraw.Please select withdraw verifications from security section"
        );
      }
    } catch (error) {
      setErrorMsg(error?.errorMsg);
    } finally {
      setVerificationLoader(false);
    }
  };

  


  const handleFormSubmission = useCallback(
    async (values) => {
    setBtnLoader(true);
      try {
        let saveObj = {
          ...values,
        };
        dispatch(setWithdrawObject(saveObj));
        let savedobj = {
          payeeId: PayeeId?.id,
          fiatWalletId: selectedCoin?.id,
          amount: values?.amount,
        }
        dispatch(setWithdrawFiatSaveObj(savedobj));
        let response = await saveFiatWithdrawl(savedobj);
         if (response?.respone) {
            dispatch(setWithdrawFiatSaveObj(response?.respone));
          navigate(`/wallets/fiat/withdraw/${selectedCoin?.code}/${selectedCoin?.id}/summary`);
         } else if (response?.error) {
            setErrorMsg(response?.error);
        }
      } catch (error) {
        setBtnLoader(false);
        setErrorMsg(error.message);
      }
    },
    [dispatch, navigate, selectedCoin, userInfo, _witdrawDetails, PayeeId,]
  );
  const handleCurrency = useCallback(
    (selectedCoin) => {
      setErrorMsg(null);
      setLoading(true);
      dispatch(setSelectedCoin(selectedCoin));
      navigate(`/wallets/fiat/withdraw/${selectedCoin?.code}`);
    },
    [dispatch, navigate]
  );
  const closeErrorMsg = useCallback(() => {
    setErrorMsg(null);
  });
  return (
    <>
      {" "}
      {currency?.data?.length !== 0 ? (
        <div className="">
          {errorMsg !== undefined && errorMsg !== null && (
            <div className="alert-flex withdraw-alert fiat-alert">
              <AppAlert type="error" description={errorMsg} showIcon />
              <button
                className="icon sm alert-close"
                onClick={() => setErrorMsg(null)}
              ></button>
            </div>
          )}
          <VerificationsHandler loader={<CriptoFiatLoader />}>
            <div className="">
              <WithdrawFaitWidget
                coins={currency?.data}
                loadingNetworks={loading}
                onCurrencyChange={handleCurrency}
                onSubmit={handleFormSubmission}
                defaultCoin={selectedCoin?.code}
                selectedCoin={vaultsdetails}
                defaultFormValues={_witdrawDetails}
                btnLoader={btnLoader}
                shouldDisplayPayees={true}
              />
            </div>
            </VerificationsHandler>
        </div>
      ) : (
        <AppEmpty />
      )}
    </>
  );
}
export default WithdrawFiat;
