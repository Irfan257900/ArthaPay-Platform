import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import View from "./view";
import { getAccountBanks, setErrorMessages, setSelectedBank } from "../../../reducers/accounts.reducer";
import AppSelect from "../../../core/shared/appSelect";
import { FiatDetailsLoader } from "../../../core/skeleton/vaults.fiatRight.loader";
import AppAlert from "../../../core/shared/appAlert";

const Account = () => {
  const dispatch = useDispatch()
  const { currency, id } = useParams();
  const { loading: fetchingBanks, data: banks, error: banksError } = useSelector(state => state.accountsReducer.accountBanks)
  const [selectedBank, setSelectedBankData] = useState(null)
  useEffect(() => {
    if (id) {
      dispatch(getAccountBanks({ currency }))
      setSelectedBankData(null)
    }
  }, [id, currency]);

  // Add banks as a dependency to the useEffect to re-run when the store updates.
  useEffect(() => {
    if (banks && banks.bankList && banks.bankList.length > 0) {
      const selectedAccount = banks.bankList.find(account => account.id === id);
      setSelectedBankData(selectedAccount || banks.bankList[0]);
    }
  }, [banks, id]);

  const clearError = useCallback(() => {
    dispatch(setErrorMessages([{ key: 'accountDetails', message: '' }, { key: 'accountBanks', message: '' }]))
  }, [])

  const bankOptions = useMemo(() => {
    if (banks) {
      return banks?.bankList?.map((item) => (
        <AppSelect key={item?.name} value={item?.name}>
          {item?.name}
        </AppSelect>
      ))
    }
  }, [banks])

  const filteredAccountDetails = useMemo(() => {
    return banks?.bankList?.filter((account) => {
      if (selectedBank) {
        dispatch(setSelectedBank(selectedBank))
        return account.name === selectedBank.name;
      } else {
        setSelectedBankData(banks?.bankList?.[0])
        dispatch(setSelectedBank(selectedBank))
        return account.name === banks?.bankList?.[0]?.name;
      }
    });
  }, [banks, selectedBank]);

  const handleBankOptions = useCallback((value) => {
    const selectedBank = banks?.bankList?.filter((bnk) => bnk.name === value)
    setSelectedBankData(...selectedBank)
  }, [banks])

  const filterOption = useCallback(
    (input, option) => {
      return (
        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
        option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
      );
    }, []);

  return (<div className="panel-card buy-card card-paddingrm">
    {(banksError) && (
      <div className="alert-flex">
        <AppAlert
          type="error"
          description={banksError}
          showIcon
          closable={true}
          afterClose={clearError}
        />
      </div>
    )}
    <div className="summary-contentarea custom-search-highlight">
      {banks?.bankList?.length > 1 && <AppSelect
        showSearch
        placeholder="Select Bank"
        className="buy-entryinput  input-bordered add-accountselect !p-0"
        maxLength={30}
        value={selectedBank?.name}
        onSelect={handleBankOptions}
        filterOption={filterOption}
      >
        {bankOptions}
      </AppSelect>}
    </div>
    {(fetchingBanks) && <FiatDetailsLoader />}
    {!fetchingBanks && <View accountDetails={filteredAccountDetails} selectedCurrency={currency} />}
  </div>
  );
};

export default Account;