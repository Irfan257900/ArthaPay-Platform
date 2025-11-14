import React, { memo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import AppDefaults, { fiatCurrencySymbols } from "../../../utils/app.config";
import NumericText from "../../../core/shared/numericText";
import { getAccounts } from "../../../reducers/banks.widthdraw.reducer";
import numberFormatter from "../../../utils/numberFormatter";
import { setIsRefresh } from "../../../reducers/accounts.reducer";
export const TotalAmount = () => {
  const { loader } = useSelector((state) => state.transferReducer.accounts);
  const totalAmount = useSelector((state) => state.transferReducer.totalAmount);
  const dispatch = useDispatch();
  const onRefresh = useCallback(() => {
    dispatch(getAccounts({ step: "init" }));
    dispatch(setIsRefresh({ step: "init" }, true));


  }, []);
  const getBalanceText = (amount, isSuffix, isOnlyAmount) => {
    const numAmount = parseFloat(amount) || 0;
    if (isNaN(numAmount)) return '0.00';

    const { number, suffix } = numberFormatter(numAmount) || {};
    const formattedNumber = (number ?? 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    if (isSuffix) {
      return suffix || "";
    }
    if (isOnlyAmount) {
      return formattedNumber;
    }
    return `$ ${formattedNumber}`;
  };
  const Smalldecimals = window.runtimeConfig.VITE_APP_SMALL_DECIMALS_ENABLED

  return (
    <>
      {!loader && (
        <div className="p-3">
          <p className="text-base font-semibold text-titleColor mb-0">
            Total Amount
          </p>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-semibold text-subTextColor text-3xl">
              <NumericText
                value={getBalanceText(totalAmount, false, true) || 0}
                decimalScale={AppDefaults.fiatDecimals}
                thousandSeparator
                className="block"
                displayType="text"
                isdecimalsmall={Smalldecimals === 'true' ? true : false}
                prefixText={fiatCurrencySymbols.USD}
                suffixText={getBalanceText(totalAmount, true, false)}
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
};
const ListHeader = () => {
  return (
    <div className="flex-1">
      <div className="flex justify-between items-center p-3 ">
        <h1 className="text-xl text-subTextColor font-medium">Withdraw</h1>
      </div>
      <TotalAmount />
    </div>
  );
};

export default memo(ListHeader);
