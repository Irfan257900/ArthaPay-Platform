import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircleOutlined } from "@ant-design/icons";
import { Form, Image, Alert } from "antd";
import phoneVerificationImage from '../../assets/images/Union.svg';
import { useDispatch, useSelector } from "react-redux";
import { fetchUserDetails } from "../../reducers/userconfig.reducer";
import CustomButton from "../button/button";
import { NumericFormat } from "react-number-format";
import SingleBarLoader from "../skeleton/bar.loader";
import { sendPhoneOTP, verifyPhoneOTP } from "./http.services";
import { replaceCommas } from "../shared/validations";
import ContentLoader from "../skeleton/common.page.loader/content.loader";
import RegistrationSubmitted from "./accountType/registration_Submitted";
import Spinner from "../shared/loaders/spinner";

const VALIDATION_MESSAGES = {
  "REQUIRED": "OTP is required",
  "INVALID": "Invalid OTP"
};

const PhoneVerification = ({ handleSubmitted }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const [isOtpResent, setIsOtpResent] = useState(false); // true = timer running
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [counter, setCounter] = useState(60);
  const [resendLoader, setResendLoader] = useState(false);
  const [defaultLoader, setDefaultLoader] = useState(true);
  const [isPhoneNumberVerified, setIsPhoneNumberVerified] = useState(false);
  const [showRegistrationSubmitted, setShowRegistrationSubmitted] = useState(false);
  const [otpValue, setOtpValue] = useState(""); // Add this state
  const intervalRef = useRef();

  const userProfile = useSelector((store) => store.userConfig.details);
  const metadata = useSelector((store) => store.userConfig.metadata);
  const userProfileLoading = useSelector(
    (store) => store.userConfig.userProfileLoading
  );

  // On mount, send OTP (initial)
  useEffect(() => {
    handleOtp(null);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line
  }, []);

  // Stop timer and clean up when verification done
  useEffect(() => {
    if (isPhoneNumberVerified) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsOtpResent(false); // show RESEND even after successful verify, but disabled
      setCounter(60);
    }
  }, [isPhoneNumberVerified]);

  // Timer logic: start and manage interval
  const inititeCounter = useCallback(() => {
    let _count = 60;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsOtpResent(true); // timer running - show timer, hide button
    intervalRef.current = setInterval(() => {
      if (_count === 0) {
        clearInterval(intervalRef.current);
        setIsOtpResent(false); // timer stopped - show button
      } else {
        _count--;
        setCounter(_count);
      }
    }, 1000);
  }, []);

  const formattedCount = useMemo(() => {
    return `${Math.floor(counter / 60)
      .toString()
      .padStart(2, "0")}:${(counter % 60).toString().padStart(2, "0")}`;
  }, [counter]);

  // Send/Resend OTP
  const handleOtp = useCallback(
    async (e) => {
      const { name = "send" } = e?.target || {};
      // Clear OTP input when resend is clicked
      form.setFieldsValue({ otp: "" });
      setIsPhoneNumberVerified(false); // allow re-verification

      setCounter(60);
      setResendLoader(true);
      setError(null);

      await sendPhoneOTP(
        () => {
          setResendLoader(false);
          inititeCounter();
          handleSubmitted(true);
        },
        (errorMessage) => {
          setDefaultLoader(false);
          setResendLoader(false);
          setError(errorMessage);
          if (errorMessage === "You are not authorized to access this resource.") {
            handleSubmitted(false);
            setShowRegistrationSubmitted(true);
          }
        },
        name,
        setDefaultLoader
      );
    },
    [inititeCounter, form]
  );
  // Verify OTP
  const handleVerify = useCallback(
    async (values) => {
      setLoading(true);
      await verifyPhoneOTP(
        () => {
          setIsPhoneNumberVerified(true);
          setLoading(false);
        },
        (errorMessage) => {
          setError(errorMessage);
          setLoading(false);
        },
        replaceCommas(values.otp)
      );
    },
    []
  );

  const handleFetchcustomerDetails = useCallback(() => {
    dispatch(fetchUserDetails());
  }, [dispatch]);
  const handleOtpValueChange = useCallback((values) => {
    setOtpValue(values?.value);
  }, []);
  return (
    <div className="text-center">
      {showRegistrationSubmitted ? (
        <RegistrationSubmitted />
      ) : (
        <>
          {defaultLoader && <ContentLoader />}
          {!defaultLoader && (
            <div>
              {error !== null && (
                <div className="mb-20">
                  <Alert
                    type="error"
                    message={error}
                    closable={false}
                    className="mb-alert cust-auth-alert"
                    showIcon
                  />
                </div>
              )}
              <div>
                <Image
                  src={phoneVerificationImage}
                  className="mx-auto"
                  width={200}
                  preview={false}
                />
              </div>
              <div className="text-base font-medium text-subTextColor text-center">
                We sent a verification code to your phone:{" "}
                <span className="text-lightWhite font-semibold">
                  {userProfile?.phoneCode} {userProfile?.phoneNumber}
                </span>{" "}
                <br />
                <span>Please enter and verify the code to continue</span>
                <Form
                  form={form}
                  initialValues={{ otp: "" }}
                  onFinish={handleVerify}
                  className="md:flex gap-4 items-start justify-center my-5"
                >
                  <Form.Item
                    className="m-0 w-full md:w-64"
                    name="otp"
                    rules={[
                      { required: true, message: VALIDATION_MESSAGES.REQUIRED },
                      { min: 4, message: VALIDATION_MESSAGES.INVALID },
                      { max: 6, message: VALIDATION_MESSAGES.INVALID },
                    ]}
                    colon={false}
                  >
                    <NumericFormat
                      className="bg-transparent !border border-inputTextBorder text-lightWhite py-2 rounded outline-0 disabled:!bg-inputDisabled disabled:cursor-not-allowed disabled:!text-lightWhite disabled:hover:!bg-inputDisabled px-3 w-full"
                      allowNegative={false}
                      decimalScale={0}
                      placeholder="Enter verification code"
                      name="otp"
                      maxLength={6}
                      disabled={isPhoneNumberVerified}
                      value={otpValue}
                      onValueChange={handleOtpValueChange}
                    />
                  </Form.Item>
                  {/* Button turns green and says Verified */}
                  {/* Button turns green and shows tick + Verified */}
                  <CustomButton
                    type="primary"
                    disabled={isPhoneNumberVerified || otpValue.length < 4} // Only enable if 6 digits
                    htmlType="submit"
                    className={isPhoneNumberVerified ? "verified-btn disabled:!bg-textGreen  disabled:hover:!bg-textGreen disabled:!text-textWhite  dark:hover:!bg-textGreen" : "varify-btn"}
                    style={
                      isPhoneNumberVerified
                        ? {
                          backgroundColor: "#28a745",
                          borderColor: "#28a745",
                          color: "#fff",
                        }
                        : {}
                    }
                  >
                    {isPhoneNumberVerified ? (
                      <>
                        <CheckCircleOutlined style={{ marginRight: 6, fontSize: 16 }} /> Verified
                      </>
                    ) : (
                      "Verify"
                    )}
                  </CustomButton>

                </Form>
              </div>



              {/* == RESEND LOGIC BLOCK == */}

              <div className="text-center my-4">
                {!isPhoneNumberVerified && <div className="text-style mb-4">
                  Didn't receive the code?{" "}
                  {/* Timer: show only when running and not verified */}
                  <>
                    {!resendLoader && <>
                      {isOtpResent && !isPhoneNumberVerified ? (
                        <strong className="text-primaryColor">{formattedCount}</strong>
                      ) : (

                        <button
                          name="resend"
                          className={
                            "cursor-pointer text-link" +
                            (isPhoneNumberVerified ? " opacity-60 cursor-not-allowed" : "")
                          }
                          onClick={handleOtp}
                          disabled={isPhoneNumberVerified}
                          style={
                            isPhoneNumberVerified
                              ? {
                                color: "#999",
                                borderColor: "#eee",
                                cursor: "not-allowed",
                              }
                              : {}
                          }
                        >
                          Resend
                        </button>

                      )}</>}
                    {
                      resendLoader && <>
                        <Spinner size="default" className="px-4" />
                      </>
                    }
                  </>
                </div>}
              </div>


              <div className="text-base font-medium text-descriptionGreyTwo text-center ">
                <div className="text-style">
                  Having issues with the phone verification? Please contact us at
                </div>
                <div className="">
                  <a
                    className="text-primaryColor hover:text-primaryColor"
                    href={`mailto:${metadata?.AdminEmail}`}
                  >
                    {metadata?.AdminEmail}
                  </a>
                </div>
              </div>
              <div className="text-center my-6">
                <CustomButton
                  type="primary"
                  disabled={!isPhoneNumberVerified}
                  onClick={handleFetchcustomerDetails}
                >
                  Continue
                </CustomButton>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PhoneVerification;
