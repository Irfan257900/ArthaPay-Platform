import React, { useCallback, useEffect, useState } from "react";
import SparklineGraph from "./sparkline";
import PageHeader from "../shared/page.header";
import { useNavigate } from "react-router";
import { MarketCryptoLoaders } from "../skeleton/market.loader 1 1 (1)";
import AppAlert from "../shared/appAlert";
import { WarningOutlined } from "@ant-design/icons";
import { deriveErrorMessage } from "../shared/deriveErrorMessage";
import AppEmpty from "../shared/appEmpty";
const icon = <WarningOutlined />;

const CryptoMarket = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate()

  const breadCrumbList = [
    { id: "1", title: "Dashboard",handleClick: () => navigate('/dashboard')},
    { id: "2", title: "Markets" }
];

  useEffect(() => {
    fetchCryptoData();
  }, []);
  const fetchCryptoData = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&sparkline=true"
      );
      if(response){
        const data = await response.json();
        setCryptoData(data);
        setLoading(false);
      }else{
        setError(deriveErrorMessage(response));
        setLoading(false);
      }
    } catch (error) {
      setError(deriveErrorMessage(error));
      setLoading(false);
    }
  };
  const clearErrorMsg = useCallback(() => {
    setError(null);
  }, []);

  return (
    <div>
      <PageHeader breadcrumbList={breadCrumbList} />
      {loading && <MarketCryptoLoaders/>}
      {!loading && <> 
      {error && (
        <div className="alert-flex">
          <AppAlert
            type="error"
            description={error}
            onClose={clearErrorMsg}
            icon={icon}
            showIcon
          />
          <span
            className="icon sm alert-close c-pointer"
            onClick={clearErrorMsg}
          ></span>
        </div>
      )}
      <div className="overflow-y-auto max-h-[800px]">
        <table className="min-w-full w-full table-auto border-collapse border border-StrokeColor">
          <thead className="">
            <tr className="bg-tableheaderBlack text-left top-[-1px] sticky">
              <th className="p-3 border border-StrokeColor text-paraColor font-semibold cursor-pointer text-sm sticky top-0 bg-tableheaderBlack">#</th>
              <th className="p-3 border border-StrokeColor text-paraColor font-semibold cursor-pointer text-sm sticky top-0 bg-tableheaderBlack">Coin</th>
              <th className="p-3 border border-StrokeColor text-paraColor font-semibold cursor-pointer text-sm sticky top-0 bg-tableheaderBlack">Price</th>
              <th className="p-3 border border-StrokeColor text-paraColor font-semibold cursor-pointer text-sm sticky top-0 bg-tableheaderBlack">24h</th>
              <th className="p-3 border border-StrokeColor text-paraColor font-semibold cursor-pointer text-sm sticky top-0 bg-tableheaderBlack">24h Volume</th>
              <th className="p-3 border border-StrokeColor text-paraColor font-semibold cursor-pointer text-sm sticky top-0 bg-tableheaderBlack">Market Cap</th>
              <th></th>
            </tr>
          </thead>
          {cryptoData?.length > 0 && 
          <tbody>
            {cryptoData?.map((coin, index) => (
              <tr key={coin.id} className="hover:bg-kendotdBghover">
                <td className="px-3 py-2 border border-StrokeColor">{index + 1}</td>
                <td className="px-3 py-2 border border-StrokeColor flex items-center space-x-2">
                  <img
                    src={coin.image}
                    alt={coin.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <div>
                    <span className="font-medium text-lightWhite text-sm">{coin.name}</span>{" "}
                    <span className="block text-paraColor uppercase text-sx font-medium">
                      {coin.symbol}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2 border border-StrokeColor font-medium text-lightWhite text-sm">
                  ${coin.current_price.toLocaleString()}
                </td>

                <td
                  className={`px-3 py-2 border border-StrokeColor font-medium text-sm ${coin.price_change_percentage_24h > 0
                    ? "text-textGreen"
                    : "text-textRed"
                    }`}
                >
                  {coin.price_change_percentage_24h?.toFixed(2)}%
                </td>

                <td className="px-3 py-2 border border-StrokeColor font-medium text-lightWhite text-sm">
                  ${coin.total_volume.toLocaleString()}
                </td>
                <td className="px-3 py-2 border border-StrokeColor font-medium text-lightWhite text-sm">
                  ${coin.market_cap.toLocaleString()}
                </td>
                <td className="px-3 py-2 border border-StrokeColor !w-52 ">
                  <SparklineGraph data={coin.sparkline_in_7d.price} color={"green"} />
                </td>
              </tr>
            ))}
          </tbody> }
        </table>
        {!cryptoData?.length && 
        <div className='text-center flex justify-center items-center'> <AppEmpty/></div>
        }
      </div> </>}
    </div>
  );
};

export default CryptoMarket;
