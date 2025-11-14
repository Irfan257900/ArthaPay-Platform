import React from "react";
import { NumericFormat } from "react-number-format";
import NumericText from "../shared/numericText";

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
      usa: "https://rapidzstoragespacetst.blob.core.windows.net/images/usa.svg",
      euro: "https://rapidzstoragespacetst.blob.core.windows.net/images/euro.svg",
    },
  },
  fastxe: {
    crypto: {
      btc: "https://rapidzstoragespacetst.blob.core.windows.net/images/BTC.svg",
      eth: "https://rapidzstoragespacetst.blob.core.windows.net/images/ETH.svg",
      usdc: "https://rapidzstoragespacetst.blob.core.windows.net/images/usdc-coin.svg",
      tether: "https://rapidzstoragespacetst.blob.core.windows.net/images/usdtclr.svg",
      solona: "https://fastxestoragespacetst.blob.core.windows.net/images/Solana-icon.svg",
    },
    fiat: {
      aed: "https://fastxestoragespacetst.blob.core.windows.net/images/aed.svg",
      briton: "https://rapidzstoragespacetst.blob.core.windows.net/images/briton.svg",
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

const WalletsSection = ({ kpisData }) => {
  const client = window.runtimeConfig.VITE_CLIENT;
  const Smalldecimals = window.runtimeConfig.VITE_APP_SMALL_DECIMALS_ENABLED
  const cryptoBalance = kpisData?.find((record) => record.name === "Crypto Balance");
  const fiatBalance = kpisData?.find((record) => record.name === "Fiat Balance");

  const clientName = window.runtimeConfig.VITE_CLIENT;
  const cryptoValue = cryptoBalance?.value || 0;
  const fiatValue = fiatBalance?.value || 0;
  const totalBalance = cryptoValue + fiatValue;

  const renderIcons = (type) => {
    const list = Object.values(icons[client]?.[type] || {});
    return (
      <div className="flex py-1 px-0 -space-x-2">
        {list?.map((icon, i) => (
          <img
            key={i}
            className="inline-block h-7 w-7 rounded-full"
            src={icon}
            alt={`${type}-${i}`}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="grid grid-cols-2 xl:gap-x-5 xl:gap-y-7 lg:gap-x-3 lg:gap-y-5 mb-4">
        <div>
          <h4 className="bashboard-titles">Total Balance</h4>
          <h5 className="text-2xl md:text-lg lg:text-xl xl:text-3xl xl:leading-10 font-semibold text-subTextColor">
            <NumericText
              value={totalBalance || 0}
              decimalScale={2}
              fixedDecimalScale={true}
              prefixText={'$'}
              thousandSeparator={true}
              displayType={"text"}
              isdecimalsmall={Smalldecimals === 'true' ? true : false}
            />
          </h5>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:gap-x-5 xl:gap-y-7 lg:gap-x-3 lg:gap-y-5 gap-4">
        <div className="kpicardbg space-y-3">
          <div className="flex items-center justify-between md:col-span-2 self-start">
            <h4 className="text-base font-semibold text-kpidarkColor">Crypto</h4>
          </div>
          {renderIcons("crypto")}
          <div className="mt-9 md:mt-0">
            <div className="flex-1 items-center gap-1">
              <h3 className="text-md font-semibold text-dbkpiText">
                <div className="text-md font-semibold text-dbkpiTex items-center">
                  <div className="flex items-center gap-2">
                  </div>
                  <div>
                    <NumericText
                      value={cryptoBalance?.value || 0}
                      prefixText={'$'}
                      thousandSeparator
                      displayType="text"
                      decimalScale={2}
                      fixedDecimalScale
                      isdecimalsmall={Smalldecimals === 'true' ? true : false}
                    />
                  </div>
                </div>
              </h3>
            </div>
          </div>
        </div>
        <div className="kpicardbg grid lg:grid-cols-1 md:grid-cols-1 space-y-3">
          <div className="flex items-center justify-between md:col-span-2 self-start">
            <h4 className="text-base font-semibold text-kpidarkColor">Fiat</h4>
          </div>
          {renderIcons("fiat")}
          <div className="flex items-center gap-1 justify-between md:col-span-2 self-end mt-9 md:mt-0">
            <div className="flex items-center gap-1">
              <h3 className="text-md font-semibold text-dbkpiText">
                <div className="text-md font-semibold text-dbkpiTex flex items-center">
                  <div className="flex items-center gap-2">
                  </div>
                  <div>
                    <NumericText
                      value={fiatBalance?.value || 0}
                      prefixText={'$'}
                      decimalScale={2}
                      fixedDecimalScale={true}
                      thousandSeparator={true}
                      displayType="text"
                      isdecimalsmall={Smalldecimals === 'true' ? true : false}
                    />
                  </div>
                </div>
              </h3>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WalletsSection;
