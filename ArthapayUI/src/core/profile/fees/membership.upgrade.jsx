import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  getConversionAmount,
  getMembershipUpgradeSummary,
  fetchVaultsForUpgradeMembership,
  upgradeMembership,
} from "../http.services";
import WithdrawWidget from "../../shared/withdraw.widget";
import AppAlert from "../../shared/appAlert";
import UpgradeSummary from "./upgrade.summary";
import { NumericFormat } from "react-number-format";
import SuccessComponent from "../../shared/success.component";
import { membershipUpgradeTexts } from "../membership/services";
import { WithdrawWidgetLoader } from "../../skeleton/withdraw.loader";
import AppDefaults from "../../../utils/app.config";
import VerificationsHandler from "../../verifications.handler";
const SuccessMessage = () => {
  const isSubscribed = useSelector((state) => state.userConfig.isSubscribed);
  return (
    <div className="flex flex-col gap-2">
      <span>
        {membershipUpgradeTexts("requestSubmittedText", isSubscribed)}
      </span>
      <span className="text-[14px] text-summaryLabelGrey">
        <span className="text-500">Note:&nbsp;</span> You will be notified once
        your request is processed. This may take few minutes.
      </span>
    </div>
  );
};
const defaultFields = {
  name: "name",
  id: "id",
  price: "membershipPrice",
  currency: "currency",
};
const MembershipUpgrade = ({ data, onSuccess, fields = defaultFields }) => {
  const [state, setState] = useState({
    error: "",
    loading: "data",
    amount: 0,
    step: 1,
    selectedCoin: null,
    selectedNetwork: null,
    selectedVault: null,
    lookups: { vaults: [], networks: [], coins: [] },
    isVerified: false,
    summary: null,
  });
  useEffect(() => {
    fetchVaultsForUpgradeMembership({
        setLoader:(payload)=>setState(prev=>({...prev,loading:payload ? 'data' :''})),
        setData:(vaults)=>setState(prev=>({...prev,lookups:{vaults}})),
        setError:(error)=>setState(prev=>({...prev,error}))
      });
  }, []);

  const onVaultChange = useCallback(
    (vault) => {
      setState((prev) => ({
        ...prev,
        selectedVault: vault,
        lookups: {
          ...prev.lookups,
          coins: vault.details,
          networks: [],
        },
        selectedNetwork: null,
        selectedCoin: null,
        amount: 0,
      }));
    },
    [setState]
  );
  const onCoinChange = useCallback(
    (coin) => {
      setState((prev) => ({
        ...prev,
        lookups: { ...prev.lookups, networks: coin.networks },
        selectedCoin: coin,
        selectedNetwork: null,
        amount: 0,
      }));
    },
    [state.selectedVault]
  );
  const onNetworkChange = useCallback(
    (network) => {
      setState((prev) => ({
        ...prev,
        selectedNetwork: network,
      }));
      getConversionAmount({
        setLoader:(payload)=>setState(prev=>({...prev,loading:payload ? 'amount':''})),
        onError:(error)=>setState(prev=>({...prev,error})),
        onSuccess:(amount)=>setState(prev=>({...prev,amount})),
        fromCoin: data?.[fields.currency] || "USD",
        toCoin: state.selectedCoin?.code,
        membershipPrice: data?.[fields.price],
      });
    },
    [state.selectedCoin, data, fields]
  );
  const handleSubmit = useCallback(
    () => {
      getMembershipUpgradeSummary({
        setLoader:(payload)=>setState(prev=>({...prev,loading:payload ?'continue':''})),
        onSuccess:(response)=>setState((prev) => ({ ...prev, summary: response, step: 2 })),
        onError:(error)=>setState((prev) => ({ ...prev, error })),
        wallet:state.selectedNetwork,
        membership: data,
        fields,
      });
    },
    [state, data, fields]
  );
  const handleUpgrade = useCallback(() => {
    upgradeMembership({
      wallet:state.selectedNetwork,
      setLoader:(payload)=>setState((prev) => ({ ...prev, loading:payload ? 'upgrade' : '' })),
      onSuccess:()=>setState((prev) => ({ ...prev, step: 3 })),
      onError:(error)=>setState((prev) => ({ ...prev,error: error })),
      membership: data,
      fields,
    });
  }, [state, data, fields]);
  const onSuccessOk = useCallback(() => {
    onSuccess();
  }, []);
  const setError = useCallback((payload) => {
    setState((prev) => ({ ...prev, error: payload }));
  }, []);
  const closeErrorMessage = useCallback(() => {
    setError("");
  }, []);
  return (
    <VerificationsHandler loader={<WithdrawWidgetLoader/>}>
      {state.error && (
        <div className="px-4">
          <div className="alert-flex withdraw-alert fiat-alert">
            <AppAlert
              type={"error"}
              description={state.error}
              showIcon
              closable
              afterClose={closeErrorMessage}
            />
          </div>
        </div>
      )}
      {state.step !== 3 && (
        <>
          <div className="summary-list-item">
            <div className="summary-label">Membership Name</div>
            <div className="summary-text">{data?.[fields.name]}</div>
          </div>
          <div className="summary-list-item">
            <div className="summary-label">Membership Price</div>
            <div className="summary-text">
              <NumericFormat
                value={data?.[fields.price]}
                displayType="text"
                className="text-light-addonColor"
                decimalScale={AppDefaults.fiatDecimals}
              />
              <span>&nbsp;{data?.[fields.currency] || "USD"}</span>
            </div>
          </div>
        </>
      )}
      {state.loading==='data' && <WithdrawWidgetLoader/>}
      {state.step === 1 &&
        state.loading !== "data" && (
          <WithdrawWidget
            widgetClass="w-full mt-8"
            hasMinMax={false}
            amount={state.amount}
            isAmountDisabled={true}
            vaults={state.lookups.vaults}
            vaultLabels={{label:'name',value:'id'}}
            showVaults={true}
            onVaultChange={onVaultChange}
            onCurrencyChange={onCoinChange}
            coins={state.lookups.coins}
            coinLabels={{label:'code',value:'code'}}
            loadingNetworks={state.loading === "networks"}
            networks={state.lookups.networks}
            networkLabels={{label:'name',value:'id',amount:'balance'}}
            onSubmit={handleSubmit}
            saving={state.loading === "continue"}
            onNetworkChange={onNetworkChange}
            selectedNetwork={state.selectedNetwork}
            amountLoading={state.loading === "amount"}
            showAvailableBalance={true}
            canAllowZero={true}
            actionControlProps={{
              actionFrom: "Purchase/Upgrade Membership",
              redirectTo: "/profile/fees/memberships/explore",
            }}
          />
        )}
      {state.step === 2 && (
        <div className="mt-8">
          <UpgradeSummary
            actionButtonText="Upgrade"
            saving={state.loading === "upgrade"}
            onSubmit={handleUpgrade}
            details={state.summary}
            setError={setError}
            screen={"upgradeMembership"}
          />
        </div>
      )}
      {state.step === 3 && (
        <SuccessComponent message={<SuccessMessage />} onOk={onSuccessOk} />
      )}
    </VerificationsHandler>
  );
};

export default MembershipUpgrade;
