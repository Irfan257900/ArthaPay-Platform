import { useParams } from "react-router";
import FiatPayees from "./fiat/fiat.layout.jsx";
import CryptoPayees from "./crypto/crypto.layout.jsx";
import Layout from "./layout.jsx";
import { setActiveTab, fetchKpis, fetchRecentActivityGraphData } from "../../reducers/payees.reducer";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
const Payees = () => {
  const { type } = useParams();
  const dispatch = useDispatch();
  const didFetch = useRef(false);
  useEffect(() => {
    if (!didFetch.current) {
      dispatch(fetchKpis({ showLoading: true }))
      dispatch(fetchRecentActivityGraphData({ showLoading: true }));
      didFetch.current = true;
    }
    return () => {
      dispatch(setActiveTab(""));
    };
  }, []);
  if (type === "crypto") {
    return <CryptoPayees />;
  }
  if (type === "fiat") {
    return <FiatPayees />;
  }
  return <Layout />;
};

export default Payees;
