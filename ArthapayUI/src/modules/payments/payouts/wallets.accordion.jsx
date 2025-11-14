import React, { useCallback, useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { Collapse } from "antd";
import {
    fetchVaults,
    setSelectedCryptoCoin,
    setSelectedCryptoVault,
    setSelectedFiatCoin,
    setSelectedFiatVault,
    setSelectedRightFormCryptoVault,
    setSelectedRightFormFiatVault
} from "./payout.accordion.reducer";
import { useNavigate, useParams } from "react-router";
import AppNumber from "../../../core/shared/appNumber";
import CoinList from "../../../core/shared/coinList";
import AppAlert from "../../../core/shared/appAlert";
import AppDefaults, { fiatCurrencySymbols } from "../../../utils/app.config";
import { getwalletsTotalBalance } from "../httpServices";
import { setCryptoDetails, setFormData, setIsNextStep, setLeftPanelRefresh, setRefreshRecentTransaction } from "../reducers/payout.reducer";
import numberFormatter from "../../../utils/numberFormatter";
import SingleBarLoader from "../../../core/skeleton/bar.loader";
import darknoData from '../../../assets/images/dark-no-data.svg';
import lightnoData from '../../../assets/images/light-no-data.svg';
import NumericText from "../../../core/shared/numericText";

const { Panel } = Collapse;

const fields = {
    currencyCode: 'code',
    currencyFullName: 'walletName',
    amount: 'amount',
    percentage: 'percentage',
    showTradebtn: false,
    istradeText: true,
    logo: 'logo',
    coinName: 'code'
};

const Smalldecimals = window.runtimeConfig.VITE_APP_SMALL_DECIMALS_ENABLED;
const payinFiatDisable = window.runtimeConfig.VITE_APP_IS_SHOW_PAYIN_FIAT;

const isPayinFiatDisabled = payinFiatDisable === "true" || payinFiatDisable === true;

const WalletsAccordion = (props) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currencyType } = useParams();

    const [errorMsg, setErrorMsg] = useState(null);
    const [loader, setLoader] = useState(false);
    const [balance, setBalance] = useState([]);

    const isRefreshLeftPanel = useSelector((state) => state.payoutReducer.isLeftPanelRefresh);
    const isNextStep = useSelector((state) => state.payoutReducer.isNextStep);
    const payoutSummary = useSelector((state) => state.payoutReducer);

    const vaults = useSelector((state) => state.payoutAccordianReducer.vaults);
    const selectedFiatVault = useSelector((state) => state.payoutAccordianReducer.selectedFiatVault);
    const selectedFiatCoin = useSelector((state) => state.payoutAccordianReducer.selectedFiatCoin);
    const selectedCryptoVault = useSelector((state) => state.payoutAccordianReducer.selectedCryptoVault);
    const selectedCryptoCoin = useSelector((state) => state.payoutAccordianReducer.selectedCryptoCoin);

    const selectedVault = currencyType === "fiat" ? selectedFiatVault : selectedCryptoVault;
    const selectedCoin = currencyType === "fiat" ? selectedFiatCoin : selectedCryptoCoin;
    const screenTypeName = currencyType === "fiat" ? 'payoutfiat' : 'payoutcrypto'

    const userProfile = useSelector(
        (store) => store.userConfig.details || {}
    );

    const getScreenName = () => (currencyType !== "fiat" ? "payoutcrypto" : isPayinFiatDisabled ? 'payoutcrypto' : "payoutfiat");


    const truncateDecimals = (num, decimals) => {
        const factor = Math.pow(10, decimals);
        return Math.floor(num * factor) / factor;
    };

    const getBalanceText = (amount, currencyType) => {
        if (!amount || isNaN(amount)) {
            return currencyType === "fiat" ? "0.00" : "0.0000";
        }
        const { number, suffix } = numberFormatter(amount);
        const decimalPlaces = currencyType === "fiat" ? 2 : 4;
        const truncatedNumber = truncateDecimals(number, decimalPlaces);
        return (
            truncatedNumber.toLocaleString(undefined, {
                minimumFractionDigits: decimalPlaces,
                maximumFractionDigits: decimalPlaces,
            }) + (suffix || "")
        );
    };


    const getBalanceInKsMs = (amount, isSuffix, isOnlyAmount, type) => {
        if ((!amount || isNaN(amount)) && type === 'payin') {
            return '';
        }
        if (typeof amount !== 'number' || isNaN(amount)) return '';

        const { number, suffix } = numberFormatter(amount) || {};
        const formattedNumber = (number ?? 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        if (isSuffix) {
            return `${suffix || ""}`;
        }
        if (isOnlyAmount) {
            return `${formattedNumber}`;
        }
        return `${'$ ' || suffix}${formattedNumber}`;
    };


    //-- Fetch vaults when component loads / refresh
    useEffect(() => {
        if (props?.userConfig?.id && currencyType) {
            dispatch(fetchVaults({ screenName: getScreenName() }));
            getTotalBalance(true);
            setErrorMsg(null);
        }
        return () => {
            // cleanup selections
            dispatch(setSelectedCryptoVault(null));
            dispatch(setSelectedRightFormCryptoVault(null));
            dispatch(setSelectedCryptoCoin(null));
            dispatch(setSelectedFiatVault(null));
            dispatch(setSelectedRightFormFiatVault(null));
            dispatch(setSelectedFiatCoin(null));
        };
    }, [props?.userConfig?.id, currencyType]);

    useEffect(() => {
        if (isRefreshLeftPanel) {
            dispatch(setLeftPanelRefresh(false));
            getTotalBalance(false);
            dispatch(fetchVaults({ screenName: getScreenName() }));
        }
    }, [isRefreshLeftPanel]);

    //-- When vaults update, preselect first
    useEffect(() => {
        if (Array.isArray(vaults?.data) && vaults.data.length > 0) {
            onVaultChange(vaults.data[0]); // crypto
        } else if (vaults?.data && vaults.data.details?.length > 0) {
            onVaultChange(vaults.data); // fiat
        }
    }, [vaults, currencyType]);



    const onVaultChange = (vaultToSelect) => {
        if (currencyType === "fiat") {
            dispatch(setSelectedFiatVault(vaultToSelect));
            if (vaultToSelect) {
                dispatch(setSelectedRightFormFiatVault(vaultToSelect));
            }
            if (props.canSelectCoin) {
                // pick the first coin from details array as default
                const coinToSelect = vaultToSelect?.details?.[0] || null;
                dispatch(setSelectedFiatCoin(coinToSelect));
            }
        } else {
            dispatch(setSelectedCryptoVault(vaultToSelect));
            if (vaultToSelect) {
                dispatch(setSelectedRightFormCryptoVault(vaultToSelect));
            }
            if (props.canSelectCoin) {
                // pick the first coin from details array as default
                const coinToSelect = vaultToSelect?.details?.[0] || null;
                dispatch(setSelectedCryptoCoin(coinToSelect));
            }
        }
    };


    const onCoinSelection = (coin) => {
        dispatch(setCryptoDetails({ uploaddocuments: null }));
        if (currencyType === "fiat") {
            dispatch(setSelectedFiatCoin(coin));
        } else {
            dispatch(setSelectedCryptoCoin(coin));
        }
        props.setState?.({ type: "setSelectedCoin", payload: coin });

        const getPayoutUrl = () => {
            const baseUrl = "/payments/payouts/payout";
            const merchantPath = isNextStep
                ? `${payoutSummary?.merchantId}/${payoutSummary?.merchantName}`
                : AppDefaults.GUID_ID;
            const actionPath = isNextStep
                ? `/success/${currencyType?.toLowerCase()}`
                : `/new/add/${currencyType?.toLowerCase()}`;
            return `${baseUrl}/${merchantPath}${actionPath}`;
        };

        if (props?.onCoinSelection) {
            navigate(getPayoutUrl());
            dispatch(setIsNextStep(false));
        }
    };

    const getTotalBalance = async (isLoading) => {
        await getwalletsTotalBalance(setLoader, setBalance, setErrorMsg, isLoading, getScreenName);
    };

    const refresh = () => {
        dispatch(setRefreshRecentTransaction(true))
        dispatch(setSelectedFiatVault(null));
        // dispatch(setSelectedFiatCoin(null));
        dispatch(setSelectedCryptoVault(null));
        dispatch(setSelectedCryptoCoin(null));
        dispatch(setFormData(null));
        dispatch(setCryptoDetails(null));
        getTotalBalance(true);
        dispatch(fetchVaults({ screenName: getScreenName() }));
    };

    const handlePanelChange = useCallback((key) => {
        if (key?.length <= 0) {
            return;
        }
        if (Array.isArray(vaults?.data)) {
            const vaultToSelect = vaults.data.find((v) => v.id === key[0]);
            onVaultChange(vaultToSelect);
        }
    }, [vaults]);
    
    return (
        <div className={`${props.customClass || ''}`}>
            {/* error msg */}
            {errorMsg && (
                <div className="alert-flex w-full">
                    <AppAlert type="warning" description={errorMsg} showIcon />
                    <button className="icon sm alert-close" onClick={() => setErrorMsg(null)}></button>
                </div>
            )}

            {/* total balance */}
            {(balance && !loader) && (
                <div className="custom-flex p-3 mb-3">
                    <div>
                        <h1 className="text-base font-semibold text-titleColor">Total Amount</h1>
                        <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-subTextColor text-3xl">
                                <NumericText
                                    value={getBalanceInKsMs(balance?.amountInUsd, false, true)}
                                    decimalScale={AppDefaults?.fiatDecimals}
                                    fixedDecimals={true}
                                    prefixText={fiatCurrencySymbols[userProfile?.currency]}
                                    suffixText={getBalanceInKsMs(balance?.amountInUsd, true, false)}
                                    isdecimalsmall={Smalldecimals === 'true' ? true : false}
                                />
                            </span>
                            <span className="icon refresh cursor-pointer" onClick={refresh} />
                        </div>
                    </div>
                </div>
            )}

            {/* vault errors */}
            {vaults?.error && (
                <div className="alert-flex w-full">
                    <AppAlert type="warning" description={vaults?.error} showIcon />
                </div>
            )}

            {loader && <SingleBarLoader />}

            {/* ✅ Fiat rendering (single vault object) */}
            {!vaults?.loader && vaults?.data && !Array.isArray(vaults.data) && (
                <div className="vaults-list">
                    {vaults.data.details?.length > 0 ? (
                        <CoinList
                            screenName={screenTypeName}
                            currencyType={currencyType}
                            coinSearch={true}
                            coinList={vaults.data.details || []}
                            coinFields={fields}
                            cryptoCoin={selectedCoin?.code}
                            isCrypto={false}
                            selectCoin={props.canSelectCoin ? onCoinSelection : null}
                        />
                    ) : (
                        <div className="nodata-content loader-position">
                            <div className="no-data">
                                <img src={darknoData} width={"100px"} alt="" className="dark:block hidden" />
                                <img src={lightnoData} width={"100px"} alt="" className="dark:hidden block" />
                                <p className="text-lightWhite text-sm font-medium mt-3">No Data Found</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
            {/* ✅ Crypto rendering: Show flat coin list for one vault, accordion for more than one */}
            {!(vaults?.loader || !Array.isArray(vaults?.data)) &&
                (vaults.data.length === 1 ? (
                    <div className="vaults-list">
                        <CoinList
                            screenName="payout"
                            coinSearch={true}
                            coinList={vaults.data[0].details || []}
                            coinFields={fields}
                            cryptoCoin={selectedCoin?.code}
                            isCrypto={true}
                            selectCoin={props.canSelectCoin ? onCoinSelection : null}
                            currencyType={currencyType}
                        />
                    </div>
                ) : vaults.data.length > 1 ? (
                    <Collapse
                        accordion
                        activeKey={selectedVault?.id}
                        onChange={handlePanelChange}
                        className="custom-collapse vault-crypto-list"
                    >
                        {vaults.data.map((vault) => (
                            <Panel
                                key={vault.id}
                                className="vault-accordion blue-gradient"
                                header={
                                    <div className="flex items-center justify-between gap-1">
                                        <p className="md:w-[120px] break-words" title={vault.name}>
                                            {vault.name}
                                        </p>
                                        <div className="flex items-center">
                                            <AppNumber
                                                value={vault?.totalInBaseAmount}
                                                prefix="$"
                                                decimalScale={AppDefaults.fiatDecimals}
                                                fixedDecimalScale={true}
                                                thousandSeparator={true}
                                                className="amount-text"
                                            />
                                        </div>
                                    </div>
                                }
                            >
                                <CoinList
                                    screenName="payout"
                                    coinSearch={true}
                                    coinList={vault.details || []}
                                    coinFields={fields}
                                    cryptoCoin={selectedCoin?.code}
                                    isCrypto={true}
                                    selectCoin={props.canSelectCoin ? onCoinSelection : null}
                                    currencyType={currencyType}
                                />
                            </Panel>
                        ))}
                    </Collapse>
                ) : (
                    <div className="nodata-content loader-position">
                        <div className="no-data">
                            <img src={darknoData} width="100px" alt="" className="dark:block hidden" />
                            <img src={lightnoData} width="100px" alt="" className="dark:hidden block" />
                            <p className="text-lightWhite text-sm font-medium mt-3">No Data Found</p>
                        </div>
                    </div>
                ))
            }

        </div>
    );
};

WalletsAccordion.propTypes = {
    userConfig: PropTypes.object,
    vaults: PropTypes.object,
    customClass: PropTypes.string,
    canSelectCoin: PropTypes.bool,
    setState: PropTypes.func,
    onCoinSelection: PropTypes.bool
};

const connectStateToProps = ({ userConfig }) => ({
    userConfig: userConfig.details
});

export default connect(connectStateToProps)(WalletsAccordion);
