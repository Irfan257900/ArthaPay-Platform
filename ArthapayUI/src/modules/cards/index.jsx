import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Outlet } from "react-router";
import { fetchGraphDetails, fetchKpis, resetState } from "../../reducers/cards.reducer";

const Cards = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchKpis({ showLoading: true }))
    dispatch(fetchGraphDetails({ showLoading: true }));
    return () => {
      dispatch(resetState());
      dispatch(fetchGraphDetails());
    };
  }, []);
  return <Outlet/>;
};
export default Cards;
