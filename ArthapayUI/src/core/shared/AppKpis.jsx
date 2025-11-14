import React, { useMemo } from "react";
import PropTypes from "prop-types";
import AppNumber from "./inputs/appNumber";
import AppDefaults from "../../utils/app.config";
const AppKpis = ({
  data,
  icons,
  itemFields = { name: "name", value: "value", isCount: "isCount" },
  listClass = "grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5",
  itemClass = "p-3.5 bg-cardbackground rounded-5 cursor-pointer text-left shadow",
  itemNameClass = "text-sm font-medium text-kpidarkColor",
  summaryClass = "flex items-center gap-3 ",
  numberTextClass = "text-md text-kpidarkColor font-semibold",
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
      {" "}
      { data && (
        <div className={listClass}>
          {data.map((item, index) => (
            <div key={item[name]} className={itemClass}>
              <div>
                <div className={summaryClass}>
                    <span
                      className={`icon ${icons[item[name]] || icons[index]}`}
                    ></span>                   
                  <div>
                  <h4 className={itemNameClass}>{item[name]}</h4>
                      <AppNumber
                        className={numberTextClass}
                        type="text"
                        defaultValue={item[value]}
                        localCurrency={""}
                        prefixText={!item[isCount] && "$"}
                        suffixText={''}
                        decimalScale={AppDefaults.fiatDecimals}
                        fixedDecimalScale={AppDefaults.fiatDecimals}
                        thousandSeparator={true}
                        allowNegative={true}
                      />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
AppKpis.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  icons: PropTypes.object.isRequired,
  itemFields: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    isCount: PropTypes.bool,
  }),
  listClass: PropTypes.string,
  itemClass: PropTypes.string,
  itemNameClass: PropTypes.string,
  summaryClass: PropTypes.string,
  countClass: PropTypes.string,
  numberTextClass: PropTypes.string,
};

export default AppKpis;
