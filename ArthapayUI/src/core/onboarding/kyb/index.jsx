import React, { useEffect, useMemo, useState } from "react";
import CompanyData from "./company.data";
import UboDetails from "./ubo";
import DirectorsDetails from "./directors.details";
import KybReviewDetails from "./kyb.review.details";
import KycKybStatus from "../kyckyb.status";
import SumSub from "../../shared/sumsub";
import { fetchExemptFields } from "../http.services";
import { useDispatch, useSelector } from "react-redux";
import { fetchLookups, setExcemptionFields } from "../../../reducers/kyb.reducer";
import { kybSteps } from "../../../utils/kyckybSteps";
import PageHeader from "../../shared/page.header";
import { useOutletContext } from "react-router";
const Kyb = ({ showHeader, screen }) => {
  const [showStatus, setShowStatus] = useState(false);
  const outletContext = useOutletContext()
  const dispatch = useDispatch();
  const Provider = useSelector((store) => store.userConfig?.details?.kycType?.toLowerCase());
  const currentKycState = useSelector(
    (store) => store.userConfig.currentKycState
  );
  const kycStatus = useSelector(
    (store) => store.userConfig.details?.kycStatus
  );
  const IsInitialKycRequired = useSelector(
    (store) => store.userConfig.metadata?.IsInitialKycRequired
  );
  const kybFlowName = useSelector(
    (store) => store.userConfig.metadata?.kyb
  );
  const currentStep = useMemo(() => {
    return kybSteps[currentKycState] || kybSteps["default"];
  }, [currentKycState]);
  const isKycorKybFlowEbabled = useSelector((store) => store.userConfig.isKycorKybFlowEbabled);

  useEffect(() => {
    getExemptFields();
    dispatch(fetchLookups())
    if (screen === 'manageAccount') {
      const { setBreadCrumb, baseBreadCrumb } = outletContext
      setBreadCrumb([...baseBreadCrumb, { id: "3", title: "KYB" },])
    }
  }, []);
  const onSuccess = (response) => {
    dispatch(setExcemptionFields(response));
  };

  const getExemptFields = async () => {
    await fetchExemptFields(onSuccess);
  };
  if (Provider === "sumsub" && IsInitialKycRequired === false && kycStatus !== "Approved") {
    return <>
      {showHeader && <PageHeader showBreadcrumb={false} />}
      <SumSub flow={kybFlowName} />
    </>;
  }
  if (showStatus) {
    return <KycKybStatus type={"KYB"} setShowStatus={setShowStatus} />;
  }
  if (Provider === "sumsub" && IsInitialKycRequired === false && kycStatus !== "Approved" && isKycorKybFlowEbabled) {
    return <>
      {showHeader && <PageHeader showBreadcrumb={false} />}
      <SumSub flow={kybFlowName} />
    </>;
  }
  return (
    <>
      {Provider !== "sumsub" && <>
        {showHeader && <PageHeader showBreadcrumb={false} />}
        {currentStep === "companyinfo" && <CompanyData />}
        {currentStep === "ubodetails" && <UboDetails />}
        {currentStep === "directordetails" && <DirectorsDetails />}
        {(currentStep === "review" || currentStep === "approved") && (
          <KybReviewDetails setShowStatus={setShowStatus} />
        )}
      </>}
      {
        (Provider === "sumsub" && kycStatus === "Approved") && <>
          <KybReviewDetails setShowStatus={setShowStatus} />
        </>
      }
    </>
  );
};

export default Kyb;
