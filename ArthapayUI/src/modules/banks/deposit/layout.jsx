import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ListDetailLayout from "../../../core/module.layouts/listdetail.layout";
import { Outlet, useLocation, useNavigate, useParams } from "react-router";
import { getAccounts, resetState } from "../../../reducers/accounts.reducer";
import ListHeader from "./list.header";
import ViewHeader from "./view.header";
import List from "./list";
import RecentTransactions from "./transactions.jsx";
import { getDepositBreadCrumbList } from "../service";
import { setBreadcrumb } from "../../../reducers/banks.reducer";
const BanksDepositLayout = () => {
  const { pathname } = useLocation();
  const { currency } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loader, data } = useSelector(
    (store) => store?.accountsReducer?.accounts
  );
  const selectedBank = useSelector(store => store.accountsReducer.selectedBank)

  useEffect(() => {
    dispatch(getAccounts());
    return () => dispatch(resetState());
  }, [dispatch]);
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
      ViewHeader={selectedBank?.accountStatus === "Approved" ? <ViewHeader /> : null}
    >
      <Outlet />
      {selectedBank?.accountStatus === "Approved" && (
        <RecentTransactions />
      )}
    </ListDetailLayout>
  );
};
export default BanksDepositLayout;
