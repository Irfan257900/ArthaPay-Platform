import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import RecentActivity from "./recentActivity";
import KpiLoader from "../../core/skeleton/kpi.loaders";
import AppDefaults from "../../utils/app.config";
import { fetchGraphDetails } from "../../reducers/vaults.reducer";
import { NumericFormat } from "react-number-format";
import NumericText from "../../core/shared/numericText";

const clientName = window.runtimeConfig.VITE_CLIENT;
const icons = {
  artha: {
    crypto: {
     btc: "https://devtstarthaone.blob.core.windows.net/arthaimages/BTC.svg",
      ethereum: "https://devtstarthaone.blob.core.windows.net/arthaimages/ETH.svg",
      usdc: "https://devtstarthaone.blob.core.windows.net/arthaimages/usdc-coin.svg",
      tether: "https://devtstarthaone.blob.core.windows.net/arthaimages/usdtclr.svg",
    },
    fiat: {
       britain: "https://rapidzstoragespacetst.blob.core.windows.net/images/briton.svg",
      // switzerland: "https://devdottstoragespace.blob.core.windows.net/arthaimages/switzerland.svg",
      usa: "https://rapidzstoragespacetst.blob.core.windows.net/images/usa.svg",
     euro: "https://rapidzstoragespacetst.blob.core.windows.net/images/euro.svg",
    },
  },
    paybase: {
    crypto: {
     btc: "https://devtstarthaone.blob.core.windows.net/arthaimages/BTC.svg",
      ethereum: "https://devtstarthaone.blob.core.windows.net/arthaimages/ETH.svg",
      usdc: "https://devtstarthaone.blob.core.windows.net/arthaimages/usdc-coin.svg",
      tether: "https://devtstarthaone.blob.core.windows.net/arthaimages/usdtclr.svg",
    },
    fiat: {
       britain: "https://rapidzstoragespacetst.blob.core.windows.net/images/briton.svg",
      // switzerland: "https://devdottstoragespace.blob.core.windows.net/arthaimages/switzerland.svg",
      usa: "https://rapidzstoragespacetst.blob.core.windows.net/images/usa.svg",
     euro: "https://rapidzstoragespacetst.blob.core.windows.net/images/euro.svg",
    },
  },
  fastxe: {
    crypto: {
      btc: "https://rapidzstoragespacetst.blob.core.windows.net/images/BTC.svg",
      eth: "https://rapidzstoragespacetst.blob.core.windows.net/images/ETH.svg",
      // usdc: "https://devdottstoragespace.blob.core.windows.net/arthaimages/usdc-coin.svg",
      // tether: "https://devdottstoragespace.blob.core.windows.net/arthaimages/usdtclr.svg",
      usdc: "https://rapidzstoragespacetst.blob.core.windows.net/images/usdc-coin.svg",
      tether: "https://rapidzstoragespacetst.blob.core.windows.net/images/usdtclr.svg",
      solona: "https://fastxestoragespacetst.blob.core.windows.net/images/Solana-icon.svg",
    },
    fiat: {
      aed: "https://fastxestoragespacetst.blob.core.windows.net/images/aed.svg",
      briton: "https://rapidzstoragespacetst.blob.core.windows.net/images/briton.svg",
      // usa: "https://devdottstoragespace.blob.core.windows.net/arthaimages/usa.svg",
      // euro: "https://devdottstoragespace.blob.core.windows.net/arthaimages/euro.svg",
      usa: "https://rapidzstoragespacetst.blob.core.windows.net/images/usa.svg",
      euro: "https://rapidzstoragespacetst.blob.core.windows.net/images/euro.svg",
    },
  },
  rapidz: {
    crypto: {
      myrc: "https://rapidzstoragespacetst.blob.core.windows.net/images/MYRC.svg",
      xsgd: "https://rapidzstoragespacetst.blob.core.windows.net/images/XSGD.svg",
      usdc: "https://rapidzstoragespacetst.blob.core.windows.net/images/usdc-coin.svg",
      tether: "https://rapidzstoragespacetst.blob.core.windows.net/images/usdtclr.svg",
    },
    fiat: {
      britain: "https://rapidzstoragespacetst.blob.core.windows.net/images/briton.svg",
      idr: "https://rapidzstoragespacetst.blob.core.windows.net/images/indonesia - Icon.svg",
      usa: "https://rapidzstoragespacetst.blob.core.windows.net/images/usa.svg",
      euro: "https://rapidzstoragespacetst.blob.core.windows.net/images/euro.svg",
    },
  },
};

