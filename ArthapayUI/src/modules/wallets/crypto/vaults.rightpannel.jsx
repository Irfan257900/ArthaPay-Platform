import React, { useCallback, useEffect, useMemo, useState } from "react";
import AppTabs from "../../../core/shared/tabs";
import { Outlet, useLocation, useNavigate, useParams } from "react-router";
import { useDispatch, useSelector, connect } from "react-redux";
import AppNumber from "../../../core/shared/inputs/appNumber";
import AppDefaults from "../../../utils/app.config";
import {
    setIsSelectionFromRightPanel,
    setLeftPanelRefresh,
    setNetWorks,
    setPayee,
    setSelectedNetWork,
    setWithdrawObj,
    setWithdrawSaveObj,
} from "../../../reducers/vaults.reducer";
import { getWalletsNetworklookup } from "../api/services";
import AppAlert from "../../../core/shared/appAlert";
import RightboxTabs from "../../../core/skeleton/rightboxskel";
import ActionWidgetLoader from "../../../core/skeleton/actionWidgets.loader";
import AppEmpty from "../../../core/shared/appEmpty";
import ViewHeaderLoader from "../../../core/skeleton/view.header";
import RecentActivity from "./recent.transaction";
import { N } from "ethers";
import NumericText from "../../../core/shared/numericText";
const tabsData = [
    { id: "Deposit", name: "Deposit" },
    { id: "Withdraw", name: "Withdraw" }]
const VaultsRightPannel = () => {
    const [loader, setLoader] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [network, setNetwork] = useState(null);
    const params = useParams();
    const { code, mrctid, custid, actionType } = params;
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const selectedVault = useSelector((storeInfo) => storeInfo?.vaultsAccordion?.selectedVault);
    const selectedCoin = useSelector((storeInfo) => storeInfo?.vaultsAccordion?.selectedCoin);
    const selectedNetwork = useSelector((storeInfo) => storeInfo?.withdrawReducer?.selectedNetwork);
    const withdrawDetails = useSelector((store) => store?.withdrawReducer?.withdrawSaveObj);
    const isRefreshLeftPanel = useSelector((storeInfo) => storeInfo?.withdrawReducer?.isleftPanelRefresh);
    const isSelectionFromRightPanel = useSelector(storeInfo => storeInfo?.withdrawReducer?.isSelectionFromRightPanel);
    const Smalldecimals = window.runtimeConfig.VITE_APP_SMALL_DECIMALS_ENABLED
    const isCrypto = useMemo(() => {
        return location?.pathname?.includes('crypto') || false;
    }, [location?.pathname])
    const isWithdraw = useMemo(() => {
        return actionType === 'withdraw'
    }, [actionType])
    const transactionUrl = useMemo(() => {
        return actionType === 'withdraw'
            ? `/api/v1/withdraw/crypto/transactions`
            : `/api/v1/deposit/crypto/transactions`;
    }, [actionType])
    useEffect(() => {
        if (selectedVault && selectedCoin && selectedVault?.id && actionType) {
            fetchNetworkData(!isSelectionFromRightPanel);
        }
    }, [selectedVault, selectedCoin, selectedVault, actionType]);
    useEffect(() => {
        if (isRefreshLeftPanel) { fetchNetworkData(false); dispatch(setLeftPanelRefresh(false)); }
    }, [isRefreshLeftPanel])
    useEffect(() => {
        setNetwork(selectedNetwork);
    }, [selectedNetwork])
    const getScreenName = () => {
        let screenName = '';
        if (isCrypto) {
            screenName = isWithdraw ? 'withdraw' : 'deposit';
        } else {
            screenName = 'fiat';
        }
        return screenName;
    }
    const getNetWorks = (response) => {
        dispatch(setNetWorks(response));
        let _selectedNetwork = response?.find(item => item?.code === withdrawDetails?.network);
        dispatch(setSelectedNetWork(withdrawDetails ? (_selectedNetwork || response?.[0]) : response?.[0]));
        dispatch(setIsSelectionFromRightPanel(false));
    }
    const fetchNetworkData = async (isLoading) => {
        const urlParams = {
            coinCode: selectedCoin?.code,
            merchantId: selectedVault?.id,
            setLoader: setLoader,
            setData: getNetWorks,
            setError: setErrorMsg,
            screenName: getScreenName(),
            isLoading: isLoading
        }
        try {
            await getWalletsNetworklookup(urlParams);

        } catch (error) {
            setErrorMsg("Failed to fetch network data.");
        }
    };
    const handleTabChange = useCallback((selectedTab) => {
        if (selectedTab) {
            navigate(`/wallets/crypto/${selectedTab.name.toLowerCase()}/${selectedCoin?.code}/${mrctid}/${custid}`);
            dispatch(setWithdrawObj(null));
            dispatch(setPayee(null));
            dispatch(setWithdrawSaveObj(null));
        }
    }, [selectedCoin?.code, mrctid, custid])
    return (
        <div className="layout-bg right-panel withdraw-rightpanel min-h-[85vh]">
            {(loader) && (
                <div className="">
                    <ViewHeaderLoader />
                    {actionType === 'deposit' && <RightboxTabs />}
                    {/* {actionType === 'withdraw' && <ActionWidgetLoader />} */}

                </div>
            )}
            {!loader && code === "null" && (
                <div className="nodata-content loader-position">
                    <AppEmpty />
                </div>
            )}
            {!loader && errorMsg !== undefined && errorMsg !== null && (
                <div className="alert-flex withdraw-alert fiat-alert">
                    <AppAlert
                        type="error"
                        description={errorMsg}
                        showIcon
                    />
                    <button className="icon sm alert-close" onClick={() => setErrorMsg(null)}></button>
                </div>
            )}
            {!loader && code !== "null" && (
                <>
                    <div className={`md:flex items-start justify-between space-y-3 ${actionType === "withdraw" ? "border-b-2 border-cryptoline pb-2" : ""
                        }`}>
                        <div className="flex gap-2.5 items-center md:mb-0 mb-2.5">
                            <span><img src={network?.image} alt="Wallet Logo" className="w-10 h-10 rounded-full" /></span>
                            <div>
                                <div className="flex items-baseline">
                                    <NumericText
                                        value={network?.amount}
                                        type="text"
                                        defaultValue={network?.amount}
                                        decimalScale={AppDefaults?.cryptoDecimals}
                                        fixedDecimalScale={true}
                                        thousandSeparator={true}
                                        allowNegative={true}
                                        isdecimalsmall={Smalldecimals === 'true' ? true : false}
                                        className="amount-text text-md font-semibold text-titleColor"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <span className="icon double-nagation"> </span>
                                    <NumericText
                                        value={network?.amountInBase}
                                        type="text"
                                        defaultValue={network?.amountInBase}
                                        prefixText="$"
                                        suffixText=""
                                        decimalScale={AppDefaults?.fiatDecimals}
                                        fixedDecimalScale={true}
                                        thousandSeparator={true}
                                        allowNegative={true}
                                        className="amount-text text-xs font-semibold text-paraColor"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="!mt-0 toggle-btn">
                            <AppTabs
                                tabsData={tabsData}
                                labelKey="name"
                                idKey="id"
                                onTabChange={handleTabChange}
                            />
                        </div>
                    </div>
                </>)}
            <Outlet />
   {code !== "null" && <RecentActivity url={transactionUrl} actionType={actionType} />}
        </div>

    );
};
const mapStateToProps = ({ userConfig }) => {
    return { user: userConfig.details };
};
export default connect(mapStateToProps)(VaultsRightPannel);
