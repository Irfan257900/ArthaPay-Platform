import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { Collapse, } from "antd";
import ManageVault from "./vault.manage";
import {
  fetchVaults,
  setSelectedCoin,
  setSelectedVault,
  setVaults,
} from "./vaultAccordianReducer";
import { useLocation, useNavigate, useParams } from "react-router";
import AppEmpty from "../../core/shared/appEmpty";
import AppNumber from "../../core/shared/inputs/appNumber";
import CoinList from "../../core/shared/coinList";
import AppAlert from "../../core/shared/appAlert";
import AppDefaults from "../../utils/app.config";

import {
  setPayee,
  setLeftPanelRefresh,
  setWithdrawObj,
  setIsNextStep,
  setWithdrawSaveObj,
  setSelectedNetWork,
  setTransactionGridRefresh,

} from "../../reducers/vaults.reducer";
import ListLoader from "../../core/skeleton/common.page.loader/list.loader";
import SingleBarLoader from "../../core/skeleton/bar.loader";
import numberFormatter from "../../utils/numberFormatter";
import { useTranslation } from "react-i18next";
import { selectTab } from "./service";
import ScreenTabs from "../../core/shared/screenTabs";
import VaultsActions from "./vaultsTabs";
import NumericText from "../../core/shared/numericText";
const fields = {
  currencyCode: "code",
  currencyFullName: "walletName",
  amount: "amount",
  percentage: "percentage",
  showTradebtn: false,
  istradeText: true,
  logo: "image",
  coinName: "name",
};
const { Panel } = Collapse;

// const getBalanceText = (amount) => {
//   if (typeof amount !== 'number' || isNaN(amount)) return '0.00';

//   const { number, suffix } = numberFormatter(amount) || {};
//   const formattedNumber = (number ?? 0).toLocaleString(undefined, {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   });

//   return `${formattedNumber}${suffix || ''}`;
// };

