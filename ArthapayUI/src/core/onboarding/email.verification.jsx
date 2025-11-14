import React, { useCallback, useMemo, useState } from "react";
import { Image } from "antd";
import MailImage from "../../assets/images/mailimage.gif";
import { connect } from "react-redux";
import { resendVerificationMail } from "./http.services";
import AppAlert from "../shared/appAlert";
import CustomButton from "../button/button";
import Spinner from "../shared/loaders/spinner";

const EmailVerification = (props) => {
  const [emailResent, setEmailResent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [counter, setCounter] = useState(60);
  const [error, setError] = useState(null);
  const inititeCounter = useCallback(() => {
    let _count = 60;
    const interval = setInterval(() => {
      if (_count === 0) {
        clearInterval(interval);
        setEmailResent(false);
      } else {
        _count--;
        setCounter(_count);
      }
    }, 1000);
  }, [setEmailResent]);
  const formattedCount = useMemo(() => {
    return `${Math.floor(counter / 60)
      .toString()
      .padStart(2, "0")}:${(counter % 60).toString().padStart(2, "0")}`;
  }, [counter]);
  const onResent = () => {
    setEmailResent(true);
    inititeCounter();
  };
  const handleResend = async () => {
    setLoading(true);
    await resendVerificationMail(onResent, setError, props.userProfile?.id);
    setLoading(false);
  };
  const handleClose = useCallback(() => {
    setError(null);
  }, []);
  return (
    <div className="text-center">
      {error != null && (
        <AppAlert
          type="error"
          closable={true}
          showIcon
          message={error}
          onClose={handleClose}
          className="mb-alert cust-auth-alert flex !items-center"
        />
      )}

      <div className="text-base font-medium text-subTextColor text-center mb-4">
        We sent a verification email to :{" "}
        <span className="text-lightWhite font-semibold">{props?.userProfile?.email}</span>.{" "}
        <br />
        Please click the link in the email to continue.
      </div>
      <Image src={MailImage} preview={false} width={200} className="mx-auto" />
        <div className="text-base font-medium text-subTextColor text-center mb-4">
          Didn't receive your confirmation email? <br />
          {!emailResent && (
            <>
              {!loading&&<button className="cursor-pointer text-link" onClick={handleResend}>
                Click here &nbsp;
              </button>}
              {loading && (
                <Spinner size="default" className="px-4"/>
            )}
              <span>to receive a new one</span>
            </>
          )}
          {emailResent && (<>
            <span>Resend email in &nbsp;</span>
            <strong className="text-primaryColor">{formattedCount}</strong>
          </>
          )}
        </div>
      <CustomButton type="primary" className="mb-5 !cursor-pointer Refresh-btn" onClick={() => window.location.reload()}>
        Refresh Page
      </CustomButton>

    </div>
  );
};
const connectStateToProps = ({ userConfig }) => {
  return { userProfile: userConfig?.details };
};
const connectDispatchToProps = (dispatch) => {
  return { dispatch };
};
export default connect(
  connectStateToProps,
  connectDispatchToProps
)(EmailVerification);
