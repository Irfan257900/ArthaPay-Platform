import React, { useCallback, useMemo, useState, useEffect } from "react";
import countries from "../../utils/countries.json";
import AppSelect from "./appSelect";

const defaultCodes = countries.map((country) => ({
  label: `(${country.dial_code}) ${country.name}`,
  value: `${country.dial_code}-${country.name}`,
}));

const PhoneCodeDropdown = ({
  onChange,
  value,
  className,
  disabled,
  loading = false,
  codes = [],
  onChangeParams = [],
  shouldUsePropsList = false,
  fieldNames = { label: "name", value: "code" },
  addPlusAtStart = false,
}) => {
  const [internalValue, setInternalValue] = useState(undefined);

  const list = useMemo(() => {
    return shouldUsePropsList
      ? codes?.map((country) => ({
          label: `(${addPlusAtStart ? "+" : ""}${country[fieldNames.value]}) ${country[fieldNames.label]}`,
          value: `${addPlusAtStart ? "+" : ""}${country[fieldNames.value]}-${country[fieldNames.label]}`,
        }))
      : defaultCodes;
  }, [shouldUsePropsList, codes, fieldNames, addPlusAtStart]);

  useEffect(() => {
    if (!value) {
      setInternalValue(undefined);
      return;
    }

    const exact = list.find((item) => item.value === value);
    if (exact) {
      setInternalValue(exact.value);
      return;
    }

    // const matches = list.filter((item) => item.value.split("-")[0] === value);
    const matches = list?.filter((item) => {
      return item?.label?.replace(/[()\s+]/g, '')?.startsWith(value?.replace(/[()+]/g, ''));
    });
    if (matches.length > 0) {
      if (internalValue && internalValue.startsWith(value + "-")) {
        setInternalValue(internalValue);
      } else {
        setInternalValue(matches[0].value);
      }
    }
  }, [value, list]); 

  const handleChange = useCallback(
    (newFullValue) => {
      if (newFullValue === undefined || newFullValue === null) {
        setInternalValue(undefined);
        onChange && (Array.isArray(onChangeParams)
          ? onChange(undefined, ...onChangeParams)
          : onChange(undefined, onChangeParams));
        return;
      }

      setInternalValue(newFullValue);
      const parts = newFullValue?.split("-");
      const dialCode = parts.slice(0, -1).join("-");
      if (Array.isArray(onChangeParams)) {
        onChange(dialCode, ...onChangeParams);
      } else {
        onChange(dialCode, onChangeParams);
      }
    },
    [onChange, onChangeParams]
  );

  return (
    <AppSelect
      className={className}
      showSearch
      allowClear
      dropdownStyle={{ width: "200px" }}
      placeholder="Select Phone Code"
      optionFilterProp="label"
      value={internalValue}
      onChange={handleChange}
      options={list}
      loading={loading}
      disabled={disabled}
    />
  );
};

export default PhoneCodeDropdown;