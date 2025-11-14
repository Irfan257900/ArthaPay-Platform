import { useEffect } from "react";
import { useDispatch } from "react-redux";
import ListDetailLayout from "../../../core/module.layouts/listdetail.layout";
import { Outlet, useLocation, useNavigate, useParams } from "react-router";
import { getAccounts, resetState } from "../../../reducers/accounts.reducer";
import ListHeader from "../deposit/list.header";
import ViewHeader from "./view.header";
import List from "../deposit/list";
import { setBreadcrumb } from "../../../reducers/banks.reducer";
import { getDepositBreadCrumbList } from "../service";
const BanksCreateAccountLayout = () => {
  const { pathname } = useLocation();
  const { currency } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAccounts());
    return () => dispatch(resetState());
  }, []);
  useEffect(() => {
    const list = getDepositBreadCrumbList(pathname, currency, navigate);
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
    </ListDetailLayout>
  );
};
export default BanksCreateAccountLayout;
