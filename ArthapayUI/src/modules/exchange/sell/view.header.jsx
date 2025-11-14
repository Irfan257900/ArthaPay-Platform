import { memo } from "react";
import ListDetailLayout from "../../../core/module.layouts/listdetail.layout";
import NumericText from "../../../core/shared/numericText";
import { textStatusColors } from "../../../utils/statusColors";
import { useSelector } from "react-redux";
import AppDefaults from "../../../utils/app.config";
const coinFields = {
  logo: "image",
  coinCode: "code",
  available: "amount",
  coinName: "name",
  changeIn24Hours: "changeIn24Hours",
};
 const Smalldecimals = window.runtimeConfig.VITE_APP_SMALL_DECIMALS_ENABLED

const BuySellViewHeader = ({ showClose, onClose }) => {
  const { loader } = useSelector((state) => state.sellState.cryptoCoins);
  const selectedCoin = useSelector(
    (store) => store.sellState.selectedCryptoCoin
  );
  return (
    <>
      {loader ? null : (
        <div className="flex justify-between items-start border-b-2 border-cryptoline pb-3">
          {selectedCoin ? (
            <ListDetailLayout.ViewHeader
              logoType="img"
              hasLogo={true}
              logo={selectedCoin?.[coinFields.logo]}
              title={
                <NumericText
                  suffixText={` ${selectedCoin?.[coinFields.coinCode]}`}
                  value={selectedCoin?.[coinFields.available]}
                  decimalScale={AppDefaults.cryptoDecimals}
                  fixedDecimals={AppDefaults.cryptoDecimals}
                        isdecimalsmall={Smalldecimals==="true"? true : false}
                  thousandSeparator
                />
              }
              // metaData={
              //   <div>
              //     <span>{selectedCoin?.[coinFields.coinName]}</span>
              //     &nbsp;
              //     <span
              //       className={`coin-price ${
              //         selectedCoin?.[coinFields.changeIn24Hours] < 0
              //           ? textStatusColors.negative
              //           : textStatusColors.positive
              //       }`}
              //     >
              //        {selectedCoin?.[coinFields?.changeIn24Hours] < 0 ? <span className="icon down-arrow text-lg"></span> : <span className="icon up-arrow"></span>}{selectedCoin?.[coinFields.changeIn24Hours] || 0}%
              //     </span>
              //   </div>
              // }
              showActions={false}
            />
          ) : (
            <div></div>
          )}
          <div className="flex gap-2">
            <div>
              <h2 className="font-semibold md:text-xl text-lg text-subTextColor">
                <span>Sell</span>
              </h2>
            </div>
            {showClose && (
              <button onClick={onClose}>
                <span
                  className="icon lg close cursor-pointer"
                  title="close"
                ></span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default memo(BuySellViewHeader);
