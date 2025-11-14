import React, { useCallback, useEffect, useReducer, useRef, useState } from "react";
import PropTypes from "prop-types";
import { connect, useSelector } from "react-redux";
import { Form as AntForm, Input, message, Radio } from "antd";
import AppAlert from "../../../core/shared/appAlert";
import { fiatLookups, fiatFormReducer, fiatFormState } from "../reducer";
import { lookupFor } from "../service";
import PayeeAddressForm from "./address.form";
import RecipientInfo from "./recipientInfo.form";
import AdditionalInfo from "./additionalInfo.form";
import PaymentInfo from "./paymentInfo.form";
import moment from "moment";
import AppDefaults from "../../../utils/app.config";
import {
  VALIDATION_ERROR_MESSAGES,
  replaceExtraSpaces,
  validations,
  favNameRegex,
  nameRegex,
} from "../../../core/shared/validations";
import { useNavigate, useParams, useSearchParams } from "react-router";
import CustomButton from "../../../core/button/button";
import ContentLoader from "../../../core/skeleton/common.page.loader/content.loader";
import PayeeFormInput from "../formInput";
import {
  fetchPayeeInfo,
  getFiatCurrencies,
  handleFiatPayeeSave,
  getStates,
  CurrencyLookup,
  fetchBankLookup,
  fetchBranchCodeLookup,
  FetchProfileDetails,
} from "../http.services";
import { decryptAES } from "../../../core/shared/encrypt.decrypt";

const { requiredValidator, regexValidator, textLengthValidator} = validations;

