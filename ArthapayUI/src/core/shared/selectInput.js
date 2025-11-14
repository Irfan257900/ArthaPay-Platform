import React, { useCallback } from 'react'
import PropTypes from 'prop-types';
import { Select } from "antd";
const { Option } = Select;
const SelectInput = ({ onSearch, showSearch = true, allowClear = true, fieldName = "Option ...", defaultValue, value, optionFilterProp = "children", disabled = false, onChange, options, optionValue = "name", optionLabel = "name", multiple = false, required, label, customClass }) => {
    const requiredMark = required ? <span className="text-light-textRedColor">*</span> : null;

    const handleSelectChange = useCallback((selectedValues) => {
        if (
            selectedValues?.includes("00000000-0000-0000-0000-000000000000") &&
            value?.includes("00000000-0000-0000-0000-000000000000")
        ) {
            onChange(selectedValues?.filter((val) => val !== "00000000-0000-0000-0000-000000000000"));
        } else if (selectedValues?.includes("00000000-0000-0000-0000-000000000000")) {
            onChange(["00000000-0000-0000-0000-000000000000"]);
        } else {
            onChange(selectedValues);
        }
    }, [onChange, value]);
    const filterOption = useCallback((input, option) => {
        return (
            (option?.value?.toLowerCase() ?? "").includes(input.toLowerCase()) ||
            (option?.children?.toLowerCase() ?? "").includes(input.toLowerCase())
        );
    }, []);
    return (<div className='relative common-selector'>
        <label className={"as-label absolute z-10 left-0.5 -top-2 text-xs font-normal cust-input-label text-light-inputFocusedColor dark:text-dark-inputFocusedColor"}>
            {label} {requiredMark}
        </label>
        <Select
    mode={multiple ? "multiple" : undefined}
    showSearch={showSearch}
    allowClear={allowClear}
    className={`${customClass} px-0 pt-2 pb-0 h-16 border border-light-inputbordercolor dark:border-inputbordercolor focus:border-inputFocusedColor focus:shadow-none focus:outline-none focus-within:outline-none focus-visible:outline-none w-full rounded-none border-t-0 border-r-0 border-l-0 placeholder:text-light-textGray dark:placeholder:text-dark-textGray focus:border-light-inputFocusedColor hover:border-light-inputFocusedColor dark:focus:border-dark-inputFocusedColor`}
    defaultValue={defaultValue}
    value={value}
    placeholder={`Select ${fieldName}`}
    onSearch={onSearch}
    optionFilterProp={optionFilterProp}
    disabled={disabled}
    filterOption={filterOption}
    onChange={handleSelectChange}
>
    {options?.map((option) => (
        <Option key={option[optionValue]} value={option[optionValue]}>
            {option[optionLabel]}
        </Option>
    ))}
</Select>

    </div>
    )
}

SelectInput.propTypes = {
    showSearch: PropTypes.bool,
    allowClear: PropTypes.bool,
    fieldName: PropTypes.string,
    optionFilterProp: PropTypes.string,
    disabled: PropTypes.bool,
    options: PropTypes.array,
    optionValue: PropTypes.string,
    optionLabel: PropTypes.string,
    defaultValue: PropTypes.string,
    onChange: PropTypes.func
};

export default SelectInput