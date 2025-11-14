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
import Sell from "./sell";
import { fetchKpis } from "../reducer";
import Summary from "./summary";
import Success from "./success";
import SellOutlet from "./sell.outlet";
const SellLayout = () => {
  const { coinToSell } = useParams();
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    dispatch(fetchCryptoCoins({ step: "init",page:1 }));
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
        { id: "2", title: "Sell" },
        { id: "3", title: coinToSell },
        { id: "4", title: "Summary" },
      ];
    } else if (pathname.includes("success")) {
      return [
        {
          id: "1",
          title: "Exchange",
          handleClick: navigateToDashboard,
        },
        { id: "2", title: "Sell" },
        { id: "3", title: coinToSell },
        { id: "4", title: "Success" },
      ];
    } else if (coinToSell) {
      return [
        {
          id: "1",
          title: "Exchange",
          handleClick: navigateToDashboard,
        },
        { id: "2", title: "Sell" },
        { id: "3", title: coinToSell },
      ];
    } else {
      return [
        {
          id: "1",
          title: "Exchange",
          handleClick: navigateToDashboard,
        },
        { id: "2", title: "Sell" },
      ];
    }
  }, [pathname, coinToSell]);
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
      <SellOutlet/>
    </ListDetailLayout>
  );
};
export const SellWithNavigation = () => {
  const navigate = useNavigate();
  const { coinToSell } = useParams();
  const dispatch=useDispatch()
  const refreshData=useSelector(state=>state.sellState.refreshData)
  useEffect(()=>{
    refreshData && dispatch(setRefreshData(false))
  },[refreshData])
  const onSuccess = useCallback(
    ({isCrypto,fromAsset}) => {
      navigate(`/exchange/sell/${fromAsset}/summary/${isCrypto}`);
    },
    []
  );
  const handleCryptoChange = useCallback((coin) => {
    dispatch(setSelectedCryptoCoin(coin))
    navigate(`/exchange/sell/${coin?.code}`);
  }, []);
  return (
    <Sell
      onSuccess={onSuccess}
      onError={null}
      onCryptoChange={handleCryptoChange}
      defaultCryptoCode={coinToSell}
      fetchAssetDetailsOnChange={false}
      shouldRefresh={refreshData}
    />
  );
};
export const SummaryWithNavigation = () => {
  const navigate = useNavigate();
  const dispatch=useDispatch()
  const { coinToSell } = useParams();
  const onSuccess = useCallback(() => {
    // dispatch(fetchKpis({showLoading:false}))
    navigate(`/exchange/sell/${coinToSell}/success`);
  }, [coinToSell]);
  const handleClose = useCallback(() => {
    navigate(`/exchange/sell/${coinToSell}`);
  }, [coinToSell]);
  return <Summary onSuccess={onSuccess} onError={null} onClose={handleClose} />;
};

export const SuccessWithNavigation=()=>{
  const navigate = useNavigate();
  const { coinToSell } = useParams();
  const onSuccess = useCallback(() => {
    navigate(`/exchange/sell/${coinToSell}`);
  }, [coinToSell]);
  return <Success onOk={onSuccess}/>
}
export default SellLayout;
