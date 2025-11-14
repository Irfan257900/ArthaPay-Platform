// src/components/ResourceFormFields.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Form, Input, Select, Alert } from "antd";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import FormInput from "./formInput";
import SingleBarLoader from "../skeleton/bar.loader";
import { appClientMethods } from "../http.clients";
import { setSelectedPaymentSchema } from "../../reducers/accounts.reducer";

const { Option } = Select;

const PaymentsMethods = ({
  paymentScheme,
  form,
  screenName,
  setSelectedPaymentMethod,
  setPaymentMethodError
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const resourceData = useMemo(() => {
    try {
      return JSON.parse(paymentScheme || "[]");
    } catch {
      return [];
    }
  }, [paymentScheme]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dropdownOptions, setDropdownOptions] = useState({});
  const [selectedValues, setSelectedValues] = useState({});

  const fetchDropdownOptions = useCallback(async (urlKey, apiUrl) => {
    setLoading(true);
    setError(null);
    try {
      const response = await appClientMethods.get(
        `${apiUrl}`
      );
      const apiData = response || {};
      const options =
        screenName === "banks"
          ? apiData.BankPaymentSchemes || []
          : apiData.PayOutCryptoPaymentSchemes || [];

      setDropdownOptions((prev) => {
        if (JSON.stringify(prev[urlKey]) === JSON.stringify(options)) {
          return prev;
        }
        return { ...prev, [urlKey]: options };
      });
    } catch (err) {
      console.error(`Failed to fetch data for ${urlKey}:`, err);
      setError(`Failed to load options for ${urlKey}.`);
    } finally {
      setLoading(false);
    }
  }, [screenName]);

  useEffect(() => {
    if (resourceData?.length > 0) {
      resourceData.forEach((field) => {
        if (field.fieldType === "dropdown" && field.url) {
          fetchDropdownOptions(field.key, field.url);
        }
      });
    }
  }, [resourceData, fetchDropdownOptions]);

  const handleSelectChange = useCallback(
    (value, fieldKey, allOptions) => {
      const selectedObject = allOptions.find(
        (item) => item.code === value || item.name === value
      );
      if (selectedObject) {
        setSelectedPaymentMethod(selectedObject);
        dispatch(setSelectedPaymentSchema(selectedObject));
        setPaymentMethodError('')
        setSelectedValues((prev) => ({
          ...prev,
          [fieldKey]: selectedObject,
        }));
      } else {
        setSelectedValues((prev) => {
          const newValues = { ...prev };
          delete newValues[fieldKey];
          return newValues;
        });
      }
    },
    [setSelectedPaymentMethod]
  );
  const handleClear = useCallback(() => {
    dispatch(setSelectedPaymentSchema(null));
    setSelectedPaymentMethod(null);
  }, [])

  if (loading) return <SingleBarLoader />;
  if (error)
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        className="my-4"
      />
    );

  return (
    <>
      {resourceData.map((field) => {
        const options = dropdownOptions[field.key] || [];

        return (
          <div key={field.key} className="mb-3">
            <FormInput
              label={field.label}
              isRequired={field.isMandatory === "true"}
            >
              <Form.Item
                className="mb-0 basicinfo-form panel-form-items-bg relative"
                name={field.key}
                rules={[
                  {
                    required: field.isMandatory === "true",
                    message: `${field.label} is required`,
                  },
                ]}
                colon={false}
              >
                {field.fieldType === "dropdown" ? (
                  <Select
                    placeholder={`Select ${field.label}`}
                    showSearch
                    onChange={(value) => {
                      form?.setFieldsValue({ [field.key]: value });
                      handleSelectChange(value, field.key, options);
                    }}
                    value={form?.getFieldValue(field.key)}
                    allowClear
                    onClear={handleClear}
                  >
                    {options.map((item) => (
                      <Option key={item.code} value={item.code}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    placeholder={t(
                      `payments.placeholders.enter${field.label
                        .replace(/\s/g, "")
                        .toLowerCase()}`
                    )}
                    maxLength={255}
                  />
                )}
              </Form.Item>
            </FormInput>
          </div>
        );
      })}
    </>
  );
};

export default PaymentsMethods;
