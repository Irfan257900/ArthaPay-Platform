import { Input } from "antd";
import { Component } from "react";
import {NumericFormat} from 'react-number-format';

class AppNumber extends Component {
    handleValueChange = ({ value }) => {
        const { onChange } = this.props;
        if (onChange) {
            onChange(value);
        }
    };
    renderText = (value,props) => {
        const { prefixText, suffixText } = this.props;
        return (
            <div {...props}>
                {prefixText || ""} {value} {suffixText || ""}
            </div>
        );
    };
    render() {
        const { type, defaultValue, prefix = "$", className, bordered = false, inputCustomStyle, autoFocus = false, placeholder,maxLength,decimalScale } = this.props;
        
        let inputPlaceholder = placeholder ? placeholder : "0.00";

        return (
            <>
                {type === "input" ? (
                    <NumericFormat
                        className={className}
                        customInput={Input}
                        thousandSeparator={true} 
                        prefix={prefix}
                        placeholder={inputPlaceholder}
                        bordered={bordered}
                        style={inputCustomStyle}
                        value={defaultValue}
                        onValueChange={this.handleValueChange}
                        autoFocus={autoFocus}
                        allowNegative={false}
                        maxLength={maxLength}
                        decimalScale={decimalScale}
                    />
                ) : (
                    <NumericFormat
                        value={defaultValue}
                        className={className}
                        displayType={'text'}
                        decimalScale={decimalScale}
                        thousandSeparator={true} 
                        renderText={this.renderText}
                    />
                )}
            </>
        );
    }
}

export default AppNumber;
