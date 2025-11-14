import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchKpis, fetchRecentActivityGraphData, resetState } from "./reducer";
import { Outlet } from "react-router";
 
const Exchange = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchKpis({showLoading:true}));
    dispatch(fetchRecentActivityGraphData());
    return () => {
      dispatch(resetState());
    };
  }, []);
  return <Outlet/>;
};
 
export default Exchange;