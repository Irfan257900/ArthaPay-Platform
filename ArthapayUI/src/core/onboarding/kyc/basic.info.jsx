import React, { useCallback, useEffect, useState, useMemo } from "react";
import StepProgress from "./step.progress";
import { Alert, Form, Input, Radio } from "antd";
import moment from "moment";
import {
  validateDOB,
  validations,
} from "../../shared/validations";
import { useLocation } from "react-router";
import { useSelector, useDispatch, connect } from "react-redux";
import CustomButton from "../../button/button";
import { kyckybTitles, openNotification } from "../services";
import { setCurrentKycState, setKycStatus } from "../../../reducers/userconfig.reducer";
import CompanyDataloader from "../../skeleton/kyb.loaders/companydata.loader";
import AddressComponenet from "../address.component";
import AppDatePicker from "../../shared/appDatePicker";
import { fetchKycBasicInformation, sendKYCInformation } from "../http.services";

const BasicInfo = (props) => {
  const useDivRef = React.useRef(null);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const userProfileInfo = useSelector((state) => state.userConfig.details);
  const {
    data: { countries, phoneCodes, states },
  } = useSelector((state) => state?.kycStore?.lookups);
  const [error, setError] = useState(null);
  const [btnLoader, setBtnLoader] = useState(false);
  const [loader, setLoader] = useState(false);
  const [details, setDetails] = useState(null);
  const location = useLocation();
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const actionFrom = useMemo(() => {
    const action = queryParams.get("actionFrom");
    return action && action !== "null" && action !== "undefined"
      ? action
      : "default";
  }, [queryParams]);
  useEffect(() => {
    if (userProfileInfo?.id || props?.hideWizard) {
      fetchKycDetails();
    }
  }, [userProfileInfo, props?.hideWizard]);
  const kycExcemptionObj = useSelector(
    (state) => state.kycStore.excemptionFields
  );
  const [hiddenFields, setHiddenFields] = useState([]);

  const isFieldHidden = useCallback((fieldName) => hiddenFields?.includes(fieldName), [hiddenFields]);

  useEffect(() => {
    if (kycExcemptionObj) {
      const step1Fields = kycExcemptionObj.step1?.split(",") || [];
      setHiddenFields(step1Fields);
    }
  }, [kycExcemptionObj]);
  const handleScrollTop = () => {
    useDivRef.current.scrollIntoView(0, 0);
  };
  const setData = useCallback((response) => {
    setDetails(response);
    const parseDate = (date) => {
      return date && moment(date).isValid() ? moment(date) : null;
    };
    const dob = parseDate(response.dob);
    form.setFieldsValue({
      firstName: response?.firstName || "",
      lastName: response?.lastName || "",
      gender: response?.gender || "",
      dob: dob,
      idIssuingCountry: response?.idIssuingCountry,
      docNumber: response?.docNumber || "",
      docExpireDate: parseDate(response.docExpireDate),
      addressFirstName: response?.addressDetails?.firstName,
      addressLastName: response?.addressDetails?.lastName,
      state: response?.addressDetails?.state,
      town: response?.addressDetails?.town,
      city: response?.addressDetails?.city,
      line1: response?.addressDetails?.line1,
      line2: response?.addressDetails?.line2,
      postalCode: response?.addressDetails?.postalCode,
      email: response?.addressDetails?.email,
      phoneNumber: response?.addressDetails?.phoneNumber,
      phoneCode:
        response?.addressDetails?.phoneCode ||
        `+${props?.trackauditlogs?.Location?.calling_code}`,
      country: response?.addressDetails?.country,
    });
  }, [form, props?.trackauditlogs]);
  const fetchKycDetails = useCallback(async () => {
    await fetchKycBasicInformation(setLoader, setData, setErrorState);
  }, [setData]);
  const onFieldChange = useCallback(
    (fieldName) => (e) => {
      let value = fieldName === "idIssuingCountry" ? e : e?.target?.value;
      if (fieldName === "dob") {
        value = e ? moment(e, "DD/MM/YYYY") : null;
        if (value) value = moment(value, "DD/MM/YYYY", true);
      }
      form.setFieldsValue({ [fieldName]: value });
    },
    [form]
  );
  const onGenderChange = useCallback((e) => {
    form.setFieldsValue({ gender: e.target.value });
  }, [form]);
  const steps = useMemo(() => [
    { number: 1, label: "Basic Information", isActive: true },
    { number: 2, label: "Identification Document", isActive: false },
    { number: 3, label: "Review", isActive: false },
  ], []);
  const onSuccess = useCallback((response) => {
    if (!props?.hideWizard) {
      openNotification("Personal details saved successfully");
      dispatch(setCurrentKycState(1));
      dispatch(setKycStatus("Draft"));
    } else {
      props?.onSuccessInfo(response);
    }
  }, [dispatch, props]);
  const onSubmit = useCallback(async () => {
    const rawValues = { ...form.getFieldsValue(true) };
    const values = Object.keys(rawValues).reduce((acc, key) => {
      acc[key] =
        typeof rawValues[key] === "string"
          ? rawValues[key]?.trim()
          : rawValues[key];
      return acc;
    }, {});
    await sendKYCInformation(setBtnLoader, onSuccess, setErrorState, {
      values,
      userProfileInfo,
      method: props?.hideWizard,
      details,
    });
  }, [form, userProfileInfo, props?.hideWizard, details, onSuccess]);
  const setErrorState = useCallback((error) => {
    handleScrollTop();
    setError(error);
  }, []);
  const clearErrorMessage = useCallback(() => {
    setError(null);
  }, []);
  return (
    <div className="kyc-basic-info">
      <div ref={useDivRef}></div>
      {loader && (
        <div className="">
          <CompanyDataloader />
        </div>
      )}
      <div
        className={` py-0  text-secondaryColor ${
          (!props?.hideWizard && "lg:px-2 md:px-6") || ""
        } `}
      >
        <div
          className={` h-full rounded-2xl kpicardbg ${
            (!props?.hideWizard && "lg:px-2 py-4 md:px-2") || ""
          }`}
        >
          <div className="basicinfo-form">
            {!props?.hideWizard && (
              <h1
                className={`text-lightWhite text-3xl font-semibold ${
                  (!props?.hideWizard && "text-center") || ""
                }`}
              >
                KYC
              </h1>
            )}
            {!props?.hideWizard && (
              <p
                className={`text-sm font-normal text-lightWhite mt-4 mb-7 ${
                  (!props?.hideWizard && "text-center") || ""
                }`}
              >
                {kyckybTitles[actionFrom]} our partners require some information
                from you
              </p>
            )}
            <div className="">
              <div className="w-full ">
                {!props?.hideWizard && <StepProgress steps={steps} />}
                {error !== null && (
                  <div className="alert-flex">
                    <Alert
                      type="error"
                      description={error}
                      onClose={clearErrorMessage}
                      showIcon
                      className="items-center"
                    />
                    <button
                      className="icon sm alert-close"
                      onClick={clearErrorMessage}
                    ></button>
                  </div>
                )}
                <Form
                  form={form}
                  onFinish={onSubmit}
                  autoComplete="off"
                  scrollToFirstError={{
                    behavior: "smooth",
                    block: "center",
                    inline: "center",
                  }}
                >
                  <div
                    className={`mt-6 w-full ${
                      (!props?.hideWizard && "px-5 pt-4") || ""
                    }`}
                  >
                    <div
                      className={`grid ${
                        (!props?.hideWizard &&
                          "gap-7 xl:grid-cols-2 md:grid-cols-2") ||
                        "gap-6"
                      }`}
                    >
                      {!isFieldHidden("firstName") && (
                        <Form.Item
                          label="First Name"
                          name="firstName"
                          rules={[
                            { required: true, message: "Is required" },
                            { whitespace: true, message: "Invalid First Name" },
                            validations.textValidator(
                              "first name",
                              "alphaNumWithSpaceAndSpecialChars"
                            ),
                          ]}
                          className="mb-0"
                        >
                          <Input
                            placeholder="Enter First Name"
                            maxLength={50}
                            autoComplete="off"
                            className="bg-transparent border-[1px] border-inputBg text-lightWhite p-2 rounded outline-0 custom-input-field"
                            onChange={onFieldChange("firstName")}
                          />
                        </Form.Item>
                      )}
                      {!isFieldHidden("lastName") && (
                        <Form.Item
                          label="Last Name"
                          name="lastName"
                          rules={[
                            { required: true, message: "Is required" },
                            { whitespace: true, message: "Invalid Last Name" },
                            validations.textValidator(
                              "last name",
                              "alphaNumWithSpaceAndSpecialChars"
                            ),
                          ]}
                          className="mb-0"
                        >
                          <Input
                            placeholder="Enter Last Name"
                            maxLength={50}
                            autoComplete="off"
                            className="bg-transparent border-[1px] border-inputBg text-lightWhite p-2 rounded outline-0 custom-input-field"
                            onChange={onFieldChange("lastName")}
                          />
                        </Form.Item>
                      )}
                      {!isFieldHidden("gender") && (
                        <Form.Item
                          label="Gender"
                          name="gender"
                          rules={[{ required: true, message: "Is required" }]}
                          className="mb-0"
                        >
                          <Radio.Group
                            onChange={onGenderChange}
                            className="ml-2 lg:space-y-0 md:space-y-2 space-y-0 pt-3 mt-4"
                          >
                            <Radio value="male">Male</Radio>
                            <Radio value="female">Female</Radio>
                            <Radio value="others">Others</Radio>
                          </Radio.Group>
                        </Form.Item>
                      )}
                      {!isFieldHidden("dob") && (
                        <Form.Item
                          label="Date Of Birth (Future dates not allowed)"
                          rules={[
                            { required: true, message: "Is required" },
                            { validator: validateDOB },
                          ]}
                          name="dob"
                          className="mb-0"
                        >
                          <AppDatePicker
                            className="bg-transparent  p-2 rounded outline-0 w-full text-lightWhite custom-input-field"
                            onChange={onFieldChange("dob")}
                            datesToDisable="futureAndCurrentDates"
                          />
                        </Form.Item>
                      )}
                    </div>
                  </div>
                  {/* <div
                    className={`mt-6 w-full ${
                      (!props?.hideWizard && "") || ""
                    }`}
                  >
                    <AddressComponenet
                      isVisible={true}
                      hideWizard={props?.hideWizard}
                      address={details?.addressDetails}
                      form={form}
                      FormInstance={Form}
                      countries={countries}
                      phoneCodes={phoneCodes}
                      states={states}
                    />
                    <div
                      className={`grid grid-cols-1 gap-6 ${
                        (!props?.hideWizard &&
                          "lg:grid-cols-2 md:grid-cols-3 xl:grid-cols-3") ||
                        ""
                      }`}
                    ></div>
                  </div> */}
                  <div className="mt-6 text-right">
                    {!props?.hideWizard && (
                      <CustomButton
                        type="primary"
                        className={"ml-3.5"}
                        loading={btnLoader}
                        disabled={btnLoader}
                        htmlType="submit"
                      >
                        Next
                      </CustomButton>
                    )}
                    {props?.hideWizard && (
                      <CustomButton
                        type="primary"
                        loading={btnLoader}
                        className={"ml-3.5"}
                        disabled={btnLoader}
                        htmlType="submit"
                      >
                        Save & Continue
                      </CustomButton>
                    )}
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const connectStateToProps = ({ userConfig }) => {
  return {
    trackauditlogs: userConfig?.trackAuditLogData,
  };
};
export default connect(connectStateToProps)(BasicInfo);