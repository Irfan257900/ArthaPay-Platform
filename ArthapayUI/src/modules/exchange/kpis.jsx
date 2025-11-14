import React, { memo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {  setErrorMessages } from "./reducer";
import AppAlert from "../../core/shared/appAlert";
import AppDefaults from "../../utils/app.config";
import KpiLoader from "../../core/skeleton/kpi.loaders";
import NumericText from "../../core/shared/numericText";
const clientName = window.runtimeConfig.VITE_CLIENT;
 const Smalldecimals = window.runtimeConfig.VITE_APP_SMALL_DECIMALS_ENABLED

const Kpis = () => {
  const dispatch = useDispatch();
  const { loading, data, error } = useSelector(
    (state) => state.exchangeStore.kpis
  );
  const clearError = useCallback(() => {
    dispatch(setErrorMessages([{ key: "kpis", message: "" }]));
  }, []);
  return (
    <>
      {error && (<div className="kpicardbg lg:col-span-2 md:col-span-2 space-y-3">
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
      {loading && <KpiLoader itemCount={2} />}
      {!loading &&
        data?.map((kpi) => {
          return (
            <div
              key={kpi.name}
              className="kpicardbg grid lg:grid-cols-1 md:grid-cols-1 space-y-3"
            >
              <div className="flex items-center justify-between md:col-span-2 self-start">
                <h4 className="text-base font-semibold text-kpidarkColor">
                  {kpi.name}
                </h4>
              </div>
              <div className="items-center flex justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex overflow-hidden py-1 px-0 -space-x-2">
                    {kpi.logos?.map((logo) => (
                      <img
                        key={logo}
                        className="inline-block h-7 w-7 rounded-full"
                        src={logo}
                        alt={logo}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 justify-between md:col-span-2 self-end mt-9 md:mt-0">
                <div className="flex items-center gap-1">
                  <h3 className="text-md font-semibold text-dbkpiText">
                    <div className="text-md font-semibold text-dbkpiTex flex gap-2 items-center">
                     <div>
                       <NumericText
                        prefixText="$ "
                        value={kpi.value || 0}
                        decimalScale={AppDefaults.fiatDecimals}
                        thousandSeparator
                        displayType="text"
                        isdecimalsmall={Smalldecimals==="true"? true : false}
                        // renderText={(value) => {
                        //   const [intPart, decimalPart] = value.split(".");
                        //   return (
                        //     <>
                        //       <span className="!text-2xl !font-semibold !text-kpidarkColor">
                        //         {intPart}
                        //       </span>
                        //       {clientName ==="fastxe" && (decimalPart && (
                        //         <span className="!text-sm !font-medium !text-paraColor">
                        //           .{decimalPart}
                        //         </span>
                        //       ))}
                        //     </>
                        //   );
                        // }}
                      />
                     </div>
                    </div>
                  </h3>
                </div>
              </div>
            </div>
          );
        })}
    </>
  );
};

export default memo(Kpis);
