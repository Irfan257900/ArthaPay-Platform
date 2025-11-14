import React, { useCallback,memo } from "react";
import { useSelector } from "react-redux";
import SuccessComponent from "../../../core/shared/success.component";
import SuccessComponentLoader from "../../../core/skeleton/common.page.loader/success.component.loader";
import NumericText from "../../../core/shared/numericText";
const Success = ({onOk}) => {
  const {loader} = useSelector((state) => state.buyState.cryptoCoins);
  const details = useSelector((state) => state.buyState.summaryDetails);
  const handleSuccessClose = useCallback(() => {
    onOk?.();
  }, []);

  return (
    <div>
      {loader!=='success' &&<SuccessComponent
          onOk={handleSuccessClose}
          okButtonText="Buy Again"
          message={
            <>
              Your order has been placed successfully,&nbsp;
              <NumericText
                value={details?.toValue}
                type="text"
                prefixText=""
                suffixText=""
                decimalScale={4}
                fixedDecimalScale={true}
                thousandSeparator={true}
                allowNegative={true}
                className="amount-text text-base font-semibold text-subTextColor"
              />
              &nbsp;{details?.toAsset} has been added into your wallet.
            </>
          }
        />}
      {loader==='success' && <SuccessComponentLoader/>}
    </div>
  );
};

export default memo(Success);
