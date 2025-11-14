import React, { useCallback, useMemo } from "react";
import countries from "../../utils/countries.json";
import AppSelect from "./appSelect";
const YearLuDropdown = ({
  onChange,
  value,
  className,
  disabled,
  loading = false,
}) => {
  const list = useMemo(() => {
    const codes = [];
    for (let country in countries) {
      codes.push({
        label: `${countries[country].name}(${countries[country].dial_code})`,
        value: countries[country].dial_code,
      });
    }
    return codes;
  }, [countries]);
  const filterOptions = useCallback(
    (input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase()),
    []
  );
  return (
    <AppSelect
      className={className}
      showSearch
      allowClear
      placeholder="Phone"
      optionFilterProp="children"
      onChange={onChange}
      value={value}
      filterOption={filterOptions}
      options={list}
      loading={loading}
      disabled={disabled}
    />
  );
};
export default YearLuDropdown;