const Form = (props) => {
  const { id, mode, name } = useParams();
  const [form] = AntForm.useForm();
  const [urlParams] = useSearchParams();
  const [fiatCurrenciesLookup, setFiatCurrenciesLookup] = useState([]);
  const [fetchpaymentslookup, setFectchPaymentLookup] = useState([]);
  const [bankLookup, setBankLookup] = useState([]);
  const trackAuditLogData = useSelector(
    (store) => store.userConfig.trackAuditLogData
  );

  const [state, setState] = useReducer(fiatFormReducer, {
    ...fiatFormState,
    lookups: { ...fiatLookups },
  });
  const customerInfo = useSelector((info) => info.userConfig.details);
  const navigate = useNavigate();
  const payeeDivRef = React.useRef(null);
  const [isFirstParty, setIsFirstParty] = useState(false);
  const additionalInfoRef = React.useRef();
  const additionalInfoContainerRef = useRef();
  const [profileDetails, setProfileDetails] = useState({});
  const [isFormEditable, setIsFormEditable] = useState(true);

  useEffect(() => {
    setError("");
    form.resetFields();
    getDetails();
  }, [mode]);

  useEffect(() => {
    if (
      urlParams.get("stableCoinPayout") === "true" &&
      state.isBaas &&
      additionalInfoContainerRef.current
    ) {
      setTimeout(() => {
        additionalInfoContainerRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);
    }
  }, [urlParams, state.isBaas]);
  const IsOnTheGo = props && props.IsOnTheGo ? props.IsOnTheGo : false;


  const fetchFaitCurrencies = useCallback(async () => {
    try {
      const currencies = await CurrencyLookup();
      setFiatCurrenciesLookup(currencies);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading("");
    }
  }, [form]);
  const getProfileDetails = useCallback(async (formData, fiatLookUps) => {
    try {
      const countries = fiatLookUps?.countryWithStates;
      setLoading("data");
      const loginAccountType = customerInfo.accountType?.toLowerCase() || '';
      const details = await FetchProfileDetails(customerInfo?.accountType);
      setProfileDetails(details);
      if ((mode === "add" || props.mode === "add") && formData.accountTypeDetails?.toLowerCase() === loginAccountType &&
        formData.addressTypeDetails === "1st Party") {
        setIsFirstParty(true);
        form.setFieldsValue({
          firstName: details?.firstName,
          lastName: details?.lastName,
          email: details?.email ? decryptAES(details?.email) : null,
          phoneCode: details?.phoneCode ? decryptAES(details?.phoneCode) : null,
          phoneNumber: details?.phoneNumber ? decryptAES(details?.phoneNumber) : null,
          birthDate: details?.dob ? moment(details?.dob) : null,
          relation: "Self",
          addressLine1: details?.addressLine1,
          addressLine2: details?.addressLine2,
          city: details?.city,
          line1: details?.line1,
          state: details?.state,
          postalCode: details?.postalCode,
          country: details?.country,
          businessName: details?.businessName
        });
        if (details?.country) {
          setStates(details?.country, countries);
        }
      } else {
        setIsFirstParty(false);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading("");
    }
  }, [customerInfo, mode, form, props]);


  const getBankCountryLU = useCallback(async (forType, values) => {
    try {
      const currenciesLu = fiatCurrenciesLookup?.find(c => c.code?.toLowerCase() === forType?.toLowerCase());
      if (currenciesLu?.countries && Array.isArray(currenciesLu?.countries)) {
        setLookups('bankCountries', currenciesLu.countries || []);
      }
      form.setFieldsValue({ ...values });
    } catch (error) {
      setError(error.message);
    }
  }, [fiatCurrenciesLookup, form]);
  const getBankLU = async (forType, values) => {
    try {
      const bankLU = await fetchBankLookup(forType);
      setBankLookup(bankLU);
      setLookups('bankProviders', bankLU);
      form.setFieldsValue({ ...values });
    } catch (error) {
      setError(error.message);
    }
  };
  const getBankBranchLU = async (forType, values) => {
    try {
      const branchLU = await fetchBranchCodeLookup(forType);
      setLookups('branchCodes', branchLU?.data || []);
      form.setFieldsValue({ ...values });
    } catch (error) {
      setError(error.message);
    }
  };
  const setError = useCallback(
    (error, type = "error") => {
      error &&
        payeeDivRef.current?.scrollIntoView({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
      setState({ type: "setError", payload: { message: error, type: type } });
    },
    [state, payeeDivRef]
  );
  const setLoading = useCallback(
    (payload) => {
      setState({ type: "setLoading", payload: payload });
    },
    [state]
  );
  const setLookups = useCallback(
    (key, data) => {
      setState({ type: "setLookups", payload: { [key]: data } });
    },
    [state]
  );
  const getInitialFormData = async () => {
    const loginAccountType = customerInfo.accountType?.toLowerCase() || '';
    if (mode === "edit") {
      const formData = await fetchPayeeInfo({ type: "fiat", id, mode: mode });
      if (formData?.dateOfBirth) {
        formData.birthDate = moment(formData.dateOfBirth);
      }

      return formData;
    }
    return {
      accountTypeDetails: loginAccountType || "personal",
      addressTypeDetails: null,
      isBaas:
        urlParams.get("stableCoinPayout") === "true"
          ? true
          : props.isBaas || false,
      currency: (props?.IsOnTheGo && props?.selectedCurrency) ? props?.selectedCurrency : null,
    };
  };
  const setIsBaasStateIfAdd = () => {
    if (mode === "add") {
      setState({
        type: "setIsBaas",
        payload:
          urlParams.get("stableCoinPayout") === "true" ? true : props.isBaas || false,
      });
    }
  };

  const decryptSensitiveFields = (formData) => {
    if (mode !== "edit") return;
    if (formData.paymentInfo && formData.paymentInfo.accountNumber) {
      formData.paymentInfo.accountNumber = decryptAES(
        formData.paymentInfo.accountNumber
      );
    }
    const sensitiveFields = [
      "email", "phoneNumber", "phoneCode",
      "postalCode", "accountNumber", "walletaddress"
    ];
    sensitiveFields.forEach((field) => {
      if (formData[field]) {
        formData[field] = decryptAES(formData[field]);
      }
    });
  };

  const getLookupsAndPaymentFields = async (currency, values) => {
    const [fiatLookUps, paymentTypes] = await Promise.all([getFiatCurrencies(), CurrencyLookup()]);
    const currenciesLu = paymentTypes?.find(c => c.code?.toLowerCase() === currency?.toLowerCase());

    setFiatCurrenciesLookup(paymentTypes);
    if (currenciesLu?.paymentInfo?.length > 0) {
      setFectchPaymentLookup(currenciesLu?.paymentInfo || []);
      form.setFieldValue("paymentFields", currenciesLu?.paymentInfo?.[0]?.fields || []);
      form.resetFields(["paymentInfo"]);
    }

    if (currenciesLu?.countries && Array.isArray(currenciesLu?.countries)) {
      setLookups('bankCountries', currenciesLu.countries || []);
    }
    form.setFieldsValue({ ...values });
    const paymentFields = currenciesLu?.paymentInfo?.[0]?.fields || []
    return { fiatLookUps, paymentFields };
  };

  const updateFormAndState = async (formData, fiatLookUps, paymentFields) => {
    const fiatCurrencies = fiatLookUps?.fiatCurrency;
    const phoneCodes = fiatLookUps?.PhoneCodes || [];
    const countries = fiatLookUps?.countryWithStates;
    const additionLu = fiatLookUps?.documentTypes;
    const businessTypes = fiatLookUps?.businessTypes;
    const businessLookup = fiatLookUps?.Business;
    const individualLookup = fiatLookUps?.Individual;
    const dataofBirth = form.getFieldValue('birthDate');
    const remittancePurposes = fiatLookUps?.RemittancePurposes || [];

    const dataToUpdate = { ...formData };
    if (!dataToUpdate.accountTypeDetails) {
      dataToUpdate.accountTypeDetails = dataToUpdate.accountType || 'personal';
    }
    if (!dataToUpdate.addressTypeDetails) {
      // if (mode === "add") {
      //   if (dataToUpdate.accountTypeDetails === "personal") {
      //     dataToUpdate.addressTypeDetails = "3rd Party";
      //   } else {
      //     dataToUpdate.addressTypeDetails = null;
      //   }
      // } else {
      //   dataToUpdate.addressTypeDetails = dataToUpdate.addressType || "1st Party";
      // }
      dataToUpdate.addressTypeDetails = dataToUpdate.addressType;
    }
    dataToUpdate.currency = dataToUpdate.currency || fiatCurrencies?.code;
    dataToUpdate.birthDate = dataToUpdate.dateOfBirth ? moment(dataToUpdate.dateOfBirth) : dataofBirth ? dataofBirth : null;
    if (dataToUpdate.bankCountry) {
      await getBankLU(dataToUpdate?.bankCountry, dataToUpdate);
    }
    if (dataToUpdate.country) {
      setStates(dataToUpdate.country, countries);
    }
    if (dataToUpdate.bankName || dataToUpdate?.paymentInfo?.bankName) {
      getBankBranchLU(dataToUpdate.bankName || dataToUpdate?.paymentInfo?.bankName, formData || {});
    }
    // Flatten paymentInfo fields into the form values if present
    let formFields = { ...dataToUpdate };
    // Ensure phoneCode is set if present in dataToUpdate
    if (dataToUpdate.phoneCode) {
      formFields.phoneCode = dataToUpdate.phoneCode;
    }
    // Set paymentFields so that dependent fields render immediately
    form.setFieldsValue({
      ...formFields,
      paymentFields: paymentFields || [],
      paymentType: dataToUpdate?.paymentType
    });
    setState({ type: "setInitialData", payload: dataToUpdate });
    const fieldOfAdditionalLu = lookupFor[dataToUpdate.accountTypeDetails];
    setState({
      type: "setLookups",
      payload: {
        fiatCurrencies,
        countries,
        phoneCodes,
        documentTypes: additionLu,
        businessTypes,
        accountTypes: fiatLookUps?.AccountTypes,
        bankProviders: fiatLookUps?.BankProvidersLu,
        businessLookup,
        individualLookup,
        remittancePurposes
      },
    });
    if (mode === "edit") {
      setState({ type: "setIsBaas", payload: urlParams.get("stableCoinPayout") === "true" ? true : formData?.stableCoinPayout });
    }
  };

  const getDetails = async () => {
    setLoading("data");
    try {
      const formData = await getInitialFormData();
      if (formData?.isEditable !== undefined) {
        setIsFormEditable(formData.isEditable); // Update the new local state
    }
      decryptSensitiveFields(formData);
      setIsBaasStateIfAdd();
      const { fiatLookUps, paymentFields } = await getLookupsAndPaymentFields(
        formData.currency,
        formData
      );
      await getProfileDetails(formData, fiatLookUps);
      await updateFormAndState(formData, fiatLookUps, paymentFields);
      setLoading("");
    } catch (error) {
      setError(error.message);
      setLoading("");
    }
  };
  const savePayee = useCallback(async () => {
    setState({ type: "setIsLoading", payload: "save" });
    try {
      const addtionalParams = {
        customer: props?.userConfig,
        mode,
        isBaas: state.isBaas,
        bankDetails: state.bankDetails,
        trackAuditLogData: trackAuditLogData,
        lookups: state.lookups,
        customerInfo: customerInfo,
        IsOnTheGo: IsOnTheGo,
        isadd: props.mode
      };
      await handleFiatPayeeSave(form.getFieldsValue(true), addtionalParams);
      message.success({
        content:
          (mode === "add" || props.mode === "add")
            ? "Payee saved successfully."
            : "Payee updated successfully.",
        className: "custom-msg",
        duration: 3,
      });
      payeeDivRef.current.scrollIntoView(0, 0);
      if (props?.isDrawer) {
        props?.onSuccess?.();
      } else {
        navigate(`/payees/fiat/${id}/${name}/${mode}/success`);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setState({ type: "setIsLoading", payload: "" });
    }
  }, [form, props, state, mode, id, name, customerInfo, navigate, trackAuditLogData]);
  const fetchPaymentFields = useCallback(async (forType, values) => {
    try {
      const currenciesLu = fiatCurrenciesLookup?.find(c => c.code?.toLowerCase() === forType?.toLowerCase());
      if (currenciesLu?.paymentInfo?.length > 0) {
        form.resetFields(["paymentInfo"]);
        setFectchPaymentLookup(currenciesLu?.paymentInfo || []);
        form.setFieldsValue({ ...values, paymentType: currenciesLu?.paymentInfo?.[0]?.code });
        form.setFieldValue("paymentFields", currenciesLu?.paymentInfo?.[0]?.fields || []);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading("");
    }
  }, [fetchpaymentslookup, form, fiatCurrenciesLookup]);
  const setStates = (selectedCountry, countries = state.lookups.countries) => {
    try {
      const states = getStates(selectedCountry, countries);
      setLookups("states", states);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading("");
    }
  };
  const navigateToView = useCallback(() => {
    if (props?.isDrawer) {
      props?.onCancel?.();
    } else if (id !== AppDefaults.GUID_ID) {
      payeeDivRef.current.scrollIntoView(0, 0);
      navigate(`/payees/fiat/${id}/${name}/view`);
    } else {
      payeeDivRef.current.scrollIntoView(0, 0);
      navigate(`/payees/fiat`);
    }
  }, [props, id, name, payeeDivRef]);
  const getAdditonalLookups = async (accType) => {
    try {
      setLookups(
        lookupFor[accType],
        accType == "personal"
          ? state.lookups?.documentTypes
          : state.lookups.businessTypes
      );
    } catch (errorMsg) {
      setError(errorMsg.message);
    }
  };
  const setField = useCallback(
    (fieldName, value) => {
      if (fieldName === "country") {
        setStates(value);
        form.resetFields(["state"]);
      }
      else if (fieldName === "currency") {
        const previousPaymentFields = form.getFieldValue("paymentFields") || [];
        const paymentFieldKeys = Array.isArray(previousPaymentFields)
          ? previousPaymentFields.map(field => field.field)
          : [];

        const oldPaymentInfo = form.getFieldValue("paymentInfo") || {};
        const oldPaymentInfoKeys = oldPaymentInfo ? Object.keys(oldPaymentInfo) : [];

        const allDynamicKeys = [...new Set([...paymentFieldKeys, ...oldPaymentInfoKeys])];

        // Clear nested paymentInfo and related dynamic fields using name paths
        form.setFieldsValue({
          paymentInfo: {},
          paymentFields: [],
          paymentType: undefined,
          bankName: undefined,
          walletaddress: undefined,
          swiftOrBicCode: undefined,
          ukShortCode: undefined,
          iban: undefined,
        });

        // Reset fields explicitly using AntD name paths for nested items
        const resetNamePaths = [
          ["paymentType"],
          ["paymentFields"],
          ["paymentInfo"],
          ["bankName"],
          ["walletaddress"],
          ["swiftOrBicCode"],
          ["ukShortCode"],
          ["iban"],
          ...allDynamicKeys.map(k => ["paymentInfo", k]),
          ...allDynamicKeys.map(k => [k]),
        ];
        form.resetFields(resetNamePaths);

        // Clear dependent lookups/state
        setLookups("paymentFields", []);
        setLookups('bankProviders', []);
        setLookups('branchCodes', []);
        setFectchPaymentLookup([]);
        setBankLookup([]);
        setState({ type: "setBankDetails", payload: null });

        // Update currency and refetch new payment fields and bank countries
        fetchPaymentFields(value, form.getFieldsValue(true) || {});
        getBankCountryLU(value, form.getFieldsValue(true) || {});
      }
      else if (fieldName === "accountTypeDetails" && value) {
        setError("");
        form.resetFields();
        getAdditonalLookups(value);
      }
      form.setFieldsValue({ ...form.getFieldsValue(true), [fieldName]: value });
      setError("");
    },
    [form, state, mode]
  );

  const validateFields = useCallback(async () => {
    try {
      // if (!form.getFieldValue("addressTypeDetails")) {
      //   // setError("Please select transfer type");
      //   return;
      // }
      await form.validateFields();
      form.submit();
    } catch (errors) {
      setError(errors.message);
    }
  }, [form]);

  const handleAccountTypeChange = useCallback(
    (e) => {
      const value = e.target.value;
      setField("accountTypeDetails", value);
      additionalInfoRef.current?.resetDocs?.();
      setLookups("states", []);
      setFectchPaymentLookup([]);
      setIsFirstParty(false);
      setState({ type: "setIsBaas", payload: urlParams.get("stableCoinPayout") === "true" ? true : false });
      // if ((mode === "add" || props.mode === "add") && value) {
      //   form.setFieldsValue({ addressTypeDetails: value === "personal" ? "3rd Party" : null });
      //   handleAddressTypeChange({ target: { value: value === "personal" ? "3rd Party" : null } });
      // }
      fetchFaitCurrencies();
    },
    [setField]
  );
  const handleClearError = useCallback(() => {
    setError("");
  }, []);

  const handleChange = useCallback(
    (e) => {
      setField?.(e.target.id, e.target.value);
      setError("");
    },
    [setField]
  );
  const handleBlur = useCallback(
    (e) => {
      setField(e.target.id, replaceExtraSpaces(e.target.value));
    },
    [setField]
  );
  const handleAddressTypeChange = useCallback(
    (e) => {
      const value = e.target.value;
      setField("addressTypeDetails", value);
      additionalInfoRef.current?.resetDocs?.();
      const selectedAccountType = form.getFieldValue('accountTypeDetails')?.toLowerCase();
      const loginAccountType = customerInfo.accountType?.toLowerCase() || '';
      const businessLu = state.lookups?.Relationships?.business || [];

      // Get all dynamic payment field keys
      const previousPaymentFields = form.getFieldValue("paymentFields") || [];
      const paymentFieldKeys = Array.isArray(previousPaymentFields)
        ? previousPaymentFields.map(field => field.field)
        : [];
      const oldPaymentInfo = form.getFieldValue("paymentInfo") || {};
      const oldPaymentInfoKeys = oldPaymentInfo ? Object.keys(oldPaymentInfo) : [];
      const allDynamicKeys = [...new Set([...paymentFieldKeys, ...oldPaymentInfoKeys])];

      if (value === "1st Party" && selectedAccountType === loginAccountType) {
        setIsFirstParty(true);
        setStates(profileDetails?.country);
        form.setFieldsValue({
          firstName: profileDetails?.firstName,
          lastName: profileDetails?.lastName,
          email: profileDetails?.email ? decryptAES(profileDetails?.email) : null,
          phoneCode: profileDetails?.phoneCode ? decryptAES(profileDetails?.phoneCode) : null,
          phoneNumber: profileDetails?.phoneNumber ? decryptAES(profileDetails?.phoneNumber) : null,
          birthDate: profileDetails?.dob ? moment(profileDetails?.dob) : null,
          relation: "Self",
          addressLine1: profileDetails?.addressLine1,
          addressLine2: profileDetails?.addressLine2,
          city: profileDetails?.city,
          line1: profileDetails?.line1,
          state: profileDetails?.state,
          postalCode: profileDetails?.postalCode,
          country: profileDetails?.country,
          businessName: profileDetails?.businessName
        });
        form.resetFields([
          "paymentFields",
          "currency",
          "paymentInfo",
          "paymentType",
          "documentType",
          "documentNumber",
          "businessType",
          "businessRegistrationNo",
          ...allDynamicKeys.map(k => `paymentInfo.${k}`),
          ...allDynamicKeys,
        ]);
      } else {
        setIsFirstParty(false);
        form.resetFields([
          "firstName",
          "lastName",
          "email",
          "phoneCode",
          "phoneNumber",
          "relation",
          "addressLine1",
          "addressLine2",
          "city",
          "line1",
          "state",
          "postalCode",
          "country",
          "paymentFields",
          "currency",
          "paymentInfo",
          "paymentType",
          "documentType",
          "documentNumber",
          "businessType",
          "businessRegistrationNo",
          "birthDate",
          "bankCountry",
          "businessName",
          ...allDynamicKeys.map(k => `paymentInfo.${k}`),
          ...allDynamicKeys,
        ]);
        setLookups("states", []);
      }
      setFectchPaymentLookup([]);
      setLookups("paymentFields", []);
      setState({ type: "setBankDetails", payload: null });
      fetchFaitCurrencies();
    },
    [setField, profileDetails, form, customerInfo, state]
  );
  const isAddressTypeDisabled = useCallback((radioValue) => {
    const loginAccountType = customerInfo?.accountType?.toLowerCase() || '';
    const selectedAccountType = form.getFieldValue('accountTypeDetails')?.toLowerCase();

    if (mode === "edit" || props.mode === "edit") {
      return true;
    }
    if (radioValue === "1st Party") {
      return selectedAccountType !== loginAccountType;
    }
    return false;
  }, [mode, props.mode, customerInfo, form]);

  return (
    <>
      <div ref={payeeDivRef}></div>
      <div>
        <div className="panel-card buy-card !w-full !mt-0 !pt-0 !p-2">
          {state.error.message && (
            <div className="">
              <div className="alert-flex" style={{ width: "100%" }}>
                <AppAlert
                  className="w-100 "
                  type="warning"
                  description={state.error.message}
                  showIcon
                />
                <button
                  className="btn-plane c-pointer"
                  onClick={handleClearError}
                >
                  <span className="icon sm alert-close"></span>
                </button>
              </div>
            </div>
          )}
          {state.loading === "data" && <ContentLoader />}
          {!state.loading && (
            <AntForm
              className="payees-form payees-rightpanel custom-label mb-0 fw-400"
              onFinish={savePayee}
              form={form}
              scrollToFirstError={{
                behavior: "smooth",
                block: "center",
                inline: "center",
              }}
            >
              <div className="payee-inblock error-space !w-full">
                <div className="!px-0">
                  <div className={
                    props?.IsOnTheGo
                      ? "flex-1 space-y-5 basicinfo-form"
                      : "grid grid-cols-1 xl:grid-cols-2 gap-6 mb-2"
                  }
                  >
                    <PayeeFormInput
                      isRequired={true}
                      label={"Favorite Name"}
                      className=""
                    >
                      <AntForm.Item
                        name="favouriteName"
                        className="relative"
                        rules={[requiredValidator(),
                        regexValidator("favorite name", nameRegex),
                        textLengthValidator("favorite name"),
                        ]}
                      >
                        <Input
                          className="custom-input-field outline-0"
                          placeholder="Enter Favorite Name"
                          type="input"
                          autoComplete="off"
                          maxLength={50}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={!isFormEditable}
                        />
                      </AntForm.Item>
                    </PayeeFormInput>
                  </div>
                  <div className=" grid md:grid-cols-2 gap-4">
                    <div className="mr-10">
                      <h1 className="text-xl font-semibold mb-4 mt-1 text-titleColor capitalize">
                        Account <span class="text-requiredRed"> *</span>
                      </h1>
                      <div className="accounttype-radio flex gap-2">
                        <AntForm.Item
                          name={"accountTypeDetails"}
                          className="text-left !p-0"
                          rules={[
                            {
                              required: true,
                              message: "Is required",
                            },
                          ]}
                        >
                          <Radio.Group
                            onChange={handleAccountTypeChange}
                            disabled={mode === "edit"}
                            className="new-custom-radiobtn newcustome-radiocheck"
                          >
                            <Radio value="personal" className="">
                              Personal
                            </Radio>
                            <Radio value="business" className="">
                              Business
                            </Radio>
                          </Radio.Group>
                        </AntForm.Item>
                      </div>
                    </div>
                    <div>
                      <h1 className="text-xl font-semibold mb-4 mt-1 text-titleColor capitalize">
                        Transfer <span class="text-requiredRed"> *</span>
                      </h1>
                      <div className="accounttype-radio flex gap-2">
                        <AntForm.Item
                          name={"addressTypeDetails"}
                          className="text-left !p-0"
                          rules={[
                            {
                              required: true,
                              message: "Is required",
                            },
                          ]}
                        >
                          <Radio.Group
                            onChange={handleAddressTypeChange}
                            className="new-custom-radiobtn newcustome-radiocheck"
                          >
                            <Radio value="1st Party" className="" disabled={isAddressTypeDisabled("1st Party")} >
                              1st Party
                            </Radio>
                            <Radio value="3rd Party" className="" disabled={isAddressTypeDisabled("3rd Party")} >
                              3rd Party
                            </Radio>
                          </Radio.Group>
                        </AntForm.Item>
                      </div>
                    </div>
                  </div>
                </div>
                <RecipientInfo
                  setError={setError}
                  setLoading={setLoading}
                  setField={setField}
                  FormInstance={AntForm}
                  form={form}
                  lookups={state.lookups}
                  isDrawer={props.isDrawer}
                  customerInfo={profileDetails}
                  isFirstParty={isFirstParty}
                  mode={mode || props.mode}
                  state={state}
                  setState={setState}
                  props={props}
                  isFormEditable={isFormEditable}
                />
                <PayeeAddressForm
                  setField={setField}
                  setError={setError}
                  setLoading={setLoading}
                  FormInstance={AntForm}
                  form={form}
                  lookups={state.lookups}
                  setFiatCurrenciesLookup={setFiatCurrenciesLookup}
                  props={props}
                  isFormEditable={isFormEditable}
                />
                <PaymentInfo
                  setField={setField}
                  setError={setError}
                  setLoading={setLoading}
                  FormInstance={AntForm}
                  fetchPaymentFields={fetchPaymentFields}
                  paymentFields={fetchpaymentslookup}
                  form={form}
                  lookups={{
                    ...state.lookups,
                    bankProviders: bankLookup,
                    branchCodes: state.lookups.branchCodes || [],
                  }}
                  fiatCurrenciesLookup={fiatCurrenciesLookup}
                  initialData={state.initialData}
                  state={state}
                  mode={mode || props.mode}
                  setState={setState}
                  getBankBranchLU={getBankBranchLU}
                  setLookups={setLookups}
                  props={props}
                  fetchFaitCurrencies={fetchFaitCurrencies}
                  setFiatCurrenciesLookup={setFiatCurrenciesLookup}
                  setFectchPaymentLookup={setFectchPaymentLookup}
                  getBankLU={getBankLU}
                  isFormEditable={isFormEditable}

                />
                {state.isBaas && (
                  <div ref={additionalInfoContainerRef}>
                  <AdditionalInfo
                    setField={setField}
                    setError={setError}
                    setLoading={setLoading}
                    FormInstance={AntForm}
                    lookups={state.lookups}
                    form={form}
                    initialData={state.initialData}
                    mode={mode || props.mode}
                    state={state}
                    ref={additionalInfoRef}
                    props={props}
                    isFormEditable={isFormEditable}
                  />
                  </div>
                  )}
                {IsOnTheGo && <div className='mt-2 !text-left border border-StrokeColor p-3 rounded-5'>
                  <p className="font-medium mb-1 !text-base">Note </p>
                  <p>Your payee will be available after 10 minutes for transactions.</p>
                </div>}
                <div className="flex justify-end items-center md:space-x-4 md:mt-5 flex-col-reverse md:flex-row">
                  <CustomButton htmlType="reset" onClick={navigateToView}>
                    Cancel
                  </CustomButton>
                  {/* {form?.getFieldValue("whiteListState") !== "Approved" && ( */}
                  <CustomButton
                    type="primary"
                    loading={state.isLoading === "save"}
                    disabled={state.isLoading === "save"}
                    onClick={validateFields}
                  >
                    <span>{mode === 'edit' ? 'Update' : 'Save'}</span>
                  </CustomButton>
                  {/* )} */}
                </div>
                <div></div>
              </div>
            </AntForm>
          )}
        </div>
      </div>
    </>
  );
};
const connectStateToProps = ({ userConfig, payeesData, payeeData }) => {
  return {
    userConfig: userConfig.details,
    payeesData: payeesData?.payeesFiatList,
    payeeData,
    trackAuditLogData: userConfig.trackAuditLogData,
  };
};
const connectDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};
Form.propTypes = {
  userConfig: PropTypes.object,
  dispatch: PropTypes.func,
};
export default connect(connectStateToProps, connectDispatchToProps)(Form);