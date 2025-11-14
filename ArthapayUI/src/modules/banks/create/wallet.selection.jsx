import React, { useCallback, useEffect,memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCryptoWallets,
  fetchFiatWallets,
  resetCreateAccountState,
  setSelectedWalletTab,
} from "../../../reducers/banks.reducer";
import AppTabs from "../../../core/shared/appTabs";
import FiatSelection from "./fiat.selection";
import CoinListLoader from "../../../core/skeleton/coinList.loader";
import CryptoSelection from "./crypto.selection";
import { WalletSelectionTabsLoader } from "../../../core/skeleton/banks.loaders";
import VerificationsHandler from "../../../core/verifications.handler";
const tabs = [
  { id: "fiat", name: "Fiat" },
  { id: "crypto", name: "Crypto" },
];
const WalletSelection = () => {
  const dispatch = useDispatch();
  const activeTab = useSelector((store) => store.banks.selectedWalletTab);
  const handleTabChange = useCallback((selectedTab) => {
    dispatch(setSelectedWalletTab(selectedTab));
    if(selectedTab==='fiat'){
      dispatch(fetchFiatWallets());
      dispatch(resetCreateAccountState([
        'cryptoWalletsForAccCreation',
        'selectedCryptoWalletToPay',
        'selectedCryptoCoinToPay',
        'selectedCryptoNetworkToPay',
        'selectedCryptoCoinNetworks',
        'selectedCryptoWalletCoins'
      ]))
    }else{
      dispatch(fetchCryptoWallets());
      dispatch(resetCreateAccountState([
        'fiatWalletsForAccCreation',
        'selectedFiatWalletToPay',
      ]))
    }
  }, []);
  useEffect(() => {
     !activeTab && handleTabChange(tabs[0]?.id);
  }, [activeTab]);
  return (
    <VerificationsHandler loader={<CoinListLoader />}>
      {!activeTab && <div className="mb-4"><WalletSelectionTabsLoader /></div>}
       <div>
        <div className="flex justify-center gap-2">
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
        {activeTab === "crypto" && <CryptoSelection/>}
      </div>
    </VerificationsHandler>
  );
};

export default memo(WalletSelection);
