import React, { useEffect, useState } from "react";
import AppKpis from "../../../core/shared/AppKpis";
import { getMemberCardsKpis } from "../httpServices";
import { useParams } from "react-router";
import KpiLoader from "../../../core/skeleton/kpi.loader/kpi";
const icons=['total-employees','approved','awaiting-payment']
const CardsKpis = () => {
  const {memberId}=useParams()
  const [state, setState] = useState({ loading: true, data: null, error: "" });
  useEffect(() => {
    getMemberCardsKpis(setState,memberId);
  }, [memberId]);
  return (
    <div>
      {state.loading && <KpiLoader/>}
      {!state.loading && state.data && <AppKpis data={state.data} loader={state.loading} icons={icons} />}
    </div>
  );
};

export default CardsKpis;
