import React, { useCallback, useState } from "react";
import CustomButton from "../../button/button";
import Verifications from "../../verification.component/verifications";
import AppText from "../../shared/appText";
import NumericText from "../../shared/numericText";
import AppDefaults from "../../../utils/app.config";
const UpgradeSummary = ({
  details,
  setError,
  saving,
  onSubmit,
}) => {
  const [state, setState] = useState({
    error: "",
    loading: "",
    isVerified: false,
    showFeeInfo: false,
  });
  const changesVerification = useCallback(
    (obj) => {
      setError("");
      if (
        Object.keys(obj.verifyData)
          .filter((key) => obj.verifyData[key] === true)
          .every((key) => obj[key] === obj.verifyData[key])
      ) {
        setState((prev) => ({ ...prev, isVerified: true }));
      } else {
        setState((prev) => ({ ...prev, isVerified: false }));
      }
    },
    [setState, setError]
  );
  return (
    <div className="summary rightpanel-card-bg mobile-padding summery-panelcard ">
      <div className="summary-panel">
        <div className="text-left">
          <h2 className="text-xl font-semibold text-titleColor mb-2.5 text-left">
            Summary
          </h2>
        </div>
        <div className="wd-inblock">
          <div className="summary-list">
            <div className="summary-list-item">
              <div className="summary-label">Exchange rate</div>
              <div className="summary-text">
                1 {details?.coin} ≈{" "}
                <NumericText
                  value={details?.exchangeRate}
                  suffixText={` USD`}
                  fixedDecimals={null}
                  decimalScale={AppDefaults.fiatDecimals}
                />
              </div>
            </div>
            <div className="summary-list-item">
              <div className=" summary-label">
                Amount
              </div>
              <div className=" summary-text">
                <NumericText
                  value={details?.amount}
                  suffixText={` ${details?.coin}`}
                  fixedDecimals={null}
                  decimalScale={AppDefaults.cryptoDecimals}
                />
              </div>
            </div>
            {details?.address && (
              <div className="summary-list-item">
                <div className=" summary-label">Receiver Address</div>
                <div className=" summary-text">
                  <AppText
                    copyable={{ tooltips: ["Copy", "Copied"] }}
                    className="summary-text m-0"
                  >
                    {details?.address?.length > 0 ? details?.address : ""}
                  </AppText>
                </div>
              </div>
            )}
            {details?.network && (
              <div className="summary-list-item">
                <div className=" summary-label">Network</div>
                <div className=" summary-text">{details?.network}</div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-12">
          <Verifications onchangeData={changesVerification} />
        </div>
        <div className="mt-9">
          <CustomButton
            type="primary"
            onClick={onSubmit}
            className={"w-full"}
            loading={saving}
            disabled={!state.isVerified}
          >
            Upgrade
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default UpgradeSummary;
