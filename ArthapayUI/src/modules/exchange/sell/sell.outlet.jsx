import React from "react";
import { useSelector } from "react-redux";
import AppEmpty from "../../../core/shared/appEmpty";
import { BuySellViewLoader } from "../../../core/skeleton/buysell";
import { Outlet, useParams } from "react-router";
import Transactions from "./transactions";
const SellOutlet = () => {
  const params = useParams();
  const { loader, data: cryptoCoins } = useSelector(
    (state) => state.sellState.cryptoCoins
  );
  const selectedCryptoCoin = useSelector(
    (store) => store.sellState.selectedCryptoCoin
  );
  return (
    <>
      {loader === "init" && <BuySellViewLoader />}
      {!loader && (!cryptoCoins?.assets?.length || !selectedCryptoCoin) && (
        <div>
          <AppEmpty />
        </div>
      )}
      {loader !== "init" && params.coinToSell && (
        <Outlet />
      )}
      {loader!=='init' && selectedCryptoCoin && <Transactions/>}
    </>
  );
};

export default SellOutlet;
