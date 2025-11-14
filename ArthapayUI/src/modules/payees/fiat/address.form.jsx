import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { Input, Select } from "antd";
import PayeeFormInput from "../formInput";
import { validations } from "../../../core/shared/validations";
const { requiredValidator, textValidator, cityValidator, zipCodeValidator } = validations

const PayeeAddressForm = ({ FormInstance, setField, lookups, form, fetchFaitCurrencies, setFiatCurrenciesLookup,props ,isFormEditable}) => {
  const handleChange = useCallback((e) => {
    setField?.(e.target.id, e.target.value);
  }, [setField]);
  const handleBlur = useCallback((e) => {
    setField?.(e.target.id, e.target?.value?.trim());
  }, [setField]);
  const handleCountrySelect = useCallback((value) => {
    setField('country', value);
    // setFiatCurrenciesLookup([]);
    // fetchFaitCurrencies(value, true);
  }, [setField]);
  const handleStateSelect = useCallback((value) => {
    setField('state', value);
  }, [setField]);
  const handlePostalCodeChange = useCallback((e) => {
    const value = e.target.value.toUpperCase(); // Convert to uppercase
    setField?.("postalCode", value); // Pass the uppercase value
    form.setFieldsValue({ postalCode: value }); // Update Ant Design form field
  }, [setField, form]);
  return (
    <div className="!w-full">
      <div className="mt-6">
        {/* <h1 className="!text-xl font-semibold !mb-3 !text-titleColor capitalize">
          Recipient's Address
        </h1> */}
        <div className={`${props?.IsOnTheGo
                ? "flex-1 space-y-5 basicinfo-form"
                : "grid md:grid-cols-2 gap-6 basicinfo-form"
              }`}>
          <PayeeFormInput isRequired={true} label={"Country"}>
            <FormInstance.Item
              name={"country"}
              className="mb-0 custom-select-float "
              autoComplete="off"
              rules={[requiredValidator()]}
            >
              <Select
                showSearch
                allowClear
                className=""
                placeholder="Select Country"
                onSelect={handleCountrySelect}
                fieldNames={{ label: 'name', value: 'name' }}
                options={lookups.countries || []}
                disabled={!isFormEditable}
              />
            </FormInstance.Item>
          </PayeeFormInput>
          <PayeeFormInput isRequired={true} label={"State"}>
            <FormInstance.Item name={"state"}
              className="mb-0 custom-select-float !w-full" autoComplete="off"
              rules={[requiredValidator()]}
            >
              <Select
                showSearch
                allowClear
                className=""
                placeholder="Select State"
                onSelect={handleStateSelect}
                fieldNames={{ label: 'name', value: 'name' }}
                options={lookups.states || []}
                disabled={!isFormEditable}
              />
            </FormInstance.Item>
          </PayeeFormInput>
          <PayeeFormInput isRequired={true} label={"City"}>
            <FormInstance.Item
              name={"city"}
              className="text-left relative mb-0"
              rules={[
                cityValidator(), requiredValidator()
              ]}
              autoComplete="off"
            >
              <Input
                className="custom-input-field outline-0"
                placeholder="Enter City"
                type="input"
                autoComplete="off"
                maxLength={50}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={!isFormEditable}
              />
            </FormInstance.Item>
          </PayeeFormInput>
          <PayeeFormInput isRequired={false} label={"Street"}>
            <FormInstance.Item
              name="line1"
              className="text-left relative mb-0"
              rules={[
                textValidator('street', 'alphaNumWithSpaceAndSpecialChars')
              ]}
            >
              <Input
                className="custom-input-field outline-0"
                placeholder="Enter Street"
                type="input"
                autoComplete="off"
                maxLength={400}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={!isFormEditable}
              />
            </FormInstance.Item>
          </PayeeFormInput>
          <PayeeFormInput
            isRequired={true}
            label={"Postal Code"}
          >
            <FormInstance.Item
              name={"postalCode"}
              className="text-left mb-0"
              rules={[requiredValidator(), 
              // validations.numberOnlyValidator('Postal code')(),
              zipCodeValidator('postal code', form.getFieldValue('country'))
              ]}
              validateTrigger={["onChange", "onBlur"]}
            >
              <Input
                onChange={handlePostalCodeChange}
                placeholder="Enter Postal Code"
                className="custom-input-field is-error-br outline-0 focus:outline-0"
                maxLength={9}
                max={6}
                min={4}
                onBlur={handleBlur}
                autoComplete="off"
                value={form.getFieldValue('postalCode') || ''}
                type="text"
                disabled={!isFormEditable}
              />
            </FormInstance.Item>
          </PayeeFormInput>
        </div>
      </div>
    </div>
  );
};
PayeeAddressForm.propTypes = {
  setField: PropTypes.func,
  lookups: PropTypes.object,
  form: PropTypes.object.isRequired,
  fetchFaitCurrencies: PropTypes.func,
  setFiatCurrenciesLookup: PropTypes.func,
};
export default PayeeAddressForm;