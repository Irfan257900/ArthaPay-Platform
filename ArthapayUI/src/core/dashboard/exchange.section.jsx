import React, { createContext, useCallback, useState } from "react";
import AppTabs from "../shared/appTabs";
import Buy from "../../modules/exchange/buy";
import Sell from "../../modules/exchange/sell";
export const ExchangeContext = createContext();
const tabs = [
  { id: "buy", name: "Buy" },
  { id: "sell", name: "Sell" },
];
const widgetClasses = {
  root: "w-full p-2",
};
const summaryClasses = {
  root: "summary w-full mx-auto mt-6 p-2",
};
const Exchange = () => {
  const [selectedTab, setSelectedTab] = useState("buy");
  const handleChange = useCallback((key) => {
    setSelectedTab(key);
  }, []);
  return (
    <div className="kpicardbg mt-7 !px-0 custom-buy-sell">
      <div className="flex justify-end gap-2">
        <div className="!mt-0 toggle-btn !px-3">
          <AppTabs
            list={tabs}
            itemFields={{ title: "name", key: "id" }}
            onChange={handleChange}
            activeKey={selectedTab}
            className="custom-crypto-tabs !mb-0"
          />
        </div>
      </div>
      <div>
        {selectedTab === "buy" && (
          <Buy
            key="buy"
            classNames={{ widget: widgetClasses, summary: summaryClasses }}
          />
        )}
        {selectedTab === "sell" && (
          <Sell
            key="sell"
            classNames={{ widget: widgetClasses, summary: summaryClasses }}
          />
        )}
      </div>
    </div>
  );
};

export default Exchange;
