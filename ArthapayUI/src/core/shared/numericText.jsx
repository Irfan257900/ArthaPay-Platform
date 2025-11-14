import { NumericFormat } from "react-number-format";
import AppDefaults from "../../utils/app.config";
import { useCallback } from "react";

const NumericText = ({ fixedDecimals = AppDefaults.cryptoDecimals, decimalScale = AppDefaults.cryptoDecimals, value, className, thousandSeparator = true, renderTextClass = "", prefixText, suffixText, spaceAfterPrefix = true, spaceBeforeSuffix = true, isdecimalsmall = false }) => {
  const renderFormattedText = useCallback((value, props) => {

    if (isdecimalsmall) {

      const [intPart, decimalPart] = value.split(".");

      return <>
        <span className="!text-2xl !font-semibold !text-kpidarkColor">
          {prefixText || ""}{spaceAfterPrefix ? " " : ""}  {intPart}
        </span>
        {decimalPart && (
          <span className="!text-sm !font-medium !text-paraColor">
            .{decimalPart}
          </span>
        )}
        <span className="!text-sm !font-semibold !text-kpidarkColor">
          {spaceBeforeSuffix ? " " : ''}{suffixText || ""}
        </span>
      </>
    } else {
      return <span className={renderTextClass} {...props}>
        {prefixText || ""}{spaceAfterPrefix ? " " : ""}{value}{spaceBeforeSuffix ? " " : ''}{suffixText || ""}
      </span>
    }

  }, [renderTextClass, prefixText, value, suffixText])

  return (
    <NumericFormat
      className={className}
      fixedDecimalScale={fixedDecimals}
      decimalScale={decimalScale}
      displayType="text"
      value={value}
      thousandSeparator={thousandSeparator}
      renderText={renderFormattedText}
      prefixText={prefixText}
      suffixText={suffixText}
     thousandsGroupStyle="lakh" 
    />
  );
};
export default NumericText;
