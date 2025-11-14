import { Input } from "antd";
import React, { useCallback } from "react";
import PhoneCodeDropdown from "../../shared/phCodeDropdown";
import AppSelect from "../../shared/appSelect";
import moment from "moment";
import { VALIDATION_MESSAGES } from "./services";
import {
  businessNameRegex,
  phoneNoRegex,
  validations,
} from "../../shared/validations";
import AppDatePicker from "../../shared/appDatePicker";
const { requiredValidator, regexValidator } = validations;
const disabledIncorporationYears = (current) => {
  return current.year() < 1920;
};
const Business = ({ FormInstance, form, setField, lookups }) => {
  const incorporationDateChange = useCallback((value) => {
    setField({ name: 'incorporationDate', value }, false)
  }, [])
  const phoneCodeChange = useCallback((value) => {
    setField({ name: 'phoneCode', value }, false)
  }, [])
  const countryChange = useCallback((value) => {
    setField({ name: 'country', value }, false)
  }, [])
  const handlePhCodeKeyDownEvent = useCallback((e) => {
    if (e.key === "e" || e.key === "E" || e.key === "+" || e.key === "-") {
      e.preventDefault();
    }
  }, [])
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mt-3">
      <div>
        <FormInstance.Item
          className="mb-0"
          name="businessName"
          label="Legal Business Name"
          required
          colon={false}
          rules={[
            requiredValidator(),
            regexValidator("business name", businessNameRegex),
          ]}
        >
          <Input
            className="custom-input-field outline-0 !focus-within:bg-transparent !focus:bg-transparent"
            maxLength={80}
            name="businessName"
            placeholder="Enter Legal Business Name"
            onChange={setField}
            onBlur={setField}
          />
        </FormInstance.Item>
      </div>
      <div className="">
        <FormInstance.Item
          className="mb-0 country-select"
          name="incorporationDate"
          label="Date of Incorporation (Future dates not allowed)"
          colon={false}
          rules={[
            requiredValidator(),
            {
              validator(_, value) {
                if (!value) {
                  return Promise.resolve();
                }
                const formatted = moment(value).startOf("day").unix();
                const current = moment().startOf("day").unix();
                if (formatted > current) {
                  return Promise.reject(
                    new Error(VALIDATION_MESSAGES.INCORPORATION_DATE)
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <AppDatePicker onChange={incorporationDateChange} disableDates={disabledIncorporationYears} />
        </FormInstance.Item>
      </div>
      <div className="">
        <FormInstance.Item
          className="phoneno-select mb-0 phone-field-error"
          name="phoneNo"
          label="Phone Number"
          required
          colon={false}
          rules={[
            requiredValidator(),
            regexValidator("phone number", phoneNoRegex, false),
          ]}
        >
          <Input
            //  type = "number"
            onKeyDown={handlePhCodeKeyDownEvent}
            addonBefore={
              <FormInstance.Item
                name="phoneCode"
                className="mb-0 w-28 md:w-32 lg:w-36 xl:w-48 phone-select-error"
                rules={[requiredValidator()]}
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
            className="mb-0"
            maxLength={15}
            name="phoneNo"
            placeholder="Enter Phone Number"
            onChange={setField}
            onBlur={setField}
          />
        </FormInstance.Item>
      </div>
      <div className="">
        <FormInstance.Item
          className="mb-0 country-select"
          name="country"
          label="Country Of Business"
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

export default Business;
