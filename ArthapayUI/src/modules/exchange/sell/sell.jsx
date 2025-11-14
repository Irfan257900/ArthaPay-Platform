import React, { memo, useCallback, useEffect, useReducer } from "react";
import AppAlert from "../../../core/shared/appAlert";
import { amountValidation, SELL_VALIDATION_MESSAGES } from "./validation";
import { replaceCommas } from "../../../core/shared/validations";
import { sellCoinReducer, sellCoinState } from "./reducers";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAssetDetails,
  fetchAssetsAndBalances,
  resetState,
  setSelectedFiatCoin,
  setSummaryDetails,
} from "./store.reducer";
import {
  debouncedCryptoFiatConverter,
  fetchSellSummary,
} from "../http.services";
import BuySellWidget from "../widget";
import { BuySellViewLoader } from "../../../core/skeleton/buysell";
const resetKeys=["assetDetails", "widgetAssets", "selectedFiatCoin"]
function Sell({
  onSuccess,
  onError,
  classNames,
  onCryptoChange,
  defaultCryptoCode,
  fetchAssetDetailsOnChange = true,
  shouldRefresh = false,
  setFirstAsDefault = false,
}) {
  const [state, setState] = useReducer(sellCoinReducer, sellCoinState);
  const dispatch = useDispatch();

  const {
    loading: fetchingAssets,
    error: assetsError,
    data: assets,
  } = useSelector((state) => state.sellState.widgetAssets);

  const {
    loading: fetchingAssetDetails,
    data: assetDetails,
    error: assetError,
  } = useSelector((state) => state.sellState.assetDetails);

  const selectedFiatCoin = useSelector(
    (state) => state.sellState.selectedFiatCoin
  );

  const setError = (message = "", type = "error") => {
    setState({ type: "setError", payload: { message, type } });
  };

  const clearError = useCallback(() => {
    setError();
    dispatch(
      setErrorMessages([
        { key: "widgetAssets", message: "" },
        { key: "assetDetails", message: "" },
      ])
    );
  }, []);

  const getAmount = (value, amount) => {
    if (!value || value === "0") return 0;
    if (!amount || amount === "0" || amount === null) return 0;
    return amount;
  };
  const setAmountsAfterConversion = (value, response, error, isCrypto) => {
    if (error) {
      setError(error);
      setState({ type: "setLoading", payload: "" });
      return;
    }

    const amt = getAmount(value, response?.toAssetValue ?? 0);
    setState({
      type: isCrypto ? "setFiatAmount" : "setCryptoAmount",
      payload: amt,
    });
    setState({ type: "setIsSaving", payload: !isCrypto });
    setState({ type: "setLoading", payload: "" });
  };
  const cryptoFiatConverter = async (
    item,
    val,
    isCrypto,
    overrideFiatCode = null
  ) => {
    if (state.error.message) setError();

    if (!selectedFiatCoin) return;

    setState({
      type: "setLoading",
      payload: isCrypto ? "fiatAmount" : "cryptoAmount",
    });

    debouncedCryptoFiatConverter({
      coin: item?.code || assetDetails?.code,
      value: val || 0,
      isCrypto,
      currency: overrideFiatCode || selectedFiatCoin?.code,
      callback: setAmountsAfterConversion,
      action: "sell",
    });
  };

  const handleChange = (value, isCrypto = true) => {
    const cleanedValue = value === "." ? value : replaceCommas(value);
    if (cleanedValue === ".") return;
    const type = isCrypto ? "setCryptoAmount" : "setFiatAmount";

    setState({ type, payload: cleanedValue });
    cryptoFiatConverter(assetDetails, cleanedValue, isCrypto);
  };

  const handleFiatChange = (item) => {
    dispatch(setSelectedFiatCoin(item));
    if (state.cryptoAmount && Number(state.cryptoAmount) > 0) {
      cryptoFiatConverter(assetDetails, state.cryptoAmount, true, item.code);
    } else {
      setState({ type: "setFiatAmount", payload: "" });
    }
  };

  const handleMinMax = (e) => {
    const value = e.currentTarget.id.includes("Min")
      ? assetDetails?.min
      : assetDetails?.max;
    setState({ type: "setCryptoAmount", payload: value });
    cryptoFiatConverter(assetDetails, value, true);
  };
  const onCryptoCurrencyChange = (data) => {
    switch (state.loading) {
      case "fiatAmount":
        setState({ type: "setCryptoAmount", payload: "" });
        cryptoFiatConverter(data, "", true);
        return;
      case "cryptoAmount":
        setState({ type: "setFiatAmount", payload: "" });
        cryptoFiatConverter(data, "", false);
        return;
      default:
        setState({ type: "setFiatAmount", payload: "" });
        setState({ type: "setCryptoAmount", payload: "" });
    }
  };
  const getSummary = async () => {
    try {
      const amount = state.isSaving ? state.fiatAmount : state.cryptoAmount;

      const summary = await fetchSellSummary({
        selectedCryptoCoin: assetDetails,
        selectedFiatCoin,
        amount,
        isCrypto: state.isSaving,
      });

      dispatch(setSummaryDetails(summary));
      setState({
        type: "setStates",
        payload: { loading: "", isSaving: false },
      });
      onSuccess?.({ ...summary,isCrypto: state.isSaving });
    } catch (error) {
      setError(error.message);
      onError?.(error.message);
      setState({
        type: "setStates",
        payload: { loading: "", isSaving: false },
      });
    }
  };

  const handleSell = useCallback(() => {
    if (state.error.message) setError();
    setState({ type: "setLoading", payload: "save" });

    if (!selectedFiatCoin) {
      setError(SELL_VALIDATION_MESSAGES.NO_FIAT_WALLET);
      setState({ type: "setLoading", payload: "" });
      return;
    }

    const warning = amountValidation({
      fiatAmount: state.fiatAmount,
      cryptoAmount: state.cryptoAmount,
      selectedCryptoCoin: assetDetails,
      selectedFiatCoin,
    });

    if (warning) {
      setError(warning, "warning");
      setState({ type: "setLoading", payload: "" });
    } else {
      getSummary();
    }
  }, [
    assetDetails,
    selectedFiatCoin,
    state.cryptoAmount,
    state.fiatAmount,
    state.error.message,
  ]);
  const getAssetDetails = useCallback(
    ({ assetCode }) => {
      const onSuccess = ({ response, fiatAssets }) => {
        onCryptoCurrencyChange(response);
        setState({ type: "setFiatWallets", payload: fiatAssets });
      };
      dispatch(fetchAssetDetails({ assets, assetCode, onSuccess }));
    },
    [onCryptoCurrencyChange, assets]
  );
  const handleCryptoCurrencyChange = useCallback(
    (value) => {
      const selected = assets?.cryptoAssets?.find(
        (coin) => coin.code === value
      );
      if (selected) {
        setState({ type: "setFiatWallets", payload: [] });
        dispatch(setSelectedFiatCoin(null));
        fetchAssetDetailsOnChange && getAssetDetails({ assetCode: selected.code });
        onCryptoChange?.(selected);
      }
    },
    [assets?.cryptoAssets, onCryptoChange]
  );
 useEffect(() => {
     dispatch(fetchAssetsAndBalances());
     return () => {
       setState({ type: "setFiatWallets", payload: [] });
       dispatch(
         resetState(resetKeys)
       );
     };
   }, []); //eslint-disable-line react-hooks/exhaustive-deps
   useEffect(() => {
     if (shouldRefresh) {
       dispatch(fetchAssetsAndBalances());
     }
   }, [shouldRefresh]); //eslint-disable-line react-hooks/exhaustive-deps
   useEffect(() => {
     if(!assets?.cryptoAssets?.length) return
     dispatch(setSelectedFiatCoin(null));
     setState({ type: "setFiatWallets", payload: [] });
     if (
       defaultCryptoCode &&
       defaultCryptoCode !== "null" &&
       defaultCryptoCode !== "undefined"
     ) {
       getAssetDetails({ assetCode: defaultCryptoCode });
     }else if(setFirstAsDefault && assets?.cryptoAssets?.[0]?.code ){
       getAssetDetails({ assetCode: assets.cryptoAssets[0].code });
     }
   }, [defaultCryptoCode,assets?.cryptoAssets?.length]);
  return (
    <>
      {fetchingAssets && (
        <BuySellViewLoader withHeader={false} widgetClass={classNames?.root} />
      )}
      {!fetchingAssets &&
        (state.error.message || assetsError || assetError) && (
          <div className="alert-flex withdraw-alert fiat-alert m-4">
            <AppAlert
              type={state.error.type}
              description={state.error.message || assetsError || assetError}
              showIcon
              closable
              afterClose={clearError}
            />
          </div>
        )}
      {!fetchingAssets && (
        <div className="panel-card buy-card card-paddingrm">
          <BuySellWidget
            key="sell"
            config={{
              cryptoCoins: assets?.cryptoAssets || [],
              handleCryptoCurrencyChange,
              selectedCryptoCoin: assetDetails,
              coinsDropdownPlaceholder: "Select coin to sell",
              cryptoAmountLoader: state.loading === "cryptoAmount",
              fiatAmountLoader: state.loading === "fiatAmount",
              handleMinMax,
              handleChange,
              cryptoAmount: state.cryptoAmount,
              fiatAmount: state.fiatAmount,
              selectedFiatCoin,
              assetDetailsLoading: fetchingAssets || (assets?.cryptoAssets?.length>0 ?  fetchingAssetDetails : false),
              fiatWalletsLoading: fetchingAssets,
              fiatWallets: state.fiatWallets || [],
              saving: state.loading === "save",
              disabled: state.loading !== "" || fetchingAssetDetails,
              handleSave: handleSell,
              screen: "sell",
              handleFiatChange,
              classNames,
            }}
          />
        </div>
      )}
    </>
  );
}

export default memo(Sell);
