import React, { useCallback, useEffect } from "react";
import CustomButton from "../button/button";
import { useDispatch, useSelector } from "react-redux";
import KpiLoader from "../skeleton/kpi.loaders";
import AppAlert from "../shared/appAlert";
import { fetchKpis, resetState, setErrorMessages, setSelectedKpi } from "../../reducers/transactions.reducer";
import NumericText from "../shared/numericText";
const kpiIcons = {
  exchange: "exchange-menu",
  banks: "bank-menu",
  cards: "cards-menu",
  payments: "payments-menu",
  wallets: "vaults-menu",
};
const Kpis = () => {
    const dispatch=useDispatch()
  const { loading, data, error } = useSelector((state) => state.txsStore.kpis);
  useEffect(()=>{
    dispatch(fetchKpis())
    return ()=>dispatch(resetState(['kpis','selectedKpi']))
  },[])
  const clearError=useCallback(()=>{
    dispatch(setErrorMessages([{key:'kpis',message:''}]))
  },[])
   const handleKpiClick = useCallback((kpiName) => {
      dispatch(setSelectedKpi(kpiName))
    }, []);
  return (
    <>
      {error && (
        <div className="alert-flex withdraw-alert fiat-alert">
          <AppAlert
            type="error"
            description={error}
            showIcon
            closable
            afterClose={clearError}
          />
        </div>
      )}
      <div className="grid xl:grid-cols-5 md:grid-cols-3 gap-5 mb-5">
        {loading && <KpiLoader itemCount={5} />}
        {data?.map((item) => (
          <CustomButton
            type="normal"
            className="p-3.5 bg-cardbackground rounded-5 cursor-pointer text-left shadow"
            key={item?.name}
            onClick={handleKpiClick}
            onClickParams={[item?.name]}
            passEvent="end"
          >
            <div className=" flex gap-3 items-center ">
              <div className="flex justify-center items-center bg-menuhover w-8 h-8 rounded-full">
                <span
                  className={`icon ${kpiIcons[item?.name?.toLowerCase()]}`}
                ></span>
              </div>
              <div>
                <p className="text-sm font-medium text-kpidarkColor">{item?.name}</p>
                <NumericText
                  className={"text-md text-kpidarkColor font-semibold"}
                  value={item?.value}
                  decimalScale={0}
                  fixedDecimals={null}
                />
              </div>


            </div>
            
          </CustomButton>
        ))}
      </div>
    </>
  );
};

export default Kpis;
