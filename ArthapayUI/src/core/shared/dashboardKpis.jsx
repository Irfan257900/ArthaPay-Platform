import React, { useMemo } from "react";
import PropTypes from "prop-types";
import AppDefaults from "../../utils/app.config";
import AppNumber from "./inputs/appNumber";
const DashBoardAppKpis = ({
  data,
  itemFields = { name: "name", value: "value", isCount: "isCount" },
  itemNameClass = "text-sm font-normal text-dbkpiPara",
  countClass = "text-md text-dbkpiText font-semibold",
  numberTextClass = "text-md text-subTextColor font-semibold",
  EndIndex = 1,
  isSeparate = false,
  StartIndex = 0,
  isSelected = false,
}) => {
  const {
    name = "name",
    value = "value",
    isCount = "isCount",
  } = useMemo(() => {
    return itemFields || {};
  }, [itemFields]);
  return (
    <>
      {!isSelected && data && isSeparate && (
        <div className="p-3.5 border border-dbkpiStroke rounded-5">
          {data.slice(`${StartIndex}`, `${EndIndex}`).map((item, index) => (
            <div key={item[name]} className="mb-3">
              
              <p className={itemNameClass}>{item[name]}</p>
              <h3 className={countClass}>
                {typeof item[value] === "number" ? (
                  <AppNumber
                    className={numberTextClass}
                    type="text"
                    defaultValue={item[value]}
                    localCurrency={""}
                    prefixText={!item[isCount] && "$"}
                    suffixText={""}
                    decimalScale={AppDefaults.fiatDecimals}
                    fixedDecimalScale={AppDefaults.fiatDecimals}
                    thousandSeparator={true}
                    allowNegative={true}
                  />
                ) : (
                  <span className={numberTextClass}>{!item[isCount] ? "$" : ""} {item[value]}</span>
                )}
              </h3>
            </div>
          ))}
        </div>
      )}
      {!isSelected && (
        <div className="p-3.5 border border-dbkpiStroke rounded-5">
          {data
            .slice(isSeparate ? `${EndIndex}` : `${StartIndex}`)
            .map((item, index) => (
              <div key={item[name]} className="mb-3">
                <p className={itemNameClass}>{item[name]}</p>
                <h3 className={countClass}>
                {typeof item[value] === "number" ? (<AppNumber
                    className={numberTextClass}
                    type="text"
                    defaultValue={item[value]}
                    localCurrency={""}
                    prefixText={!item[isCount] && "$"}
                    suffixText={""}
                    decimalScale={AppDefaults.fiatDecimals}
                    fixedDecimalScale={AppDefaults.fiatDecimals}
                    thousandSeparator={true}
                    allowNegative={true}
                  />) :(
                    <span className={numberTextClass}>{!item[isCount] ? "$" : ""} {item[value]}</span>
                  ) 
                }
                </h3>
              </div>
            ))}
        </div>
      )}
      {isSelected && (
        <div className="p-3.5 border border-dbkpiStroke rounded-5">
          {data.slice(`${StartIndex}`, `${EndIndex}`).map((item, index) => (
            <div key={item[name]} className="">
              <p className={itemNameClass}>{item[name]}</p>
              <h3 className={countClass}>
              {typeof item[value] === "number" ?<AppNumber
                  className={numberTextClass}
                  type="text"
                  defaultValue={item[value]}
                  localCurrency={""}
                  prefixText={!item[isCount] && "$"}
                  suffixText={""}
                  decimalScale={AppDefaults.fiatDecimals}
                  fixedDecimalScale={AppDefaults.fiatDecimals}
                  thousandSeparator={true}
                  allowNegative={true}
                /> :(
                  <span className={numberTextClass}>{!item[isCount] ? "$" : ""} {item[value]}</span>
                ) 
              }
              </h3>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
DashBoardAppKpis.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  itemFields: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    isCount: PropTypes.bool,
  }),
  itemNameClass: PropTypes.string,
  countClass: PropTypes.string,
  numberTextClass: PropTypes.string,
  isSeparate: PropTypes.bool,
  EndIndex: PropTypes.number,
  StartIndex: PropTypes.number,
  isSelected: PropTypes.bool,
};

export default DashBoardAppKpis;
