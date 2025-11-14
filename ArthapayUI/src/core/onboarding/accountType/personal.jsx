import React, { useCallback } from "react";
import { Input } from "antd";
import PhoneCodeDropdown from "../../shared/phCodeDropdown";
import { nameRegex } from "../../../utils/validations";
import AppSelect from "../../shared/appSelect";
import { phoneNoRegex, validations } from "../../shared/validations";
const { requiredValidator, regexValidator, textLengthValidator } = validations;
const Personal = ({ FormInstance, setField, lookups, form }) => {
  const phoneCodeChange = useCallback((value) => {
    setField({ name: "phoneCode", value }, false);
  }, []);
  const countryChange = useCallback((value) => {
    setField({ name: "country", value }, false);
  }, []);
  const genderChange = useCallback((value) => {
    setField({ name: "gender", value }, false);
  }, []);
  const handlePhCodeKeyDownEvent = useCallback((e) => {
    if (e.key === "e" || e.key === "E" || e.key === "+" || e.key === "-") {
      e.preventDefault();
    }
  }, []);
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mt-3">
      <div className="">
        <FormInstance.Item
          className="mb-0"
          name="firstName"
          label="First Name"
          required
          colon={false}
          rules={[
            requiredValidator(),
            regexValidator("first name", nameRegex),
            textLengthValidator("first name"),
          ]}
        >
          <Input
            className="custom-input-field outline-0 !focus-within:bg-transparent !focus:bg-transparent"
            maxLength={40}
            name="firstName"
            placeholder="Enter First Name"
            onChange={setField}
            onBlur={setField}
          />
        </FormInstance.Item>
      </div>
      <div>
        <FormInstance.Item
          className="mb-0"
          name="lastName"
          label="Last Name"
          required
          colon={false}
          rules={[
            requiredValidator(),
            regexValidator("last name", nameRegex),
            textLengthValidator("last name"),
          ]}
        >
          <Input
            className="custom-input-field outline-0 !focus-within:bg-transparent !focus:bg-transparent"
            maxLength={40}
            name="lastName"
            placeholder="Enter Last Name"
            onChange={setField}
            onBlur={setField}
          />
        </FormInstance.Item>
      </div>
      <div>
        <FormInstance.Item
          className="mb-0"
          name="gender"
          label="Gender"
          required
          colon={false}
          rules={[requiredValidator()]}
        >
          <AppSelect
            className={""}
            allowClear
            placeholder="Select Gender"
            onSelect={genderChange}
            options={lookups.genders}
            fieldNames={{ label: "name", value: "code" }}
          />
        </FormInstance.Item>
      </div>
      <div>
        <FormInstance.Item
          className="phoneno-select mb-0 phone-field-error"
          name="phoneNo"
          label="Phone Number"
          required
          rules={[
            requiredValidator(),
            regexValidator("phone number", phoneNoRegex, false),
          ]}
          validateTrigger={["onChange", "onBlur"]}
        >
          <Input
            className="w-full border-0  border-dbkpiStroke text-lightWhite p-0 rounded outline-0"
            addonBefore={
              <FormInstance.Item
                name="phoneCode"
                className="mb-0 w-28 md:w-32 lg:w-36 xl:w-48 phone-select-error"
                colon={false}
                rules={[requiredValidator()]}
                validateTrigger={["onChange"]}
              >
                <PhoneCodeDropdown
                  onChange={phoneCodeChange}
                  codes={lookups.phoneCodes}
                  shouldUsePropsList={true}
                  addPlusAtStart={false}
                  value={form.getFieldValue("phoneCode")}
                />
              </FormInstance.Item>
            }
            maxLength={15}
            name="phoneNo"
            placeholder="Enter Phone Number"
            onChange={setField}
            onBlur={setField}
            onKeyDown={e => {
              if (e.key === "e" || e.key === "E" || e.key === "+" || e.key === "-") {
                e.preventDefault();
              }
            }}
          />
        </FormInstance.Item>
      </div>
      <div>
        <FormInstance.Item
          className="mb-0 w-full country-select"
          name="country"
          label="Country Of Residence"
          colon={false}
          rules={[requiredValidator()]}
        >
          <AppSelect
            className={""}
            showSearch
            allowClear
            placeholder="Select Country"
            onChange={countryChange}
            options={lookups.countries}
            value={form.getFieldValue("country")}
            fieldNames={{ label: "name", value: "name" }}
          />
        </FormInstance.Item>
      </div>
    </div>
  );
};

export default Personal;