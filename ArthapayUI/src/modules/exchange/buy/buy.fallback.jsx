import React from "react";
import AppEmpty from "../../../core/shared/appEmpty";
import { useSelector } from "react-redux";
import { BuySellViewLoader } from "../../../core/skeleton/buysell";

const BuyFallBack = () => {
  const { loader, data } = useSelector(
    (store) => store?.buyState?.cryptoCoins
  );
  const selectedCoin = useSelector(
    (store) => store?.buyState?.selectedCryptoCoin
  );
  return (
    <>
      {loader && <BuySellViewLoader />}
      {!loader && !data?.length && !selectedCoin && <AppEmpty />}
    </>
  );
};

export default BuyFallBack;
