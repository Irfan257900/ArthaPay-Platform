import { useCallback, useEffect, useMemo } from "react";
import ListDetailLayout from "../../../core/module.layouts/listdetail.layout";
import { useNavigate, useParams, useLocation } from "react-router";
import ViewHeader from "./view.header";
import Kpis from "../kpis";
import Activity from "../recentActivity";
import List from "./assets";
import ListHeader from "./list.header";
import { useDispatch, useSelector } from "react-redux";
import { fetchCryptoCoins, resetState, setRefreshData, setSelectedCryptoCoin } from "./store.reducer";
import Buy from "./buy";
import Summary from "./summary";
import Success from "./success";
import { fetchKpis } from "../reducer";
import BuyOutlet from "./buy.outlet";
const BuyLayout = () => {
  const { coinToBuy } = useParams();
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    dispatch(fetchCryptoCoins({ step: "init", page: 1 }));
    return () => dispatch(resetState());
  }, []);
  const navigateToDashboard = useCallback(() => {
    navigate(`/exchange`);
  }, []);
  const breadCrumbList = useMemo(() => {
    if (pathname.includes("summary")) {
      return [
        {
          id: "1",
          title: "Exchange",
          handleClick: navigateToDashboard,
        },
        { id: "2", title: "Buy" },
        { id: "3", title: coinToBuy },
        { id: "4", title: "Summary" },
      ];
    } else if (pathname.includes("success")) {
      return [
        {
          id: "1",
          title: "Exchange",
          handleClick: navigateToDashboard,
        },
        { id: "2", title: "Buy" },
        { id: "3", title: coinToBuy },
        { id: "4", title: "Success" },
      ];
    } else if (coinToBuy) {
      return [
        {
          id: "1",
          title: "Exchange",
          handleClick: navigateToDashboard,
        },
        { id: "2", title: "Buy" },
        { id: "3", title: coinToBuy },
      ];
    } else {
      return [
        {
          id: "1",
          title: "Exchange",
          handleClick: navigateToDashboard,
        },
        { id: "2", title: "Buy" },
      ];
    }
  }, [pathname, coinToBuy]);
  return (
    <ListDetailLayout
      breadCrumbList={breadCrumbList}
      showBreadcrumb={true}
      hasOverview={true}
      Overview={
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:gap-5 xxl:gap-5 xl:gap-4 gap-4 mb-5">
          <Kpis />
          <Activity />
        </div>
      }
      ListHeader={<ListHeader />}
      ListComponent={<List />}
      ListComponentTitle="Select Coin"
      ViewHeader={<ViewHeader showClose={false} />}
    >
      <BuyOutlet/>
    </ListDetailLayout>
  );
};
export const BuyWithNavigation = () => {
  const navigate = useNavigate();
  const { coinToBuy } = useParams();
  const dispatch = useDispatch();
  const refreshData = useSelector((state) => state.buyState.refreshData);
  useEffect(() => {
    refreshData && dispatch(setRefreshData(false));
  }, [refreshData]);
  const onSuccess = useCallback(
    ({ isCrypto,toAsset }) => {
      navigate(`/exchange/buy/${toAsset}/summary/${isCrypto}`);
    },
    []
  );
  const handleCryptoChange = useCallback((coin) => {
    dispatch(setSelectedCryptoCoin(coin))
    navigate(`/exchange/buy/${coin?.code}`);
  }, []);
  return (
    <Buy
      onSuccess={onSuccess}
      onError={null}
      onCryptoChange={handleCryptoChange}
      defaultCryptoCode={coinToBuy}
      fetchAssetDetailsOnChange={false}
      shouldRefresh={refreshData}
    />
  );
};
export const SummaryWithNavigation = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { coinToBuy } = useParams();
  const onSuccess = useCallback(() => {
    // dispatch(fetchKpis({showLoading:false}));
    navigate(`/exchange/buy/${coinToBuy}/success`);
  }, [coinToBuy]);
  const handleClose = useCallback(() => {
    navigate(`/exchange/buy/${coinToBuy}`);
  }, [coinToBuy]);
  return <Summary onSuccess={onSuccess} onError={null} onClose={handleClose} />;
};

export const SuccessWithNavigation = () => {
  const navigate = useNavigate();
  const { coinToBuy } = useParams();
  const onSuccess = useCallback(() => {
    navigate(`/exchange/buy/${coinToBuy}`);
  }, [coinToBuy]);
  return <Success onOk={onSuccess} />;
};
export default BuyLayout;
