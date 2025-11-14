import React, { useCallback, useEffect, useState } from "react";
import { Alert, Switch } from "antd";
import { connect, useDispatch } from "react-redux";
import { withdrawVerifyObj } from "../../../reducers/profile.reducer";
import PropTypes from "prop-types";
import CustomButton from "../../button/button";
import SecurityLoader from "../../skeleton/manage.account/security.loader";
import { successToaster } from "../../shared/toasters";
import {
  resetPasswordSave,
  saveVerification,
  verificationsFields,
} from "../http.services";
import CommonDrawer from "../../shared/drawer";
import ConfirmResetPassword from "./confirmResetPassword";
import Enable2FA from "./enable2FA";
import PhoneVerifications from "./phoneVerifications";
import { useOutletContext } from "react-router";
import { deriveErrorMessage } from "../../shared/deriveErrorMessage";
import { fetchVerifications } from "../../../reducers/userconfig.reducer";
import { decryptAES } from "../../shared/encrypt.decrypt";
const Security = ({ userConfig, props }) => {

  const [isChangepassword, setIsChangepassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const useDivRef = React.useRef(null);
  const [phone, setPhone] = useState(false)
  const [email, setEmail] = useState(false)
  const [mfa, setMfa] = useState(false)
  const [live, setLive] = useState(false)
  const [factor, setFactor] = useState(false)
  const [loader, setLoader] = useState(true)
  const [btnLoader, setBtnLoader] = useState(false)
  const [isViewDrawer, setISViewDrawer] = useState(false)
  const [isViewDrawerPassword, setISViewDrawerPassword] = useState(false)
  const [isFactorDrawer, setIsFactorDrawer] = useState(false)
  const [isPhoneVerification, setIsPhoneVerification] = useState(false)
  const [resetError, setResetError] = useState(null)
  const { baseBreadCrumb, setBreadCrumb } = useOutletContext();
  const dispatch = useDispatch();
  useEffect(() => {
    getDetails()
    setBreadCrumb([
      ...baseBreadCrumb,
      { id: "3", title: "Security" },
    ]);
  }, [])
  const setVerificationFields = (res) => {
    if (res) {
      setErrorMsg(null);
      setPhone(res.isPhoneVerified);
      setEmail(res.isEmailVerification)
      setLive(res.isLiveVerification);
      setFactor(res.isTwoFactorEnabled);
      setMfa(res.isMfaEnabled)
    }
    else {
      setLoader(false)
      setErrorMsg(deriveErrorMessage(res));
    }
  }
  const getDetails = async () => {

    await verificationsFields(setLoader, setErrorMsg, setVerificationFields)
  }
  const setResetPassword = (success) => {
    if (success) {
      setIsChangepassword(true);
      setResetError(null);
      setISViewDrawerPassword(false);
    } else {
      setIsChangepassword(false);
      setIsResetPassword(false);
      setResetError("Failed to reset password. Please try again.");
    }
  };
  const showEmailMessage = useCallback(async () => {
    setIsChangepassword(false);
    resetPasswordSave(setIsResetPassword, setResetPassword, setResetError)
  }, []);
  const setInputChange = (e, type) => {
    setErrorMsg(null)
    if (type === "phone") {
      setPhone(e)
    } else if (type === "email") {
      setEmail(e)
    } else if (type === "mfa") {
      setMfa(e)
    }else if (type === "factor") {
      setFactor(e);
      if (e) {
        handleFactorDrawer(true, "Factor");
      } else {
        handleFactorDrawer(true, "Phone Verification");
      }
    }
    else if (type === "live") {
      setLive(!!e.target.checked)
    }
  }
  const handleInputChange = useCallback((field) => (e) => {
    setInputChange(e, field)
  }, [])
  const setSaveDetails = (obj) => {
    successToaster({ content: "Security details updated successfully.", className: "custom-msg", duration: 3 })
    withdrawVerifyObj(obj);
    dispatch(fetchVerifications())
    setErrorMsg(null);
    getDetails()
  }

  const saveDetails = useCallback(async () => {
    setBtnLoader(true);
    setErrorMsg(null);
    const verificationOptions = [live, email, phone, factor, mfa];
    const selectedOptionsCount = verificationOptions.filter(option => option).length;
    if (selectedOptionsCount === 0) {
      useDivRef.current.scrollIntoView(0, 0);
      setErrorMsg("Please select at least one of the verification option");
      setBtnLoader(false)
      return;
    }
    let obj = {
      customerId: userConfig.id,
      isEmailVerification: email || false,
      isPhoneVerified: phone || false,
      isTwoFactorEnabled: factor || false,
      isLiveVerification: live || false,
      isMfaEnabled: mfa || false,
    };
    await saveVerification(obj, setBtnLoader, setSaveDetails, setErrorMsg)
  }, [live, email, phone, factor,mfa,userConfig]);
  const handleView = useCallback(() => {
    setISViewDrawerPassword(true)
  }, [])
  const isClosePasswordDrawer = useCallback(() => {
    setISViewDrawerPassword(false)
    setErrorMsg(null)
    setResetError(null)

  }, [])
  const handleFactorDrawer = useCallback((drawer, screen) => {
    setISViewDrawer(drawer);
    if (screen === "Phone Verification") {
      setIsPhoneVerification(true);
      setIsFactorDrawer(false);
    } else if (screen === "Factor") {
      setIsFactorDrawer(true);
      setIsPhoneVerification(false);
    }
  }, []);
  const isCloseFactorDrawer = useCallback(async (data, factor) => {
    setISViewDrawer(data);
    if (!factor) {
      getDetails();
    }
    setFactor(!factor)
    await saveDetails();
  }, [factor, getDetails, saveDetails]);

  const closeError = useCallback(() => {
    setErrorMsg(null)
  }, [])
  const phoneVerificationDrawerClose = useCallback(() => {
    setISViewDrawer(false);
    setFactor(false);
    if (isPhoneVerification) {
      getDetails();
    }
  }, [isPhoneVerification])

  const handleGoogleAuthenticator = useCallback(async () => {
    setISViewDrawer(false);
    setFactor(!factor)
    await saveDetails();
    await getDetails();
  }, [isViewDrawer, factor]);

  return (
    <><div ref={useDivRef}></div>
      {loader && <div className=""><SecurityLoader /></div>}
      {!loader && <>	{errorMsg !== null && (<div className="alert-flex !w-auto mb-24 !mx-3">
        <Alert
          className="mb-3 security-error"
          closable
          type="error"
          description={errorMsg}
          onClose={closeError}
          showIcon
        />
      </div>)}
        <div className="kpicardbg h-full">
          <div className="mb-8 grid md:grid-cols-2 gap-3">
            <div className="">
              <h4
                className="text-2xl text-titleColor font-semibold mb-0.5"
              >Change Password</h4>
              <p
                className="text-paraColor font-medium text-base mb-3"
              >Choose a unique password to protect your account.</p>
              <div>
                <CustomButton
                  type="primary"
                  onClick={handleView}
                >
                  Reset Password
                </CustomButton>
              </div>
              {isChangepassword && <div className="reset-paswrd-mt mt-2.5">
                <h4
                  className="text-2xl text-titleColor font-semibold mb-0.5"
                > Check Your Email</h4>
                <p className="title-desc text-lightWhite capitalize">
                  Email send successfully to : <b className="font-semibold text-primaryColor cursor-pointer">{userConfig?.email}</b></p><p className="title-desc text-lightWhite capitalize"> please check your inbox to reset your password.</p>
              </div>
              }
            </div>
            <div className="">
              <h4
                className="text-2xl text-titleColor font-semibold mb-0.5"
              >Security</h4>
              <p
                className="text-paraColor font-medium text-base mb-3"
              >Enable 2FA to add an extra layer of security to your account.</p>
              <Switch
                checked={factor}
                onChange={handleInputChange("factor")}
                className=""
              />
            </div>
          </div>
          {window.runtimeConfig.VITE_SEND_VERIFICATION_HIDE !== false && <div className="mb-8">
            <div className="">
              <h4
                className="text-2xl text-titleColor font-semibold mb-0.5"
              >Send Verification</h4>
              <p
                className="text-paraColor font-medium text-base mb-3"
              >Please select at least one of the verification options from below.</p>
              <div>
                <div className="grid md:grid-cols-2">
                  <div className="flex items-center mb-4">
                    <p
                      className="text-lightWhite font-medium text-base"
                    >Phone Verification</p>
                    <Switch
                      checked={phone}
                      onChange={handleInputChange("phone")}
                      className="!ml-2"
                    />
                  </div>
                  <div className="flex items-center mb-4">
                    <p
                      className="text-lightWhite font-medium text-base"
                    >Email Verification</p>
                    <Switch
                      checked={email}
                      onChange={handleInputChange("email")}
                      className="!ml-2"
                    />
                  </div>
                   {/* <div className="flex items-center mb-4">
                    <p
                      className="text-lightWhite font-medium text-base"
                    >MFA Verification</p>
                    <Switch
                      checked={mfa}
                      onChange={handleInputChange("mfa")}
                      className="!ml-2"
                    />
                  </div> */}
                </div>
                <div className="mt-9">
                  <CustomButton
                    type="primary"
                    className=""
                    loading={btnLoader}
                    onClick={saveDetails}>
                    Save
                  </CustomButton>
                </div>
              </div>
            </div>
          </div>
          }</div></>}
      {<CommonDrawer title={`Reset Password  `} isOpen={isViewDrawerPassword} onClose={isClosePasswordDrawer}   >
        {isViewDrawerPassword && <ConfirmResetPassword isCloseDrawer={isClosePasswordDrawer}  resetError={resetError} showEmailMessage={showEmailMessage} loading={isResetPassword}  setResetError={setResetError} />}
      </CommonDrawer>}
      <CommonDrawer
          title={!factor ? `Disable 2FA` : `Enable 2FA`}
          isOpen={isViewDrawer}
          onClose={phoneVerificationDrawerClose}
        >
          {isFactorDrawer && (
            <Enable2FA isCloseDrawer={isCloseFactorDrawer} factor={factor} />
          )}
          {isPhoneVerification && (
            <PhoneVerifications
              handleFactorDrawer={handleFactorDrawer}
              drawerClose={setISViewDrawer}
              factor={factor}
              onClose={phoneVerificationDrawerClose}
              handleGoogleAuthenticator={handleGoogleAuthenticator}
            />
          )}
        </CommonDrawer>
    </>
  );
};
const connectStateToProps = ({ userConfig, userProfile }) => {
  return { userConfig: userConfig.details, userProfile };
};
const connectDispatchToProps = (dispatch) => {
  return {
    fetchWithdrawVerifyObj: (obj) => {
      dispatch(withdrawVerifyObj(obj));
    },
    dispatch,
  };
};
Security.propTypes = {
  userConfig: PropTypes.shape({
    accountType: PropTypes.string,
    email: PropTypes.string,
    phoneNo: PropTypes.string,
    id: PropTypes.string,
  }),
};
export default connect(connectStateToProps, connectDispatchToProps)(Security);
