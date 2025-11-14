import { useDispatch, useSelector } from "react-redux";
import AppAlert from "../../core/shared/appAlert";
import { setErrorMessages } from "../../reducers/payees.reducer";
import KpiLoader from "../../core/skeleton/kpi.loaders";
import NumericText from "../../core/shared/numericText";
import { useCallback } from "react";

const Kpis = () => {
  const dispatch = useDispatch();

  const { loading, data, error,refreshing } = useSelector(
    (state) => state.payeeStore.kpis
  );
  const clearError = useCallback(() => {
    dispatch(setErrorMessages([{ key: "kpis", message: "" }]));
  }, []);
  return (
    <>
      {error && (
        <div className="kpicardbg lg:col-span-2 md:col-span-2 space-y-3">
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
      {(!loading || refreshing) &&
        data?.map((kpi, index) => {
          if (index === 0) return <></>;
          return (
            <div className="kpicardbg " key={kpi.name}>
              <div className="md:flex md:items-center md:justify-between p-1 !mb-[86px]">
                <h4 className="text-sm font-semibold text-kpidarkColor">
                  {kpi?.name}
                </h4>
                <h3 className="font-semibold text-dbkpiText">
                  <div className="text-md font-semibold text-kpidarkColor">
                    <NumericText
                      value={kpi?.value}
                      decimalScale={0}
                      fixedDecimals={null}
                    />
                  </div>
                </h3>
              </div>
            </div>
          );
        })}
    </>
  );
};

export default Kpis;
