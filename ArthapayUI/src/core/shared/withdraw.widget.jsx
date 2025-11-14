import React, { useCallback, useEffect } from "react";
import AppSelect from "./appSelect";
import { NumericFormat } from "react-number-format";
import AppButton from "./appButton";
import { Form as AntForm } from "antd";
import { allowedDecimals } from "./numberFormatDecimal";
import { normalizeFormattedNumber, validations } from "./validations";
import AppDefaults from "../../utils/app.config";
import { useTranslation } from "react-i18next";
import Spinner from "./loaders/spinner";
import ActionController from "../onboarding/action.controller";
import { cryptoMaxAllowedDecimals } from "../../utils/custom.validator";
import Payees from "../../modules/wallets/crypto/payees";
import { useSelector } from "react-redux";
import NumericText from "./numericText";
function validateAmount(value, hasMinMax, data, canAllowZero) {
  if (value === 0 && !canAllowZero) {
    return Promise.reject(new Error("Should be greater than zero"));
  }
  if (!value && value !== 0) {
    return Promise.reject(new Error("Please Enter Amount "));
  }
  if (value && hasMinMax && value < data?.minLimit) {
    return Promise.reject(new Error(`Minimum value must be ${data?.minLimit}`));
  }
  if (value && value > data?.amount) {
    return Promise.reject(new Error(`Insufficient balance to continue`));
  }
  if (value && hasMinMax && value > data?.maxLimit) {
    return Promise.reject(new Error(`Should not exceed ${data?.maxLimit}`));
  }

  return Promise.resolve();
}
function WithdrawWidget({
  widgetClass = "md:w-[465px] w-full mx-auto ",
  vaults,
  canAllowZero = false,
  showVaults = false,
  vaultLabels = { label: "merchantName", value: "id" },
  onVaultChange,
  onSubmit,
  submitButtonText = "Continue",
  selectedCoin,
  coins,
  coinLabels = { label: "code", value: "code" },
  networkLabels = { label: "name", value: "code", amount: 'amount' },
  selectedNetwork,
  networks,
  loadingNetworks,
  saving,
  amount,
  isAmountDisabled = false,
  onCurrencyChange,
  onNetworkChange,
  hasMinMax = true,
  defaultNetwork,
  defaultVault,
  defaultCoin,
  defaultFormValues,
  amountLoading,
  showAmountField = true,
  showAvailableBalance = false,
  actionControlProps = { actionFrom: "Vaults Withdraw", redirectTo: "/wallets/crypto" },
  screen,
  shouldDisplayPayees = false,
}) {
  const [form] = AntForm.useForm();
  const { t } = useTranslation();
  useEffect(() => {
    isAmountDisabled &&
      (amount || amount === 0) &&
      form.setFieldValue("amount", amount);
  }, [amount, isAmountDisabled, form]);

  useEffect(() => {
    defaultVault && form.setFieldValue("vault", defaultVault);
    if (!isAmountDisabled && !form.getFieldValue("amount")) {
      form.resetFields(["amount"]);
    }
  }, [defaultVault, isAmountDisabled, form]);

  useEffect(() => {
    defaultNetwork && form.setFieldValue("networkName", defaultNetwork);
    if (!isAmountDisabled && !form.getFieldValue("amount")) {
      form.resetFields(["amount"]);
    }
  }, [defaultNetwork, isAmountDisabled, form]);

  useEffect(() => {
    defaultCoin && form.setFieldValue("currency", defaultCoin);
    if (!isAmountDisabled && !form.getFieldValue("amount")) {
      form.resetFields(["amount"]);
    }
  }, [defaultCoin, isAmountDisabled, form]);

  useEffect(() => {
    defaultFormValues && form.setFieldValue(defaultFormValues);
    if (!isAmountDisabled && !form.getFieldValue("amount")) {
      form.resetFields(["amount"]);
    }
  }, [defaultFormValues, isAmountDisabled, form]);
  const payeeInfo = useSelector((storeInfo) => storeInfo?.withdrawReducer?.selectedPayee);


  const handleCurrency = useCallback(
    (selectCoin) => {
      const coinToSelect = coins?.find((item) => item?.[coinLabels.value] === selectCoin);
      isAmountDisabled
        ? form.setFieldsValue({ currency: selectCoin, networkName: null })
        : form.setFieldsValue({
          currency: selectCoin,
          networkName: null,
          // amount: "",
        });
      form.setFields([
        { name: "amount", errors: [] },
        { name: "networkName", errors: [] },
      ]);
      onCurrencyChange(coinToSelect);
    },
    [coins, isAmountDisabled, form, onCurrencyChange]
  );
  const handleNetwork = useCallback(
    (selectedNetWork) => {
      const networkToSelect = networks?.find(
        (item) => item?.[networkLabels.value] === selectedNetWork
      );
      form.setFieldsValue({ networkName: selectedNetWork });
      onNetworkChange?.(networkToSelect);
    },
      form.setFields([
        { name: "amount", errors: [] },
        { name: "networkName", errors: [] },
      ]),
    [networks, form.onNetworkChange]
  );
  const handleVaultChange = useCallback((value) => {
    form.resetFields(["networkName", "currency"]);
    const vaultToSelect = vaults?.find((item) => item?.[vaultLabels.value] === value);
    form.setFieldsValue({ vault: vaultToSelect?.id });
    onVaultChange(vaultToSelect);
  }, [form, vaults, onVaultChange])
  const handleMin = useCallback(() => {
    form.setFieldsValue({ amount: selectedNetwork?.minLimit });
  }, [selectedNetwork, form]);
  const handleMax = useCallback(() => {
    form.setFieldsValue({ amount: selectedNetwork?.maxLimit });
  }, [selectedNetwork, form]);

  const normalizeValue = useCallback(
    (value) => (value ? normalizeFormattedNumber(value) : undefined),
    [normalizeFormattedNumber]
  );
  const handleFormSubmission = useCallback(() => {
    onSubmit?.(form.getFieldsValue(true))
  }, [onSubmit, form])

  const handleAmountChange = useCallback((data) => {
    form.setFieldsValue({ amount: data.floatValue });
  }, [form])
  return (
    <div>
      {!screen === "bank" && <hr className="border border-cryptoline my-3"></hr>}
      <div className={widgetClass}>
        <AntForm
          form={form}
          onFinish={handleFormSubmission}
          className="pay-inform basicinfo-form panel-form-items-bg !mb-0"
        >
          <div className="form-field-bg grid grid-cols-1 gap-4 md:p-2">
            {showVaults && (
              <div>
                <div className={`relative`}>
                  <div className="custom-input-lablel">
                    Wallet<span className="text-requiredRed">*</span>
                  </div>
                  <div className="text-left">
                    <AntForm.Item
                      className="mb-0 custom-select-float"
                      name="vault"
                      rules={[validations.requiredValidator()]}
                    >
                      <AppSelect
                        className="p-0 rounded outline-0 w-full text-lightWhite"
                        placeholder="Select Wallet"
                        fieldNames={vaultLabels}
                        options={vaults || []}
                        onChange={handleVaultChange}
                      />
                    </AntForm.Item>
                  </div>
                </div>
              </div>
            )}
            <div>
              <div className="bg-inputBg rounded-5 border border-dbkpiStroke w-full">
                <div className={`${showAmountField ? 'flex py-1.5 px-2' : ''} items-start justify-between gap-2`}>
                  {showAmountField && <div className="flex-1">
                    <div className={`relative`}>
                      <div className="custom-input-lablel">
                        {t('vault.vaultscrypto.amount')} <span className="text-requiredRed">*</span>
                      </div>
                      <AntForm.Item
                        className={`mb-0 custom-select-float`}
                        name="amount"
                        colon={false}
                        rules={[
                          {
                            validator: function (_, value) {
                              return validateAmount(
                                value,
                                hasMinMax,
                                selectedNetwork,
                                canAllowZero
                              );
                            },
                          },
                        ]}
                        normalize={normalizeValue}
                      >
                        {amountLoading && (
                          <div className="block custom-input-field bg-transparent border border-t-0 border-l-0 border-r-0 w-full border-b-amountBbr text-lightWhite p-2 rounded-none outline-0">
                            <Spinner size="default" />
                          </div>
                        )}
                        {!amountLoading && (
                          <NumericFormat
                            className={`${isAmountDisabled ? "block" : ""
                              } custom-input-field is-error-br outline-0 focus:outline-0 border-none `}
                            placeholder={t('vault.vaultscrypto.amountplaceholder')}
                            isAllowed={cryptoMaxAllowedDecimals}
                            thousandSeparator={true}
                            thousandsGroupStyle="lakh"
                            allowNegative={false}
                            decimalScale={allowedDecimals["amount"]}
                            value={form.getFieldValue("amount")}
                            onValueChange={handleAmountChange}
                            disabled={isAmountDisabled}
                            displayType={isAmountDisabled ? "text" : "input"}
                          />
                        )}
                      </AntForm.Item>
                    </div>
                  </div>}
                  <div className={`relative`}>
                    <div className="custom-input-lablel">
                      {t('vault.vaultscrypto.coin')} <span className="text-requiredRed">*</span>
                    </div>
                    <div className="text-left">
                      <AntForm.Item
                        className="mb-0 custom-select-float custom-input-border"
                        name="currency"
                        rules={[validations.requiredValidator()]}
                      >
                        <AppSelect
                          className="p-0 rounded outline-0 w-full text-lightWhite"
                          placeholder="Select Coin"
                          onChange={handleCurrency}
                          fieldNames={coinLabels}
                          options={coins || []}
                        />
                      </AntForm.Item>
                    </div>
                  </div>
                </div>
              </div>
              {hasMinMax && (
                <div className="flex justify-between items-center gap-3 flex-wrap">
                  <AppButton
                    type="link"
                    className="text-sm text-primaryColor font-normal hover:!text-primaryColor"
                    onClick={handleMin}
                  >
                    {t('vault.vaultscrypto.min')} -
                    <NumericText
                      value={selectedNetwork?.minLimit}
                      displayType="text"
                      thousandSeparator={true}
                      fixedDecimals={AppDefaults.cryptoDecimals}
                      
                    />
                    {selectedCoin}
                  </AppButton>

                  <AppButton
                    type="link"
                    className="text-sm text-primaryColor font-normal hover:!text-primaryColor"
                    onClick={handleMax}
                  >
                    {t('vault.vaultscrypto.max')} -
                    <NumericText
                      value={selectedNetwork?.maxLimit}
                      displayType="text"
                      thousandSeparator={true}
                        fixedDecimals={AppDefaults.cryptoDecimals}
                    />
                    {selectedCoin}
                  </AppButton>
                </div>
              )}
            </div>
            <div>
              <div className={`relative`}>
                <div className="custom-input-lablel">
                  {t('vault.vaultscrypto.network')} <span className="text-requiredRed">*</span>
                </div>
                <div
                  className={`text-left ${loadingNetworks && "select-arrow-hidden"
                    }`}
                >
                  <AntForm.Item
                    className="mb-0 custom-select-float"
                    name="networkName"
                    rules={[validations.requiredValidator()]}
                  >
                    <AppSelect
                      className="p-0 rounded outline-0 w-full text-lightWhite"
                      placeholder="Select Network"
                      type="input"
                      maxLength={100}
                      onChange={handleNetwork}
                      fieldNames={networkLabels}
                      options={networks || []}
                      loading={loadingNetworks}
                    />
                  </AntForm.Item>
                  {showAvailableBalance && selectedNetwork && (
                    <span className="pl-2 mt-1 absolute right-0">
                      <span>Available Balance:&nbsp;</span>
                      <NumericFormat
                        value={selectedNetwork?.[networkLabels.amount] || selectedNetwork?.balance || 0}
                        displayType="text"
                        className="text-light-addonColor"
                        fixedDecimalScale={AppDefaults.cryptoDecimals}
                        thousandSeparator={true}
                        decimalScale={AppDefaults.cryptoDecimals}
                      />
                    </span>
                  )}
                </div>
              </div>
            </div>
            {
              shouldDisplayPayees && <Payees />
            }
            {payeeInfo && <div className="text-center mb-9 mt-4">
              <ActionController
                {...actionControlProps}
                handlerType="button"
                onAction={form.submit}
                buttonType="primary"
                buttonClass={'w-full'}
                loading={saving}
                disabled={saving}
              >
                {submitButtonText}
              </ActionController>
            </div>}

            {!shouldDisplayPayees && <div className="text-center mb-9 mt-5">
              <ActionController
                {...actionControlProps}
                handlerType="button"
                onAction={form.submit}
                buttonType="primary"
                buttonClass={'w-full'}
                loading={saving}
                disabled={saving}
              >
                {submitButtonText}
              </ActionController>
            </div>}
          </div>
        </AntForm>
      </div>



      {/* <div className="w-[465px] mx-auto">
        <div className="flex items-center flex-col gap-3.5">
          <div className="w-full">
            <div className="bg-BlackBg rounded-5 px-4 py-3.5 ">
              <Form>
                <div className="flex items-center justify-between">
                  <Form.Item
                    className="mb-0 top-label-design"
                    name="addressFirstName"
                    label="You Pay"
                    colon={false}
                  >
                    <Input
                      className="w-full bg-transparent border-0 text-lightWhite  rounded outline-0 !p-0"
                      placeholder="86,733.52"
                      type="input"
                      maxLength={100}
                    />
                  </Form.Item>
                  <div className="vertical-line"></div>
                  <div className="flex items-center space-x-2 justify-center ">
                    <Dropdown className="db-dropdownlist"
                      menu={{
                        items,
                      }}
                      trigger={['click']}
                    >
                      <a onClick={(e) => e.preventDefault()}>
                        <Space>
                          <img className="inline-block h-7 w-7 rounded-full" src="https://devdottstoragespace.blob.core.windows.net/arthaimages/briton.svg" alt="Bitcoin" />
                          <div>
                            <h5 className="text-base text-subTextColor font-semibold">USD</h5>
                            <p className="text-xs font-normal text-subTextColor">470</p>
                          </div>
                          <button className='relative'>
                            <span className='icon menu-expandicon ml-2 cursor-pointer rotate-90'></span>
                          </button>
                        </Space>
                      </a>
                    </Dropdown>
                  </div>
                </div>
              </Form>
            </div>
            <div className="text-right mt-1.5">
              <button type="normal" className="text-primaryColor">Max: 10,000</button>
            </div>
          </div>
          <span className="icon db-down-arrow"></span>
          <div className="bg-BlackBg rounded-5 px-4 py-3.5 w-full ">
            <Form>
              <div className="flex items-center justify-between">
                <Form.Item
                  className="mb-0 top-label-design"
                  name="addressFirstName"
                  label="You Receive"
                  colon={false}
                >
                  <Input
                    className="w-full bg-transparent border-0 text-lightWhite  rounded outline-0 !p-0"
                    placeholder="1"
                    type="input"
                    maxLength={100}
                  />
                </Form.Item>
                <div className="vertical-line"></div>
                <div className="flex items-center space-x-2 justify-center ">
                  <Dropdown className="db-dropdownlist"
                    menu={{
                      item,
                    }}
                    trigger={['click']}
                  >
                    <a onClick={(e) => e.preventDefault()}>
                      <Space>
                        <img className="inline-block h-7 w-7 rounded-full" src="https://devdottstoragespace.blob.core.windows.net/arthaimages/BTC.svg" alt="Bitcoin" />
                        <div>
                          <h5 className="text-base text-subTextColor font-semibold">BTC</h5>
                        </div>
                        <button className='relative'>
                          <span className='icon menu-expandicon ml-2 cursor-pointer rotate-90'></span>
                        </button>
                      </Space>
                    </a>
                  </Dropdown>
                </div>
              </div>
            </Form>
          </div>
        </div>
        <Collapse className="border-0 border-r-0 border-l-0 collapse-border mt-6" items={colapsitems} defaultActiveKey={['1']} />
        <CustomButton type="primary" className="w-full !my-6">Continue</CustomButton>
        </div> */}





    </div>
  );
}

export default WithdrawWidget;
