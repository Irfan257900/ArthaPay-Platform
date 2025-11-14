import React, { useCallback, useState } from "react";
import Verifications from "../../../core/verification.component/verifications";
import CustomButton from "../../../core/button/button";
import NumericText from "../../../core/shared/numericText";
import AppDefaults from "../../../utils/app.config";
import AppText from "../../../core/shared/appText";
import { useSelector } from "react-redux";
const SummaryItem = ({ label, value }) => {
  return (
    <div className="summary-list-item">
      <div className=" summary-label">{label}</div>
      <div className=" summary-text">{value}</div>
    </div>
  );
};
const AccountSummary = ({
  details,
  setError,
  actionButtonText = "Confirm",
  saving,
  onSubmit,
}) => {
  const [state, setState] = useState({
    error: "",
    loading: "",
    isVerified: false,
    // ✨ ADD A STATE TO TRACK VERIFICATION DATA LOADING
    isVerificationDataLoading: true,
  });
  const {
    data: vaults,
  } = useSelector((store) => store.banks.cryptoWalletsForAccCreation);
  const changesVerification = useCallback(
    (obj) => {
      setError("");
      // ✨ UPDATE LOADING STATE FROM CHILD COMPONENT
      setState((prev) => ({ ...prev, isVerificationDataLoading: obj.isLoading }));

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
  // const handleRedirectToBack = useCallback(() => {
  //   window.history.back();
  // }, []);
  return (
    <div className="summary rightpanel-card-bg mobile-padding summery-panelcard ">
      <div className="md:w-[565px] w-full mx-auto">
        <div className="wd-inblock mt-5">
          <div className="flex gap-56 items-center">
            {/* <span class="icon lg btn-arrow-back" onClick={handleRedirectToBack}></span> */}
            <div className="summary-title text-xl font-semibold text-titleColor flex justify-center">Summary</div>
          </div>
          <div>
          </div>
          <div className="summary-list">
            <div className="summary-list-item">
              <div className=" summary-label">Account To Create</div>
              <div className=" summary-text">{details?.accountToCreate}</div>
            </div>
            {details?.payingWalletType === "Crypto" && (
              <>
                {vaults?.length > 1 && <SummaryItem
                  label={"Vault"}
                  value={details?.vaultName}
                />}
                <SummaryItem label={"Coin"} value={details?.payingWalletCoin} />
                <SummaryItem label={"Network"} value={details?.network} />
                <SummaryItem
                  label={"Receiver Address"}
                  value={
                    <AppText
                      copyable={{
                        text: details?.recieverWalletAddress || "",
                        tooltips: ["Copy", "Copied"],
                      }}
                      className="summary-text m-0"
                    >
                      <span style={{ marginRight: "8px" }}>
                        {details?.recieverWalletAddress?.length > 0
                          ? details?.recieverWalletAddress
                          : ""}
                      </span>
                    </AppText>
                  }
                />
              </>
            )}

            {details?.payingWalletType === "Fiat" && (
              <SummaryItem label={"Currency"} value={details?.payingWalletCoin} />
            )}
            <SummaryItem
              label={"Amount to pay"}
              value={
                <NumericText
                  value={details?.amount}
                  suffixText={` ${details?.payingWalletCoin}`}
                  fixedDecimals={true}
                  decimalScale={
                    details?.payingWalletType === "Fiat"
                      ? AppDefaults.fiatDecimals
                      : AppDefaults.cryptoDecimals
                  }
                />
              }
            />
          </div>
        </div>
        <div className="mt-8">
          <Verifications onchangeData={changesVerification} />
        </div>
        <div className="mt-8">
          <CustomButton
            type="primary"
            onClick={onSubmit}
            className={"w-full"}
            loading={saving}
            // ✨ DISABLE IF DATA IS STILL LOADING OR NOT YET VERIFIED
            disabled={!state.isVerified || state.isVerificationDataLoading}
          >
            {actionButtonText}
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default AccountSummary;