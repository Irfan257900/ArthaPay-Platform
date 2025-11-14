import React from "react";
import { NumericFormat } from "react-number-format";

const TotalBalanceSection = ({ totalBalance }) => {
  return (
    <div className="kpicardbg p-5 rounded-lg">
      <h4 className="text-lg font-semibold text-titleColor">Total Balance</h4>
      <h5 className="text-2xl font-bold text-subTextColor">
        <NumericFormat
          value={totalBalance || 0}
          decimalScale={2}
          fixedDecimalScale={true}
          prefix="$ "
          thousandSeparator={true}
          displayType={"text"}
        />
      </h5>
      <div className="items-center flex justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex  py-1 px-0 -space-x-2">
            <img
              className="inline-block h-7 w-7 rounded-full"
              src="https://devtstarthaone.blob.core.windows.net/arthaimages/BTC.svg"
              alt="Bitcoin"
            />
            <img
              className="inline-block h-7 w-7 rounded-full"
              src="https://devtstarthaone.blob.core.windows.net/arthaimages/ETH.svg"
              alt="Ethereum"
            />
            <img
              className="inline-block h-7 w-7 rounded-full"
              src="https://devtstarthaone.blob.core.windows.net/arthaimages/usdc-coin.svg"
              alt="USD Coin"
            />
            <img
              className="inline-block h-7 w-7 rounded-full"
              src="https://devtstarthaone.blob.core.windows.net/arthaimages/usdtclr.svg"
              alt="Tether"
            />
          </div>
        </div>
      </div>
      <p className="text-base text-subTextColor mt-2">
        Top up your wallet to start using it! <br/> As soon as you add funds, your <br/>live balance will appear right here.</p>
    </div>
  );
};

export default TotalBalanceSection;