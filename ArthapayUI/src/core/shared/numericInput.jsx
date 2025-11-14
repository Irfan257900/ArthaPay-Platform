import React, { useCallback } from "react";
import { Input } from "antd";
import { NumericFormat } from "react-number-format";
import AppDefaults from "../../utils/app.config";
const NumericInput = ({
  name,
  decimalScale = AppDefaults.cryptoDecimals,
  customInput = Input,
  className,
  onChange,
  thousandSeparator = true,
  allowNegative = false,
  placeholder = "Enter Input",
  onChangeParams = [],
  returnOnlyNumber = true,
  value,
  disabled=false
}) => {
  const onValueChange = useCallback(
    (values) => {
      !disabled && onChange(
        returnOnlyNumber ? values.floatValue : values,
        ...onChangeParams
      );
    },
    [disabled,onChangeParams]
  );
  return (
    <NumericFormat
      name={name}
      decimalScale={decimalScale}
      customInput={customInput}
      className={className}
      onValueChange={onValueChange}
      value={value}
      thousandSeparator={thousandSeparator}
      allowNegative={allowNegative}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
};

export default NumericInput;
