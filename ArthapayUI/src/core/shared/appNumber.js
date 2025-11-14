import { Input } from "antd";
import { Component } from "react";
import {NumericFormat} from 'react-number-format';

class AppNumber extends Component {
    handleChange = (value) => {
        const { onChange } = this.props;
        if (onChange) {
            onChange(value);
        }
    };
    handleValueChange = ({ value }) => {
        const { onValueChange } = this.props;
        if (onValueChange) {
            onValueChange(value);
        }
    };
    renderText = (value, props) => {
        const { prefixText, suffixText } = this.props;
        return (
            <span {...props}>
                {prefixText ? prefixText : ""} {value} {suffixText ? suffixText : ""}
            </span>
        );
    };
    render() {
        const {thousandSeparator, type,CustomInput, defaultValue, prefixText, suffixText, onChange, prefix = " ", suffix = '',className, inputCustomStyle,disable, autoFocus = false,placeholder,decimalScale,maxLength,onFocus,onValueChange,...otherProps } = this.props;
        return <>
        {type === "input" ? <NumericFormat className={className} thousandSeparator={thousandSeparator} prefix={prefix}
            placeholder={placeholder?placeholder:""}
            suffix={suffix}
            style={inputCustomStyle}
            
            value={defaultValue}
            decimalScale={decimalScale}
            maxLength={maxLength}
            disabled={disable}
            onChange={this.handleChange}
            onValueChange={this.handleValueChange}
            autoFocus={autoFocus}
            allowNegative={false}
            onFocus={onFocus}
            customInput={CustomInput || Input}
            {...otherProps}
        /> : <NumericFormat
            value={defaultValue}
            className={className}    
            displayType={'text'}
            thousandSeparator={true}
            decimalScale={decimalScale}
            renderText={this.renderText} />}</>
    
    }
    
}

export default AppNumber;