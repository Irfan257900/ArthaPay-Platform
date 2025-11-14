import { useCallback } from "react";
import PayeeFormInput from "../formInput";
import {
  validations,
  normalizeString,
  ibanRegex,
} from "../../../core/shared/validations";
import { Button, Select } from "antd";
import GetPaymentField from "./getPaymentField";
import IbanDetails from "./iban.details";
import { getIBANAccountDetails } from "../http.services";
import { useSelector } from "react-redux";
const { requiredValidator, regexValidator } = validations;
const getRulesofFields = (field) => {
  const { isMandatory, validation, label } = field;
  let rules = [];
  if (isMandatory) {
    rules = [...rules, requiredValidator()];
  }
  if (validation) {
    try {
      const regexToValidate = new RegExp(validation);
      rules = [
        ...rules,
        regexValidator(normalizeString(label), regexToValidate),
      ];
    } catch (error) { }
  }
  return rules;
};
const PaymentInfo = ({
  FormInstance,
  setField,
  form,
  lookups,
  initialData,
  state,
  paymentFields,
  setState,
  setError,
  fiatCurrenciesLookup,
  getBankBranchLU,
  setLookups,
  props,
  getBankLU,
  mode,
  isFormEditable
}) => {
  const currency = FormInstance.useWatch("currency", form);
  const isValidIban = (iban) => ibanRegex.test(iban);
  const onCurrencyTypeChange = useCallback(
    (value) => {
      setField("currency", value);
    },
    [initialData, form]
  );

  function shallowEqual(object1, object2) {
    const isObj1 = typeof object1 === "object" && object1 !== null;
    const isObj2 = typeof object2 === "object" && object2 !== null;

    // If one is object and the other is not, return false
    if (isObj1 !== isObj2) {
      return false;
    }

    // If both are not objects (primitives), return true if strictly equal
    if (!isObj1 && !isObj2) {
      return object1 === object2;
    }

    // Both are objects: do shallow comparison
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (let key of keys1) {
      if (object1[key] !== object2[key]) {
        return false;
      }
    }

    return true;
  };

  const handlePaymentFieldChange = useCallback(
    (value, field) => {
      const paymentFieldsList = form.getFieldValue('paymentFields') || paymentFields?.[0]?.fields || [];
      const fieldDef = paymentFieldsList.find(f => f.field === field);

      // Helper to get reset value based on field type
      const getResetValue = (f) => (f?.fieldType === "lookup" ? null : "");
      const bankNameDef = paymentFieldsList.find(f => f.field === "bankName");
      const branchCodeDef = paymentFieldsList.find(f => f.field === "branchCode");

      if (field === "bankName") {
        form.setFieldsValue({
          paymentInfo: {
            branchCode: getResetValue(branchCodeDef)
          },
          branchCode: getResetValue(branchCodeDef)
        });
        setLookups('branchCodes', []);
        if (fieldDef?.fieldType === "lookup" && lookups?.bankProviders?.length > 0 && value) {
          getBankBranchLU(value, form.getFieldsValue(true) || {});
        }
      } else if (field === "bankCountry") {
        form.setFieldsValue({
          paymentInfo: {
            bankName: getResetValue(bankNameDef),
            branchCode: getResetValue(branchCodeDef)
          },
          bankName: getResetValue(bankNameDef),
          branchCode: getResetValue(branchCodeDef)
        });
        setLookups('bankProviders', []);
        setLookups('branchCodes', []);
        if (fieldDef?.fieldType === "lookup" && lookups?.bankCountries?.length > 0 && value) {
          getBankLU(value, form.getFieldsValue(true) || {});
        }
      } else {
        form.setFieldsValue({ paymentInfo: { [field]: value } });
      }
    },
    [form, setLookups, getBankBranchLU, getBankLU, paymentFields]
  );

  const shouldUpdatePaymentFields = useCallback((prev, curr) => {
    return (
      !shallowEqual(prev.paymentFields, curr.paymentFields) ||
      !shallowEqual(prev.paymentInfo, curr.paymentInfo) ||
      prev.currency !== curr.currency
    );
  }, []);

  const shouldUpdatePaymentType = useCallback(
    (prev, curr) => prev.currency !== curr.currency,
    []
  );

  const handleValidate = useCallback(
    async (event) => {
      event.preventDefault();
      const iban = form.getFieldsValue(true)?.paymentInfo?.ibanNumber;
      const urlParams = { ibanNo: iban };
      await getIBANAccountDetails(setState, urlParams, setError);
    },
    [state, setError]
  );

  const handleCheckboxChange = (e) => {
    setState({ type: "setIsBaas", payload: e.target.checked });
    form.resetFields([
      "documentType",
      "frontImage",
      "backImage",
      "documentNumber",
    ]);
  };

  const enabledModules = useSelector(
    (state) => state.userConfig.enabledModules
  );

  const isModuleEnabled = useCallback(
    (name) => {
      if (!Array.isArray(enabledModules) || enabledModules?.length === 0) {
        return false;
      }
      return enabledModules.includes(name);
    },
    [enabledModules]
  );

  return (
    <div className="mt-6">
      <h1 className="text-xl font-semibold  mb-3 text-titleColor capitalize">
        Bank Account
      </h1>
      <div className={`${props?.IsOnTheGo
        ? "flex-1 space-y-5 basicinfo-form"
        : "grid md:grid-cols-2 gap-5 basicinfo-form"
        }`}>
        <PayeeFormInput isRequired={true} label={"Currency"}>
          <FormInstance.Item shouldUpdate={shouldUpdatePaymentType}>
            <FormInstance.Item
              name="currency"
              className="mb-0 custom-select-float"
              rules={[requiredValidator()]}
            >
              <Select
                showSearch={true}
                allowClear={true}
                className="p-0 rounded outline-0 w-full text-lightWhite"
                placeholder="Select Currency"
                onSelect={onCurrencyTypeChange}
                fieldNames={{ label: "code", value: "code" }}
                options={fiatCurrenciesLookup || []}
                disabled={!isFormEditable}
              />
            </FormInstance.Item>
          </FormInstance.Item>
        </PayeeFormInput>
      </div>

      {currency && paymentFields?.length > 0 && (
        <div>
          <PayeeFormInput>
            <FormInstance.Item shouldUpdate={shouldUpdatePaymentFields}>
              {({ getFieldValue }) => {
                return (
                  <>
                    <div className={`${props?.IsOnTheGo
                      ? "flex-1 space-y-5 basicinfo-form"
                      : "grid md:grid-cols-2 gap-5 basicinfo-form"
                      }`}>
                      {getFieldValue("paymentFields")?.map((field) => {
                        return (
                          <PayeeFormInput
                            key={field.field}
                            isRequired={field.isMandatory}
                            label={field.label}
                          >
                            <FormInstance.Item
                              key={field.field}
                              name={['paymentInfo', field.field || field.key]}
                              className="mb-0 relative"
                              rules={getRulesofFields(field)}
                              validateTrigger={["onBlur", "onChange"]}
                            >
                              <GetPaymentField
                                field={field}
                                onBlur={handlePaymentFieldChange}
                                onChange={handlePaymentFieldChange}
                                lookups={lookups}
                                isFormEditable={isFormEditable}
                              />
                            </FormInstance.Item>
                            {field.field === "ibanNumber" &&
                              (currency === "EUR" || currency === "CHF") && (
                                <Button
                                  type="button"
                                  htmlType="primary"
                                  className="absolute top-0 right-0 hover:!transform-none hover:!transition-none bg-advcard border border-primaryColor text-primaryColor rounded-l-none rounded-r-5 h-[52px] disabled:cursor-not-allowed"
                                  loading={false}
                                  disabled={
                                    !form.getFieldsValue(true)?.paymentInfo
                                      ?.ibanNumber
                                  }
                                  onClick={handleValidate}
                                >
                                  <span>Validate</span>
                                </Button>
                              )}
                          </PayeeFormInput>
                        );
                      })}
                    </div>{" "}
                  </>
                );
              }}
            </FormInstance.Item>
          </PayeeFormInput>
          {isValidIban(form.getFieldsValue(true)?.paymentInfo?.ibanNumber) && (
            <IbanDetails state={state} />
          )}
        </div>
      )}
      {isModuleEnabled("Payments") && <div className="my-4">
        <label className="text-center custom-checkbox ">
          <input
            type="checkbox"
            checked={state.isBaas}
            onChange={handleCheckboxChange}
            disabled={mode === "edit"}
          />
          <span></span>{" "}
        </label>{" "}
        <span className="ml-1">
          {" "}
          Please select this checkbox to add additional info for fiat payouts
        </span>
      </div>}
    </div>
  );
};

export default PaymentInfo;