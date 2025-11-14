import { useState, useEffect, useCallback } from "react";
import { Typography, Button, Form, Input, Alert, Tooltip } from "antd";
import {
  getCode,
  getVerification,
  sendEmail,
  verifyEmailCode,
  getAuthenticator,
  getVerificationFields,
} from "./http.services";
import { connect, useSelector } from "react-redux";
import { WarningOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { deriveErrorMessage } from "../shared/deriveErrorMessage";
import { phoneNoRegexOtp, validations } from "../shared/validations";

const icon = <WarningOutlined />;

const Verifications = (props) => {
  const [verifyData, setVerifyData] = useState({});
  const [email, setEmail] = useState({
    showRuleMsg: "",
    errorMsg: "",
    btnName: "get_otp",
    requestType: "Send",
    code: "",
    verified: false,
    btnLoader: false,
  });
  const [phone, setPhone] = useState({
    showRuleMsg: "",
    errorMsg: "",
    btnName: "get_otp",
    requestType: "Send",
    code: "",
    verified: false,
    btnLoader: false,
  });
  const [authenticator, setAuthenticator] = useState({
    showRuleMsg: "",
    errorMsg: "",
    btnName: "verifyOtpBtn",
    code: "", // Added 'code' to local state for controlled input
    verified: false,
    btnLoader: false,
  });
  const { t } = useTranslation();
  const [phoneSeconds, setPhoneSeconds] = useState(0);
  const [emailSeconds, setEmailSeconds] = useState(0);
  const [errorMsg, setErrorMsg] = useState(false);
  const [isPhoneCodeValid, setIsPhoneCodeValid] = useState(false);
  const [isEmailCodeValid, setIsEmailCodeValid] = useState(false);
  // ✨ NEW STATE FOR AUTHENTICATOR CODE VALIDATION
  const [isAuthenticatorCodeValid, setIsAuthenticatorCodeValid] = useState(false);
  // ✨ NEW STATE TO TRACK LOADING STATUS
  const [isLoading, setIsLoading] = useState(true); // Default to true as loading starts immediately
  const { Text } = Typography;
  const fullNumber = props?.userConfig?.phoneNumber;
  const last4Digits = fullNumber?.slice(-4);
  const maskedNumber = last4Digits?.padStart(fullNumber?.length, "*");
  const userInfo = useSelector((store) => store.userConfig.details);

  useEffect(() => {
    getVerifyData(userInfo.id);
  }, [userInfo.id]);

  useEffect(() => {
    props?.onchangeData({
      verifyData: verifyData,
      isEmailVerification: email.verified,
      isTwoFactorEnabled: authenticator.verified,
      isPhoneVerified: phone.verified,
      // ✨ PASS LOADING STATE TO PARENT
      isLoading: isLoading,
    });
  }, [
    email.verified,
    phone.verified,
    authenticator.verified,
    verifyData,
    props?.onchangeData,
    isLoading, // Include in dependency array
  ]);

  // ✅ FIX RE-APPLIED: Prevents state reset if already verified
  useEffect(() => {
    let timer;
    if (phoneSeconds > 0) {
      timer = setInterval(() => {
        setPhoneSeconds((prev) => {
          if (prev <= 1) {
            // 👇 CRUCIAL CHECK: Only reset if NOT verified
            if (!phone.verified) { 
              setPhone((p) => ({ ...p, btnName: "resendotp", code: "" }));
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [phoneSeconds, phone.verified]); // 👈 CRUCIAL DEPENDENCY: Added phone.verified

  // ✅ FIX RE-APPLIED: Prevents state reset if already verified
  useEffect(() => {
    let timer;
    if (emailSeconds > 0) {
      timer = setInterval(() => {
        setEmailSeconds((prev) => {
          if (prev <= 1) {
            // 👇 CRUCIAL CHECK: Only reset if NOT verified
            if (!email.verified) {
                setEmail((e) => ({ ...e, btnName: "resendotp", code: "" }));
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [emailSeconds, email.verified]); // 👈 CRUCIAL DEPENDENCY: Added email.verified

  const getVerifyData = async (id) => {
    let response = await getVerificationFields(id);
    if (response?.data) {
      setVerifyData(response?.data);
    } else {
      setErrorMsg(
        "Without verifications you can't withdraw. Please select withdraw verifications from security section"
      );
    }
    // ✨ SET isLoading TO FALSE AFTER DATA IS FETCHED OR AN ERROR OCCURS
    setIsLoading(false);
  };

  const sendEmailOTP = useCallback(async () => {
    setEmail((e) => ({ ...e, errorMsg: "", showRuleMsg: "", btnLoader: true }));
    let response = await sendEmail(email.requestType);
    if (response.data) {
      setEmail((e) => ({
        ...e,
        errorMsg: "",
        btnName: "code_Sent",
        requestType: "Resend",
        showRuleMsg: `Enter 6 digit code sent to your Email Id`,
        btnLoader: false,
        code: "", // Clears input on successful send/resend
      }));
      setIsEmailCodeValid(false); // Reset code valid state
      setEmailSeconds(60);
    } else {
      setEmail((e) => ({
        ...e,
        errorMsg: deriveErrorMessage(response.error),
        showRuleMsg: "",
        btnLoader: false,
      }));
    }
  }, [email.requestType]);

  const verifyEmailOtp = useCallback(async () => {
    if (!email.code) {
      setEmail((e) => ({
        ...e,
        errorMsg: "Please enter email verification code",
        verified: false,
      }));
      return;
    }
    if (email.code.toString().length === 6) {
      setEmail((e) => ({ ...e, errorMsg: "", showRuleMsg: "", btnLoader: true }));
      let response = await verifyEmailCode(email.code);
      if (response?.data === "Approved") {
        setEmail((e) => ({
          ...e,
          errorMsg: "",
          verified: true,
          btnName: "verified",
          btnLoader: false,
          showRuleMsg: "",
        }));
        updateverifyObj(true, "isEmailVerification");
      } else {
        setEmail((e) => ({
          ...e,
          showRuleMsg: "",
          errorMsg: "Invalid email verification code",
          verified: false,
          btnLoader: false,
        }));
        updateverifyObj(false, "isEmailVerification");
      }
    } else {
      setEmail((e) => ({
        ...e,
        errorMsg: "Invalid email verification code",
        verified: false,
        btnLoader: false,
      }));
    }
  }, [email.code]);

  const handleEmailinputChange = useCallback(
    (e) => {
      const value = e.target.value;
      setEmail((prevEmail) => ({ ...prevEmail, errorMsg: "", showRuleMsg: "", code: value }));
      const isValid = phoneNoRegexOtp.test(value);
      setIsEmailCodeValid(isValid);
      
      // Prevent button name change if already verified
      if (email.verified) return;
      
      if (isValid) {
        setEmail((prevEmail) => ({ ...prevEmail, btnName: "verifyOtpBtn" }));
      } else if (emailSeconds === 0 && email.btnName === "code_Sent") {
        setEmail((prevEmail) => ({ ...prevEmail, btnName: "resendotp", code: "" }));
      } else if (
        emailSeconds === 0 &&
        (email.btnName === "resendotp" || email.btnName === "verifyOtpBtn") &&
        value === ""
      ) {
        setEmail((prevEmail) => ({ ...prevEmail, btnName: "resendotp", code: "" }));
      } else if (value.length < 6 && email.btnName !== "get_otp" && email.btnName !== "verified") {
        setEmail((prevEmail) => ({ ...prevEmail, btnName: "code_Sent" }));
      }
    },
    [email, emailSeconds]
  );

  const getphoneOTP = useCallback(async () => {
    setPhone((p) => ({ ...p, errorMsg: "", showRuleMsg: "", btnLoader: true }));
    let response = await getCode(phone.requestType);
    if (response.data) {
      setPhone((p) => ({
        ...p,
        errorMsg: "",
        btnName: "code_Sent",
        requestType: "Resend",
        showRuleMsg: `Enter 6 digit code sent to ${maskedNumber}`,
        btnLoader: false,
        code: "", // Clears input on successful send/resend
      }));
      setIsPhoneCodeValid(false); // Reset code valid state
      setPhoneSeconds(60);
    } else {
      setPhone((p) => ({
        ...p,
        errorMsg: deriveErrorMessage(response.error),
        showRuleMsg: "",
        btnLoader: false,
      }));
    }
  }, [phone.requestType, maskedNumber]);

  const verifyPhoneOtp = useCallback(async () => {
    if (!phone.code) {
      setPhone((p) => ({
        ...p,
        errorMsg: "Please enter phone verification code",
        verified: false,
        btnLoader: false,
      }));
      return;
    }
    if (phone.code.toString().length === 6) {
      setPhone((p) => ({ ...p, errorMsg: "", showRuleMsg: "", btnLoader: true }));
      let response = await getVerification(phone.code);
      if (response === "SuccessFully") {
        setPhone((p) => ({
          ...p,
          errorMsg: "",
          verified: true,
          btnName: "verified",
          btnLoader: false,
          showRuleMsg: "",
        }));
        updateverifyObj(true, "isPhoneVerification");
      } else {
        setPhone((p) => ({
          ...p,
          showRuleMsg: " ",
          errorMsg: "Invalid phone verification code",
          verified: false,
          btnLoader: false,
        }));
        updateverifyObj(false, "isPhoneVerification");
      }
    } else {
      setPhone((p) => ({
        ...p,
        errorMsg: "Invalid phone verification code",
        verified: false,
        btnLoader: false,
      }));
    }
  }, [phone.code]);

  const handlephoneinputChange = useCallback(
    (e) => {
      const value = e?.target?.value;
      setPhone((p) => ({ ...p, errorMsg: "", code: value }));
      const isValid = phoneNoRegexOtp.test(value);
      setIsPhoneCodeValid(isValid);
      
      // Prevent button name change if already verified
      if (phone.verified) return;

      if (isValid) {
        setPhone((p) => ({ ...p, btnName: "verifyOtpBtn" }));
      } else if (phoneSeconds <= 0 && value.length === 0) {
        setPhone((p) => ({ ...p, btnName: "resendotp" }));
      } else if (value.length < 6 && phone.btnName !== "get_otp" && phone.btnName !== "verified") {
        setPhone((p) => ({ ...p, btnName: "code_Sent" }));
      }
    },
    [phoneSeconds, phone.btnName, phone.verified]
  );

  const verifyAuthenticatorOTP = useCallback(async () => {
    if (!authenticator.code) {
      return setAuthenticator((a) => ({
        ...a,
        errorMsg: "Please enter authenticator code",
        verified: false,
        btnLoader: false,
      }));
    }
    if (authenticator.code.toString().length === 6) {
      setAuthenticator((a) => ({
        ...a,
        errorMsg: "",
        verified: false,
        btnLoader: true,
      }));
      let response = await getAuthenticator(authenticator.code);
      if (response.data && !response.error) {
        setAuthenticator((a) => ({
          ...a,
          errorMsg: "",
          verified: true,
          btnName: "verified",
          btnLoader: false,
          showRuleMsg: "",
        }));
        updateverifyObj(true, "isAuthenticatorVerification");
      } else {
        setAuthenticator((a) => ({
          ...a,
          errorMsg: "Invalid authenticator verification code",
          verified: false,
          btnLoader: false,
        }));
      }
    } else {
      setAuthenticator((a) => ({
        ...a,
        errorMsg: "Invalid authenticator verification code",
        verified: false,
        btnLoader: false,
      }));
    }
  }, [authenticator.code]);

  // ✨ UPDATED: handleAuthenticatorinputChange to include validation
  const handleAuthenticatorinputChange = useCallback((e) => {
    const value = e.target.value;
    const isValid = phoneNoRegexOtp.test(value);

    setAuthenticator((a) => ({ ...a, code: value, errorMsg: "" }));
    setIsAuthenticatorCodeValid(isValid);

    // This logic ensures the button is "verifyOtpBtn" when the code is valid/being entered.
    if (authenticator.btnName !== "verified") {
        setAuthenticator((a) => ({ ...a, btnName: "verifyOtpBtn" }));
    }
  }, [authenticator.btnName]);

  const updateverifyObj = (val, name) => {
    if (name === "isEmailVerification") {
      setVerifyData((prevVerifyData) => ({
        ...prevVerifyData,
        isEmailVerification: val,
      }));
    } else if (name === "isPhoneVerification") {
      setVerifyData((prevVerifyData) => ({
        ...prevVerifyData,
        isPhoneVerified: val,
      }));
    } else if (name === "isAuthenticatorVerification") {
      setVerifyData((prevVerifyData) => ({
        ...prevVerifyData,
        isTwoFactorEnabled: val,
      }));
    }
  };

  const phone_btnList = {
    get_otp: (
      <Button
        type="text"
        loading={phone.btnLoader}
        className="mx-auto"
        onClick={getphoneOTP}
      >
        <h4 className="pl-0 ml-0 text-sm font-normal text-primaryColor mx-auto cursor-pointer">
          {t("vault.vaultscrypto.getcode")}
        </h4>
      </Button>
    ),
    code_Sent: (
      <>
        <Button
          type="text"
          className="!w-auto lg:!max-w-[100%] !max-w-[160px] !p-0"
          disabled
        >
          <h4 className="pl-0 ml-0 lg:text-[13px] text-xs font-medium text-subTextColor !break-words !whitespace-normal !leading-4 cursor-not-allowed">
            <span>{t("vault.vaultscrypto.verificationcodesent")}</span>
            {phoneSeconds > 0 && (
              <span style={{ marginLeft: 8 }}>{`(${phoneSeconds}s)`}</span>
            )}
          </h4>
        </Button>
        <Tooltip
          title={`Haven't received code? Request new code in ${phoneSeconds} seconds.`}
        >
          <span className="icon md info ml-1.5  hidden md:block" />
        </Tooltip>
      </>
    ),
    resendotp: (
      <Button
        type="text"
        loading={phone.btnLoader}
        className="mx-auto"
        onClick={getphoneOTP}
      >
        <h4 className="text-sm font-medium text-primaryColor !break-words !whitespace-normal !leading-4 cursor-pointer">
          {t("vault.vaultscrypto.resendCode")}
        </h4>
      </Button>
    ),
    verified: (
      <Button
        type="text"
        className="bg-textGreen border border-textGreen w-[265px] h-[52px] rounded-r-5 rounded-l-none verifybg"
        disabled
      >
        <h4 className="pl-0 ml-0 text-sm font-medium text-textWhite cursor-pointer  verifytext">
          {t("vault.vaultscrypto.verified")}
        </h4>
        <span className="icon md success-arrow" />
      </Button>
    ),
    verifyOtpBtn: (
      <Button
        type="text"
        className="!w-auto lg:!max-w-[100%] !max-w-[105px] mx-auto"
        onClick={verifyPhoneOtp}
        loading={phone.btnLoader}
        disabled={!isPhoneCodeValid}
      >
        <h4 className="text-sm font-medium text-primaryColor !break-words !whitespace-normal !leading-4 cursor-pointer">
          {t("vault.vaultscrypto.clickheretoverify")}
        </h4>
      </Button>
    ),
  };

  const email_btnList = {
    get_otp: (
      <Button
        type="text"
        loading={email.btnLoader}
        className="mx-auto"
        onClick={sendEmailOTP}
      >
        <h4 className="text-sm font-medium text-primaryColor">
          {t("vault.vaultscrypto.getcode")}
        </h4>
      </Button>
    ),
    code_Sent: (
      <>
        <Button
          type="text"
          className="!w-auto lg:!max-w-[100%] !max-w-[150px]  !p-0"
          disabled
        >
          <h4 className="pl-0 ml-0 lg:text-[13px] text-xs font-medium text-lightWhite !break-words !whitespace-normal !leading-4 cursor-not-allowed">
            <span>{t("vault.vaultscrypto.verificationcodesent")}</span>
            {emailSeconds > 0 && (
              <span style={{ marginLeft: 8 }}>{`(${emailSeconds}s)`}</span>
            )}
          </h4>
        </Button>
        <Tooltip
          placement="topRight"
          title={`Haven't received code? Request new code in ${emailSeconds} seconds.`}
        >
          <span className="icon md info ml-1.5 hidden md:block" />
        </Tooltip>
      </>
    ),
    resendotp: (
      <Button
        type="text"
        loading={email.btnLoader}
        className="mx-auto"
        onClick={sendEmailOTP}
      >
        <h4 className="text-sm font-medium text-primaryColor">
          {t("vault.vaultscrypto.resendCode")}
        </h4>
      </Button>
    ),
    verified: (
      <Button
        type="text"
        disabled
        className="bg-textGreen border border-textGreen w-[265px] h-[52px] rounded-r-5 rounded-l-none verifybg"
      >
        <h4 className="text-sm font-medium text-textWhite">
          {t("vault.vaultscrypto.verified")}
        </h4>
        <span className="icon md success-arrow" />
      </Button>
    ),
    verifyOtpBtn: (
      <Button
        type="text"
        onClick={verifyEmailOtp}
        className="!w-auto lg:!max-w-[100%] !max-w-[105px] mx-auto"
        loading={email.btnLoader}
        disabled={!isEmailCodeValid}
      >
        <h4 className="text-sm font-medium text-primaryColor !break-words !whitespace-normal !leading-4">
          {t("vault.vaultscrypto.clickheretoverify")}
        </h4>
      </Button>
    ),
  };

  const authenticator_btnList = {
    verified: (
      <Button
        type="text"
        disabled
        className="w-full bg-textGreen h-[52px] rounded-r-5 rounded-l-none"
      >
        <h4 className="text-sm font-medium text-textWhite">
          {t("vault.vaultscrypto.verified")}
        </h4>
        <span className="icon md success-arrow" />
      </Button>
    ),
    verifyOtpBtn: (
      // ✨ UPDATED: disabled prop added using isAuthenticatorCodeValid
      <Button
        type="text"
        onClick={verifyAuthenticatorOTP}
        className="mx-auto"
        loading={authenticator.btnLoader}
        disabled={!isAuthenticatorCodeValid}
      >
        <h4 className="text-sm font-medium text-primaryColor !break-words !whitespace-normal !leading-4 cursor-pointer">
          {t("vault.vaultscrypto.clickheretoverify")}
        </h4>
      </Button>
    ),
  };

  if (isLoading) {
    return (
        <div className="mt-4">
            <Text>Loading verifications...</Text>
        </div>
    );
  }

  return (
    <div className="mt-4">
      {errorMsg && (
        <div className="alert-flex">
          <Alert
            showIcon
            type="error"
            description={errorMsg}
            closable={false}
            className="w-100"
            icon={icon}
          />
          <span className="icon sm alert-close" onClick={() => setErrorMsg(false)} />
        </div>
      )}
      {verifyData.isPhoneVerified === true && (
        <Form.Item
          name="phoneCode"
          className="basicinfo-form relative mb-2"
          label={t("vault.vaultscrypto.phoneCode")}
          colon={false}
          extra={
            <div className="relative text-right">
              <Text className="text-sm text-labelGrey">{phone.showRuleMsg}</Text>
              <Text className="text-sm !text-textLightRed" style={{ float: "left" }}>
                {phone.errorMsg}
              </Text>
            </div>
          }
          rules={[
            { required: true, message: "" },
            validations.whitespaceValidator("phone code"),
            validations.regexValidator("phone code", phoneNoRegexOtp, false),
          ]}
        >
          <div className="basicinfo-form panel-form-items-bg relative !bg-inputBg rounded-5">
            <Input
              placeholder={t("vault.vaultscrypto.entercode")}
              maxLength={6}
              disabled={phone.btnName === "get_otp" || phone.btnName === "verified"}
              onChange={handlephoneinputChange}
              value={phone.code} 
              className="custom-input-field outline-0 disabled:!bg-inputDisabled disabled:!border disabled:!border-inputDisabled disabled:cursor-not-allowed disabled:!text-lightWhite disabled:hover:!bg-inputDisabled"
            />
            <div className="border border-primaryColor text-subTextColor rounded-r-5 absolute bottom-0 right-0 h-[52px] flex items-center lg:w-[244px] w-[128px] justify-center !bg-transparent cursor-pointer z-[1000]">
              {phone_btnList[phone.btnName]}
            </div>
          </div>
        </Form.Item>
      )}
      {verifyData.isEmailVerification === true && (
        <Form.Item
          name="emailCode"
          className="basicinfo-form panel-form-items-bg relative mb-2"
          colon={false}
          label={t("vault.vaultscrypto.emailVerificationCode")}
          extra={
            <div className="relative text-right">
              <Text className="text-sm text-labelGrey">{email.showRuleMsg}</Text>
              <Text className="text-sm !text-textLightRed" style={{ float: "left" }}>
                {email.errorMsg}
              </Text>
            </div>
          }
          rules={[
            { required: true, message: "" },
            validations.whitespaceValidator("email code"),
            validations.regexValidator("email code", phoneNoRegexOtp, false),
          ]}
        >
          <div className="basicinfo-form panel-form-items-bg relative">
            <Input
              type="text"
              placeholder={t("vault.vaultscrypto.entercode")}
              maxLength={6}
              disabled={email.btnName === "get_otp" || email.btnName === "verified"}
              onChange={handleEmailinputChange}
              value={email.code} 
              className="custom-input-field outline-0 disabled:!bg-inputDisabled disabled:cursor-not-allowed disabled:!text-lightWhite disabled:hover:!bg-inputDisabled"
            />
            <div className="border border-primaryColor text-subTextColor rounded-r-5 absolute bottom-0 right-0 h-[52px] flex items-center lg:w-[244px] w-[128px] justify-center !bg-transparent cursor-pointer z-[1000]">
              {email_btnList[email.btnName]}
            </div>
          </div>
        </Form.Item>
      )}
      {verifyData.isTwoFactorEnabled === true && (
        <Form.Item
          name="authenticatorCode"
          colon={false}
          label={t("vault.vaultscrypto.authenticatorCode")}
          className="basicinfo-form panel-form-items-bg relative mb-2"
          extra={
            <div className="relative text-right">
              <Text className="text-sm text-labelGrey">
                {authenticator.showRuleMsg}
              </Text>
              <Text className="text-sm !text-textLightRed" style={{ float: "left" }}>
                {authenticator.errorMsg}
              </Text>
            </div>
          }
          rules={[
            { required: true, message: "" },
            validations.whitespaceValidator("authentication code"),
            validations.regexValidator(
              "authentication code",
              phoneNoRegexOtp,
              false
            ),
          ]}
        >
          <div className="basicinfo-form panel-form-items-bg relative authenticator-btn">
            <Input
              type="text"
              placeholder={t("vault.vaultscrypto.entercode")}
              maxLength={6}
              disabled={
                authenticator.btnName === "get_otp" ||
                authenticator.btnName === "verified"
              }
              onChange={handleAuthenticatorinputChange}
              value={authenticator.code} // This was already correct
              className="custom-input-field outline-0 disabled:!bg-inputDisabled disabled:cursor-not-allowed disabled:hover:!bg-inputDisabled disabled:!text-lightWhite"
            />
            <div
              className={`!bg-transparent border border-primaryColor text-subTextColor py-2 rounded-r-5 absolute bottom-0 right-0 !h-[52px] flex items-center lg:w-[244px] w-[128px] justify-center z-[1000] ${authenticator.btnName === "verifyOtpBtn" && isAuthenticatorCodeValid
                  ? "cursor-pointer"
                  : "cursor-not-allowed"
                }`}
              onClick={() => {
                if (authenticator.btnName === "verifyOtpBtn" && isAuthenticatorCodeValid) {
                  verifyAuthenticatorOTP();
                }
              }}
            >
              {authenticator_btnList[authenticator.btnName]}
            </div>
          </div>
        </Form.Item>
      )}
    </div>
  );
};

const connectStateToProps = ({ userConfig }) => ({
  userConfig: userConfig.details,
});
const connectDispatchToProps = (dispatch) => ({ dispatch });

export default connect(connectStateToProps, connectDispatchToProps)(Verifications);