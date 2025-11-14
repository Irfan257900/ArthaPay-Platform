import React, { useRef, useState, useEffect } from "react";
import List from '../../core/grid.component/index'
import { useSelector } from "react-redux";
import {PaymentLinksColoumns, transactionColoumns } from './dashboard.services'
import { paymetsDashoardKpis } from "./api/services";
import SummaryGraph from "./payments.graph";
import PageHeader from "../../core/shared/page.header";
import PaymentsDashboardLoader from "../../core/skeleton/payments.loader/payments.dashboard.loader";
import DashBoardAppKpis from "../../core/shared/dashboardKpis";
import FeatureCard from "../../core/shared/FeatureCards";
import { useTranslation } from "react-i18next";

const baseURL = window.runtimeConfig.VITE_WALLET_TYPE === "non_custodial" ? window.runtimeConfig.VITE_WEB3_API_END_POINT : window.runtimeConfig.VITE_API_END_POINT;

const Dashboard = () => {
    const customerInfo = useSelector((store) => store.userConfig.details)
    const  PaymentsColoumns=PaymentLinksColoumns()
    const transactionGridColumns=transactionColoumns()
    const { t } = useTranslation(); 
    const gridRef = useRef(null)
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true)
    useEffect(() => {
        fetchData()
    }, [])
    const breadCrumbList = [
        { id: "1", title: t("payments.dashboard.Payments"), },
    ];
    const fetchData = async () => {
        setIsLoading(true);
        try {
            await Promise.all([paymetsDashoardKpis(setData)]);
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div>
            {isLoading && <PaymentsDashboardLoader /> ||
                <><PageHeader breadcrumbList={breadCrumbList} />
                    <div className="grid md:grid-cols-4 gap-5 mb-5">
                        <DashBoardAppKpis data={data} isSeparate={true} EndIndex={2} />
                            <div className="p-3.5 border border-dbkpiStroke hover:border-primaryColor active-hyperlink hover:bg-primaryColor hoveranim rounded-5 ">
                            <FeatureCard
                                icon="db-payin-icon"
                                title={t("payments.dashboard.Pay-In")}
                                description={t("payments.dashboard.Seamless crypto pay-in solutions for secure and instant transactions.")}
                                hasSeparator={true}
                                routing="/payments/payins/payin/00000000-0000-0000-0000-000000000000/new/generate"
                                actionFrom={'Payments'}
                                redirectTo={'/payments'}
                                isKycCheck={true}
                            />
                            </div>
                            <div className="p-3.5 border border-dbkpiStroke hover:border-primaryColor active-hyperlink hover:bg-primaryColor hoveranim rounded-5 ">                                
                            <FeatureCard
                                icon="db-payout-icon"
                                title={t("payments.dashboard.Pay Outs")}
                                description={t("payments.dashboard.Fast and secure crypto payouts for hassle-free settlements.")}
                                routing="/payments/payouts/payout/00000000-0000-0000-0000-000000000000/new/add/fiat"
                                actionFrom={'Payments'}
                                redirectTo={'/payments'}
                                isKycCheck={true}
                            />
                            </div>
                        </div>
                    <h3 className="text-2xl font-semibold text-titleColor mb-1 mt-8">{t("payments.dashboard.Recent Invoices")}</h3>
                    <div className="rounded-sm bg-sectionBG md:p-0 p-2.5 mb-5">
                        <List
                            url={baseURL + `/Merchant/PayInPayOutTransaction/PayIn`}
                            columns={PaymentsColoumns}
                            pSize={6}
                            className="custom-grid"
                            ref={gridRef}
                            pageable={false}
                        />
                    </div>
                    <div>
                        <div className="grid md:grid-cols-2 mt-7">
                            <h3 className="text-2xl font-semibold text-titleColor mb-1.5 hidden md:block">{t("payments.dashboard.Recent Activity")}</h3>
                            <h3 className="text-2xl font-semibold text-titleColor mb-1.5 hidden md:block">{t("payments.dashboard.Transactions Summary")}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-0 mb-6">
                            <div className="rounded-5 border border-dbkpiStroke recent-grid-br">
                                <span className="flex items-center gap-1">
                                    <h3 className="text-2xl font-semibold text-titleColor mb-1 md:hidden block">{t("payments.dashboard.Recent Activity")}</h3>
                                </span>
                                <div className="overflow-y-auto  overflow-x-hidden">
                                    <List
                                        ref={gridRef}
                                        columns={transactionGridColumns}
                                        className="custom-grid"
                                        url={baseURL + `/Merchant/Payments/Transactions/All/null//`}
                                        pSize={7}
                                        pageable={false}
                                    />
                                </div>
                            </div>
                            <div className="rounded-5 border border-dbkpiStroke p-2.5 md:p-5">
                                <SummaryGraph customerInfo={customerInfo} removeClassName={true} />
                            </div>
                        </div>
                    </div>
                </>
            }

        </div>
    )
}
export default Dashboard; 
