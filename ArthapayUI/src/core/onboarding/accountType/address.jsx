import React, { useCallback } from "react";
import { NumericFormat } from "react-number-format";
import AppSelect from "../../shared/appSelect";
import { validations } from "../../shared/validations";
const {requiredValidator,postalCodeValidator}=validations
const Address = ({ FormInstance, setField, lookups }) => {
  const onTownChange=useCallback((value)=>{
    setField({name:'town',value},false)
  },[])
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-3">
      <div>
        <FormInstance.Item
          className="payees-input required-reverse"
          name="state"
          label="State"
          rules={[
            requiredValidator(),
            {
              validator: (_, value) => {
                const htmlTagPattern = /<\/?[a-z][\s\S]*>/i;
                if (htmlTagPattern.test(value)) {
                  return Promise.reject(new Error("Invalid state"));
                }
                return Promise.resolve();
              },
            },
          ]}
          colon={false}
        >
          <input
            className="custom-input-field"
            placeholder="Enter State"
            type="input"
            name="state"
            maxLength={100}
            onChange={setField}
            onBlur={setField}
          />
        </FormInstance.Item>
      </div>
      <div>
        <FormInstance.Item
          className="payees-input required-reverse"
          name="town"
          label="Town"
          rules={[requiredValidator()]}
          colon={false}
        >
          <AppSelect
            showSearch
            className=" payee-input input-bordered"
            placeholder="Select Town"
            type="input"
            maxLength={100}
            allowClear
            options={lookups.towns}
            fieldNames={{label:'name',value:'name'}}
            onChange={onTownChange}
          />
        </FormInstance.Item>
      </div>
      <div>
        <FormInstance.Item
          className="payees-input required-reverse"
          name="city"
          label="City"
          rules={[
            requiredValidator(),
            {
              validator: (_, value) => {
                const htmlTagPattern = /<\/?[a-z][\s\S]*>/i;
                if (htmlTagPattern.test(value)) {
                  return Promise.reject(new Error("Invalid city"));
                }
                return Promise.resolve();
              },
            },
          ]}
          colon={false}
        >
          <input
            className="custom-input-field"
            placeholder="Enter City"
            type="input"
            name="city"
            maxLength={100}
            onChange={setField}
            onBlur={setField}
          />
        </FormInstance.Item>
      </div>
      <div>
        <FormInstance.Item
          className="payees-input required-reverse"
          name="addressLine1"
          label="Address Line 1"
          rules={[
            requiredValidator(),
            {
              validator: (_, value) => {
                const htmlTagPattern = /<\/?[a-z][\s\S]*>/i;
                if (htmlTagPattern.test(value)) {
                  return Promise.reject(new Error("Invalid address line 1"));
                }
                return Promise.resolve();
              },
            },
          ]}
          colon={false}
        >
          <input
            className="custom-input-field"
            placeholder="Enter Address Line 1"
            type="input"
            name="addressLine1"
            maxLength={100}
            onChange={setField}
            onBlur={setField}
          />
        </FormInstance.Item>
      </div>

      <div>
        <FormInstance.Item
          className="payees-input required-reverse"
          name="postalCode"
          label="Postal Code"
          rules={[requiredValidator(),postalCodeValidator('postal code')]}
          colon={false}
        >
          <NumericFormat
            className="custom-input-field"
            placeholder="Enter Postal Code"
            maxLength={8}
            name="postalCode"
            onChange={setField}
          />
        </FormInstance.Item>
      </div>
    </div>
  );
};

export default Address;
