import { useEffect, useMemo, useState } from "react";
import ListDetailLayout from "../../core/module.layouts/listdetail.layout";
import { useLocation } from "react-router";
import CoinListLoader from "../../core/skeleton/coinList.loader";
import { BuySellViewLoader } from "../../core/skeleton/buysell";
import KpiLoader from "../../core/skeleton/kpi.loaders";
import ListHeader from "./list.header";
const ExchangeLayout = () => {
  const { pathname } = useLocation();
  const [activeTab, setActiveTab] = useState("");
  useEffect(() => {
    if (pathname.includes("buy")) {
      setActiveTab("Buy");
    } else if (pathname.includes("sell")) {
      setActiveTab("Sell");
    }
  }, [pathname]);
  const breadCrumbList = useMemo(() => {
    return [
      {
        id: "1",
        title: "Exchange",
      },
    ];
  }, []);
  return (
    <ListDetailLayout
      breadCrumbList={breadCrumbList}
      showBreadcrumb={true}
      hasOverview={true}
      Overview={
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:gap-5 xxl:gap-5 xl:gap-4 gap-4 mb-5">
          <KpiLoader itemCount={3} />
        </div>
      }
      ListHeader={<ListHeader activeTab={activeTab} setActiveTab={setActiveTab}/>}
      ListComponent={<CoinListLoader />}
      ListComponentTitle="Select Coin"
      ViewHeader={null}
    >
      <BuySellViewLoader />
    </ListDetailLayout>
  );
};

export default ExchangeLayout;
