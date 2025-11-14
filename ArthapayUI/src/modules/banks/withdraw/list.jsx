import { memo, useCallback, useEffect } from "react";
import AccountsList from "../../../core/shared/accountsList";
import {
  setSelectedCurrency,
} from "../../../reducers/banks.widthdraw.reducer";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router";
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
  const { currency } = useParams();
  const accounts = useSelector((store) => store?.transferReducer?.accounts);
  const selectedCurrency = useSelector(
    (store) => store?.transferReducer?.selectedCurrency
  );
  const handleSelection = useCallback(
    (item) => {
      if (item && !pathname.includes("success")) {
        dispatch(setSelectedCurrency(item));
        navigate(`/banks/withdraw/${item[fields.currencyCode]}`);
      } else {
        dispatch(setSelectedCurrency(item));
      }
    },
    [pathname]
  );
  useEffect(() => {
    if (
      accounts?.data?.length > 0 &&
      (!currency || currency === "null" || currency === "undefined")
    ) {
      handleSelection(accounts.data[0]);
    } else if (accounts?.data?.length > 0) {
      const accountToselect =
        accounts?.data?.find(
          (account) => account?.[fields.currencyCode] === currency
        ) || accounts?.data[0];
      handleSelection(accountToselect);
    }
  }, [accounts?.data, currency]);

  return (
    <AccountsList
      accountsList={accounts?.data || []}
      fields={fields}
      onSelect={handleSelection}
      isLoading={accounts?.loader}
      showSearch={true}
      selected={selectedCurrency}
    />
  );
};

export default memo(List);
