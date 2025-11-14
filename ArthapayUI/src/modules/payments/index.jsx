import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Outlet } from "react-router";
import { fetchKpisData, fetchRecentActivityGraphData } from "./reducers/payout.reducer";
 
const Payments = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchRecentActivityGraphData());
        dispatch(fetchKpisData({showLoading:true}));
    }, []);
    return <Outlet />;
};
 
export default Payments;