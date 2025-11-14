import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, matchPath } from "react-router";
import CustomButton from "../../../core/button/button";
import { Steps } from "antd";
import { clearErrorMessage, setSelectedCryptoWalletToPay, setSelectedFiatWalletToPay } from "../../../reducers/banks.reducer";

const ViewHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const handleBack = useCallback(() => {
    navigate(-1);
    dispatch(clearErrorMessage(['summaryForAccountCreation']));
    dispatch(clearErrorMessage(['fiatWalletsForAccCreation']));
    dispatch(clearErrorMessage(['cryptoWalletsForAccCreation']));
    dispatch(setSelectedFiatWalletToPay(null));
    dispatch(setSelectedCryptoWalletToPay(null));
  }, [navigate]);

  const userConfig = useSelector((store) => store.userConfig.details);
  const bankForCreateAccount = useSelector(
    (store) => store.banks.bankForCreateAccount
  );
  const shouldShowPayStep = bankForCreateAccount?.accountCreationFee > 0;
  const type = userConfig?.accountType === "Business";

  const ACCOUNT_CREATION_STEPS = [
    {
      id: "chooseAccount",
      name: "Choose Account",
      icon: <span className="icon step-user-icon"></span>,
    },
    {
      id: "kyc",
      name: type ? "KYB" : "KYC",
      icon: <span className="icon kyc-icon"></span>,
    },
    ...(!bankForCreateAccount || shouldShowPayStep
      ? [
        {
          id: "paymentDetails",
          name: "Pay",
          icon: <span className="icon pay-icon"></span>,
        },
      ]
      : []),
  ];

  const getStepFromPath = (pathname) => {
    const stepRoutes = [
      { path: "/banks/account/create", step: 0 },
      { path: "/banks/account/create/:id/:type", step: 1 },
      { path: "/banks/account/create/:id/:type/success", step: 1 },
      { path: "/banks/account/create/:id/:type/pay", step: 2 },
      { path: "/banks/account/create/:id/:type/pay/fait/summary", step: 2 },
      { path: "/banks/account/create/:id/:type/pay/crypto/summary", step: 2 },
      {
        path: "/banks/account/create/:id/:type/pay/crypto/summary/success",
        step: 2,
      },
      {
        path: "/banks/account/create/:id/:type/pay/fait/summary/success",
        step: 2,
      },
    ];

    const foundStep = stepRoutes.find((route) => matchPath(route.path, pathname));

    return foundStep ? foundStep.step : 0;
  };

  const currentStep = getStepFromPath(location.pathname);

  return (
    <>
      <div className="flex justify-between items-center border-b-2 border-cryptoline pb-3">
        {!location.pathname.includes("success") && (
          <CustomButton type="normal" onClick={handleBack}>
            <span className="icon lg btn-arrow-back"></span>
          </CustomButton>
        )}
        <div className="flex gap-2">
          <p className="text-2xl font-semibold text-subTextColor capitalize">
            Add New Bank account
          </p>
        </div>
      </div>

      <div className="flex gap-1 items-center mt-5 custom-steps">
        <Steps current={currentStep}>
          {ACCOUNT_CREATION_STEPS.map((step) => (
            <Steps.Step key={step.id} title={step.name} icon={step.icon} />
          ))}
        </Steps>
      </div>
    </>
  );
};

export default ViewHeader;