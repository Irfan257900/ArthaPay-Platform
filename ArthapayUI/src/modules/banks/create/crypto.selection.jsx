import React, { useCallback, useEffect } from "react";
import AppAlert from "../../../core/shared/appAlert";
import { useDispatch, useSelector } from "react-redux";
import {
  clearErrorMessage,
  fetchCryptoSummaryForAccCreation,
  setSelectedCryptoCoinToPay,
  setSelectedCryptoNetworkToPay,
  setSelectedCryptoWalletToPay,
} from "../../../reducers/banks.reducer";
import { WithdrawWidgetLoader } from "../../../core/skeleton/withdraw.loader";
import WithdrawWidget from "../../../core/shared/withdraw.widget";
import { useNavigate, useParams } from "react-router";
import { use } from "react";
const CryptoSelection = ({ screen }) => {
  const dispatch = useDispatch();
  const {
    loading,
    data: vaults,
    error,
  } = useSelector((store) => store.banks.cryptoWalletsForAccCreation);
  const { loading: saving, error: summaryError } = useSelector(
    (store) => store.banks.summaryForAccountCreation
  );
  const { productId, type } = useParams();
  const navigate = useNavigate();
  const coins = useSelector((store) => store.banks.selectedCryptoWalletCoins);
  const {
    loading: networksLoader,
    data: networks,
    error: networkError,
  } = useSelector((store) => store.banks.selectedCryptoCoinNetworks);
  const selectedNetworkToPay = useSelector(
    (store) => store.banks.selectedCryptoNetworkToPay
  );
  const selectedCoinToPay = useSelector(
    (store) => store.banks.selectedCryptoCoinToPay
  );
  const selectedVaultToPay = useSelector(
    (store) => store.banks.selectedCryptoWalletToPay
  );
  useEffect(() => {
    if (!loading && vaults && vaults.length > 0 && !selectedVaultToPay) {
      dispatch(setSelectedCryptoWalletToPay(vaults[0]));
    }
  }, [loading, vaults, selectedVaultToPay, dispatch]);
  const onVaultChange = useCallback((vault) => {
    dispatch(setSelectedCryptoWalletToPay(vault));
  }, []);
  const onCoinChange = useCallback((coin) => {
    dispatch(setSelectedCryptoCoinToPay(coin));
  }, []);
  const onNetworkChange = useCallback((network) => {
    dispatch(setSelectedCryptoNetworkToPay(network));
  }, []);

  const onSubmit = useCallback(async () => {
    try {
      await dispatch(fetchCryptoSummaryForAccCreation(productId)).unwrap();
      navigate(`/banks/account/create/${productId}/${type}/pay/crypto/summary`);
    } catch (error) {
      dispatch(clearErrorMessage(["something went wrong"]));
    }
  }, [dispatch, navigate, productId, type]);



  const clearError = useCallback(() => {
    error && dispatch(clearErrorMessage(["cryptoWalletsForAccCreation"]));
    summaryError && dispatch(clearErrorMessage(["summaryForAccountCreation"]));
    networkError && dispatch(clearErrorMessage(["selectedCryptoCoinNetworks"]));
  }, [error, summaryError, networkError]);
  return (
    <>
      {loading && <WithdrawWidgetLoader />}
      {(error || networkError || summaryError) && (
        <div className="alert-flex withdraw-alert fiat-alert">
          <AppAlert
            type={"error"}
            description={error || networkError || summaryError}
            showIcon
            closable
            onClose={clearError}
          />
        </div>
      )}
      {!loading && (
        <div className="md:w-[565px] w-full mx-auto">
          <WithdrawWidget
            widgetClass="w-full mt-8"
            hasMinMax={false}
            amount={0}
            isAmountDisabled={true}
            vaults={vaults}
            vaultLabels={{ label: 'name', value: 'id' }}
            networkLabels={{ label: 'name', value: 'id' }}
            showVaults={vaults && vaults?.length > 1} 
            onVaultChange={onVaultChange}
            onCurrencyChange={onCoinChange}
            coins={coins}
            loadingNetworks={networksLoader}
            networks={networks}
            saving={saving}
            onSubmit={onSubmit}
            onNetworkChange={onNetworkChange}
            selectedNetwork={selectedNetworkToPay}
            showAvailableBalance={true}
            defaultCoin={selectedCoinToPay?.code}
            defaultVault={selectedVaultToPay?.id}
            defaultNetwork={selectedNetworkToPay?.id}
            canAllowZero={true}
            showAmountField={false}
            screen={screen}

            actionControlProps={{
              actionFrom: "Bank Account Creation",
              redirectTo: "/banks/deposit",
            }}
          />
        </div>
      )}
    </>
  );
};

export default CryptoSelection;
