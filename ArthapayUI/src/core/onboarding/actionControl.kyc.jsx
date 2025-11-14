import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import reviewImage from "../../assets/images/doc-underreview.svg";
import CustomButton from "../button/button";
const getConfig = ({ kycText }) => {
  return {
    draft: {
      image: reviewImage,
      text: (
        <h1 className="mt-0 text-xl font-medium text-lightWhite">
          Please complete your <span className="font-bold">{kycText}</span>{" "}
          verification
          <br />
          <span className="text-base">
            to proceed with this action.&nbsp;Contact support if you need
            assistance.
          </span>
        </h1>
      ),
      cancelText: "I will do it later",
      continueText: "Continue",
    },
    rejected: {
      image: reviewImage,
      text: (
        <h1 className="mt-0 text-xl font-medium text-lightWhite">
          Your <span className="font-bold">{kycText}</span> verification has
          been rejected.
          <br />
          <span className="text-base">
            Please review your information and resubmit with any necessary
            updates.
          </span>
        </h1>
      ),
      cancelText: "I will do it later",
      continueText: "Review now",
    },
    underReview: {
      image: reviewImage,
      text: (
        <h1 className="mt-0 text-xl font-medium text-lightWhite">
          Your documents are under review.
          <br />
          <span className="text-base">
            We’ll notify you promptly once the review is completed.
          </span>
        </h1>
      ),
      cancelText: "Cancel",
      continueText: "",
    },
    submitted: {
      image: reviewImage,
      text: (
        <h1 className="mt-0 text-xl font-medium text-lightWhite">
          Your <span className="font-bold">{kycText}</span> submission has been
          received.
          <br />
          <span className="text-base">
            You can edit your information before verification begins.
          </span>
        </h1>
      ),
      cancelText: "Cancel",
      continueText: "Edit now",
    },
  };
};
const ActionControlKyc = React.memo(
  ({ kycText, path, isModal, currentStatus, onCancel }) => {
    const navigate = useNavigate();
    const onOk = useCallback(() => {
      navigate(path);
    }, [path, navigate]);
    const configKey=useMemo(()=>{
      if([null,'draft','Draft'].includes(currentStatus)) return 'draft'
      if(['rejected','Rejected'].includes(currentStatus)) return 'rejected'
      if(['under review','Under Review','Under review'].includes(currentStatus)) return 'underReview'
      return 'submitted'
    },[currentStatus])
    const config=useMemo(()=>{
      const configToSet=getConfig({kycText})
      return configToSet[configKey]
    },[configKey,kycText])
    return (
      <>
        <div
          className={`flex flex-col justify-center items-center gap-4 text-center w-full ${
            isModal ? "h-fit" : "h-[100vh]"
          }`}
        >
          <img
            src={config['image']}
            alt="Documents Review"
            className="h-32 mt-12"
          />
          {config['text']}
        </div>
        <div className="text-right mt-9">
          {isModal && <CustomButton onClick={onCancel}>{config['cancelText']}</CustomButton>}
          {config['continueText'] && (
            <CustomButton onClick={onOk} type="primary" className="md:ml-3.5">
              {config['continueText']}
            </CustomButton>
          )}
        </div>
      </>
    );
  }
);

export default ActionControlKyc;