const MerchantComponent = (props) => {
  const navigate = useNavigate();
  const params = useParams();
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const [modal, setModal] = useState("");
  const [vaultToEdit, setVaultToEdit] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [vault, setVault] = useState(null);
  const loader = false;
  const [isCrypto, success] = useMemo(() => {
    return [pathname?.includes("crypto"), pathname?.includes("success")]
  }, [pathname])
  const isWithdraw = useMemo(() => {
    return params?.actionType?.includes("withdraw");
  }, [params?.actionType])
  const isRefreshLeftPanel = useSelector(
    (storeInfo) => storeInfo?.withdrawReducer?.isleftPanelRefresh
  );
  const isNextStep = useSelector(
    (storeInfo) => storeInfo?.withdrawReducer?.isNextStep
  );
  const vaults = useMemo(() => props.vaults, [props.vaults]);
  const selectedVault = useMemo(
    () => props.selectedVault,
    [props.selectedVault]
  );
  const selectedCoin = useSelector(
    (storeInfo) => storeInfo?.vaultsAccordion?.selectedCoin
  );

  const Smalldecimals = window.runtimeConfig.VITE_APP_SMALL_DECIMALS_ENABLED
  useEffect(() => {
    if (!vaults?.data?.wallets) return;

    const vaultId = params.mrctid !== "null" && params.mrctid !== "undefined"
      ? params.mrctid
      : null;
    const coinCode = params.code !== "null" && params.code !== "undefined"
      ? params.code
      : null;

    props.dispatch(setSelectedVault(null));
    props.dispatch(setSelectedCoin(null));

    if (vaultId && coinCode) {
      const vaultToSelect = vaults.data.wallets.find(v => v.id === vaultId);
      if (vaultToSelect) {
        const coinToSelect = vaultToSelect.assets?.find(a => a.code === coinCode);
        if (coinToSelect) {
          props.dispatch(setSelectedVault(vaultToSelect));
          props.dispatch(setSelectedCoin(coinToSelect));
          return;
        }
      }
    }

    if (vaults.data.wallets.length > 0) {
      const firstVault = vaults.data.wallets[0];
      if (firstVault?.assets?.length > 0) {
        props.dispatch(setSelectedVault(firstVault));
        props.dispatch(setSelectedCoin(firstVault.assets[0]));
        setVault(firstVault);
        return;
      }
    }
    navigate(`/wallets/crypto/null/null/null/${props?.userConfig?.id}`);
  }, [vaults.data, params.mrctid, params.code]);

  useEffect(() => {
    if (props?.selectedVault?.id && props?.selectedCoin?.code) {
      onCryptoSelection(selectedCoin);
    }
  }, [props?.selectedVault, params?.code, props?.selectedCoin?.code]);

  const getScreenName = useCallback(() => {
    let screenName = "fiat"; // Default value

    if (isCrypto) {
      screenName = "crypto";
    }

    return screenName;
  }, [isCrypto, isWithdraw])

  useEffect(() => {
    props.dispatch(fetchVaults(getScreenName(), true));
    return () => {
      props.dispatch(setVaults());
      props.dispatch(setSelectedCoin(null));
      props.dispatch(setSelectedVault(null));
    };
  }, []);

  const getBalanceText = (amount, isSuffix, isOnlyAmount) => {
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




  useEffect(() => {
    if (isRefreshLeftPanel) {
      dispatch(setLeftPanelRefresh(false));
      props.dispatch(fetchVaults(getScreenName(), true));

    }
  }, [isRefreshLeftPanel]);

  const onModalClose = useCallback(() => {
    setVaultToEdit(null);
    setModal("");
  }, []);
  const handleAddClick = useCallback(() => {
    setModal("add");
  }, []);

  const onVaultChange = (vaultToSelect) => {
    props.dispatch(setSelectedVault(vaultToSelect));
    setVault(vaultToSelect);
    if (props.canSelectCoin) {
      const coinToSelect = vaultToSelect?.assets?.[0];
      props.dispatch(setSelectedCoin(selectedCoin || coinToSelect));
      if (!success) {
        onCryptoSelection(coinToSelect);
      }
    }
  };


  const onVaultSave = useCallback(() => {
    props.dispatch(fetchVaults(getScreenName(), true));
    onModalClose();
  }, [getScreenName]);


  const handlePanelChange = useCallback(
    (key) => {
      if (!props.clearOnPanelClose && !key) {
        return;
      }
      const vaultToSelect = vaults.data?.wallets?.find((vault) => vault.id === key[0]);
      if (selectedVault?.id === vaultToSelect?.id || !vaultToSelect) {
        setVault(vaultToSelect);
      } else {
        onVaultChange(vaultToSelect);
      }
    },
    [vaults, selectedVault]
  );

  let action = "deposit"; // Default action
  if (isWithdraw) {
    action = "withdraw";
  }
  const onCryptoSelection = (coin) => {
    if (
      coin?.code &&
      props?.selectedVault?.id &&
      props?.userConfig?.id &&
      pathname.includes('wallets')
    ) {
      const { code } = coin;
      const customerId = props?.userConfig?.id;
      const merchantId = props?.selectedVault?.id;
      const route = isNextStep
        ? `/wallets/crypto/${action}/${code}/${merchantId}/${customerId}/success`
        : `/wallets/crypto/${action}/${code}/${merchantId}/${customerId}`;
      dispatch(setIsNextStep(false));
      navigate(route);
    }
    props.dispatch(setSelectedCoin(coin));
    dispatch(setWithdrawObj(null));
    dispatch(setPayee(null));
  };

  const refresh = () => {
    props.dispatch(setVaults());
    props.dispatch(setSelectedCoin());
    props.dispatch(setSelectedVault());
    dispatch(setTransactionGridRefresh(true));
    dispatch(setWithdrawObj(null));
    dispatch(setWithdrawSaveObj(null));
    dispatch(setSelectedNetWork(null));
    props.dispatch(fetchVaults(getScreenName(), true));
  };
  const handleTabChanging = useCallback((selectedTab) => {
    if (selectedTab === "Fiat") {
      navigate(`/wallets/fiat`);
    }
  }, []);

  return (
    <>
      <div className={`${props.customClass || ""}`}>
        {errorMsg && (
          <div className="px-4">
            <div className="alert-flex" style={{ width: "100%" }}>
              <AppAlert
                className="w-100"
                type="warning"
                description={errorMsg}
                showIcon
              />
              <button
                className="icon sm alert-close"
                onClick={() => setErrorMsg(null)}
              ></button>
            </div>
          </div>
        )}
        <div className="flex justify-between items-center p-3 ">
          <div className=" toggle-btn custom-tabs !mb-0 ">
            <ScreenTabs
              onChange={handleTabChanging}
              activeKey={selectTab}
              className="custom-crypto-tabs "
            />
          </div>
          <VaultsActions
            screen="Crypto"
            vaults={vaults}
            handleAddClick={handleAddClick}
          />
        </div>
        <div className={`vaults-header ${vaults?.data?.wallets?.length === 1 ? "px-4" : "p-4"}`}>
          <h1 className="text-base font-semibold text-titleColor mb-0">
            {t("vault.vaultscrypto.totalAmount")}
          </h1>
                  {!vaults?.loader &&  (

          <div className="flex gap-1">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-subTextColor text-3xl">
                {/* $ {
                (vaults?.data?.totalInBaseAmount)} */}

                <NumericText
                  value={getBalanceText(vaults?.data?.totalInBaseAmount, false, true) || 0}
                  decimalScale={AppDefaults.fiatDecimals}
                  thousandSeparator
                  className="block"
                  displayType="text"
                  isdecimalsmall={Smalldecimals === 'true' ? true : false}
                  prefixText={"$"}
                  suffixText={getBalanceText(vaults?.data?.totalInBaseAmount, true, false)}
                />
              </span>
              <span
                className="icon refresh cursor-pointer"
                onClick={refresh}
              />
            </div>
          </div>
)}
        </div>
        {vaults?.loader && <ListLoader />}
        {vaults?.error && (
          <div className="px-4">
            <div className="alert-flex" style={{ width: "100%" }}>
              <AppAlert
                className="w-100"
                type="warning"
                description={vaults?.error}
                showIcon
              />
            </div>
          </div>
        )}
        {loader && <SingleBarLoader />}

        {!vaults?.loader && vaults?.data?.wallets?.length === 1 && (
          <div className="vaults-list">
            <div className="">
              <div className="vaults-list">
                <CoinList
                  coinSearch={true}
                  coinList={vaults.data.wallets[0]?.assets || []}
                  coinFields={fields}
                  cryptoCoin={props?.selectedCoin?.code}
                  isCrypto={true}
                  selectCoin={props?.canSelectCoin ? onCryptoSelection : null}
                  handleListModalClose = {props?.handleListModalClose}
                />
              </div>
            </div>
          </div>
        )}

        {!vaults?.loader && vaults?.data?.wallets?.length > 1 && (
          <Collapse
            accordion
            activeKey={vault?.id}
            onChange={handlePanelChange}
            className="custom-collapse vault-crypto-list"
          >
            {vaults?.data?.wallets.map((vault) => (
              <Panel
                className="vault-accordion blue-gradient"
                header={
                  <div className="flex items-center justify-between flex1 gap-2 mr-1.5">
                    <p className="md:w-[130px]" title={vault?.name}>{`${vault?.name.length > 31
                      ? vault?.name.slice(0, 31) + "..."
                      : vault?.name
                      }`}</p>
                    <div className="flex items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-lightWhite">
                          <NumericText
                            value={vault?.totalBalanceInUsd}
                            type="text"
                            defaultValue={vault?.totalBalanceInUsd}
                            prefixText="$"
                            suffixText=""
                            decimalScale={AppDefaults?.fiatDecimals}
                            fixedDecimalScale={true}
                            thousandSeparator={true}
                            allowNegative={true}
                            className="amount-text"
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                }
                key={vault?.id}
              >
                <div className="vaults-list">
                  <CoinList
                    coinSearch={true}
                    coinList={selectedVault?.assets || []}
                    coinFields={fields}
                    cryptoCoin={props?.selectedCoin?.code}
                    isCrypto={true}
                    selectCoin={props?.canSelectCoin ? onCryptoSelection : null}
                    handleListModalClose={props?.handleListModalClose}
                  />
                </div>
              </Panel>
            ))}
          </Collapse>
        )}

        {!vaults?.loader && vaults?.data?.wallets?.length === 0 && (
          <div className="nodata-content loader-position">
            <AppEmpty />
          </div>
        )}
      </div>
      {modal && (
        <ManageVault
          isOpen={modal !== ""}
          data={vaultToEdit}
          onSave={onVaultSave}
          onClose={onModalClose}
          mode={modal}
          onUpgrade={onModalClose}
        />
      )}
    </>
  );
};
const connectStateToProps = ({ vaultsAccordion, userConfig }) => {
  return {
    userConfig: userConfig.details,
    vaults: vaultsAccordion?.vaults,
    selectedVault: vaultsAccordion?.selectedVault,
    selectedCoin: vaultsAccordion?.selectedCoin,
  };
};
const connectDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};
MerchantComponent.propTypes = {
  userConfig: PropTypes.object,
  vaults: PropTypes.object,
  dispatch: PropTypes.func,
  customClass: PropTypes.string,
  selectedVault: PropTypes.object,
  canAdd: PropTypes.bool,
  canEdit: PropTypes.bool,
  canSelectCoin: PropTypes.bool | undefined,
  clearOnPanelClose: PropTypes.bool | undefined,
};
export default connect(
  connectStateToProps,
  connectDispatchToProps
)(MerchantComponent);