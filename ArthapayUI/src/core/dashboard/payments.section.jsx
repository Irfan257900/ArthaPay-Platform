import React from "react";
import AppDefaults, { fiatCurrencySymbols } from "../../utils/app.config";
import { useNavigate } from "react-router";
import SummaryGraph from "../../modules/payments/payments.graph";
import { useSelector } from "react-redux";
import NumericText from "../shared/numericText";
import { NumericFormat } from "react-number-format";
const icons = {
  "Pay-In": "grey-arrow-down",
  "Pay-Out": "grey-arrow-up"
}
const PaymentSection = ({ paymentStats }) => {
  const clientName = window.runtimeConfig.VITE_CLIENT;


  const navigate = useNavigate();
  const customerInfo = useSelector((store) => store.userConfig.details);
  const filteredData = paymentStats
    ?.filter(
      (item) => item?.name === "Pay-In" || item?.name === "Pay-Out"
    )

  const userProfileInfo = useSelector((state) => state.userConfig.details);
  const Smalldecimals = window.runtimeConfig.VITE_APP_SMALL_DECIMALS_ENABLED;

  return (
    <>
      <div className="flex items-center justify-between mb-4 mt-7">
        <h4 className="bashboard-titles">Payments</h4>
        <div>
          <button
            type="normal"
            className="secondary-outline"
            onClick={() => navigate(`/payments`)}
          >
            All Payments <span className="icon btn-arrow shrink-0 ml-2"></span>
          </button>
        </div>
      </div>
      <div className="grid xl:grid-flow-col lg:grid-flow-row md:grid-flow-col grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 xl:grid-rows-2 xl:gap-5 lg:gap-3 gap-4">
        {filteredData?.map((item) => (
          <div className="kpicardbg lg:col-span-1 md:row-span-1" key={item.name}>
            <div className="flex items-center gap-2.5">
              <span className={`icon shrink-0 ${icons[item.name]}`}></span>
              <span className="text-titleColor text-base font-semibold">
                {item?.name}
              </span>
            </div>
            <div className="mt-8 flex items-center">
              <div className="flex items-center gap-2">
              </div>
              <h4 className="text-large font-semibold text-subTextColor">
                <NumericText
                  value={item?.value}
                  prefixText={fiatCurrencySymbols[userProfileInfo?.currency]}
                  thousandSeparator={true}
                  decimalScale={AppDefaults?.fiatDecimals}
                  fixedDecimalScale={true}
                  displayType="text"
                  isdecimalsmall={Smalldecimals === 'true' ? true : false}
                />
              </h4>
            </div>
          </div>
        ))}
        <div className="md:row-span-2 md:col-span-2 kpicardbg payments-graph">
          <SummaryGraph customerInfo={customerInfo} removeClassName={true} />
        </div>
      </div>
    </>
  );
};

export default PaymentSection;
