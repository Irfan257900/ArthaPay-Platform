import React, { useCallback, memo } from "react";
import AppAlert from "../../../core/shared/appAlert";
import CoinList from "../../../core/shared/coinList";
import CoinListLoader from "../../../core/skeleton/coinList.loader";
import { useDispatch, useSelector } from "react-redux";
import { clearErrorMessage, fetchFiatSummaryForAccCreation, setSelectedFiatWalletToPay } from "../../../reducers/banks.reducer";
import ActionController from "../../../core/onboarding/action.controller";
import { useNavigate, useParams } from "react-router";
const fields = {
  currencyCode: "code",
  amount: "amount",
  percentage: "percentage",
  currencyFullName: "name",
  coinName: "name",
};
const FiatSelection = () => {
  const dispatch = useDispatch();
  const { loading, data, error } = useSelector(
    (store) => store.banks.fiatWalletsForAccCreation
  );
const { productId,type } =useParams();
  const { loading:saving, error:summaryError } = useSelector(
    (store) => store.banks.summaryForAccountCreation
  );
  const selectedWalletToPay = useSelector(
    (store) => store.banks.selectedFiatWalletToPay
  );
  const navigate=useNavigate();
  const onSelection = useCallback((wallet) => {
    dispatch(setSelectedFiatWalletToPay(wallet));
  }, []);
  const onSubmit = useCallback(async () => {
  try {
    await dispatch(fetchFiatSummaryForAccCreation(productId)).unwrap();
    navigate(`/banks/account/create/${productId}/${type}/pay/fait/summary`);
  } catch (error) {
    dispatch(clearErrorMessage(['something went wrong']));
  }
}, [dispatch, navigate, productId, type]);

   const clearError=useCallback(()=>{
      error && dispatch(clearErrorMessage(['fiatWalletsForAccCreation']))
      summaryError && dispatch(clearErrorMessage(['summaryForAccountCreation']))
    },[error,summaryError])
  return (
    <>
      {loading && <CoinListLoader />}
      {error || summaryError && (
        <div className="alert-flex withdraw-alert fiat-alert">
          <AppAlert type={"error"} description={error || summaryError} showIcon closable onClose={clearError} />
        </div>
      )}
      {!loading && data?.assets && (
        <>
        <div className="md:w-[565px] w-full mx-auto">
          <CoinList
            className="coin-itemslist-scroll"
            coinSearch={true}
            isCrypto={false}
            coinList={data.assets || []}
            coinFields={fields}
            cryptoCoin={selectedWalletToPay?.code}
            selectCoin={onSelection}
            type="fiat"
          />
          
          {selectedWalletToPay && <div className="text-center mb-9 mt-5">
            <ActionController
              redirectTo="/banks/deposit"
              actionFrom="Bank Account Creation"
              handlerType="button"
              onAction={onSubmit}
              buttonType="primary"
              buttonClass={"!w-full"}
              loading={saving}
              disabled={saving || !selectedWalletToPay}
            >
              Continue
            </ActionController>
          </div>}
          </div>
        </>
      )}
    </>
  );
};

export default memo(FiatSelection);
