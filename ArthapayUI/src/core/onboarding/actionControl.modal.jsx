import React,{ useCallback, useMemo } from "react";
import AppModal from "../shared/appModal";
import { useSelector } from "react-redux";
import ActionControlKyc from "./actionControl.kyc"
import ActionControlMembership from "../shared/noActiveMembership"
const ModalTitle = ({ kycText, currentStatus,currentModal }) => {
  if (currentModal==='kyc' && (currentStatus === null || currentStatus === "Draft")) {
    return <h1 className="text-2xl text-titleColor font-semibold">Complete {kycText}</h1>;
  }
  if (currentModal==='kyc' && (currentStatus === null || currentStatus === "Draft")) {
    return <h1 className="text-2xl text-titleColor font-semibold">{kycText} Approval Status</h1>;
  }
  if (currentModal==='subscribeMembership') {
    return <h1 className="text-2xl text-titleColor font-semibold">Purchase Membership</h1>;
  }
  return <></>
 
};
const exploreMembershipPath=`/profile/fees/memberships/explore`
const ActionControlModal = ({ isOpen,modal, setModalOpen,actionFrom,redirectTo }) => {
  const userProfile = useSelector((store) => store.userConfig.details || {});
  const currentKycStatus = useSelector((store) => store.userConfig.kycStatus);
  const {basePath,kycText} = useMemo(() => {
    return userProfile?.accountType === "Business" ? {basePath:"/kyb?",kycText:"KYB"} : {kycText:"KYC",basePath:"/kyc?"};
  }, [userProfile?.accountType]);
  const closeModal=useCallback(() => setModalOpen(''),[setModalOpen])
  return (
    <AppModal
      isOpen={isOpen}
      title={<ModalTitle kycText={kycText} currentStatus={currentKycStatus} currentModal={modal}/>}
      footer={null}
      onClose={closeModal}
      closeIcon={<button onClick={closeModal}><span className="icon lg close cursor-pointer" title="close"></span></button>}
    >
     {modal==='kyc' && <ActionControlKyc
        kycText={kycText}
        currentModal={modal}
        onCancel={closeModal}
        isModal={true}
        userProfile={userProfile}
        currentStatus={currentKycStatus}
        path={`${basePath}actionFrom=${encodeURIComponent(
          actionFrom
        )}&redirectTo=${encodeURIComponent(redirectTo)}`}
      />}
      {modal==='subscribeMembership' && <ActionControlMembership
        kycText={kycText}
        currentModal={modal}
        onCancel={closeModal}
        isModal={true}
        userProfile={userProfile}
        currentStatus={currentKycStatus}
        path={`${exploreMembershipPath}?redirectTo=${encodeURIComponent(redirectTo)}`}
      />}
    </AppModal>
  );
};

export default ActionControlModal;
