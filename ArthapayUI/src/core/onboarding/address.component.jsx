import { Input } from "antd";
import { useCallback, useEffect, useState } from "react";
import { connect } from "react-redux";
import AppSelect from "../shared/appSelect";
import {
  phoneNoRegex,
  streetAddressRegex,
  validations,
} from "../shared/validations";
import { TwoColFormLoader } from "../skeleton/form.loaders";
import PhoneCodeDropdown from "../shared/phCodeDropdown";
const AddAddress = ({
  form,
  FormInstance: Form,
  fetchingCountries = false,
  countries,
  phoneCodes,
  townsKey = "details",
  states,
  ...props
}) => {
  const [towns, setTowns] = useState(null);
  const [statesLookup, setStatesLookUp] = useState(null);
  useEffect(() => {
    if (props?.address?.country && countries?.length > 0) {
      setTowns(getTowns(props?.address?.country, countries));
      setStatesLookUp(getState(props?.address?.country));
    }
  }, [props?.address?.country, countries?.length]);
  const setFieldValue = (field, value) => {
    form.setFieldValue({ [field]: value });
    if (field === "country") {
      form.resetFields(["town"]);
      form.resetFields(["state"]);
      setTowns(getTowns(value, countries));
      setStatesLookUp(getState(value));
    }
  };
  const handleFieldChange = useCallback(
    (fieldName) => (e) => {
      const value = e?.target ? e.target.value : e;
      setFieldValue(fieldName, value);
    },
    [setFieldValue]
  );
  const getTowns = (country, countries) => {
    return countries?.find((cn) => cn.name === country)?.[townsKey];
  };
  const getState = (country) => {
    return states?.find((cn) => cn.name === country)?.details;
  };
  const handleKeyDown = useCallback((e) => {
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault();
    }
  }, []);
  const handlePostalCodeChange = useCallback((e) => {
    const upperCaseValue = e.target.value?.toUpperCase();
    form.setFieldsValue({ postalCode: upperCaseValue });
  }, [form]);
  return (
    <div className={`w-full ${(!props?.hideWizard && "p-5 pt-2 mb-5") || ""}`}>
      {fetchingCountries && <TwoColFormLoader itemCount={13} />}
      {!fetchingCountries && (
        <div>
          <h3 className="text-lightWhite text-large font-semibold mb-4 mt-3">
            Address
          </h3>
          <div
            className={`grid md:grid-cols-1 gap-6 ${(!props?.hideWizard && "grid-cols-1 md:grid-cols-2") || ""
              }`}
          >
            {props?.isVisible && (
              <>
                <Form.Item
                  className="mb-0"
                  name="addressFirstName"
                  label="First Name"
                  rules={[
                    { required: true, message: "Is required" },
                    { whitespace: true, message: "Invalid First Name" },
                    validations.textValidator(
                      "first name",
                      "alphaNumWithSpaceAndSpecialChars"
                    ),
                  ]}
                  colon={false}
                >
                  <Input
                    className="custom-input-field outline-0"
                    placeholder="Enter First Name"
                    type="input"
                    maxLength={50}
                    onChange={handleFieldChange("addressFirstName")}
                  />
                </Form.Item>
                <Form.Item
                  className="mb-0"
                  name="addressLastName"
                  label="Last Name"
                  rules={[
                    { required: true, message: "Is required" },
                    { whitespace: true, message: "Invalid Last Name" },
                    validations.textValidator(
                      "last name",
                      "alphaNumWithSpaceAndSpecialChars"
                    ),
                  ]}
                  colon={false}
                >
                  <Input
                    className="custom-input-field outline-0"
                    placeholder="Enter Last Name"
                    type="input"
                    maxLength={50}
                    onChange={handleFieldChange("addressLastName")}
                  />
                </Form.Item>
              </>
            )}
            <div className={`text-left payee-field relative`}>
              <div className="flex country-form-item relative">
                <div className="custom-input-lablel">
                  Country <span className="text-errorBorderRed">*</span>
                </div>
              </div>
              <div className="text-left ">
                <Form.Item
                  name="country"
                  rules={[{ required: true, message: "Is required" }]}
                  className="mb-0 custom-select-float"
                  colon={false}
                >
                  <AppSelect
                    showSearch
                    name="country"
                    onSelect={handleFieldChange("country")}
                    placeholder="Select Country"
                    className=""
                    maxLength={30}
                    options={countries || []}
                    fieldNames={{ label: "name", value: "name" }}
                  />
                </Form.Item>
              </div>
            </div>
            <Form.Item
              name="state"
              label="State"
              rules={[{ required: true, message: "Is required" }]}
              className="mb-0 custom-select-float"
              colon={false}
            >
              <AppSelect
                showSearch
                name="state"
                onSelect={handleFieldChange("state")}
                placeholder="Select State"
                className=""
                maxLength={30}
                options={statesLookup || []}
                fieldNames={{ label: "name", value: "name" }}
              />
            </Form.Item>
            <div className={`text-left payee-field relative`}>
              <div className="flex country-form-item relative">
                <div className="custom-input-lablel">
                  Town <span className="text-errorBorderRed">*</span>
                </div>
              </div>
              <div className="text-left">
                <Form.Item
                  className="mb-0 custom-select-float"
                  name="town"
                  rules={[
                    { required: true, message: "Is required" },
                    { whitespace: true, message: "Invalid  Town" },
                  ]}
                >
                  <AppSelect
                    showSearch
                    className=""
                    placeholder="Select Town"
                    maxLength={100}
                    onSelect={handleFieldChange("town")}
                    options={towns || []}
                    fieldNames={{ label: "name", value: "name" }}
                  />
                </Form.Item>
              </div>
            </div>
            <Form.Item
              className="mb-0"
              name="city"
              label="City"
              rules={[
                { required: true, message: "Is required" },
                { whitespace: true, message: "Invalid City" },
                validations.textValidator(
                  "city",
                  "alphaNumWithSpaceAndSpecialChars"
                ),
              ]}
              colon={false}
            >
              <Input
                className="custom-input-field outline-0"
                placeholder="Enter City"
                type="input"
                maxLength={100}
                onChange={handleFieldChange("city")}
              />
            </Form.Item>
            <Form.Item
              className={`mb-0 ${(!props?.hideWizard && "md:col-span-2 ") || ""
                }`}
              name="line1"
              label="Address Line 1"
              rules={[
                validations.requiredValidator(),
                validations.regexValidator(
                  "address line 1",
                  streetAddressRegex
                ),
                { whitespace: true, message: "Invalid address line 1" },
              ]}
              colon={false}
            >
              <Input
                className="custom-input-field outline-0"
                placeholder="Enter Address Line 1"
                type="input"
                maxLength={100}
                onChange={handleFieldChange("line1")}
              />
            </Form.Item>
            <Form.Item
              className={`mb-0 ${(!props?.hideWizard && "md:col-span-2 ") || ""
                }`}
              name="line2"
              label="Address Line 2"
              rules={[
                validations.regexValidator(
                  "address line 2",
                  streetAddressRegex
                ),
                { whitespace: true, message: "Invalid address line 2" },
              ]}
              colon={false}
            >
              <Input
                className="custom-input-field outline-0"
                placeholder="Enter Address Line 2"
                type="input"
                maxLength={100}
                onChange={handleFieldChange("line2")}
              />
            </Form.Item>
            <Form.Item
              className="mb-0"
              name="postalCode"
              label="Postal Code"
              rules={[
                validations.requiredValidator(),
                validations.zipCodeValidator("postal code"),
                { whitespace: true, message: "Invalid postal code" },
              ]}
              colon={false}
            >
              <Input
                name="postalCode"
                className="custom-input-field outline-0 required-border"
                placeholder="Enter Postal Code"
                maxLength={8}
                value={form.getFieldValue("postalCode") || ""}
                onChange={handlePostalCodeChange}
              />
            </Form.Item>
            <Form.Item
              className={`mb-0 phoneno-select phone-field-error kyckyb`}
              name="phoneNumber"
              label="Phone Number"
              required
              rules={[
                validations.requiredValidator(),
                validations.regexValidator("phone number", phoneNoRegex, false),
              ]}
            >
              <Input
                type="number"
                onKeyDown={handleKeyDown}
                className=""
                addonBefore={
                  <Form.Item
                    name="phoneCode"
                    className="mb-0 w-28 md:w-32 lg:w-36 outline-none phone-select-error"
                    colon={false}
                    rules={[{ required: true, message: "Is required" }]}
                  >
                    <PhoneCodeDropdown
                      codes={phoneCodes || []}
                      shouldUsePropsList={true}
                      // addPlusAtStart={true}
                      value={form.getFieldValue("phoneCode")}
                      onChange={handleFieldChange("phoneCode")}
                    />
                  </Form.Item>
                }
                maxLength={12}
                placeholder="Enter Phone Number"
                onChange={handleFieldChange("phoneNumber")}
              />
            </Form.Item>
            <Form.Item
              className="mb-0"
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Is required" },
                { whitespace: true, message: "Invalid Email" },
                validations.textValidator("email", "email"),
              ]}
              colon={false}
            >
              <Input
                className="custom-input-field outline-0"
                placeholder="Enter Email"
                type="input"
                maxLength={100}
                onChange={handleFieldChange("email")}
              />
            </Form.Item>
          </div>
        </div>
      )}
    </div>
  );
};
const connectStateToProps = ({ userConfig, applyCard }) => {
  return {
    userConfig: userConfig.details,
    trackauditlogs: userConfig?.trackAuditLogData,
    selectedAddress: applyCard?.selectedAddress?.data,
  };
};
export default connect(connectStateToProps)(AddAddress);
