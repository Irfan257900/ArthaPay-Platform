import React, { useState, useMemo, useEffect, useReducer, useCallback } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import ListDetailLayout from "../../../core/module.layouts/listdetail.layout";
import { Outlet, useNavigate, useParams, useLocation } from "react-router";
import AppDefaults from "../../../utils/app.config";
import { processorReducer, processorState } from "./reducer";
import { currencyTypes, fetchPayouts } from "../httpServices";
import WalletsAccordion from "./wallets.accordion";
import AppTabs from "../../../core/shared/appTabs";
import { setFiatIsRefresh, setIsNextStep } from "../reducers/payout.reducer";
import SingleBarLoader from "../../../core/skeleton/bar.loader";
import { replaceExtraSpaces } from "../../../core/shared/validations";
import { badgeColors } from "../../../utils/statusColors";
import { useTranslation } from "react-i18next";
import NumericText from "../../../core/shared/numericText";
import { NumericFormat } from "react-number-format";
import { setSelectedTab } from "./payout.accordion.reducer";
import ScreenTabs from "../../../core/shared/screenTabs";
import PaymentsKpis from "../kpis.and.tabs";
import defaultImg from '../../../assets/images/default-circle-img.png'
import numberFormatter from "../../../utils/numberFormatter";

const pageSize = 10;

const logoSize = ["40px", "40px"];

const Smalldecimals = window.runtimeConfig.VITE_APP_SMALL_DECIMALS_ENABLED;
const payinFiatDisable = window.runtimeConfig.VITE_APP_IS_SHOW_PAYIN_FIAT;

const isPayinFiatDisabled = payinFiatDisable === "true" || payinFiatDisable === true;

const getBalanceText = (amount) => {
  if (!amount || isNaN(amount)) {
    return "0.00";
  }

  const { number, suffix } = numberFormatter(amount);
  return (
    number?.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + (suffix || "")
  );
};

