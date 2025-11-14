import Loader from '../../../core/shared/loader';
import { Select } from 'antd';

const fieldNames = {
  'AccountType': { label: 'name', value: 'code' },
  'bankProviders': { label: 'name', value: 'name' },
  'branchCodes': { label: 'code', value: 'code' },
  'bankCountries': { label: 'name', value: 'name' },
  'remittancePurpose': { label: 'name', value: 'name' },
  // Default field names for other lookups
  'default': { label: 'name', value: 'code' }
};
const lookupKeys = {
  'bankAccountType': 'accountTypes',
  'bankName': 'bankProviders',
  'branchCode': 'branchCodes',
  'bankCountry': 'bankCountries',
  'remittancePurpose':'remittancePurposes'
};

const GetPaymentField = ({ field, value, onChange, onBlur, lookups,isFormEditable }) => {
  const { fieldType: type, label, field: keyFromField, key: keyFromKey, maxLength, placeholder } = field;
  const key = keyFromKey || keyFromField;

  // Compute options for lookup fields
  const options = type === 'lookup' ? (lookups?.[lookupKeys[key]] || []) : [];

  // If this is branchCode and options are empty, force type to input
  let renderType = type;
  if ((key === "branchCode" || key === "bankName") && type === "lookup" && (options.length === 0 || !Array.isArray(options))) {
    renderType = "input";
  }

  // Custom onChange handler to extract .code if needed
  const handleChange = (val) => {
    if (val && typeof val === "object" && "code" in val) {
      onChange(val.code,key);
    } else {
      onChange(val,key);
    }
  };

  if (renderType !== 'lookup') {
    return (
      <input
        className={`getInput custom-input-field outline-0 ${key === 'bankDocumentNumber' ? 'uppercase placeholder:capitalize' : ''}`}
        placeholder={placeholder || `Enter ${label}`}
        type="input"
        autoComplete="off"
        maxLength={maxLength || 30}
        onChange={e => handleChange(e.target.value)}
        value={value}
        onBlur={onBlur}
        disabled={!isFormEditable}
      />
    );
  }

  if (renderType === 'lookup') {
    return (
      <Select
        showSearch
        allowClear={true}
        className=""
        placeholder={`Select ${label}`}
        onChange={handleChange}
        fieldNames={fieldNames[lookupKeys[key]] || fieldNames['default']}
        value={value}
        options={options}
        disabled={!isFormEditable}
      />
    );
  }

  return <div><Loader /></div>;
};

export default GetPaymentField;