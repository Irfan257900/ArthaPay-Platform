import React, { useCallback,  useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import AccountSelection from "./accounts.selection";
import {
  resetCreateAccountState,
  setCurCreationStep,
} from "../../../reducers/banks.reducer";
import CommonDrawer from "../../../core/shared/drawer";

const drawerTitles = {
  accSelection: "Create Account",
  walletSelection: "Pay with wallet",
  fiatSummary: "Summary",
  cryptoSummary: "Summary",
};
const backButtonLabels = {
  walletSelection: "Back to Account selection",
  fiatSummary: "Back to wallet selection",
  cryptoSummary: "Back to wallet selection",
};
const CreateAccount = ({ isDrawer, isDrawerOpen, closeDrawer }) => {
  const dispatch = useDispatch();
  const currentStep = useSelector((store) => store.banks.curCreationStep);
  
  const showBackButton = useMemo(() => {
    return !["accSelection", "success"].includes(currentStep);
  }, [currentStep]);
  const handleClose = useCallback(() => {
    isDrawer ? closeDrawer() : dispatch(setCurCreationStep("accSelection"));
  }, [isDrawer]);

  const handleBack = useCallback(
    (e) => {
      e?.preventDefault();
      switch (currentStep) {
        case "walletSelection": {
          dispatch(setCurCreationStep("accSelection"));
          dispatch(
            resetCreateAccountState([
              "selectedWalletTab",
              "fiatWalletsForAccCreation",
              "cryptoWalletsForAccCreation",
              "selectedFiatWalletToPay",
              "selectedCryptoWalletToPay",
              "selectedCryptoCoinToPay",
              "selectedCryptoNetworkToPay",
              "verifications",
            ])
          );
          break;
        }
        case "fiatSummary":
        case "cryptoSummary": {
          dispatch(setCurCreationStep("walletSelection"));
          dispatch(resetCreateAccountState(["summaryForAccountCreation"]));
          break;
        }
        default:
          break;
      }
    },
    [currentStep]
  );
  return (
    <>
      {isDrawer && (
        <CommonDrawer
          isOpen={isDrawerOpen}
          title={drawerTitles[currentStep]}
          onClose={handleClose}
        >
          {showBackButton && (
            <button
              onClick={handleBack}
              type="button"
              className="mb-4 flex gap-2 text-primaryColor hover:text-primaryColor"
            >
              <span className="icon lg btn-arrow-back"></span>
              <span>{backButtonLabels[currentStep]}</span>
            </button>
          )}

        </CommonDrawer>
      )}
      {!isDrawer && (
        <>
          {currentStep === "accSelection" && (
            <AccountSelection isDrawer={isDrawer} />
          )}
          {currentStep === "kycVerification" && (
            <BankKycDetails isDrawer={isDrawer} />
          )}

          <CommonDrawer
            isOpen={!["accSelection", "success"].includes(currentStep)}
            title={drawerTitles[currentStep]}
            onClose={handleClose}
          >
            <button
              onClick={handleBack}
              type="button"
              className="mb-4 flex gap-2 text-primaryColor hover:text-primaryColor"
            >
              <span className="icon lg btn-arrow-back"></span>
              <span>{backButtonLabels[currentStep]}</span>
            </button>
          </CommonDrawer>
        </>
      )}
    </>
  );
};

export default CreateAccount;
