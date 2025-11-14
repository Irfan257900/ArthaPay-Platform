import React, { useState, useEffect } from "react";

const CryptoHighlights = () => {
  const [marketData, setMarketData] = useState(null);
  const [trendingCoins, setTrendingCoins] = useState([]);
  const [topGainers, setTopGainers] = useState([]);

  useEffect(() => {
    const fetchMarketData = async () => {
      const marketResponse = await fetch("https://api.coingecko.com/api/v3/global");
      const marketResult = await marketResponse.json();
      setMarketData(marketResult.data);

      const trendingResponse = await fetch("https://api.coingecko.com/api/v3/search/trending");
      const trendingResult = await trendingResponse.json();
      setTrendingCoins(trendingResult.coins);

      const topGainersResponse = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=price_change_percentage_24h_desc&per_page=3"
      );
      const topGainersResult = await topGainersResponse.json();
      setTopGainers(topGainersResult);
    };

    fetchMarketData();
  }, []);

  return (
    <div className="p-4">
      {/* Market Highlights */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white shadow-md rounded">
          <h3 className="text-lg font-semibold">Market Cap</h3>
          <p className="text-2xl font-bold">
            ${marketData?.total_market_cap?.usd?.toLocaleString()}
          </p>
          <p className={`text-sm ${marketData?.market_cap_change_percentage_24h_usd > 0 ? "text-green-500" : "text-red-500"}`}>
            {marketData?.market_cap_change_percentage_24h_usd?.toFixed(2)}%
          </p>
        </div>
        <div className="p-4 bg-white shadow-md rounded">
          <h3 className="text-lg font-semibold">24h Trading Volume</h3>
          <p className="text-2xl font-bold">
            ${marketData?.total_volume?.usd?.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Trending Coins */}
      <div className="mt-4 p-4 bg-white shadow-md rounded">
        <h3 className="text-lg font-semibold">Trending Coins</h3>
        <ul>
          {trendingCoins.map((coin) => (
            <li key={coin.item.id} className="flex justify-between">
              <span>{coin.item.name} ({coin.item.symbol.toUpperCase()})</span>
              <span>{coin.item.price_btc.toFixed(8)} BTC</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Top Gainers */}
      <div className="mt-4 p-4 bg-white shadow-md rounded">
        <h3 className="text-lg font-semibold">Top Gainers</h3>
        <ul>
          {topGainers.map((coin) => (
            <li key={coin.id} className="flex justify-between">
              <span>{coin.name} (${coin.current_price.toFixed(2)})</span>
              <span className="text-green-500">
                {coin.price_change_percentage_24h?.toFixed(2)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CryptoHighlights;
