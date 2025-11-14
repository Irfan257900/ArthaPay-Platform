import { useCallback } from "react";
import { useSelector } from "react-redux";
import checkIcon from "../../assets/images/gifSuccess.gif";
import closeImage from "../../assets/images/rejected.svg";
import underReview from "../../assets/images/under_review.svg";
import CustomButton from "../button/button";

const clientName = window.runtimeConfig.VITE_CLIENT_NAME

const StatusImage = ({ status }) => {
  if (status === "Rejected" || status === "Closed") {
    return (
      <img
        src={closeImage}
        className="spinning-loader mx-auto w-24"
        alt={status.toLowerCase()}
      />
    );
  }
  if (status === "Under Review") {
    return (
      <img
        src={underReview}
        className="spinning-loader review-animation mx-auto w-24 animate-pulse"
        alt="under review"
      />
    );
  }

  return (
    <img src={checkIcon} className="spinning-loader mx-auto w-24" alt="success" />
  );
};

const Description = ({ status, metadata,userConfig }) => {
  const adminEmail = metadata?.AdminEmail ;
  const refreshPage = useCallback(() => {
    window.location.reload();
  }, []);
  if (status === "Rejected") {
    return (
      <>
        <p className="text-base font-medium text-subTextColor text-center">
          <p className="text-lg  text-subTextColor text-center mb-4"><span className="text-textLightRed font-semibold text-lg">Reason</span> : {userConfig?.reason}</p>
          <span className="text-base font-medium text-subTextColor text-center mb-4">
            We regret to inform you that your account <br /> registration did not meet
            our requirements at this time.
          </span>
          <br />
          <br />
          <span className="text-base font-light text-subTextColor text-center mb-4">
            If you have any questions or would like assistance, please feel free
            to contact our Customer Support team at&nbsp;
            <a
              className="text-primaryColor hover:text-primaryColor"
              href={`mailto:${adminEmail}`}
            >
              {adminEmail}
            </a>{" "}
            for more information.
          </span>
        </p>
        <CustomButton type="primary" className="mb-5 !cursor-pointer Refresh-btn" onClick={refreshPage}>
          Refresh Page
        </CustomButton>
      </>
    );
  }
  if (status === "Under Review") {
    return (
      <>
        <div className="text-base text-subTextColor text-center">
          <span className="text-base font-medium text-subTextColor text-center">
            Your application is currently under review. <br /> We appreciate your
            patience during this process.
          </span>
          <br />
          <br />
          <span className="text-base font-medium text-subTextColor text-center mb-4">
            For updates or questions, contact our Customer Support team at
            <br />
            <a
              className="text-primaryColor hover:text-primaryColor"
              href={`mailto:${adminEmail}`}
            >
              {adminEmail}
            </a>.
          </span>
        </div>
        <CustomButton type="primary" className="mb-5 !cursor-pointer Refresh-btn" onClick={refreshPage}>
          Refresh Page
        </CustomButton>
      </>
    );
  }

  if (status === "Closed") {
    return (
      <>
        <div className="text-base  text-subTextColor text-center">
          <span className="text-base font-medium text-subTextColor text-center mb-4">This account is no longer active.</span>
          <br />
          <br />
          <span className="text-base font-medium text-subTextColor text-center mb-4">
            If you have any questions or would like assistance, please feel free
            to contact our Customer Support team at&nbsp;
            <a
              className="text-primaryColor hover:text-primaryColor"
              href={`mailto:${adminEmail}`}
            >
              {adminEmail}
            </a>{" "}
            for more information.
          </span>
        </div>
        <CustomButton type="primary" className="mb-5 !cursor-pointer Refresh-btn" onClick={refreshPage}>
          Refresh Page
        </CustomButton>
      </>
    );
  }

  if (status === "Approval In Progress") {
    return (<>
      <div className="text-base text-subTextColor text-center">
        <span className="block mb-2 text-lg font-semibold text-subTextColor text-center">Welcome to {clientName}!</span>
        <span className="text-base font-medium text-subTextColor text-center mb-4">
          Your account has been successfully created. We’re reviewing your
          details as part of our verification process. You’ll receive a
          notification as soon as your account is approved and ready to use.
        </span>
        <br />
        <br />
        <span className="text-base font-medium text-subTextColor text-center mb-4">
          Our support team is here to help. Feel free to contact us at&nbsp;
          <a
            className="text-primaryColor hover:text-primaryColor"
            href={`mailto:${adminEmail}`}
          >
            {adminEmail}
          </a>{" "}
          if you have any questions or need assistance.
        </span>
        <br />
        <br />
        <span className="text-base font-medium text-subTextColor text-center mb-4">Thank you for choosing {clientName} — we’re excited to have you on board!</span>

      </div>
      <CustomButton type="primary" className="mb-5 !cursor-pointer Refresh-btn" onClick={refreshPage}>
        Refresh Page
      </CustomButton>
    </>
    );
  }

  return null;
};

const AccountStatusHandler = () => {
  const userConfig = useSelector((state) => state.userConfig?.details);
  const metadata = useSelector((state) => state.userConfig?.metadata);
  const status = userConfig?.customerState;

  return (
    <div className="text-center space-y-4 max-w-[700px] mx-auto py-6">
      <h2 className="text-[34px] font-semibold text-lightWhite capitalize">
        {status || "Status Unknown"}
      </h2>
      <StatusImage status={status} />
      <Description status={status} metadata={metadata} userConfig={userConfig} />
    </div>
  );
};

export default AccountStatusHandler;
