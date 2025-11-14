import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ListDetailLayout from "../../../core/module.layouts/listdetail.layout";
import { Outlet, useLocation, useNavigate, useParams } from "react-router";
import { getAccounts, resetState} from "../../../reducers/banks.widthdraw.reducer";
import ListHeader from "./list.header";
import ViewHeader from "./view.header";
import List from "./list";
import RecentTransactions from "./transactions";
import { getWithdrawBreadCrumbList } from "../service";
import { setBreadcrumb } from "../../../reducers/banks.reducer";
const BanksWithdrawLayout = () => {
  const { pathname } = useLocation();
  const { currency } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const triggerFlag = useSelector(state => state.transferReducer.triggerFlag); 
  useEffect(() => {
    dispatch(getAccounts());
    return () => dispatch(resetState());
  }, [dispatch]);
  useEffect(() => {
    const list = getWithdrawBreadCrumbList(pathname, currency, navigate);
    dispatch(setBreadcrumb(list));
  }, [pathname, currency, navigate, dispatch]);
  return (
    <ListDetailLayout
      showBreadcrumb={false}
      hasOverview={false}
      hasPageHeader={false}
      ListHeader={<ListHeader />}
      ListComponent={<List />}
      ListComponentTitle="Select Account"
      ViewHeader={<ViewHeader />}
    >
      <Outlet />
     { currency &&<RecentTransactions key={triggerFlag}/>}
    </ListDetailLayout>
  );
};
export default BanksWithdrawLayout;
