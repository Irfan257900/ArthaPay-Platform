import ListDetailLayout from "../../../core/module.layouts/listdetail.layout";
import { Outlet, useLocation, useNavigate, useParams } from "react-router";
import { useCallback, useMemo, useEffect } from "react";
import AppTabs from "../../../core/shared/tabs";
import CoinList from "../../../core/shared/coinList";
import {
  fetchFiatCoins,
  setFiatCoins,
  setPayeeFiat,
  setRefreshLeftPanel,
  setSelectedCoin,
  setWithdrawFiatSaveObj,
  setWithdrawObject,
} from "./withdraw.components/withdrawFiatReducer";
import { connect, useSelector } from "react-redux";
import AppEmpty from "../../../core/shared/appEmpty";
import NumericText from "../../../core/shared/numericText";
import AppAlert from "../../../core/shared/appAlert";
import VaultsKpis from "../kpi";
import { capitalizeFirstLetter, selectTabs } from "../service";
import ScreenTabs from "../../../core/shared/screenTabs";
import FiatRightboxLoader from "../../../core/skeleton/vaults.fiatRight.loader";
import ActionWidgetLoader from "../../../core/skeleton/actionWidgets.loader";
import ViewHeaderLoader from "../../../core/skeleton/view.header";
import useEnsureKpis from "../useEnsuerkips";

