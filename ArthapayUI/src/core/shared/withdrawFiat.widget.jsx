import React, { useCallback, useEffect } from "react";
import AppSelect from "./appSelect";
import { NumericFormat } from "react-number-format";
import AppButton from "./appButton";
import { Form as AntForm } from "antd";
import { normalizeFormattedNumber, validations } from "./validations";
import Loader from "./loader";
import { useTranslation } from "react-i18next";
import ActionController from "../onboarding/action.controller";
import { fiatMaxAllowedDecimals } from "../../utils/custom.validator";
import FiatPayees from "../../modules/wallets/fiat/withdraw.components/fiatPayees";
import { useSelector } from "react-redux";
import NumericText from "./numericText";
import AppDefaults from "../../utils/app.config";
function validateAmount(value, hasMinMax, data) {
  if (value === 0) {
    return Promise.reject(new Error("Should be greater than zero"));
  }
  if (!value) {
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
function WithdrawFaitWidget({
  widgetClass = "md:w-[465px] w-full mx-auto",
  onSubmit,
  submitButtonText = "Continue",
  selectedCoin,
  coins,
  coinLabels = { label: "code", value: "code" },
  saving,
  amount,
  isAmountDisabled = false,
  onCurrencyChange,
  hasMinMax = true,
  defaultCoin,
  defaultFormValues,
  amountLoading,
  btnLoader,
  actionControlProps = { actionFrom: "Vaults Withdraw", redirectTo: "/wallets/fiat" },
 shouldDisplayPayees=false

}) {
  const [form] = AntForm.useForm();
  const { t } = useTranslation();
  useEffect(() => {
    isAmountDisabled &&
      (amount || amount === 0) &&
      form.setFieldValue("amount", amount);
  }, [amount, isAmountDisabled, form]);
  useEffect(() => {
    defaultCoin && form.setFieldValue("currency", defaultCoin);
    if (!isAmountDisabled && !form.getFieldValue("amount")) {
      form.resetFields(["amount"]);
    }
     form.setFields([
          { name: "amount", errors: [] },
          { name: "currency", errors: [] },
        ]);
  }, [defaultCoin, amount, isAmountDisabled, form]);
  useEffect(() => {
    defaultFormValues && form.setFieldValue(defaultFormValues);
    if (!isAmountDisabled && !form.getFieldValue("amount")) {
      form.resetFields(["amount"]);
    }
  }, [defaultFormValues, amount, isAmountDisabled, form]);
  const handleCurrency = useCallback(
    (selectCoin) => {
      const coinToSelect = coins?.find((item) => item?.code === selectCoin);
      isAmountDisabled
        ? form.setFieldsValue({ currency: selectCoin })
        : form.setFieldsValue({
          currency: selectCoin,
          // amount: "",
        });
        form.setFields([
          { name: "amount", errors: [] },
          { name: "currency", errors: [] },
        ]);
      onCurrencyChange(coinToSelect);
    },
    [coins, isAmountDisabled, form, onCurrencyChange]
  );


  const PayeeId= useSelector((state) => state.withdrawFiat?.selectedPayee);

  const handleMin = useCallback(() => {
    form.setFieldsValue({ amount: selectedCoin?.minLimit });
  }, [selectedCoin, form]);
  const handleMax = useCallback(() => {
    form.setFieldsValue({ amount: selectedCoin?.maxLimit });
  }, [selectedCoin, form]);

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
    <>
      <div className={widgetClass}>
        <AntForm
          form={form}
          onFinish={handleFormSubmission}
          className="pay-inform basicinfo-form panel-form-items-bg !mb-0"
        >
          <div className="form-field-bg grid grid-cols-1 gap-4 md:p-2">
            <div>
              <div className="bg-inputBg !border !border-StrokeColor rounded-5 px-2 py-1.5 w-full">
                <div className=" flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className={`relative`}>
                      <div className="custom-input-lablel">
                        {t('vault.vaultscrypto.amount')} <span className="text-requiredRed">*</span>
                      </div>
                      <AntForm.Item
                        className={`mb-0 `}
                        name="amount"
                        colon={false}
                        rules={[
                          {
                            validator: function (_, value) {
                              return validateAmount(
                                value,
                                hasMinMax,
                                selectedCoin
                              );
                            },
                          },
                        ]}
                        normalize={normalizeValue}
                      >
                        {amountLoading && (
                          <div className="text-center">
                            <Loader />
                          </div>
                        )}
                        {!amountLoading && (
                          <NumericFormat
                            className={`${isAmountDisabled ? "block" : ""
                              } custom-input-field is-error-br !border-none  outline-0 focus:outline-0`}
                            placeholder={t('vault.vaultscrypto.amountplaceholder')}
                            isAllowed={fiatMaxAllowedDecimals}
                            thousandSeparator={true}
                            thousandsGroupStyle="lakh"
                            allowNegative={false}
                            decimalScale={2}
                            value={form.getFieldValue("amount")}
                            onValueChange={handleAmountChange}
                            disabled={isAmountDisabled}
                            displayType={isAmountDisabled ? "text" : "input"}
                          />
                        )}
                      </AntForm.Item>
                    </div>
                  </div>
                  <div className={`relative walletwithdraw `}>
                    <div className="custom-input-lablel">
                      {('Currency')} <span className="text-requiredRed">*</span>
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
                <div className="flex justify-between items-center">
                  <AppButton
                    type="link"
                    className="text-sm text-primaryColor font-normal hover:!text-primaryColor"
                    onClick={handleMin}
                  >
                    {t('vault.vaultscrypto.min')} -
                    <NumericText
                      value={selectedCoin?.minLimit}
                      displayType="text"
                      thousandSeparator={true}
                      //  fixedDecimals={AppDefaults.fiatDecimals}
                       decimalScale={AppDefaults.fiatDecimals}
                    />
                    {selectedCoin?.currency}
                  </AppButton>
                  <AppButton
                    type="link"
                    className="text-sm text-primaryColor font-normal hover:!text-primaryColor"
                    onClick={handleMax}
                  >
                    {t('vault.vaultscrypto.max')} -
                    <NumericText
                      value={selectedCoin?.maxLimit}
                      displayType="text"
                      thousandSeparator={true}
                        decimalScale={AppDefaults.fiatDecimals}
                    />
                    {selectedCoin?.currency}
                  </AppButton>
                </div>
              )}
            </div>
            {shouldDisplayPayees && <FiatPayees/>}
           { PayeeId && <div className="text-center mb-9 mt-5">
              <ActionController
                {...actionControlProps}
                handlerType="button"
                onAction={form.submit}
                buttonType="primary"
                buttonClass={'w-full'}
                loading={btnLoader}
                disabled={saving}
              >
                {submitButtonText}
              </ActionController>
            </div>
}
          </div>
        </AntForm>
      </div>
    </>
  );
}

export default WithdrawFaitWidget;