import { useCallback, lazy, Suspense, memo, useState } from "react";
import { useSelector } from "react-redux";
import { userManager } from "../authentication";
import PlainLoader from "../shared/loaders/plain.loader";
import { kybSteps, kycSteps } from "../../utils/kyckybSteps";
const Kyc = lazy(() => import("./kyc"));
const Kyb = lazy(() => import("./kyb"));
import AccountStatusHandler from "./accountStatus.handler";
import AccountType from "./accountType";
import EmailVerification from "./email.verification";
import OnboardingLayout from "./onboarding.layout";
import PhoneVerification from "./phone.verification";
import PageError from "../layout/pageError";
import SumSub from "../shared/sumsub";
import KycKybStatusHandler from "./kycKybStatusHandler";
import AccessDenied from "../layout/accessDenied";
const Onboarding = ({ children }) => {
  const userProfile = useSelector(
    (store) => store.userConfig.details || {}
  );
  const metadata = useSelector(
    (store) => store.userConfig.metadata || {}
  );
  const currentKycState = useSelector(
    (store) => store.userConfig.currentKycState
  );
  const [submitted, setSubmitted] = useState(false);
  const [reKycKybEligible, setReKycKybEligible] = useState(false);
  const handleSubmitted = useCallback((flag) => {
    setSubmitted(flag);
  }, []);
  const redirect = useCallback(() => {
    userManager.removeUser();
    window.open(window.runtimeConfig.VITE_ADMIN_URL, "_self");
  }, [userManager]);
  const handleReKycKyb = useCallback(() => {
    setReKycKybEligible(true);
  }, []);
  if (userProfile.error) {
    return (
      <PageError errorToDisplay={userProfile.error} />
    );
  }
  if (!userProfile?.id) {
    return <PlainLoader />;
  }
  if (userProfile.role === "Admin") {
    return <AccessDenied />;
  }
  if (
    metadata.IsEmailVerified === false ||
    metadata.IsEmailVerified === null
  ) {
    return (
      <OnboardingLayout
        className="!py-10"
        blockStyles={""}
        title={
          <span className=" mb-2 text-[34px] font-semibold text-lightWhite text-center">
            Almost there! <br /> Check your inbox.
          </span>
        }
      >
        <EmailVerification />
      </OnboardingLayout>
    );
  }
  if (
    userProfile.customerState === null || userProfile.customerState === 'Registered'
  ) {
    return (
      <OnboardingLayout
        title={
          <>
            {submitted && <span className="inline-block capitalize">
              What type of Account would <br /> you like to setup?
            </span>}
          </>
        }
      >
        <AccountType handleSubmitted={handleSubmitted} />
      </OnboardingLayout>
    );
  }



  if (
    metadata.IsPhoneNumberVerified === false ||
    metadata.IsPhoneNumberVerified === null
  ) {
    return (
      <OnboardingLayout
        title={
          <>
            {submitted && <span>
              Phone Verification <br />
            </span>}
          </>
        }
      >
        <PhoneVerification handleSubmitted={handleSubmitted} />
      </OnboardingLayout>
    );
  }
  if (metadata?.IsKycRequired) {
    if (metadata.kycType === "SumSub" && (userProfile?.kycStatus === null || userProfile.kycStatus?.toLowerCase() === 'draft' || userProfile.kycStatus?.toLowerCase() === 'init') && metadata?.IsInitialKycRequired === true) {
      return (
        <OnboardingLayout
        >
          <SumSub flow={userProfile.accountType === "Business" ? metadata.kyb : metadata.kyc} />
        </OnboardingLayout>
      );
    }
    if (metadata.kycType === "SumSub" && (userProfile?.kycStatus?.toLowerCase() === "rejected") && metadata?.IsInitialKycRequired === true && reKycKybEligible) {
      return (
        <OnboardingLayout
        >
          <SumSub flow={userProfile.accountType === "Business" ? metadata.kyb : metadata.kyc} />
        </OnboardingLayout>
      );
    }

    if (
      metadata.IsInitialKycRequired === true &&
      (userProfile.kycStatus === null || userProfile.kycStatus?.toLowerCase() === 'draft' || userProfile.kycStatus?.toLowerCase() === 'init') &&
      (userProfile.accountType === "Personal" ||
        userProfile.accountType === "Employee") && metadata.kycType !== "SumSub"
    ) {
      return (
        <OnboardingLayout>
          <Suspense fallback={<PlainLoader />}>
            <Kyc currentStep={kycSteps[currentKycState] || kycSteps.default} />
          </Suspense>
        </OnboardingLayout>
      );
    }
    if (
      metadata.IsInitialKycRequired === true &&
      userProfile.kycStatus?.toLowerCase() === 'rejected' &&
      (userProfile.accountType === "Personal" ||
        userProfile.accountType === "Employee") && metadata.kycType !== "SumSub" && reKycKybEligible
    ) {
      return (
        <OnboardingLayout>
          <Suspense fallback={<PlainLoader />}>
            <Kyc currentStep={kycSteps[currentKycState] || kycSteps.default} />
          </Suspense>
        </OnboardingLayout>
      );
    }
    if (
      metadata.IsInitialKycRequired === true &&
      (userProfile?.kycStatus === null || userProfile.kycStatus?.toLowerCase() === 'draft' || userProfile.kycStatus?.toLowerCase() === 'init') &&
      userProfile.accountType === "Business"
    ) {
      return (
        <OnboardingLayout>
          <Suspense fallback={<PlainLoader />}>
            <Kyb currentStep={kybSteps[currentKycState] || kybSteps.default} />
          </Suspense>
        </OnboardingLayout>
      );
    }
    if (
      metadata.IsInitialKycRequired === true &&
      userProfile.kycStatus?.toLowerCase() === 'rejected' &&
      userProfile.accountType === "Business" && reKycKybEligible && metadata.kycType !== "SumSub"
    ) {
      return (
        <OnboardingLayout>
          <Suspense fallback={<PlainLoader />}>
            <Kyb currentStep={kybSteps[currentKycState] || kybSteps.default} />
          </Suspense>
        </OnboardingLayout>
      );
    }
  }
  if (metadata?.IsInitialKycRequired === true && userProfile.kycStatus !== "Approved") {
    return (<OnboardingLayout>
      <Suspense fallback={<PlainLoader />}>
        <KycKybStatusHandler handleReKycKyb={handleReKycKyb} />
      </Suspense>
    </OnboardingLayout>);
  }
  if (userProfile.id && userProfile.customerState !== "Approved") {
    return (
      <OnboardingLayout
        blockStyles={""}
        topBgClass={"h-[45vh]"}
      //title={<AccountStatusTitle status={userProfile?.customerState} />}
      >
        <AccountStatusHandler />
      </OnboardingLayout>
    );
  }
  if (userProfile.id && userProfile.customerState === "Approved") {
    return <>{children}</>;
  }
  return <OnboardingLayout><PlainLoader />;</OnboardingLayout>
};

export default memo(Onboarding);
