import { useCallback, useEffect, useMemo, useState } from "react";
import BasicInfo from "./basic.info";
import IdentityDocuments from "./identity.documents";
import ReviewComponent from "./review.component";
import KycKybStatus from "../kyckyb.status";
import SumSub from "../../shared/sumsub";
import { fetchExemptFields } from "../http.services";
import { useDispatch, useSelector } from "react-redux";
import { fetchLookups, setExcemptionFields } from "../../../reducers/kyc.reducer";
import { kycSteps } from "../../../utils/kyckybSteps";
import PageHeader from "../../shared/page.header";
import { useOutletContext } from "react-router";
import CompanyDataloader from "../../skeleton/kyb.loaders/companydata.loader";
import { Alert, Button } from "antd";

const PreKycInfo = ({ onContinue }) => {
  return (
    <div className="p-6 kpicardbg h-full mx-auto rounded-lg shadow-md text-center flex flex-col items-center justify-center">
      <div className="p-6 max-w-2xl">
        <h2 className="text-2xl font-semibold mb-6">Complete Your KYC</h2>
        <ul className="text-left list-disc pl-6 mb-8 space-y-3 text-base md:text-lg">
          <li>After completing your KYC, you can deposit funds into your account.</li>
          <li>Withdraw funds securely and without limitations.</li>
          <li>Access all application features without restrictions.</li>
          <li>Ensure your account is fully verified for compliance and safety.</li>
        </ul>
        <p className="mb-8 text-center text-sm md:text-base">
          <span className="font-bold">Note:</span> Once your KYC is approved, please sign in again to access all features without any limitations.
        </p>
        <Button type="primary" size="large" onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
};

const Kyc = ({ showHeader = false, screen }) => {
  const [error, setError] = useState(null);
  const [showStatus, setShowStatus] = useState(false);
  const [showPreKycInfo, setShowPreKycInfo] = useState(false);

  const dispatch = useDispatch();
  const outletContext = useOutletContext();

  const currentKycState = useSelector((store) => store.userConfig.currentKycState);
  const Provider = useSelector((store) => store.userConfig.metadata?.kycType?.toLowerCase());
  const IsInitialKycRequired = useSelector((store) => store.userConfig.metadata?.IsInitialKycRequired);
  const kycStatus = useSelector((store) => store.userConfig.details?.kycStatus);
  const kycFlowName = useSelector((store) => store.userConfig.metadata?.kyc);
  const isKycorKybFlowEbabled = useSelector((store) => store.userConfig.isKycorKybFlowEbabled);
  const userId = useSelector((store) => store.userConfig.details?.userId); // Unique user ID from store

  const preKycKey = `hasContinuedPreKyc_${userId || "guest"}`;

  const onSuccess = useCallback((response) => {
    dispatch(setExcemptionFields(response));
  }, [dispatch]);

  const clearErrorMessage = useCallback(() => {
    setError(null);
  }, []);

  const getExemptFields = useCallback(async () => {
    await fetchExemptFields(onSuccess, setError);
  }, [onSuccess]);

  const currentStep = useMemo(() => {
    return kycSteps[currentKycState] || kycSteps["default"];
  }, [currentKycState]);

  useEffect(() => {
    getExemptFields();
    dispatch(fetchLookups());

    if (screen === "manageAccount") {
      const { setBreadCrumb, baseBreadCrumb } = outletContext;
      setBreadCrumb([...baseBreadCrumb, { id: "3", title: "KYC" }]);
    }

    if (localStorage.getItem(preKycKey)) {
      setShowPreKycInfo(true);
    }
  }, [dispatch, getExemptFields, outletContext, screen, preKycKey]);

  const handleContinue = () => {
    setShowPreKycInfo(true);
    localStorage.setItem(preKycKey, "true"); // Store state for this user
  };

  if (Provider === "sumsub" && kycStatus?.toLowerCase() === "approved") {
    return (
      <>
        {showHeader && <PageHeader showBreadcrumb={false} />}
        <ReviewComponent setShowStatus={setShowStatus} />
      </>
    );
  }

  if (
    Provider === "sumsub" &&
    IsInitialKycRequired === false &&
    kycStatus?.toLowerCase() !== "approved" &&
    isKycorKybFlowEbabled
  ) {
    return (
      <>
        {showHeader && <PageHeader showBreadcrumb={false} />}
        {!showPreKycInfo ? (
          <PreKycInfo onContinue={handleContinue} />
        ) : (
          <SumSub flow={kycFlowName} />
        )}
      </>
    );
  }

  if (Provider === "sumsub" && IsInitialKycRequired === false && kycStatus?.toLowerCase() !== "approved") {
    return (
      <>
        {showHeader && <PageHeader showBreadcrumb={false} />}
        {!showPreKycInfo ? (
          <PreKycInfo onContinue={handleContinue} />
        ) : (
          <SumSub flow={kycFlowName} />
        )}
      </>
    );
  }

  if (showStatus) {
    return <KycKybStatus type={"KYC"} setShowStatus={setShowStatus} />;
  }

  return (
    <>
      {error !== null && (
        <div className="alert-flex">
          <Alert type="error" description={error} onClose={clearErrorMessage} showIcon />
          <button className="icon sm alert-close" onClick={clearErrorMessage}></button>
        </div>
      )}
      {Provider !== "sumsub" && kycStatus?.toLowerCase() === "approved" && (
        <ReviewComponent setShowStatus={setShowStatus} />
      )}
      {Provider !== "sumsub" && kycStatus?.toLowerCase() !== "approved" && (
        <>
          {showHeader && !error && <PageHeader showBreadcrumb={false} />}
          {(currentStep === null || currentStep === "basicinfo") &&
            Provider !== "sumsub" &&
            !error && <BasicInfo />}
          {currentStep === "identification" && !error && <IdentityDocuments />}
          {(currentStep === "review" || currentStep === "approved") && !error && (
            <ReviewComponent setShowStatus={setShowStatus} />
          )}
          {currentStep === undefined && <CompanyDataloader />}
        </>
      )}

      {Provider === "sumsub" && kycStatus?.toLowerCase() === "approved" && (
        <ReviewComponent setShowStatus={setShowStatus} />
      )}
    </>
  );
};

export default Kyc;
