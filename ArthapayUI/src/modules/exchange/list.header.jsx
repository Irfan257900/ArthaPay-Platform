import React, { memo, useCallback } from "react";
import NumericText from "../../core/shared/numericText";
import AppDefaults, { fiatCurrencySymbols } from "../../utils/app.config";
import { useNavigate } from "react-router";
import ScreenTabs from "../../core/shared/screenTabs";
import numberFormatter from "../../utils/numberFormatter";
 const Smalldecimals = window.runtimeConfig.VITE_APP_SMALL_DECIMALS_ENABLED

export const TotalAmount = memo(({ loading, data, onRefresh }) => {

  const getBalanceText = (amount, isSuffix, isOnlyAmount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '0.00';

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

  return (
    <>
      {!loading && (
        <div className="p-3">
          <p className="text-base font-semibold text-titleColor mb-0">
            Total Amount
          </p>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-subTextColor text-3xl">
              <NumericText
                value={getBalanceText(data?.totalInBaseCurrency, false, true) || 0}
                decimalScale={AppDefaults.fiatDecimals}
                thousandSeparator
                className="block"
                displayType="text"
                        isdecimalsmall={Smalldecimals==="true"? true : false}
                prefixText={"$"}
                suffixText={getBalanceText(data?.totalInBaseCurrency, true, false)}
              />
            </span>
            <button onClick={onRefresh}>
              <span className="icon refresh cursor-pointer" />
            </button>
          </div>
        </div>
      )}
    </>
  );
});
const ListHeader = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    switch (tab) {
      case "Buy":
        navigate("/exchange/buy");
        break;
      case "Sell":
        navigate("/exchange/sell");
        break;
      default:
        break;
    }
  }, []);
  return (
    <div className="flex-1">
      <div className="flex justify-between items-center p-3 ">
        <div className=" toggle-btn custom-tabs ">
          <ScreenTabs
            className="custom-crypto-tabs"
            activeKey={activeTab}
            onChange={handleTabChange}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(ListHeader);
