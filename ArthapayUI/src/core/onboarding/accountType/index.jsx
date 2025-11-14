import { useCallback, useEffect, useMemo, useState } from "react";
import { Form, Radio, Input } from "antd";
import Business from "./business";
import Personal from "./personal";
import { useSelector } from "react-redux";
import {
  getAccountSectionData,
  saveCustomerAccountType,
  validateReferral,
} from "../http.services";
import CustomButton from "../../button/button";
import { VALIDATION_MESSAGES } from "./services";
import Address from "./address";
import { replaceExtraSpaces } from "../../../utils/validations";
import AppAlert from "../../shared/appAlert";
import AccountTypeLoader from "../../skeleton/registration.loaders/account.type.loader";
import { genderLookup } from "../../../utils/app.config";
import AppModal from "../../shared/appModal";
import Agreement from "./agreement";
import PrivacyPolicy from "./privacypolicy";
import { decryptAES } from "../../shared/encrypt.decrypt";
import RegistrationSubmitted from "./registration_Submitted";
const getTowns = (countries, country) => {
  return countries?.find((item) => item?.name === country)?.towns || [];
};
const clientName = window.runtimeConfig.VITE_CLIENT_NAME
const AccountType = ({ handleSubmitted }) => {
  const [form] = Form.useForm();
  const [lookups, setLookups] = useState({
    countries: [],
    towns: [],
    genders: genderLookup,
  });
  const [accountType, setAccountType] = useState("");
  const [referralData, setReferralData] = useState({
    verified: false,
    error: "",
  });
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const [modal, setModal] = useState("");
  const [decryptedReferral, setDecryptedReferral] = useState("");
  const [showRegistrationSubmitted, setShowRegistrationSubmitted] = useState(false);
  const metadata = useSelector(state => state.userConfig.metadata)
  const userProfile = useSelector((store) => store.userConfig.details);
  const chosenAccountType = metadata?.chooseAccount?.toLowerCase();
  useEffect(() => {
    if (chosenAccountType === "personal") {
      setAccountType("Personal");
    } else if (chosenAccountType === "business") {
      setAccountType("Business");
    }
  }, [chosenAccountType]);
  const userProfileLoading = useSelector(
    (store) => store.userConfig.userProfileLoading
  );
  const isReferralRequired = useMemo(() => {
    return metadata?.IsReferralRequiredOrNot === true ? metadata?.IsReferralMandatory === true : false;
  }, [metadata?.IsReferralRequiredOrNot, metadata?.IsReferralMandatory]);
  useEffect(() => {
    if (userProfile?.id) {
      setDetails();
      getDetails();
    }
  }, [userProfile?.id]);
  const setDetails = () => {
    const {
      id,
      isEmployee,
      firstName,
      lastName,
      businessReferralCode,
      referralFullName,
      phoneNo,
    } = userProfile;
    if (!id || !isEmployee) {
      return;
    }
    setAccountType("Employee");
    setReferralData({ verified: true, error: "" });
    form.setFieldsValue({
      firstName,
      lastName,
      referralCode: businessReferralCode,
      referral: referralFullName,
      phoneNo: phoneNo,
    });
  };
  const onDataSuccess = ([ipData, lookups]) => {
    setLookups((prev) => ({
      ...prev,
      countries: lookups?.Country,
      phoneCodes: lookups?.PhoneCodes,
    }));

    const fallbackCountry = null;
    const fallbackPhoneCode = null;

    const selectedCountry =
      userProfile?.country ||
      ipData?.country_name ||
      fallbackCountry;

    const selectedPhoneCode =
      userProfile?.phonecode ||
      (ipData?.location?.calling_code
        ? `+${ipData.location.calling_code}`
        : null) ||
      fallbackPhoneCode;

    const matchedPhone = lookups?.PhoneCodes?.find(
      pc => pc.code === selectedPhoneCode || pc.name === selectedPhoneCode
    );
    form.setFieldsValue({
      country: selectedCountry,
      phoneCode: matchedPhone ? `${matchedPhone.code}` : null,
    });
  };
  const onDataError = (message) => {
    setError(message);
  };

  const getDetails = async () => {
    setLoading("data");
    await getAccountSectionData(onDataSuccess, onDataError);
    setLoading("");
  };
  const onAccountTypeChange = useCallback(
    (payload, isEvent = true) => {
      let value = payload;
      if (isEvent) {
        value = payload.target.value;
      }
      if (userProfile?.isEmployee === true) {
        return;
      }
      setError("");
      if (value === "Business" || accountType === "Business") {
        form.resetFields([
          "firstName",
          "lastName",
          "businessName",
          "incorporationDate",
          "gender",
          //"phoneNo",
          "state",
          "town",
          "city",
          "addressLine1",
          // "phoneCode",
          // "country",
        ]);
      }
      form.resetFields(["isAccepted"]);
      setAccountType(value);
    },
    [form, userProfile, accountType]
  );
  const onSuccess = () => {
    setShowRegistrationSubmitted(true);
    handleSubmitted(false);
  };
  const handleSubmit = useCallback(async () => {
    if (!accountType) {
      setError(VALIDATION_MESSAGES.ACCOUNT_TYPE);
      setLoading("");
      return;
    }
    const values = form.getFieldsValue(true);
    try {
      await saveCustomerAccountType(onSuccess, setError, {
        values,
        userProfile,
        accountType,
        referralData
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading("");
    }
  }, [accountType, userProfile, form, referralData]);

  // Use a separate function to set fields to ensure they are available
  const setReferralFields = useCallback((response) => {
    const { name, firstName, lastName, type, id, phoneCode, phoneNo } = response;

    const fieldsToUpdate = {};
    let referralName = "";

    if (firstName) fieldsToUpdate.firstName = decryptAES(firstName);
    if (lastName) fieldsToUpdate.lastName = decryptAES(lastName);
    if (phoneCode) {
      const decryptedPhoneCode = decryptAES(phoneCode);
      fieldsToUpdate.phoneCode = decryptedPhoneCode.startsWith('+') ? decryptedPhoneCode : `+${decryptedPhoneCode}`;
    }
    if (phoneNo) fieldsToUpdate.phoneNo = decryptAES(phoneNo);
    if (name) {
      referralName = decryptAES(name);
      fieldsToUpdate.referral = referralName;
    }

    form.setFieldsValue(fieldsToUpdate);
    setDecryptedReferral(referralName); // <-- set this in state
  }, [form]);

  const onReferralValidateSuccess = (response) => {
    const { type, id } = response;
    setReferralData({ verified: true, error: "", type, id });
    if (type === "Employee") {
      onAccountTypeChange("Employee", false);
    } else if (accountType === "Employee") {
      onAccountTypeChange("Personal", false);
    }
    setTimeout(() => {
      setReferralFields(response);
    }, 0);
    setLoading("");
    form.setFieldValue("referralCode", form.getFieldValue("referralCode").toUpperCase());
  };
  const onReferralValidateError = (message) => {
    setLoading("");
    setReferralData({
      verified: false,
      error: message,
    });
  };
  const handleReferralValidation = useCallback(
    async (e) => {
      e?.preventDefault();
      const referralCode = form.getFieldValue("referralCode");
      if (!referralCode) {
        setReferralData({ verified: false, error: isReferralRequired ? VALIDATION_MESSAGES.REQUIRED : "" });
        return;
      }
      setLoading("verifyRef");
      await validateReferral(
        onReferralValidateSuccess,
        onReferralValidateError,
        {
          referralCode
        }
      );
    },
    [form, userProfile, isReferralRequired]
  );
  const setField = useCallback(
    (event, isInputEvent = true) => {
      error && setError("");
      const {
        name: fieldName,
        value,
        checked,
      } = isInputEvent ? event.target : event;
      if (fieldName === "isAccepted") {
        form.setFieldValue(fieldName, checked);
        return;
      }
      if (fieldName === "referralCode" && userProfile?.isEmployee) {
        return;
      }
      const valueToSet =
        event.type === "blur" && value ? replaceExtraSpaces(value) : value;
      if (fieldName === "referralCode" && event.type !== "blur") {
        setReferralData({ verified: false, error: "" });
        accountType === "Employee" && setAccountType("Personal");
        //form.resetFields(["firstName", "lastName", "phoneNo", "phoneCode"]);
      } else if (fieldName === "country") {
        setLookups((prev) => ({
          ...prev,
          towns: getTowns(lookups.countries, valueToSet),
        }));
      } else if (
        (fieldName === "phoneNo" || fieldName === 'phoneCode') &&
        event.type === "blur"
      ) {
        form.validateFields(["phoneNo", "phoneCode"]);
      }
      form.setFieldValue(fieldName, valueToSet);
    },
    [userProfile, form, accountType]
  );

  const validateFields = useCallback(
    async (e) => {
      e?.preventDefault();
      setLoading("save");
      const values = form.getFieldsValue(true);
      try {
        await form.validateFields();
        if (!values.referralCode && isReferralRequired) {
          setReferralData({
            verified: false,
            error: VALIDATION_MESSAGES.REQUIRED,
          });
          setLoading("");
          return;
        }
        if (values.referralCode && !referralData.verified) {
          setReferralData({
            verified: false,
            error: VALIDATION_MESSAGES.REFERRAL_CODE,
          });
          setLoading("");
          return;
        }
        form.submit();
      } catch (error) {
        if (values.referralCode && !referralData.verified) {
          setReferralData({
            verified: false,
            error: VALIDATION_MESSAGES.REFERRAL_CODE,
          });
        }
        setLoading("");
      }
    },
    [referralData, form]
  );
  const clearError = useCallback(() => {
    setError("");
  }, []);

  const handleModalOpen = useCallback((e) => {
    e.preventDefault();
    setModal(e.currentTarget.name);
  }, []);
  const handleModalClose = useCallback((e) => {
    e.preventDefault();
    setModal("");
  }, []);
  if (showRegistrationSubmitted) {
    return <RegistrationSubmitted />;
  }
  return (
    <Form onFinish={handleSubmit} form={form}>
      <div className="">
        {error && (
          <div className="">
            <div className="alert-flex withdraw-alert fiat-alert">
              <AppAlert
                type="error"
                description={error}
                onClose={clearError}
                showIcon
                closable
              />
            </div>
          </div>
        )}
       {metadata?.IsReferralRequiredOrNot === true && <div className="mt-4 mb-8 grid md:grid-cols-2 lg:grid-cols-2 gap-3.5">
          <div className="relative">
            <Form.Item
              className="mb-0"
              name="referralCode"
              label="Referral Code"
              colon={false}
              validateTrigger={false}
              required={isReferralRequired}
              rules={[
                {
                  required: isReferralRequired,
                  message: VALIDATION_MESSAGES.REQUIRED,
                },
              ]}
              validateStatus={referralData?.error ? "error" : undefined}
              help={referralData?.error || undefined}
            >
              <Input
                className="custom-input-field outline-0 !focus-within:bg-transparent !focus:bg-transparent"
                maxLength={15}
                name="referralCode"
                placeholder="Enter Referral Code"
                onChange={setField}
                onBlur={setField}
                disabled={userProfile.isEmployee}
              />
            </Form.Item>
            {referralData.verified === true && (
              <p className="text-s font-normal absolute left-[-4px] bottom-[-10] flex gap-1">
                <span className="icon lg greencheck greencheck-small !static"></span>
                <span className="text-textGreen">
                  {/* {form.getFieldValue("referral")} */}
                  {decryptedReferral}
                </span>
              </p>
            )}
          </div>
          {!userProfile?.isEmployee && (
            <div>
              <CustomButton
                className="h-[52px] max-h-[52px]"
                type="primary"
                onClick={handleReferralValidation}
                loading={loading === "verifyRef"}
                disabled={
                  loading === "verifyRef" || !form.getFieldValue("referralCode") || referralData.verified
                }
              >
                {" "}
                Verify
              </CustomButton>
            </div>
          )}
        </div>}
        {loading === "data" && <AccountTypeLoader />}
        {loading !== "data" && (
          <>
            {(chosenAccountType == "both" || chosenAccountType == null) && <div>
              <Radio.Group
                onChange={onAccountTypeChange}
                value={accountType}
                disabled={userProfile?.isEmployee === true}
                className={`mb-6 grid lg:grid-cols-2  gap-6 account-typeradio ${userProfile?.isEmployee === true ||
                  referralData?.type === "Employee"
                  ? "xl:grid-cols-3"
                  : "xl:grid-cols-2"
                  }`}
              >
                {(userProfile?.isEmployee === true ||
                  referralData?.type === "Employee") && (
                    <Radio
                      value="Employee"
                      className="border border-inputDarkBorder rounded-5 bg-inputDarkBorder mb-3.5 md:mb-0 mr-0 p-3.5 w-full !flex !gap-4"
                    >
                      <h5 className="text-xl font-semibold text-lightWhite">
                        Employee
                      </h5>
                      <p className="text-textGrey text-sm font-normal">
                        For corporate users.{" "}
                      </p>
                    </Radio>
                  )}
                <Radio
                  value="Personal"
                  disabled={userProfile?.isEmployee === true || referralData?.type === "Employee"}
                  className={`rounded-5 bg-inputBg !flex !gap-4 mb-3.5 md:mb-0 mr-2 p-3.5 w-full  ${userProfile?.isEmployee === true
                    ? "dark:opacity-70 opacity-45"
                    : ""
                    }`}
                >
                  <h5
                    className={`text-xl font-semibold ${userProfile?.isEmployee === true || referralData?.type === "Employee"
                      ? "text-tabcolor"
                      : "text-lightWhite"
                      }`}
                  >
                    Personal
                  </h5>
                  <p
                    className={`md:text-xs lg:text-xs xl:text-sm font-normal ${userProfile?.isEmployee === true || referralData?.type === "Employee"
                      ? "text-tabcolor"
                      : "text-textGrey"
                      }`}
                  >
                    Full access to crypto and fiat : trade, manage wallets, deposit/withdraw, make secure payments, and use physical or virtual cards.{" "}
                  </p>
                </Radio>
                <Radio
                  value="Business"
                  disabled={userProfile?.isEmployee === true || referralData?.type === "Employee"}
                  className={`bg-inputBg rounded-5 !flex !gap-4 mb-3.5 md:mb-0 mr-2 p-3.5 w-full ${userProfile?.isEmployee === true
                    ? "dark:opacity-70 opacity-45"
                    : ""
                    }`}
                >
                  <h5
                    className={`text-xl font-semibold ${userProfile?.isEmployee === true || referralData?.type === "Employee"
                      ? "text-tabcolor"
                      : "text-lightWhite"
                      }`}
                  >
                    Business
                  </h5>
                  <p
                    className={`text-sm font-normal ${userProfile?.isEmployee === true || referralData?.type === "Employee"
                      ? "text-tabcolor"
                      : "text-textGrey"
                      }`}
                  >
                    Accept crypto and fiat : open wallets, process payments, issue corporate cards, and manage trading, deposits, and withdrawals.
                  </p>
                </Radio>
              </Radio.Group>
            </div>}
            {chosenAccountType === "personal" && <div>
              <h2 className="text-2xl font-semibold text-lightWhite capitalize text-left">
                Personal Details
              </h2>
            </div>}
            {chosenAccountType === "business" && <div>
              <h2 className="text-2xl font-semibold text-lightWhite capitalize text-left">
                Company Details
              </h2>
            </div>}
            {accountType && (
              <div className="">
                <div>
                  <div className="">
                    {accountType === "Business" && (
                      <Business
                        FormInstance={Form}
                        form={form}
                        setField={setField}
                        lookups={lookups}
                      />
                    )}
                    {(accountType === "Personal" ||
                      accountType === "Employee") && (
                        <Personal
                          FormInstance={Form}
                          form={form}
                          setField={setField}
                          lookups={lookups}
                        />
                      )}
                  </div>
                  {metadata?.IsAddressRequiredWhileSignup === true && (
                    <div className="mt-4">
                      <h1 className="text-l font-semibold text-lightWhite">
                        Address
                      </h1>
                      <Address
                        FormInstance={Form}
                        form={form}
                        setField={setField}
                        lookups={lookups}
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-[10px] mb-3 mt-5 relative">
                    <Form.Item
                      name="isAccepted"
                      className={"mb-0 check-error"}
                      valuePropName="checked"
                      rules={[
                        {
                          validator() {
                            const value = form.getFieldValue("isAccepted");
                            if (!value || value !== true) {
                              return Promise.reject(
                                new Error(
                                  VALIDATION_MESSAGES.TERMS_AND_CONDITIONS
                                )
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <label className="custom-checkbox c-pointer cust-check-outline">
                        <Input
                          name="isAccepted"
                          type="checkbox"
                          className="c-pointer"
                          onChange={setField}
                        />
                        <span></span>
                      </label>
                    </Form.Item>
                    {
                      <span className="text-sm font-normal text-descriptionGreyTwo">
                        By clicking submit, I here by acknowledge that i agree
                        to {clientName} Terms of use{" "}
                        <button
                          type="button"
                          name="agreement"
                          className="text-primaryColor hover:text-primaryColor"
                          onClick={handleModalOpen}
                        >
                          Agreement
                        </button>{" "}
                        and I've read the{" "}
                        <button
                          name="privacy"
                          type="button"
                          onClick={handleModalOpen}
                          className="text-primaryColor hover:text-primaryColor"
                        >
                          Privacy Policy
                        </button>
                        <span>.</span>
                      </span>
                    }
                  </div>
                  <div className="view-level-btn text-right cust-auth-btn">
                    <CustomButton
                      loading={loading === "save" || userProfileLoading}
                      type="primary"
                      onClick={validateFields}
                      disabled={loading === "save" || userProfileLoading}
                    >
                      Continue
                    </CustomButton>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <AppModal
        className="md:!w-[80%]"
        title={
          modal === "privacy" ? (
            <h1 className="text-xl font-semibold mb-4">PRIVACY POLICY</h1>
          ) : (
            <h1 className="text-xl font-semibold mb-4">USER AGREEMENT</h1>
          )
        }
        isOpen={modal !== ""}
        onClose={handleModalClose}
        closeIcon={<AppModal.CloseIcon onClose={handleModalClose} />}
        footer={
          <AppModal.Footer
            showOk={false}
            onCancel={handleModalClose}
            cancelText="Close"
          />
        }
      >
        {modal === "agreement" && <Agreement accountType={accountType} />}
        {modal === "privacy" && <PrivacyPolicy accountType={accountType} />}
      </AppModal>
    </Form>
  );
};
export default AccountType;
