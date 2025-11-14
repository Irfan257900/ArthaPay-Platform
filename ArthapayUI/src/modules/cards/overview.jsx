import React, { useCallback } from "react";
import NumericText from "../../core/shared/numericText";
import cardsRotate from "../../assets/images/cardrotate.png";
import { useDispatch, useSelector } from "react-redux";
import {  setErrorMessages } from "../../reducers/cards.reducer";
import AppAlert from "../../core/shared/appAlert";
import KpiLoader from "../../core/skeleton/kpi.loaders";
import RecentActivity from "./recentActivity";

const Overview = () => {
  const dispatch = useDispatch();
  const { loading, data, error } = useSelector(
    (state) => state.cardsStore.kpis
  );
    const { loading: graphLoader, error:graphError } = useSelector(
        (state) => state.cardsStore.graphDetails
      );
  const clearError = useCallback(() => {
    dispatch(setErrorMessages([{ key: "kpis", message: "" },{ key: "graphDetails", message: "" }]));
  }, []);
  return (
    <>
      {(error||graphError) && (
        <div className="mx-2">
          <div className="alert-flex withdraw-alert fiat-alert">
            <AppAlert
              type="error"
              description={(error||graphError)}
              showIcon
              closable
              afterClose={clearError}
            />
          </div>
        </div>
      )}
      <div className="grid md:grid-cols-3 gap-5 mb-7">
        {(loading||graphLoader) && <KpiLoader itemCount={3} />}
        {!loading && !graphLoader &&(
          <>
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="kpicardbg grid lg:grid-cols-1 md:grid-cols-1 space-y-3">
                  <div className="flex justify-between items-center ">
                    <div className="self-start">
                      <h4 className="text-base font-semibold text-titleColor mb-2">
                        {data?.[0]?.name} Cards
                      </h4>
                      <div className="text-md font-semibold text-dbkpiTex">
                        <NumericText
                          value={data?.[0]?.value || 0}
                          thousandSeparator={true}
                          decimalScale={0}
                        />
                      </div>
                    </div>
                    <div className="">
                      <img className="" src={cardsRotate} alt="Bitcoin" />
                    </div>
                  </div>
                </div>
                <div className="kpicardbg grid lg:grid-cols-1 md:grid-cols-1 space-y-3">
                  {data
                    ?.filter((item) => item.name !== "Total")
                    ?.map((item) => (
                      <div key={item.name} className="">
                        <h4 className="text-base font-semibold text-titleColor">{`${item?.name} Cards`}</h4>
                        <h3 className="text-md font-semibold text-dbkpiText">
                          <div className="text-md font-semibold text-dbkpiTex">
                            <NumericText
                              value={item?.value || 0}
                              thousandSeparator={true}
                              decimalScale={0}
                            />
                          </div>
                        </h3>
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <RecentActivity />
          </>
        )}
      </div>
    </>
  );
};
export default Overview;
