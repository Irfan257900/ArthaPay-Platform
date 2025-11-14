import React,{ useCallback } from 'react'
import {Input} from 'antd'
const AppCheckbox = (
    {name,className,onChange,onChangeParams = [],labelClass='',checked,disabled=false}
) => {
    const handleChange = useCallback((e) => {
        !disabled && onChange(e.target.checked,...onChangeParams);
    },[disabled, onChange, onChangeParams])
  return (
    <label className={`custom-checkbox c-pointer cust-check-outline ${labelClass}`}>
    <Input
      name={name}
      type="checkbox"
      checked={checked || false}
      className={className}
      onChange={handleChange}
      disabled={disabled}
    />
    <span></span>
  </label>
  )
}

export default AppCheckbox