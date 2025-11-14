import React, { useCallback, useMemo } from "react";
import countries from "../../utils/countries.json";
import AppSelect from "./appSelect";
const CountriesDropdown = ({
  onChange,
  value,
  className,
  disabled,
  placeholder="Select Country",
  loading = false,
}) => {
  const list = useMemo(() => {
    const countriesList = [];
    for (let country in countries) {
        countriesList.push({
        label: countries[country].name,
        value: countries[country].name,
      });
    }
    return countriesList;
  }, [countries]);
  const filterOption = useCallback((input, option) => {
    return (option?.label ?? "").toLowerCase().includes(input.toLowerCase());
  }, []);
  return (
    <AppSelect
      className={className}
      showSearch
      allowClear
      placeholder={placeholder}
      optionFilterProp="children"
      onChange={onChange}
      value={value}
      filterOption={filterOption}
      options={list}
      loading={loading}
      disabled={disabled}
    />
  );
};

export default CountriesDropdown;