import RecentActivityFait from "./depositFiat/recentActivity";
import numberFormatter from "../../../utils/numberFormatter";
const tabsData = [
  { id: "Deposit", name: "Deposit" },
  { id: "Withdraw", name: "Withdraw" },
];
const fields = {
  currencyCode: "code",
  amount: "amount",
  percentage: "percentage",
  currencyFullName: "code",
  coinName: "code",
};
const FiatLayout = (props) => {
  const { pathname } = useLocation();
  const { actionType, currency: walletCode } = useParams();
  const currency = useSelector((state) => state.withdrawFiat?.fiatCoins);
  const TotalAmounts = useSelector((state) => state.withdrawFiat?.TotalAmount);
  const userInfo = useSelector(
    (storeInfo) => storeInfo?.userConfig?.details
  );
  const selectedCurrency = useSelector(
    (storeInfo) => storeInfo?.withdrawFiat?.selectedCoin
  );
  const Smalldecimals = window.runtimeConfig.VITE_APP_SMALL_DECIMALS_ENABLED
  const isRefreshLeftPanel = useSelector(
    (storeInfo) => storeInfo?.withdrawFiat?.isRefreshLeftPanel
  );
  const navigate = useNavigate();
  const breadCrumbList = useMemo(() => {
  return [
    { id: "1", title: "Wallets", handleClick: () => navigate("/wallets") },
    { id: "2", title: "Fiat" },
    { id: "3", title: capitalizeFirstLetter(actionType) },
    { id: "4", title: walletCode ? walletCode.toUpperCase() : "" },
  ];
}, [actionType, walletCode]);

  useEffect(() => {
    if (actionType === "deposit") {
      props.dispatch(fetchFiatCoins(true, "fiat"));
    } else if (actionType == "withdraw") {
      props.dispatch(fetchFiatCoins(true, "fiat"));
    } else {
      handleTabChange(tabsData[0]);
    }
  }, [actionType]);
  useEffect(() => {
    if (currency?.data?.length > 0) {
      getFiat();
    }
  }, [currency?.data]);
  useEffect(() => {
    if (isRefreshLeftPanel) {
      props.dispatch(
        fetchFiatCoins(
          true,
          "fiat",
          userInfo?.id
        )
      );
    }
  }, [isRefreshLeftPanel]);

  const getBalanceText = (amount, isSuffix, isOnlyAmount) => {
    const numAmount = parseFloat(amount) || 0;
    if (isNaN(numAmount)) return '0.00';

    const { number, suffix } = numberFormatter(numAmount) || {};
    const formattedNumber = (number ?? 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    if (isSuffix) {
      return suffix || "";
    }
    if (isOnlyAmount) {
      return formattedNumber;
    }
    return `$ ${formattedNumber}`;
  };
  const getFiat = () => {
    if (actionType && actionType !== "null" && actionType !== "undefined") {
      const coinToSelect = walletCode
        ? currency.data.find(coin => coin.code === walletCode.toUpperCase())
        : currency.data[0];

      if (coinToSelect) {
        props.dispatch(setSelectedCoin(coinToSelect));
      }

      if (coinToSelect) {
        props.dispatch(setSelectedCoin(coinToSelect));
        if (isRefreshLeftPanel && !pathname.includes("success")) {
          props.dispatch(setRefreshLeftPanel(false));
        }
        if (!isRefreshLeftPanel && !pathname.includes("success")) {
          navigate(`/wallets/fiat/${actionType}/${coinToSelect.code}`);
        }
      }
    }
    if (!actionType || actionType === "null" || actionType === "undefined") {
      navigate(`/wallets/fiat/deposit/${currency.data[0]?.code || ''}`);

    }
  };



  const handleTabChange = useCallback(
    (selectedTab) => {
      if (selectedTab) {
        navigate(`/wallets/fiat/${selectedTab?.name?.toLowerCase()}`);
        props.dispatch(setWithdrawObject(null));
        props.dispatch(setPayeeFiat(null));
        props.dispatch(setWithdrawFiatSaveObj(null));
      }
    },
    [navigate, props.dispatch]
  );
  const getFiatSelectionCoin = useCallback(
    (item) => {
      if (item) {
        props?.dispatch(setSelectedCoin(item));
        navigate(`/wallets/fiat/${actionType}/${item?.code}`);
      }
    },
    [actionType]
  );


  const cancelErrorMessage = () => {
    props?.dispatch(
      setFiatCoins({
        loader: false,
        data: null,
        error: null,
      })
    );
  };
  const onRefresh = useCallback(() => {
    props?.dispatch(setRefreshLeftPanel(true));
  }, []);

  const handleTabChanging = useCallback((selectedTab) => {
    if (selectedTab === "Crypto") {
      navigate(`/wallets/crypto`);
    }
  }, []);
  useEnsureKpis();
  return (
    <ListDetailLayout
      breadCrumbList={breadCrumbList}
      showBreadcrumb={true}
      hasOverview={true}
      Overview={<VaultsKpis />}
      ListHeader={
        <>
          <div className="flex justify-between !p-3">
            <div className="toggle-btn custom-tabs">
              <ScreenTabs
                onChange={handleTabChanging}
                activeKey={selectTabs}
                className="custom-crypto-tabs "
              />
            </div>
          </div>
          <ListDetailLayout.ListHeader
            title={actionType == "deposit" ? "Deposit Fiat" : "Withdraw Fiat"}
            showAdd={false}
          />
          {!currency?.loader &&
          <div className="p-3">
            <p className="text-base font-semibold text-titleColor mb-0">
              Total Amount
            </p>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-subTextColor text-3xl">
                <NumericText
                  value={TotalAmounts?.response?.totalBalanceInUSD}
                  prefixText={"$  "}
                  thousandSeparator={true}
                  isdecimalsmall={Smalldecimals === 'true' ? true : false}
                  decimalScale={2}
                />
              </span>
              <span
                className="icon refresh cursor-pointer"
                onClick={onRefresh}
              />
            </div>
          </div>}
        </>
      }
      ListComponent={
        <div className="vaults-list">
          {currency?.error && (
            <div className="px-4">
              <div className="alert-flex" style={{ width: "100%" }}>
                <AppAlert
                  className="w-100 "
                  type="warning"
                  description={currency?.error}
                  showIcon
                />
                <button
                  className="icon sm alert-close"
                  onClick={cancelErrorMessage}
                ></button>
              </div>
            </div>
          )}
          <CoinList
            className="coin-itemslist-scroll"
            coinSearch={true}
            isLoading={currency?.loader}
            isCrypto={false}
            coinList={currency?.data || []}
            coinFields={fields}
            cryptoCoin={selectedCurrency?.code}
            selectCoin={getFiatSelectionCoin}
            type={actionType}
          />
        </div>
      }
      ViewHeader={
        <>
          {currency.loader && <ViewHeaderLoader />}
          {(!currency?.loader && selectedCurrency !== null) && <div>
            <div className="md:flex justify-between items-start">
              <ListDetailLayout.ViewHeader
                logoType="img"
                hasLogo={selectedCurrency?.image ? true : false}
                showActions={false}
                logo={selectedCurrency?.image}
                title={
                  <NumericText
                    suffixText={selectedCurrency?.code || ""}
                    value={selectedCurrency?.amount || 0}
                    fixedDecimals={2}
                    decimalScale={2}
                    thousandSeparator
                    isdecimalsmall={Smalldecimals === 'true' ? true : false}
                  />
                }
              />
              <div className="flex gap-2">
                <div className="!mt-0 toggle-btn">
                  <AppTabs
                    tabsData={tabsData}
                    labelKey="name"
                    idKey="id"
                    onTabChange={handleTabChange}
                  />
                </div>
              </div>
            </div>
            <hr className="border border-cryptoline my-3"></hr>
          </div>}
        </>
      }
    >
      {walletCode && (
        <div>
          <Outlet />
        </div>
      )}
      {currency?.loader && actionType === 'deposit' && <FiatRightboxLoader />}
      {currency?.loader && actionType === 'withdraw' && <ActionWidgetLoader />}
      {!currency?.loader && !currency?.data?.length && <AppEmpty />}
      {!currency?.loader &&
        currency?.data?.length > 0 &&
        selectedCurrency?.id &&
        actionType && (
          <RecentActivityFait actionType={actionType} />
        )}
    </ListDetailLayout>
  );
};
const connectDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};
export default connect(connectDispatchToProps)(FiatLayout);
