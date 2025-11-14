import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchKpis } from "../../reducers/vaults.reducer";
const useEnsureKpis = () => {
  const dispatch = useDispatch();
  const kpis = useSelector(state => state.withdrawReducer.kpis?.data);

  useEffect(() => {
    if (!kpis || kpis.length === 0) {
      dispatch(fetchKpis());
    }
  }, [kpis, dispatch]);
};

export default useEnsureKpis;