const VaultsKpis = () => {
  const { loading, data } = useSelector((state) => state.withdrawReducer.kpis);
  const dispatch = useDispatch();
  const Smalldecimals = window.runtimeConfig.VITE_APP_SMALL_DECIMALS_ENABLED
    const permissions = useSelector((state) => state.userConfig.permissions);  
    const screenTabs = useMemo(() => {
      return permissions?.permissions?.["tabs"]?.filter(tab=>tab.isEnabled) || [];
    }, [permissions]);
  useEffect(() => {
    if (!data || data.length === 0) {
      dispatch(fetchGraphDetails());
    }
  }, [dispatch, data]);

  const renderKpiImages = (name) => {
    const client = window.runtimeConfig.VITE_CLIENT;

    if (name === "Crypto Balance") {
      const cryptoIcons = Object.values(icons[client]?.crypto || {});
      return (
        <div className="flex py-1 px-0 -space-x-2">
          {cryptoIcons.map((icon, index) => (
            <img
              key={index}
              className="inline-block h-7 w-7 rounded-full"
              src={icon}
              alt={`crypto-${index}`}
            />
          ))}
        </div>
      );
    } else if (name === "Fiat Balance") {
      const fiatIcons = Object?.values(icons[client]?.fiat || {});
      return (
        <div className="flex overflow-hidden py-1 px-0 -space-x-2">
          {fiatIcons.map((icon, index) => (
            <img
              key={index}
              className="inline-block h-7 w-7 rounded-full"
              src={icon}
              alt={`fiat-${index}`}
            />
          ))}
        </div>
      );
    }
    return null;
  };
  const filteredKpis = useMemo(() => {
    return data?.filter(kpi => {
      if (kpi?.name === "Crypto Balance" && screenTabs?.some(tab => tab?.name === "Crypto" && tab?.isEnabled)) {
        return true;
      }
      if (kpi?.name === "Fiat Balance" && screenTabs?.some(tab => tab?.name === "Fiat" && tab?.isEnabled)) {
        return true;
      }
      return false;
    });
  }, [data, screenTabs]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:gap-5 xxl:gap-5 xl:gap-4 gap-4 mb-5">
      {loading && <KpiLoader itemCount={3} />}

      {!loading &&
        filteredKpis?.map((kpi) => (
          <div key={kpi.name} className="kpicardbg space-y-3">
            <div className="flex items-center justify-between md:col-span-2 self-start">
              <h4 className="text-base font-semibold text-titleColor">
                {kpi.name}
              </h4>
            </div>

            <div className="items-center flex justify-between">
              {renderKpiImages(kpi?.name)}
            </div>
            <div className="text-md font-semibold text-dbkpiText flex items-center">
              <div className="flex items-center gap-2">
                {/* {clientName === 'fastxe' && <p className="w-9 h-9 rounded-full flex justify-center items-center bg-primaryColor">
                  <span className="w-6 h-6 rounded-full flex justify-center items-center border-2 border-lightDark font-semibold text-lightDark text-base">
                    $
                  </span>
                </p>} */}
              </div>
              <div className="flex items-center gap-1 justify-between md:col-span-2 self-end mt-9 md:mt-0 ">
                <div>

                  <NumericText
                    prefixText={'$'}
                    value={kpi?.value || 0}
                    decimalScale={AppDefaults?.fiatDecimals}
                    fixedDecimalScale={true}
                    thousandSeparator
                    displayType="text"
                    isdecimalsmall={Smalldecimals === 'true' ? true : false}
                  />

                </div>
              </div>
            </div>
          </div>
        ))}

      {!loading && <RecentActivity />}
    </div>
  );
};

export default VaultsKpis;
