import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getKipsAccounts,
  getKipsDetails,
  getPaymentKpis,
  getRecentActivites,
} from "./http.services";
import PageHeader from "../shared/page.header";
import DashboardLoader from "../skeleton/dashboard.loader";
import { useTranslation } from "react-i18next";
import WalletsSection from "./wallets.section";
import AccountSection from "./accounts.section";
import TransactionSection from "./recentActivity.section";
import CardSection from "./cards.section";
import PaymentSection from "./payments.section";
import Exchange from "./exchange.section";
import { fetchNoticesData } from "../../reducers/userconfig.reducer";
import QuickLinks from "./quickLinks";
import CombinedNoticesAndCases from "./dashboardCarousel";

const Dashboard = () => {
  const [paymentStats, setPaymentStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [kpisData, setKpisData] = useState([]);
  const [accountsKpis, setAccountsKpis] = useState([]);
  const [recentActivityData, setRecentActivityData] = useState([]);
  const userInfo = useSelector((store) => store.userConfig.details);
  const dispatch = useDispatch();
  
   const enabledModules = useSelector(
    (state) => state.userConfig.enabledModules
  );

  const isModuleEnabled = useCallback(
    (name) => {
      if (!Array.isArray(enabledModules) || enabledModules?.length === 0) {
        return false;
      }
      return enabledModules.includes(name);
    },
    [enabledModules]
  );

  useEffect(() => {
    dispatch(fetchNoticesData());
  }, [dispatch]);

  const { t } = useTranslation();
  useEffect(() => {
    fetchData();
  }, []);
  const breadCrumbList = useMemo(
    () => [{ id: "1", title: t("dashboard.Dashboard") }],
    []
  );

  // Memoize fetchData using useCallback to ensure it's stable and
  // to correctly capture dependencies like isModuleEnabled and userInfo.id.
  const fetchData = useCallback(async () => {
    // Check if userInfo.id is available before fetching
    if (!userInfo?.id) {
        console.warn("User ID not available, skipping dashboard data fetch.");
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    const promises = [];

    // Conditionally add API calls based on module enablement
    if (isModuleEnabled("Wallets")) {
      promises.push(getKipsDetails(setKpisData, userInfo.id));
    }
    
    // Assuming 'Payments' module needs payment KPIs
    if (isModuleEnabled("Payments")) {
      promises.push(getPaymentKpis(setPaymentStats, userInfo.id));
    }

    // Assuming 'Banks' module needs accounts KPIs
    if (isModuleEnabled("Banks")) {
      promises.push(getKipsAccounts(setAccountsKpis, userInfo.id));
    }

    // Assuming 'Transactions' module needs recent activities
    if (isModuleEnabled("Transactions")) {
      promises.push(getRecentActivites(setRecentActivityData, userInfo.id));
    }

    if (promises.length === 0) {
        console.log("No modules enabled that require primary dashboard data fetch.");
        setIsLoading(false);
        return;
    }

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userInfo.id, isModuleEnabled]);


  const hasData = useMemo(() => {
    const hasPrimaryData =
      kpisData?.some((item) => item.value > 0) ||
      paymentStats?.some((item) => item.value > 0) ||
      accountsKpis?.some((item) => item.value > 0);

    const hasRecentActivity = recentActivityData.length > 0;

    return hasPrimaryData && hasRecentActivity;
  }, [kpisData, paymentStats, accountsKpis, recentActivityData]);
;

  return (
    <div>
      {isLoading && <DashboardLoader />}
      {!isLoading && (
        <>
          <PageHeader breadcrumbList={breadCrumbList} />

          <>
            <CombinedNoticesAndCases/>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 xl:gap-5 lg:gap-3 gap-4">
              <div className="md:col-span-2">
                {isModuleEnabled("Wallets") && <WalletsSection kpisData={kpisData} />}
                {isModuleEnabled("Banks") && <AccountSection accountsKips={accountsKpis} />}
                {isModuleEnabled("Cards") && <CardSection />}
                {isModuleEnabled("Payments") && <PaymentSection paymentStats={paymentStats} />}
              </div>
              <div className="">
                {isModuleEnabled("Transactions") && (
                  <TransactionSection recentTranscation={recentActivityData} />
                )}
                {isModuleEnabled("Exchange") && <Exchange />}
                {window.runtimeConfig.VITE_APP_IS_QUICKLICKS_ENABLED === "true" && <QuickLinks />}
              </div>
            </div>
          </>
        </>
      )}
    </div>
  );
};

export default Dashboard;