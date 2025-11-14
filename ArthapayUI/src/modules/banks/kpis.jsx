import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearErrorMessage } from "../../reducers/banks.reducer";
import AppDefaults, { fiatCurrencySymbols } from "../../utils/app.config";
import NumericText from "../../core/shared/numericText";
import AppAlert from "../../core/shared/appAlert";
import KpiLoader from "../../core/skeleton/kpi.loaders";
import NoAccounts from "./noAccounts";
import { decryptAES } from "../../core/shared/encrypt.decrypt";

const Kpis = () => {
  const dispatch = useDispatch();
  const { loading, data, error } = useSelector((store) => store.banks.kpis);
  const clearError = useCallback(() => {
    dispatch(clearErrorMessage([{ key: "kpis", message: "" }]));
  }, []);
  const Smalldecimals = window.runtimeConfig.VITE_APP_SMALL_DECIMALS_ENABLED
  return (
    <>
      {error && (
        <div className="mx-2">
          <div className="alert-flex withdraw-alert fiat-alert">
            <AppAlert
              type="error"
              description={error}
              showIcon
              closable
              afterClose={clearError}
            />
          </div>
        </div>
      )}
      {loading && <KpiLoader itemCount={3} />}
      {!loading &&
        data?.map((account) => {
          return (
            <div className="kpicardbg space-y-3" key={account.id}>
              <div className="flex items-center self-start gap-2">
                <img
                  className="inline-block h-7 w-7 rounded-full"
                  src={account.image}
                  alt={account.currency}
                />
                <h4 className="text-base font-semibold text-subTextColor">
                  {account.currency}
                </h4>
                <h4 className="text-base font-semibold text-subTextColor">
                  {decryptAES(account.accountNumber)}
                </h4>
              </div>
              <div className="items-center flex justify-between">
                <h3 className="text-sm font-semibold text-placeholderGrey">
                  {/* {account.currency} - <span>{account.name}</span> */}
                </h3>
              </div>
              <div className="flex items-center gap-1 justify-between md:col-span-2 self-end mt-9 md:mt-0">
                <div className="flex items-center gap-1">
                  <h3 className="text-md font-semibold text-dbkpiText">
                    <div className="text-md font-semibold text-dbkpiTex">
                      <NumericText
                        prefixText={fiatCurrencySymbols[account.code || 'USD']}
                        value={account.amount || 0}
                        thousandSeparator
                        isdecimalsmall={Smalldecimals === 'true' ? true : false}
                        decimalScale={AppDefaults.fiatDecimals}
                      />
                    </div>
                  </h3>
                </div>
              </div>
            </div>
          );
        })}
      {!loading && !data?.length && <div className="md:col-span-2 kpicardbg"><NoAccounts title={'View Your Balances'}  showButton={false} showIcon={false} message={'Create an account to see your total balance and manage your funds in one place.'} /></div>}
    </>
  );
};

export default Kpis;
