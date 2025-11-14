import { NumericFormat } from "react-number-format";
import RecentActivity from "./recentActivity";
import { useDispatch, useSelector } from "react-redux";
import NumericText from "../../core/shared/numericText";
import AppDefaults, { fiatCurrencySymbols } from "../../utils/app.config";
import KpiLoader from "../../core/skeleton/kpi.loaders";
import AppAlert from "../../core/shared/appAlert";
import { setErrorMessages } from "./reducers/payout.reducer";
import { useCallback } from "react";

const Smalldecimals = window.runtimeConfig.VITE_APP_SMALL_DECIMALS_ENABLED;


const PaymentsKpis = () => {
    const dispatch = useDispatch();
    const { loader, data: kpisData, error } = useSelector((store) => store?.payoutReducer?.kpisData);
    const userProfile = useSelector(
        (store) => store.userConfig.details || {}
    );

     const clearError = useCallback(() => {
       dispatch(setErrorMessages([{ key: "kpisData", message: "" }]));
     }, []);

    return (
        <>

            <div className="grid grid-cols-1 xl:grid-cols-3 md:grid-cols-2 gap-5 mb-5">
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
                {loader && <KpiLoader itemCount={3} />}
                {!loader &&
                    <>
                        <div className="kpicardbg ">
                            <div className="">
                                <h4 className="text-base font-semibold text-titleColor">{kpisData?.[0]?.name}</h4>
                                <h3 className="font-semibold text-dbkpiText my-2">
                                    <div className="flex items-center gap-2">
                                        <div className="text-md font-semibold text-dbkpiTex">
                                            <NumericText
                                                displayType="text"
                                                thousandSeparator={true}
                                                fixedDecimalScale={true}
                                                value={kpisData?.[0]?.value}
                                                decimalScale={AppDefaults?.fiatDecimals}
                                                prefixText={fiatCurrencySymbols[userProfile?.currency]}
                                                isdecimalsmall={Smalldecimals === "true" ? true : false}
                                            /></div>
                                    </div>
                                </h3>
                            </div>

                            <div className="flex items-center gap-1 justify-between md:col-span-2 self-end mt-9 md:mt-0  mb-4">
                                <div className="">
                                    <h4 className="text-base font-semibold text-titleColor">{kpisData?.[1]?.name}</h4>
                                    <h3 className="text-md font-semibold text-dbkpiText ">
                                        <div className="text-md font-semibold text-dbkpiTex">
                                            <NumericText
                                                displayType="text"
                                                thousandSeparator={true}
                                                fixedDecimalScale={false}
                                                value={kpisData?.[1]?.value}
                                                isdecimalsmall={false}
                                                decimalScale={0}
                                            />
                                        </div>
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div className="kpicardbg ">
                            <div className="">
                                <h4 className="text-base font-semibold text-titleColor">{kpisData?.[2]?.name}</h4>
                                <h3 className="font-semibold text-dbkpiText my-2">
                                    <div className="flex items-center gap-2">
                                        <div className="text-md font-semibold text-dbkpiTex">
                                            <NumericText
                                                displayType="text"
                                                thousandSeparator={true}
                                                fixedDecimalScale={true}
                                                value={kpisData?.[2]?.value}
                                                decimalScale={AppDefaults?.fiatDecimals}
                                                prefixText={fiatCurrencySymbols[userProfile?.currency]}
                                                isdecimalsmall={Smalldecimals === "true" ? true : false}
                                            /></div>
                                    </div>
                                </h3>
                            </div>

                            <div className="flex items-center gap-1 justify-between ">
                                <div className="">
                                    <h4 className="text-base font-semibold text-titleColor">{kpisData?.[3]?.name}</h4>
                                    <h3 className="text-md font-semibold text-dbkpiText">
                                        <div className="text-md font-semibold text-dbkpiTex">

                                            <NumericText
                                                displayType="text"
                                                thousandSeparator={true}
                                                value={kpisData?.[3]?.value}
                                                isdecimalsmall={false}
                                                decimalScale={0}
                                            />
                                        </div>
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div className="kpicardbg">
                            {kpisData && <RecentActivity />}
                        </div>
                    </>
                }
            </div>
        </>
    );

}

export default PaymentsKpis;