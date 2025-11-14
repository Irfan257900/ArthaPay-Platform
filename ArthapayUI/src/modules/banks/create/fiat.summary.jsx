import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import AppAlert from "../../../core/shared/appAlert";
import { clearErrorMessage, createBankAccount, setErrorMessage } from "../../../reducers/banks.reducer";
import AccountSummary from "./account.summary";
import { useNavigate, useParams } from "react-router";

const FiatSummary = () => {
  const dispatch = useDispatch();
  const { data: summary } = useSelector(
    (store) => store.banks.summaryForAccountCreation
  );
  const { productId, type } = useParams();
  const navigate = useNavigate();
  const { loading: saving, error: saveError } = useSelector(
    (store) => store.banks.createAccountData
  );

  const createAccount = useCallback(async () => {
  try {
    await dispatch(createBankAccount(productId)).unwrap();
    navigate(`/banks/account/create/${productId}/${type}/pay/fait/summary/success`);
  } catch (error) {
    console.error("Create account failed:", error);
  }
}, [dispatch, navigate, productId, type]);


  const clearError = useCallback(() => {
    dispatch(clearErrorMessage(['createAccountData']))
  }, [])
  const setError = useCallback((message) => {
    dispatch(setErrorMessage([{ key: 'createAccountData', message }]))
  }, [])
  return (
    <>
      {(saveError) && (
        <div className="alert-flex withdraw-alert fiat-alert">
          <AppAlert type={"error"} description={saveError} showIcon closable onClose={clearError} />
        </div>
      )}
      <AccountSummary
        saving={saving}
        onSubmit={createAccount}
        details={summary}
        setError={setError}
      />
    </>
  );
};

export default FiatSummary;
