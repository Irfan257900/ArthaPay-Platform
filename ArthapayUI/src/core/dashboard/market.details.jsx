import React, { useCallback, useEffect, useMemo, useReducer } from "react";
import graph from "../../assets/images/market-graphbg.png";
import btcIcon from "../../assets/images/bitcoin.svg";
import CustomButton from "../button/button";
import ScreenTabs from "../shared/screenTabs";
import MarketAbout from "../../modules/market/market.about";
import MarketSecurity from "../../modules/market/market.security";
import MarketTokenomics from "../../modules/market/market.tokenomics";
import PageHeader from "../shared/page.header";
import { useNavigate, useParams } from "react-router";
import { initialState, reducer } from "./reducer";
import ContentLoader from "../skeleton/common.page.loader/content.loader";
import { fetchMarketCoinDetails, fetchMarketTopGainers } from "./http.services";
import MarketHighlightsKpis from "./market.kpis";
import AppAlert from "../shared/appAlert";
const tabs = [
  {
    title: "About",
    icon: "about-icon",
  },
  {
    title: "Tokenomics",
    icon: "tokennomics",
  },
  {
    title: "Security",
    icon: "security-icon",
  },
];
function MarketDeatils() {
  const {coin,id} = useParams()
  const navigate=useNavigate()
   const [state, dispatch] = useReducer(reducer, initialState);
   useEffect(()=>{
    if(coin){
      fetchData()
    }
    fetchMarketTopGainers(dispatch)
   },[coin])
  const navigateToDashboard = () => {
    navigate(`/dashboard`)
  }
  const navigateMarkets = () => {
    navigate(`/dashboard/makethighlights`)
  }
   const breadCrumbList = useMemo(() => {
    const defaultList = [ 
      { id: "1", title: "Dashboard" ,handleClick:()=>navigateToDashboard()},
      { id: "2", title: "Markets" ,handleClick:()=>navigateMarkets()},
    ];  
    let list = [...defaultList];
   if (coin) {
      list = [
        ...list,
        { id: "3", title: coin }
      ];
    }
    return list;
  }, [coin,id ]);
   const renderContent = () => {
    switch (state?.activeTab) {
      case "About":
        return <MarketAbout /> ;
      case "Tokenomics":
        return <MarketTokenomics />;
      case "Security":
        return <MarketSecurity />;
      default:
        return null;
    }
  };
  const handleTabChange = useCallback((key) => {
    dispatch({ type: 'setActiveTab', payload: key });
  },[state])
  const fetchData = async() => {
    const urlParams = {coin:coin}
   await fetchMarketCoinDetails(dispatch,urlParams)
  }
  const clearErrorMsg = useCallback(()=>{
    dispatch({ type: 'setError', payload: null });
  },[state]);
  
  return (
    <div className="mb-7">
      <PageHeader breadcrumbList={breadCrumbList} />
          { state?.error  && (
            <div className="alert-flex mb-24">
              <AppAlert
                type="error"
                description={state?.error}
                onClose={clearErrorMsg }
                showIcon
              />
              <span className="icon sm alert-close c-pointer" onClick={clearErrorMsg}></span>
            </div>
          )}
      <h4 className="text-2xl text-titleColor font-semibold mb-3">
        Market Highlights{" "}
      </h4>
      {/* <div className="grid md:grid-cols-3 gap-5 mb-7">
        <div>
        <div className="p-3.5 border border-dbkpiStroke rounded-5 grid md:grid-cols-2 bg-kpcardhover cursor-pointer">
            <div className="flex items-center justify-between md:col-span-2">
              <div className="flex gap-2.5">
                <img src={usdtIcon} alt="" className="w-8 h-8" />
                <div>
                  <h4 className="text-base text-dbkpiText font-semibold">
                    Bitcoin
                  </h4>
                  <p className="text-sm text-labelGrey ">BTC</p>
                </div>
              </div>
              <img src={redgraph} alt="" />
            </div>
            <div className="flex items-center gap-1 justify-between md:col-span-2 self-end mt-9 md:mt-5">
              <div className="flex items-center gap-1">
                <h3 className="text-md font-semibold text-dbkpiText">
                  $ 1.00
                </h3>
              </div>
              <div className="">
                <span className="icon graph-red ml-1"></span>{" "}
                <span className="text-textRed text-xs font-semibold">10% </span>{" "}
                <span className="text-labelGrey text-xs font-normal">
                  This Week
                </span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="p-3.5 border border-dbkpiStroke rounded-5 grid md:grid-cols-2 hover:bg-kpcardhover cursor-pointer">
            <div className="flex items-center justify-between md:col-span-2">
              <div className="flex gap-2.5">
                <img src={ethIcon} alt="" className="w-8 h-8" />
                <div>
                  <h4 className="text-base text-dbkpiText font-semibold">
                    Ethereum
                  </h4>
                  <p className="text-sm text-labelGrey ">ETH</p>
                </div>
              </div>
              <img src={featuredasset} alt="" />
            </div>
            <div className="flex items-center gap-1 justify-between md:col-span-2 self-end mt-9 md:mt-5">
              <div className="flex items-center gap-1">
                <h3 className="text-md font-semibold text-dbkpiText">
                  $ 168,757.95
                </h3>
              </div>
              <div className="">
                <span className="icon graph-green ml-1"></span>{" "}
                <span className="text-textGreen text-xs font-semibold">10% </span>{" "}
                <span className="text-labelGrey text-xs font-normal">
                  This Week
                </span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="p-3.5 border border-dbkpiStroke rounded-5 grid md:grid-cols-2 hover:bg-kpcardhover cursor-pointer">
            <div className="flex items-center justify-between md:col-span-2">
              <div className="flex gap-2.5">
                <img src={bnbIcon} alt="" className="w-8 h-8" />
                <div>
                  <h4 className="text-base text-dbkpiText font-semibold">
                  Binance
                  </h4>
                  <p className="text-sm text-labelGrey ">BNB</p>
                </div>
              </div>
              <img src={featuredasset} alt="" />
            </div>
            <div className="flex items-center gap-1 justify-between md:col-span-2 self-end mt-9 md:mt-5">
              <div className="flex items-center gap-1">
                <h3 className="text-md font-semibold text-dbkpiText">$ 3,352.42</h3>
              </div>
              <div className="">
                <span className="icon graph-green ml-1"></span>{" "}
                <span className="text-textGreen text-xs font-semibold">
                  45%{" "}
                </span>{" "}
                <span className="text-labelGrey text-xs font-normal">
                  This Week
                </span>
              </div>
            </div>
          </div>
        </div>     
      </div> */}
        {state?.marketDataLoader && <ContentLoader />}
        {!state?.marketDataLoader && 
          <div className="grid md:grid-cols-3 gap-5 mb-5">
            <MarketHighlightsKpis topgainerData={state?.marketData} />
          </div>}

      {!state?.loader && 
     <div className="grid grid-cols-12 gap-4">
      <div className="lg:col-span-8 col-span-12">
      <div className="mb-7 p-3.5 border border-dbkpiStroke rounded-5">
        <div className="md:flex justify-end space-y-2 md:space-y-0">
          <div className="flex items-center md:space-x-10 space-x-4 mb-4 md:mb-0">
            <span className="text-sm text-labelGrey">1H</span>
            <span className="text-sm w-7 h-7 rounded-md bg-primaryColor text-lightDark flex justify-center items-center">1D</span>
            <span className="text-sm text-labelGrey">1W</span>
            <span className="text-sm text-labelGrey">1M</span>
            <span className="text-sm text-labelGrey">1Y</span>
            <span className="text-sm text-labelGrey">All</span>
            <span className="w-[1px] h-7 bg-rightincardBr"></span>
            <div className="space-x-4">
            <span className="icon star-icon cursor-pointer"></span>
            <span className="icon notification-small cursor-pointer"></span>
            </div>
          </div>
        </div>
        <div className="py-4">
            <img src={graph} alt="" className="w-full" />
        </div> 
        <div className="flex items-center md:space-x-14 space-x-3 mb-4">
            <span className="md:text-sm text-[10px] text-labelGrey">12:30PM</span>
            <span className="md:text-sm text-[10px] text-labelGrey">03:12PM</span>
            <span className="md:text-sm text-[10px] text-labelGrey">04:30PM</span>
            <span className="md:text-sm text-[10px] text-labelGrey">08:15PM</span>
            <span className="md:text-sm text-[10px] text-labelGrey">10:15PM</span>
            <span className="md:text-sm text-[10px] text-labelGrey">02:30AM</span>
            <span className="md:text-sm text-[10px] text-labelGrey">03:30AM</span>       
          </div>
      </div>
      <div className="market-tab p-3.5 border border-dbkpiStroke rounded-5">
      <div className="team-tabs">
        <ScreenTabs
          activeKey={state?.activeTab}
          onChange={handleTabChange}
          list={tabs}
          shouldUsePropsList={true}
          tabFields={{ icon: "icon", key: "title", title: "title" }}
        />
        <div className="mt-4">
           {renderContent()}
        </div>
      </div>
      </div>
      </div>
      <div className="lg:col-span-4 col-span-12">
      <div className="mb-7 p-3.5 border border-dbkpiStroke rounded-5">
         <div className="flex space-x-2 mb-2">
            <img src={btcIcon} alt="" className="w-8 h-8" />
            <div className="space-x-1 flex items-center">
              <span className="text-lg text-dbkpiText font-medium">Bitcoin</span>
              <span className="text-base text-labelGrey ">BTC Price</span>
              <span className="w-5 h-5 rounded-md text-xs font-medium text-lightDark flex justify-center items-center bg-primaryColor ms-2">#1</span>
            </div>
         </div>
         <div className="flex items-center space-x-3 mb-4">
          <h1 className="text-3xl text-dbkpiText font-semibold">$101,817</h1>
          <p className="items-center space-x-2"><span className="icon graph-green menu-icon cursor-pointer"></span><span className="text-textGreen font-semibold text-2xl">2.8%</span></p>
          <span className="icon md info"></span>
         </div>
         <div className="flex items-center space-x-2 mb-2">
          <h1 className="text-base text-labelGrey font-semibold">$00,000</h1>
          <p className="items-center space-x-2"><span className="icon graph-green menu-icon cursor-pointer"></span><span className="text-textGreen font-semibold text-base">0.0%</span></p>
         </div>
         <div className="flex-1 bg-labelGrey h-1.5 relative rounded mb-1.5">
          <div className="absolute top-0 left-0 h-full bg-textGreen rounded" style={{ width: "85%" }}></div>
         </div>
         <div className="flex justify-between mb-4">
          <span className="text-labelGrey text-sm">$97,532.25</span>
          <span className="text-sm text-labelGrey">24h Range</span>
          <span className="text-labelGrey text-sm">$102,235</span>
        </div>
        <div className="flex mb-4">
        <CustomButton type="primary" className="w-full !text-start"><span className="icon md info star invert"></span>
          <span>Add to Portfolio </span><span>(1,869,789 added)</span>
       </CustomButton>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center border-b border-StrokeColor py-2">
            <span className="text-labelGrey">Market Cap</span>
            <span className="font-medium text-dbkpiText">$2,017,106,061,856</span>
          </div>
          <div className="flex justify-between border-b border-StrokeColor py-2">
            <span className="text-labelGrey">Fully Diluted Valuation</span>
            <span className="font-medium text-dbkpiText">$2,017,106,061,856</span>
          </div>
          <div className="flex justify-between border-b border-StrokeColor py-2">
            <span className="text-labelGrey">24 Hour Trading Vol</span>
            <span className="font-medium text-dbkpiText">$58,436,283,983</span>
          </div>
          <div className="flex justify-between border-b border-StrokeColor py-2">
            <span className="text-labelGrey">Circulating Supply</span>
            <span className="font-medium text-dbkpiText">19,811,131</span>
          </div>
          <div className="flex justify-between border-b border-StrokeColor py-2">
            <span className="text-labelGrey">Total Supply</span>
            <span className="font-medium text-dbkpiText">19,811,131</span>
          </div>
          <div className="flex justify-between border-b border-StrokeColor py-2">
            <span className="text-labelGrey">Max Supply</span>
            <span className="font-medium text-dbkpiText">21,000,000</span>
          </div>
      </div>
      </div>
      </div>
     </div>
     }
     {state?.loader && <ContentLoader />}
    </div>
  );
}

export default MarketDeatils;
