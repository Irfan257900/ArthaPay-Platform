import React, { useCallback } from "react";
import ScreenTabs from "../../../core/shared/screenTabs";
import { TotalAmount } from "../list.header";
import { useDispatch, useSelector } from "react-redux";
import { fetchCryptoCoins, setRefreshData } from "./store.reducer";
import { useNavigate } from "react-router";

const ListHeader = () => {
  const navigate=useNavigate()
  const dispatch = useDispatch();
  const { loader, data,page } = useSelector((state) => state.sellState.cryptoCoins);
  const handleTabChange = useCallback((tab) => {
    if (tab === "Buy") {
      navigate("/exchange/buy");
    }
  }, []);
  const onRefresh = useCallback(() => {
    dispatch(setRefreshData(true))
    dispatch(fetchCryptoCoins({ step: "more",page,data:data?.assets }));
  }, [data?.assets,page]);
  return (
    <div className="flex-1">
      <div className="flex justify-between items-center p-3 ">
        <div className=" toggle-btn custom-tabs ">
          <ScreenTabs
            className="custom-crypto-tabs"
            activeKey="Sell"
            onChange={handleTabChange}
          />
        </div>
      </div>
      <TotalAmount data={data} loading={loader} onRefresh={onRefresh} />
    </div>
  );
};

export default ListHeader;
