import React, { useRef, useState, useEffect } from "react";
import List from '../../core/grid.component/index'
import { useSelector } from "react-redux";
import { CryptoColoumns, FiatColoumns } from './dashboard.services'
import {  paymetsDashoardKpis } from "./http.services";
import { useNavigate } from "react-router";
import PageHeader from "../../core/shared/page.header";
import PaymentsDashboardLoader from "../../core/skeleton/payments.loader/payments.dashboard.loader";
import DashBoardAppKpis from "../../core/shared/dashboardKpis"; // NOSONAR
import FeatureCard from "../../core/shared/FeatureCards";// NOSONAR
import { useTranslation } from "react-i18next";
const baseURL = window.runtimeConfig.VITE_WALLET_TYPE === "non_custodial" ? window.runtimeConfig.VITE_WEB3_API_END_POINT : window.runtimeConfig.VITE_API_END_POINT;

const Dashboard = () => {
    const customerInfo = useSelector((store) => store.userConfig.details)
    const CryptoGridColoumns=CryptoColoumns()
    const FiatGridColoumns=FiatColoumns()
    const gridRef = useRef(null)
    const [data, setData] = useState([]); // NOSONAR
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true)
    const { t } = useTranslation();
    useEffect(() => {
        if (customerInfo?.id) {
            fetchData()
        }
    }, [customerInfo?.id])
    const fetchData = async () => {
        setIsLoading(true);
        try {
            await Promise.all([
                paymetsDashoardKpis(setData)
            ]);
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };
    const handleRedirectToCrypto = (e, currency) => {
        e.preventDefault();
        if (currency === 'crypto')
            navigate(`crypto`)
        else navigate('fiat');
    }
    const breadCrumbList = [
        { id: "1", title: t("payees.dashboard.Payees"), },
    ];
    return (
        <div>
            {isLoading && <PaymentsDashboardLoader /> || <><PageHeader showBreadcrumb={true} breadcrumbList={breadCrumbList} />
            {/* eslint-disable sonarjs/no-duplicate-string */}
                {/* <div className="grid md:grid-cols-4 gap-5 mb-4 mt-4">
                    <DashBoardAppKpis data={data} isSeparate={true} EndIndex={2} StartIndex={1} />
                        <div className="p-3.5 border border-dbkpiStroke hover:border-primaryColor active-hyperlink hover:bg-primaryColor hoveranim rounded-5 ">
                            <FeatureCard
                                icon="add-crypto-icon"
                                title={t("payees.dashboard.Add Crypto Payee")}
                                description={t("payees.dashboard.Secure crypto Payees to protect your digital assets.")}
                                hasSeparator={true}
                                routing="/payees/crypto/00000000-0000-0000-0000-000000000000/new/add"
                                actionFrom={'Payees'}
                                redirectTo={'/payees'}
                                isKycCheck={true}
                            />
                            </div>
                            <div className="p-3.5 border border-dbkpiStroke hover:border-primaryColor active-hyperlink hover:bg-primaryColor hoveranim rounded-5 ">
                            <FeatureCard
                                icon="add-fiat-icon"
                                title={t("payees.dashboard.Add Fiat Payee")}
                                description={t("payees.dashboard.Fiat Payee for effortless spending, anytime, anywhere")}
                                routing="/payees/fiat/00000000-0000-0000-0000-000000000000/new/add"
                                actionFrom={'Payees'}
                                redirectTo={'/payees'}
                                isKycCheck={true}
                            />
                        </div>
                    </div> */}
                      <div className="grid grid-col-1 lg:grid-cols-3 md:grid-cols-2 gap-3">
                <div className="kpicardbg ">
                    <h1 className="text-base font-semibold text-titleColor">Crypto Payees</h1>
                    <div className="flex -space-x-1 py-5">
                        <img className=" inline-block h-7 w-7 rounded-full" src="https://devdottstoragespace.blob.core.windows.net/arthaimages/BTC.svg" alt="Bitcoin" />
                        <img className="inline-block h-7 w-7 rounded-full" src="https://devdottstoragespace.blob.core.windows.net/arthaimages/ETH.svg" alt="Ethereum" />
                        <img className="inline-block h-7 w-7 rounded-full" src="https://devdottstoragespace.blob.core.windows.net/arthaimages/usdc-coin.svg" alt="USD Coin" />
                        <img className="inline-block h-7 w-7 rounded-full" src="https://devdottstoragespace.blob.core.windows.net/arthaimages/usdtclr.svg" alt="Tether" />
                    </div>
                    <h1 className="text-3xl font-semibold text-dbkpiText">30</h1>

                </div>

                <div >
                    <div className="kpicardbg ">
                        <h1 className="text-base font-semibold text-titleColor">Fiat Payees</h1>
                        <div className="flex -space-x-1 py-5">
                            <img className=" inline-block h-7 w-7 rounded-full" src="https://devdottstoragespace.blob.core.windows.net/arthaimages/BTC.svg" alt="Bitcoin" />
                            <img className="inline-block h-7 w-7 rounded-full" src="https://devdottstoragespace.blob.core.windows.net/arthaimages/ETH.svg" alt="Ethereum" />
                            <img className="inline-block h-7 w-7 rounded-full" src="https://devdottstoragespace.blob.core.windows.net/arthaimages/usdc-coin.svg" alt="USD Coin" />
                            <img className="inline-block h-7 w-7 rounded-full" src="https://devdottstoragespace.blob.core.windows.net/arthaimages/usdtclr.svg" alt="Tether" />
                        </div>
                        <h1 className="text-3xl font-semibold text-dbkpiText">12</h1>

                    </div>

                </div>

                <div>
                    <div className="flex  justify-between mb-4 ">
                        <h4 className="bashboard-titles">Recent Activity</h4>
                        <div>
                            <button type="normal" className="secondary-outline">All Transactions  <span className="icon btn-arrow shrink-0 ml-2"></span></button>
                        </div>
                    </div>
                    <div>
                   
                <div className="kpicardbg flex gap-3.5 items-center">
                <span className="icon shrink-0 notificationdeposit"></span>
                <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <p><span className="text-sm font-semibold text-subTextColor">John Doe</span><span className="icon btn-white-arrow shrink-0"></span><span className="text-sm font-semibold text-subTextColor">Eleanor Account</span> </p>
                        <h4 className="text-xs font-normal text-paraColor">20 Mar 2025</h4>
                    </div>
                    <div className="flex justify-between items-center">
                    <h4 className="text-xs font-normal text-paraColor">Withdraw Fiat USD SWIFT</h4>
                    <h4 className="text-sm font-semibold text-subTextColor">+948.5 UDS</h4>
                    </div>
                    <div className="flex justify-between items-center">
                        <h4>
                        <span>1bd44...2j3i<span className="icon anticon-copy ml-1 scale-75"></span></span>
                        </h4>
                        <h4 className="!text-textApproved text-xs font-normal">Approved</h4>
                        
                    </div>
                </div>
                </div>

                   
                    
                    
                  
                    </div>
                    

                </div>
                
            </div>
                <div>
                    <div className="md:grid md:grid-cols-2 gap-4 mt-6">
                        <button className="items-center gap-1 md:flex hidden w-fit" onClick={(e) => handleRedirectToCrypto(e, 'crypto')}>
                            <h4 className="text-2xl font-semibold text-titleColor mb-1">
                               {t("payees.dashboard.Crypto")}
                            </h4>
                            <span className="icon lg square-arrow cursor-pointer" ></span>
                        </button>
                        <button className="items-center gap-1 md:flex hidden w-fit" onClick={(e) => handleRedirectToCrypto(e, 'fiat')}>
                            <h4 className="text-2xl font-semibold text-titleColor mb-1">
                                {t("payees.dashboard.Fiat")}
                            </h4>
                            <span className="icon lg square-arrow cursor-pointer"></span>
                        </button>
                    </div>
                    <div className="md:grid md:grid-cols-2 gap-4 mb-6">
                        <div className="border border-dbkpiStroke rounded-5 recent-grid-br">
                            <button className="flex items-center gap-1 mb-3 md:hidden" onClick={(e) => handleRedirectToCrypto(e, 'crypto')}>
                                <h4 className="text-2xl font-semibold text-titleColor mb-1">
                                      {t("payees.dashboard.Crypto")}
                                </h4>
                                <span className="icon lg square-arrow cursor-pointer mt-1" ></span>
                            </button>
                            <div className="">
                                <List
                                    ref={gridRef}
                                    columns={CryptoGridColoumns}
                                    className="custom-grid"
                                    url={baseURL + `/Common/Payees/Crypto`}
                                    pSize={8}
                                    pageable={false}
                                />
                            </div>
                        </div>
                        <div className="border border-dbkpiStroke rounded-5 recent-grid-br">
                            <button className="flex items-center gap-1 mb-3 md:hidden" onClick={(e) => handleRedirectToCrypto(e, 'fiat')}>
                                <h4 className="text-2xl font-semibold text-titleColor mb-1">
                                    {t("payees.dashboard.Fiat")}
                                </h4>
                                <span className="icon lg square-arrow cursor-pointer mt-1"></span>
                            </button>
                            <div className="">
                                <List
                                    ref={gridRef}
                                    columns={FiatGridColoumns}
                                    className="custom-grid"
                                    url={baseURL + `/Common/Payees/Fiat`}
                                    pSize={8}
                                    pageable={false}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </>}
        </div>
    )
}
export default Dashboard; 