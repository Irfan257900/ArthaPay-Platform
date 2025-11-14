import { memo, useCallback, useEffect } from "react";
import AccountsList from "../../../core/shared/accountsList";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router";
import {
  setSelectedCurrency,
} from "../../../reducers/accounts.reducer";
const fields = {
  currency: "name",
  currencyCode: "currency",
  available: "amount",
  id: "id",
  logo: "image",
};

const List = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const accounts = useSelector((store) => store?.accountsReducer?.accounts);
  const selectedCurrency = useSelector(
    (store) => store?.accountsReducer?.selectedCurrency
  );
  const selectAccount = useCallback(
    (selectedAccount) => {
      navigate(
        `/banks/deposit/${selectedAccount?.id}/details/${
          selectedAccount?.[fields.currencyCode]
        }`
      );
      dispatch(setSelectedCurrency(selectedAccount));
    },
    [accounts.data, selectedCurrency?.currencyCode]
  );
  useEffect(() => {
    if (
      accounts?.data &&
      accounts?.data?.length > 0 &&
      !pathname.includes("accountSuccess") &&
      !pathname.includes("create")
    ) {
      selectAccount(accounts?.data[0]);
    } else if (
      accounts?.data?.length > 0 &&
      pathname.includes(id) &&
      pathname.includes("details")
    ) {
      const accountToselect =
        accounts?.data?.find((account) => account.id === id) ||
        accounts?.data[0];
      selectAccount(accountToselect);
    }
  }, [accounts?.data]);

  return (
    <AccountsList
      accountsList={accounts?.data || []}
      fields={fields}
      onSelect={selectAccount}
      isLoading={accounts?.loader}
      showSearch={true}
      selected={selectedCurrency}
    />
  );
};

export default memo(List);
