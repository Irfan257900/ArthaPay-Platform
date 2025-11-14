import React, { useCallback, useEffect, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearErrorMessage, fetchCryptoWallets, fetchFiatWallets, setSelectedCryptoWalletToPay, setSelectedFiatWalletToPay, setSelectedWalletTab } from "../../../reducers/banks.reducer";
import CoinListLoader from "../../../core/skeleton/coinList.loader";
import { WalletSelectionTabsLoader } from "../../../core/skeleton/banks.loaders";
import FiatSelection from "./fiat.selection";
import CryptoSelection from "./crypto.selection";
import VerificationsHandler from "../../../core/verifications.handler";
import AppTabs from "../../../core/shared/appTabs";
const tabs = [
    { id: "fiat", name: "Fiat" },
    { id: "crypto", name: "Crypto" },
];
let screen = "bank"
const WalletSelection = () => {
    const dispatch = useDispatch();
    const activeTab = useSelector((store) => store.banks.selectedWalletTab);
    const handleTabChange = useCallback((selectedTab) => {
        dispatch(setSelectedWalletTab(selectedTab));
        if (selectedTab === 'fiat') {
            dispatch(fetchFiatWallets());
        } else {
            dispatch(fetchCryptoWallets());
        }
        dispatch(clearErrorMessage(['fiatWalletsForAccCreation']));
        dispatch(clearErrorMessage(['cryptoWalletsForAccCreation']));
        dispatch(clearErrorMessage(['summaryForAccountCreation']));
        dispatch(setSelectedFiatWalletToPay(null));
        dispatch(setSelectedCryptoWalletToPay(null));
    }, []);
    useEffect(() => {
        !activeTab && handleTabChange(tabs[0]?.id);
    }, [activeTab]);


    return (
        <VerificationsHandler loader={<CoinListLoader />}>
            {!activeTab && <div className="mb-4"><WalletSelectionTabsLoader /></div>}
            <div>
                <div className="flex justify-end gap-2 mt-4">
                    <div className="!mt-0 toggle-btn">
                        <AppTabs
                            list={tabs}
                            itemFields={{ title: "name", key: "id" }}
                            onChange={handleTabChange}
                            activeKey={activeTab}
                            className="custom-crypto-tabs"
                        />
                    </div>
                </div>
                {activeTab === "fiat" && <FiatSelection />}
                {activeTab === "crypto" && <CryptoSelection screen={screen} />}
            </div>
        </VerificationsHandler>
    );
};

export default memo(WalletSelection);