const Payouts = () => {
  const [loader, setLoader] = useState(false);
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [network, setNetwork] = useState({});
  const [balanceLoader, setBalanceLoader] = useState(false); // NOSONAR  This state is used to manage the loading state of the balance
  const [totalBalances, setTotalBalances] = useState(0); // NOSONAR  This state is used to manage the total balances
  const { t } = useTranslation();
  const [state, setState] = useReducer(processorReducer, processorState);
  const [loadingHeader, setLoadingHeader] = useState(false)
  const userProfile = useSelector((store) => store.userConfig.details);
  const isFormRefresh = useSelector((store) => store.payoutReducer?.fiatRefresh);
  const selectedFiatCoin = useSelector((state) => state.payoutAccordianReducer.selectedFiatCoin);
  const selectedCryptoCoin = useSelector((state) => state.payoutAccordianReducer.selectedCryptoCoin);
  const activeKeyForTab = useSelector((state) => state?.payoutAccordianReducer?.selectTab)
  const vaults = useSelector((state) => state.payoutAccordianReducer.vaults);
  const selectedMerchant = useSelector(
    (storeInfo) => storeInfo?.payoutAccordianReducer?.selectedCryptoVault
  );
  const { id, mode, type, currencyType } = useParams();
  const selectedCoin = currencyType === 'fiat' ? selectedFiatCoin : selectedCryptoCoin
  const location = useLocation();
  const dispatch = useDispatch();
  const breadCrumbList = useMemo(() => {
    const defaultList = [
      { id: "1", title: `${t('payments.breadcrumb.payments')}`, handleClick: () => navigate('/payments') },
    ];

    if (!mode || (mode !== 'add' && !selectedPayout?.merchantName)) {
      return defaultList;
    }

    const formattedMode = mode !== 'add'
      ? `${selectedPayout?.merchantName?.[0]?.toUpperCase()}${selectedPayout?.merchantName?.substring(1)}`
      : `${mode?.[0]?.toUpperCase()}${mode?.substring(1)}`;

    let list = [...defaultList];

    if (mode === "add") {
      list = [
        ...list,
        {
          id: "2",
          title: `${t('payments.breadcrumb.payout')}`,
          handleClick: () => navigate(
            `/payments/payouts/payout/${selectedPayout?.id}/${selectedPayout?.merchantName}/view/${selectedPayout?.type}/${selectedPayout?.transactionType}`
          )
        },
        { id: "3", title: `${t('payments.breadcrumb.addpayout')}`, url: "" }
      ];
    } else if (mode === "update") {
      if (type === "Static") {
        list = [
          ...list,
          {
            id: "2", title: "Pay Out", handleClick: () => navigate(
              `/payments/payouts/payout/${selectedPayout?.id}/${selectedPayout?.merchantName}/view/${selectedPayout?.type}/${selectedPayout?.transactionType}`
            )
          },
          { id: "3", title: 'Edit Static Pay Out' }
        ];
      } else if (type === "Invoice") {
        list = [
          ...list,
          {
            id: "2", title: "Pay Out", handleClick: () => navigate(
              `/payments/payouts/payout/${selectedPayout?.id}/${selectedPayout?.merchantName}/view/${selectedPayout?.type}/${selectedPayout?.transactionType}`
            )
          },
          { id: "3", title: 'Edit Regular Pay Out' }
        ];
      } else {
        list = [
          ...list,
          {
            id: "2", title: `${t('payments.breadcrumb.payout')}`, handleClick: () => navigate(
              `/payments/payouts/payout/${selectedPayout?.id}/${selectedPayout?.merchantName}/view/${selectedPayout?.type}/${selectedPayout?.transactionType}`
            )
          },
          { id: "3", title: formattedMode }
        ];
      }
    } else {
      list = [
        ...list,
        { id: "2", title: `${t('payments.breadcrumb.payout')}` },
        { id: "3", title: formattedMode }
      ];
    }

    return list;
  }, [selectedPayout?.merchantName, mode, type, id]);


  const getBalanceText = (amount) => {
    if (!amount || isNaN(amount)) {
      const retrunValue = currencyType === 'fiat' ? "0.00" : '0.0000'
      return retrunValue;
    }

    const { number, suffix } = numberFormatter(amount);
    return (
      number?.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + (suffix || "")
    );
  };

 const getBalanceInKsMs = (amount, isSuffix, isOnlyAmount) => {
    // Fallback for any falsy amount (null, undefined, NaN)
    if (typeof amount !== 'number' || isNaN(amount)) {
      return isSuffix ? '' : '0.00';
    }
 
    const { number, suffix } = numberFormatter(amount) || {};
    const formattedNumber = (number ?? 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    if (isSuffix) {
      // Ensure suffix is NOT undefined
      return suffix || '';
    }
    if (isOnlyAmount) {
      return `${formattedNumber}`;
    }
    // If you ever use this branch, ensure suffix and number never undefined
    return `${suffix || ''}${formattedNumber}`;
  };

  useEffect(() => {
    if (location?.pathname === '/payments/payouts' && !isPayinFiatDisabled){
      getData();
    }
  }, [location, userProfile,isPayinFiatDisabled]);
  useEffect(() => {
    if (isFormRefresh) {
      dispatch(setFiatIsRefresh(false));
      getData();
    }
  }, [isFormRefresh]);

  useEffect(() => {
    dispatch(setSelectedTab('Pay Out'));
    cryptoBalances();
  }, []);

  useEffect(() => {
    if(isPayinFiatDisabled){
      dispatch(setIsNextStep(false));
      setLoadingHeader(true);
      navigate(`/payments/payouts/payout/${AppDefaults.GUID_ID}/new/add/crypto`);
      new Promise(resolve => setTimeout(resolve, 500));
      setLoadingHeader(false);
    }
  }, [isPayinFiatDisabled])

  const cryptoTotalBalances = useCallback(async () => {
    await getData([], 1, searchInput || null);
  }, [])

  const cryptoBalances = useCallback(async () => {
    // await getwalletsTotalBalance(setBalanceLoader, setTotalBalances, setErrorMessage, true, "payout");  // NOSONAR  This one commented because we did changes in the payout. If it need in the furure that's why we are keeping it here.
  }, [])

  const getData = async (
    currentData = [],
    pageToFetch = 1,
    searchValue = searchInput || null
  ) => {
    const urlParams = {
      searchValue: searchValue,
      pageNo: pageToFetch,
      pageSize: pageSize,
      currentData,
      state
    }
    await fetchPayouts(setLoader, setData, setErrorMessage, urlParams, selectPayout, setPage);
  };
  const selectPayout = (payoutToSelect) => {
    const {
      id,
    } = payoutToSelect || {};
    setSelectedPayout(payoutToSelect);
    if (id === `${AppDefaults?.GUID_ID}`) {
      return
    } else {
      navigate(`/payments/payouts/payout/${AppDefaults.GUID_ID}/new/add/${currencyType || 'fiat'}`);
    }
  };


  const handleForm = useCallback(() => {
    navigate(`/payments/payouts/payout/${AppDefaults.GUID_ID}/new/add/fiat`);
  }, []);

  const handleSearchPayout = useCallback((value) => {
    value = replaceExtraSpaces(value);
    setSearchInput(value);
    getData([], 1, value || null);
  }, []);

  const handleSelectPayOut = useCallback((item) => {
    selectPayout(item)
  }, []);

  const fetchNextPage = useCallback(async (pageToFetch) => {
    await getData(data, pageToFetch + 1)
  }, [data]);
  const ItemRow = useCallback(({ data, handleListModalClose }) => {
    return (
      <ListDetailLayout.ListItem
        data={data}
        itemFields={{
          id: "id",
          title: "merchantName",
          logo: "image",
          status: "status",
        }}
        handleListModalClose={handleListModalClose}
        badgeColor={badgeColors}
        selectedRow={selectedPayout}
        onItemSelect={handleSelectPayOut}
        hasStatusBadge={true}
        ItemDescription={
          <div className="text-xs font-medium text-summaryLabelGrey !flex">
            {`${data?.wallet} (${data?.network})`}
            {/* <AppText className="fw-600 text-upper text-secondary d-block"></AppText> */}
          </div>
        }
      >
        <span className="text-xs font-medium text-summaryLabelGrey !flex">
          <NumericFormat value={data?.amount} displayType="text" decimalScale={4} thousandSeparator={true} /> {data?.currency}
        </span>
      </ListDetailLayout.ListItem>
    );
  }, [badgeColors, selectedPayout, handleSelectPayOut]);

  const handleChangeTabs = useCallback(
    async (value) => {
      dispatch(setIsNextStep(false));
      setErrorMessage('')
      if (value) {
        setLoadingHeader(true);
        navigate(`/payments/payouts/payout/${AppDefaults.GUID_ID}/new/add/${value?.toLowerCase()}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        setLoadingHeader(false);
      }
    }, []);


  const filteredCurrencyTypes = isPayinFiatDisabled
    ? currencyTypes.filter((c) => c.name.toLowerCase() !== 'fiat')
    : currencyTypes;

  const renderViewHeader = () => {
    if (mode === 'view' && data?.length > 0) {
      return (
        <div className="flex justify-between items-start border-b-2 border-cryptoline pb-2">
          <ListDetailLayout.ViewHeader
            logoType="custom"
            logo={<span>{selectedPayout?.merchantName?.[0]}</span>}
            title={selectedPayout?.merchantName}
            metaData={<NumericText thousandSeparator={true} displayType={'text'} decimalScale={4} fixedDecimals={4} value={selectedPayout?.amount} suffixText={selectedPayout?.wallet} />}
            showActions={false}
          />
          <div>
            <h2 className="font-semibold md:text-xl text-lg text-subTextColor">Payouts</h2>
          </div>
        </div>
      );
    }
    if (mode === 'add' || mode === 'summary' || mode === 'success') {
      return (
        <div className="md:flex justify-between items-start mb-5 !border-b-2 !border-cryptoline pb-2">
          {vaults?.loader ? (
            <SingleBarLoader />
          ) : (

            <ListDetailLayout.ViewHeader
              hasLogo={true}
              logoType="custom"
              logoBg={""}
              customLogoClass=""
              title={
                <div className="flex flex-row items-center gap-2">
                  <img src={selectedCoin?.image || defaultImg} alt="" width={logoSize[0]} height={logoSize[1]} className={"rounded-full w-10 h-10"} />
                  <div>
                    <NumericText
                      value={getBalanceInKsMs(network?.amount, false, true)}
                      thousandSeparator={true}
                      spaceBeforeSuffix={true}
                      suffixText={
                        (getBalanceInKsMs(network?.amount, true, false)
                          ? getBalanceInKsMs(network?.amount, true, false) + ' '
                          : '')
                        + (selectedCoin?.code ?? '')
                      }
                      decimalScale={currencyType === 'fiat' ? AppDefaults?.fiatDecimals : AppDefaults?.cryptoDecimals}
                      fixedDecimals={true}
                      isdecimalsmall={Smalldecimals === 'true'}
                    />
                  </div>
                </div>
              }
              showActions={false}
            />
          )}
          <div className="md:flex items-center gap-2 justify-end mt-3 md:mt-0">
            <div className="toggle-btn">
              <AppTabs
                list={filteredCurrencyTypes.map((c) => ({
                  title: c.name,
                  key: c.name.toLowerCase(),
                }))}
                activeKey={
                  isPayinFiatDisabled && currencyType?.toLowerCase() === 'fiat'
                    ? 'crypto'
                    : currencyType?.toLowerCase()
                }
                onChange={handleChangeTabs}
                defaultActiveKey={isPayinFiatDisabled ? 'crypto' : 'fiat'}
                className="custom-crypto-tabs"
              />
            </div>
          </div>
        </div>
      );
    }

    return <></>
  };


  const onTabChange = useCallback((value) => {
    if (value === 'Pay In') {
      dispatch(setSelectedTab(value));
      navigate('/payments/payins');
    } else if (value === "Batch Pay-Outs") {
      dispatch(setSelectedTab(value));
      navigate('/payments/batchpayouts')
    }
  }, []);




  return (
    <ListDetailLayout
      breadCrumbList={breadCrumbList}
      hasOverview={true}
      ListComponentTitle={"Select Payout"}
      Overview={<PaymentsKpis />}
      loader={loader}
      ListHeader={
        <div className="flex flex-col gap-3 !p-3">
          <div className="flex !justify-between gap-3">
            <div className="toggle-btn custom-tabs">
              <ScreenTabs
                tabFields={{ title: "name", key: "name", icon: "" }}
                activeKey={activeKeyForTab}
                className="custom-crypto-tabs"
                onChange={onTabChange}
              />
            </div>
            {mode === 'view' ? (
              <ListDetailLayout.ListHeader
                title={t('payments.breadcrumb.payout')}
                onAdd={handleForm}
                showAdd={true}
                activeTab={activeKeyForTab}
                totalAmount={totalBalances?.amountInUSD}
                refreshTotalAmount={cryptoTotalBalances}
              />
            ) : mode === 'add' ? (
              <ListDetailLayout.ListHeader showTitle={false} showAdd={false} />
            ) : null}
          </div>
          {mode === 'view' && (
            <div>
              <p className="text-base font-semibold text-titleColor mb-0">Total Amount</p>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-subTextColor text-3xl">
                  <NumericText
                    value={totalBalances?.amount || 0}
                    prefixText={"$  "}
                    thousandSeparator={true}
                    decimalScale={4}
                    fixedDecimals={4}
                  />
                </span>
                <span className="icon refresh cursor-pointer" onClick={cryptoTotalBalances} />
              </div>
            </div>
          )}
        </div>
      }
      ListComponent={
        (mode === 'view') ? (
          <ListDetailLayout.List
            list={data || []}
            ItemComponent={ItemRow}
            onSearch={handleSearchPayout}
            onSearchInput={setSearchInput}
            showAlert={errorMessage !== ""}
            alterMessage={errorMessage}
            searchValue={searchInput}
            pageSize={pageSize}
            setShowAlert={setErrorMessage}
            currentPage={page}
            fetchNext={fetchNextPage}
            loading={loader || balanceLoader}
            searchPlaceholer={'Pay Out'}
          />) : (mode === 'add' || mode === 'summary' || mode === 'success') && (
            <div>
              <WalletsAccordion canSelectCoin={true} clearOnPanelClose={true} setState={setState} onCoinSelection={true} currencyType={currencyType} />
            </div>
          )
      }
      ViewHeader={renderViewHeader()}
    >
      <Outlet context={{ setNetworkLu: setNetwork }} />
    </ListDetailLayout>
  );
};
const connectStateToProps = ({ userConfig }) => {
  return {
    user: userConfig.details,
    trackauditlogs: userConfig?.trackAuditLogData,
  };
};
export default connect(connectStateToProps)(Payouts);