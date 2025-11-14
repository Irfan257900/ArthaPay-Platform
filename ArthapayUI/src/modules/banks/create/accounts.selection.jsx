import React, { useCallback, useEffect, useState, memo } from "react";
import { Form, Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import AppSelect from "../../../core/shared/appSelect";
import CustomButton from "../../../core/button/button";
import {
  clearErrorMessage,
  fetchAccountsToCreate,
  setAccountToCreate,
  setAdditionalInfo,
  setAddressInformation,
  setBankForCreateAccount,
  setCurCreationStep,
  setDirectorBenficiaries,
  setKycDocInfo,
  setSelector,
  setType,
  setUboBenficiaries,
} from "../../../reducers/banks.reducer";
import AppAlert from "../../../core/shared/appAlert";
import { AccountSelectionLoader } from "../../../core/skeleton/banks.loaders";
import { useNavigate } from "react-router";
import VerificationsHandler from "../../../core/verifications.handler";
import CoinListLoader from "../../../core/skeleton/coinList.loader";
import AppCheckbox from "../../../core/shared/appCheckbox";
import NumericText from "../../../core/shared/numericText";

const AccountSelection = ({ isDrawer, showTitle = false }) => {
  const [error, setError] = useState("");
  const ishideBank = false;
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const accountsForCreation = useSelector(
    (store) => store.banks.accountsForCreation
  );
  const [selectedCoin, setSelectedCoin] = useState(null);
  const accountToCreate = useSelector((store) => store.banks.accountToCreate);
  const userConfig = useSelector((store) => store.userConfig.details);
  const type = userConfig?.accountType === "Business";
  const bankForCreateAccount = useSelector(
    (store) => store.banks.bankForCreateAccount
  );
  const { t } = useTranslation();
  const [termsVisible, setTermsVisible] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    // Reset states on component mount
    dispatch(fetchAccountsToCreate());
    dispatch(setKycDocInfo([]));
    dispatch(setAdditionalInfo(null));
    dispatch(setUboBenficiaries([]));
    dispatch(setDirectorBenficiaries([]));
    dispatch(setSelector(null));
    dispatch(setType(null));
    dispatch(setAddressInformation([]));
    dispatch(setAccountToCreate(null));
    dispatch(setBankForCreateAccount(null));
  }, [dispatch]);

  // Use a separate useEffect to handle setting the default value
  useEffect(() => {
    if (accountsForCreation?.data?.length > 0) {
      const firstAccount = accountsForCreation.data[0];
      // Dispatch the first account to the Redux store
      dispatch(setAccountToCreate(firstAccount));
      // Update local state
      setSelectedCoin(firstAccount);
      form.setFieldsValue({
        currency: firstAccount.name,
        bank: firstAccount.banks?.[0]?.name,
      });
    }
  }, [accountsForCreation.data, dispatch, form]);

  useEffect(() => {
    if (accountToCreate?.banks?.length > 0) {
      const firstBank = accountToCreate.banks[0];
      dispatch(setBankForCreateAccount(firstBank));
    }
  }, [accountToCreate, dispatch, form]);

  const goToWalletSelection = useCallback(() => {
    setError("");
    if (!accountToCreate) {
      setError(t("banks.errors.pleaseselectcurrency"));
    } else if (!bankForCreateAccount) {
      setError(t("banks.errors.pleaseselectbank"));
    } else {
      dispatch(setCurCreationStep("walletSelection"));
    }
  }, [accountToCreate, bankForCreateAccount, isDrawer, dispatch, t]);

  const handleAccountSelection = useCallback(
    (_, value) => {
      setSelectedCoin(value);
      dispatch(setAccountToCreate({ ...value }));
      setError(null);
      dispatch(setBankForCreateAccount(null));
      form.setFieldsValue({ bank: null });
    },
    [dispatch, form]
  );

  const handleBankSelection = useCallback(
    (_, value) => {
      dispatch(setBankForCreateAccount({ ...value }));
    },
    [dispatch]
  );

  const filterOption = useCallback(
    (input, option) =>
      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
      option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0,
    []
  );

  const validateFields = useCallback(
    async (e) => {
      e.preventDefault();
      const { name } = e.currentTarget;
      try {
        await form.validateFields();
        if (name === "PayWithWallet") {
          goToWalletSelection();
        }
      } catch (err) { }
    },
    [form, goToWalletSelection]
  );

  const clearError = useCallback(() => {
    if (accountsForCreation?.error) {
      dispatch(clearErrorMessage(["accountsForCreation"]));
    }
    if (error) {
      setError("");
    }
  }, [error, accountsForCreation?.error, dispatch]);

  const handleProceedToKyc = useCallback(() => {
    setError("");
    if (!accountToCreate) {
      setError(t("banks.errors.pleaseselectcurrency"));
      return;
    }
    const bankNote = bankForCreateAccount?.note;
    if (bankNote) {
      setTermsVisible(true);
      setIsChecked(false);
      return;
    }else {
      navigate(
        `/banks/account/create/${bankForCreateAccount?.productId}/${
          type ? "kyb" : "kyc"
        }`
      );
    }
  }, [accountToCreate, bankForCreateAccount, type, t, navigate]);

  const handleCheckboxChange = (e) => {
    setIsChecked(e);
  };

  const handleModalClose = () => {
    setTermsVisible(false);
    setIsChecked(false);
  };

  const handleAgreeAndContinue = () => {
    setTermsVisible(true);
    // setIsChecked(false);
    navigate(
      `/banks/account/create/${bankForCreateAccount?.productId}/${type ? "kyb" : "kyc"
      }`
    );
  };
  return (
    <>
      <VerificationsHandler loader={<CoinListLoader />}>
        {!isDrawer && showTitle && (
          <div
            className={`${isDrawer
                ? "flex flex-wrap items-center gap-2.5 mb-2.5 pb-3.5"
                : "grid grid-cols-1"
              }`}
          >
            <h1 className="text-2xl text-titleColor font-semibold">
              {t("banks.titles.createaccount")}
            </h1>
          </div>
        )}
        {(accountsForCreation?.error || error) && (
          <div className="mb-3.5 pb-1">
            <div className="alert-flex" style={{ width: "100%" }}>
              <AppAlert
                type="error"
                description={error || accountsForCreation?.error}
                showIcon
                closable
                onClose={clearError}
              />
            </div>
          </div>
        )}
        <div className="h-[300px] md:flex justify-center items-center">
          <Form form={form} autoComplete="off">
            <div
              className={`grid grid-cols-1 ${isDrawer
                  ? "md:grid-cols-1"
                  : "md:grid-cols-1 gap-4 md:w-[465px] w-full mx-auto mt-8"
                } gap-4 mt-3.5`}
            >
              {accountsForCreation?.loading && <AccountSelectionLoader />}
              {!accountsForCreation?.loading && (
                <>
                  <div className="text-left ">
                    <Form.Item
                      name="currency"
                      label={t("banks.lables.currency")}
                      rules={[
                        { required: true, message: t("cards.Is_required") },
                      ]}
                      className="mb-0 custom-select-float"
                      colon={false}
                    >
                      <AppSelect
                        showSearch
                        placeholder={t("banks.placeholders.selectcurrency")}
                        maxLength={30}
                        onSelect={handleAccountSelection}
                        options={accountsForCreation?.data || []}
                        fieldNames={{ label: "name", value: "name" }}
                        filterOption={filterOption}
                      />
                    </Form.Item>
                  </div>
                  {ishideBank && (
                    <div className="text-left ">
                      <Form.Item
                        name="bank"
                        label={t("banks.lables.bank")}
                        rules={[
                          { required: true, message: t("cards.Is_required") },
                        ]}
                        className="mb-0 custom-select-float"
                        colon={false}
                      >
                        <AppSelect
                          showSearch
                          placeholder={t("banks.placeholders.selectbank")}
                          maxLength={30}
                          onSelect={handleBankSelection}
                          disabled={!accountToCreate}
                          loading={accountsForCreation?.loading}
                          options={accountToCreate?.banks || null}
                          fieldNames={{ label: "name", value: "name" }}
                          filterOption={filterOption}
                        />
                      </Form.Item>
                    </div>
                  )}
                  {selectedCoin?.banks?.[0]?.accountCreationFee > 0 &&
                    selectedCoin?.banks?.[0]?.name && (
                      <h1 className="text-subTextColor !mt-0 border border-StrokeColor rounded-5 p-3">
                        <b>Note:</b> The bank requires a{" "}
                        <strong>
                          <NumericText
                            value={selectedCoin.banks[0].accountCreationFee}
                            decimalScale={2}
                            thousandSeparator={true}
                            displayType="text"
                            suffixText={`${selectedCoin.banks[0].name}`}
                          />
                        </strong>{" "}
                        account opening fee
                      </h1>
                    )}
                  <div className="md:mt-6 mt-2 flex flex-col gap-4">
                    {ishideBank && (
                      <CustomButton
                        name="PayWithWallet"
                        type="primary"
                        onClick={validateFields}
                        className="w-full"
                      >
                        {t("banks.buttons.payWithWallet")}
                      </CustomButton>
                    )}
                    <CustomButton
                      name="PayAndCreate"
                      type="primary"
                      onClick={handleProceedToKyc}
                      className="w-full"
                    >
                      Continue
                    </CustomButton>
                    {ishideBank && (
                      <CustomButton
                        className="w-full"
                        disabled={true}
                        onClick={validateFields}
                      >
                        {t("banks.buttons.payAndCreate")}
                      </CustomButton>
                    )}
                  </div>
                </>
              )}
            </div>
          </Form>
        </div>
      </VerificationsHandler>

      <Modal
        centered
        className="custom-modal cust-popup terminate note-cust-modal"
        title={
          <h2 className="text-2xl text-titleColor font-semibold">
            Terms And Conditions
          </h2>
        }
        open={termsVisible}
        onCancel={handleModalClose}
        footer={false}
        closeIcon={
          <button onClick={handleModalClose}>
            <span
              className="icon lg close cursor-pointer"
              title="close"
            ></span>
          </button>
        }
      >
        <div className="max-h-[300px] overflow-y-auto">
          <span
            dangerouslySetInnerHTML={{
              __html: bankForCreateAccount?.note || "No terms and conditions provided by the bank.",
            }}
          />
        </div>
        <label className="flex items-center gap-2 mt-4 cards-custom-checkbox">
          <AppCheckbox
            checked={isChecked}
            onChange={handleCheckboxChange}
            className="cursor-pointer"
          />
          <span>I Agree To The Terms And Conditions</span>
        </label>
        <div className="w-fit ml-auto !mt-4">
          <CustomButton
            type="primary"
            block
            className="applynow-btn"
            onClick={handleAgreeAndContinue}
            disabled={!isChecked}
          >
            <span>I've Read</span>
          </CustomButton>
        </div>
      </Modal>
    </>
  );
};

export default memo(AccountSelection);