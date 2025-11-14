import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Form, Input, Switch } from "antd";
import AppSelect from "../../core/shared/appSelect";
import { useParams } from "react-router";
import {
  emailRegex,
  nameRegex,
  phoneNoRegex,
  replaceExtraSpaces,
  streetAddressRegex,
  validations,
} from "../../core/shared/validations";
import PhoneCodeDropdown from "../../core/shared/phCodeDropdown";
import { TwoColFormLoader } from '../../core/skeleton/form.loaders';
import { useSelector } from "react-redux";
import AppDefaults, { getCurrentDateIso, isObject } from "../../utils/app.config";
import { deriveErrorMessage } from "../../core/shared/deriveErrorMessage";
import AppAlert from "../../core/shared/appAlert";
import { encryptAES } from "../../core/shared/encrypt.decrypt";
import CustomButton from "../../core/button/button";
import { successToaster } from "../../core/shared/toasters";
import { editAddressSave, fetchAddressDetails, getCountryTownLu, saveNewAddressDetails } from "./http.services";
import { getAddressType } from "../../core/profile/http.services";
import AppCheckbox from "../../core/shared/appCheckbox";

const {
  requiredValidator,
  regexValidator,
  textLengthValidator,
  postalCodeValidator,
  textValidator,
} = validations;
const ManageAddress = ({
  address,
  addressId,
  formMode,
  showHeader = true,
  onSuccess,
  onCancel,
  isDrawer,
  mode = "Add",
}) => {
  const [form] = Form.useForm();
  const params = useParams();
  const errorRef = useRef(null)
  const [id] = useMemo(() => {
    return !(addressId && formMode)
      ? [params.id, params.mode]
      : [addressId, formMode];
  }, [params.id, addressId, formMode]);
  const userProfile = useSelector((store) => store.userConfig.details);
  const auditLogData = useSelector(
    (store) => store.userConfig.trackAuditLogData
  );
  const userConfig = useSelector((store) => store.userConfig.details);
  const accountType = userConfig?.accountType === "Business"
  const [loader, setLoader] = useState(false);
  const [errorMessage, setErrorMessage] = useState();
  const [countryLookUp, setCountryLookUp] = useState();
  const [townsLookUp, setTownsLookUp] = useState();
  const [buttonLoader, setButtonLoader] = useState();
  const [phoneCodeLookUp, setPhoneCodeLookUp] = useState();
  const [type, setType] = useState();
  const [statesLu, setStatesLu] = useState([]);
  const [countryWithStates, setCountryWithStates] = useState();
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    country: "",
    state: "",
    city: "",
    addressLine1: "",
    addressLine2: "",
    postalCode: "",
    phoneNumber: "",
    phoneCode: auditLogData?.Location?.calling_code
      ? `+${auditLogData?.Location?.calling_code}`
      : "",
    email: "",
  });
  useEffect(() => {
    if (errorRef.current && errorMessage) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [errorMessage])
  useEffect(() => {
    getDetails();
  }, [addressId]);
  const getDetails = async () => {
    if (
      !address &&
      mode !== "Add" &&
      id &&
      id !== "undefined" &&
      id !== "null" &&
      id !== AppDefaults.GUID_ID
    ) {
      fetchAddressDetails({
        setData: (data) => {
          form.setFieldsValue(data);
          setFormData(data);
        },
        setError: setErrorMessage,
        addressId: id,
      });
    } else if (isObject(address) && mode !== "Add") {
      form.setFieldsValue({ ...address });
      setFormData({ ...address });
    }
    await getCountryTownLu(setCountryLu, setErrorMessage);
    await getAddressType(setErrorMessage, setType);
    setLoader(false);
  };
  const setFieldValue = (field, value) => {
    form.setFieldValue(field, value);
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
    if (field === "phoneCode") {
      form.validateFields(["phoneCode"]);
    } else if (field === "country") {
      form.validateFields(["state", "town"]);
    }
  };
  const handleForm = useCallback(
    (field) => (e) => {
      setFieldValue(
        field,
        e?.type == "blur" ? replaceExtraSpaces(e?.target?.value) : e
      );
    },
    []
  );
  const backtoView = useCallback(
    (e) => {
      e?.preventDefault?.();
      onCancel()
    },
    [onCancel]
  );
  const setCountryLu = (response) => {
    if (response) {
      const countryWithTowns = response?.countryWithTowns || [];
      setCountryLookUp(countryWithTowns);
      setCountryWithStates(response?.countryWithStates);
      setPhoneCodeLookUp(response?.phoneCodes || response?.PhoneCodes || []);
      if (address?.country !== null) {
        const selectedCountry = countryWithTowns?.find(
          (item) => item?.name === address?.country
        );
        setTownsLookUp(selectedCountry?.towns || selectedCountry?.details || []);
      }
      setLoader(false);
    } else {
      setErrorMessage(deriveErrorMessage(response));
      setLoader(false);
    }
  };
  const getSaveAddress = (response) => {
    if (response) {
      setButtonLoader(false);
      successToaster({
        content:
          mode === "Add"
            ? "Address saved successfully."
            : "Address updated successfully.",
        className: "custom-msg",
        duration: 3,
      });
      onCancel();
    } else {
      setButtonLoader(false);
      setErrorMessage(deriveErrorMessage(response));
    }
  };
  const saveNewAddress = async () => {
    const formValues = form.getFieldsValue(true)
    let saveObj = {
      ...formValues,
      id: id,
      email: encryptAES(formValues.email, userProfile?.clientSecretKey),
      phoneNumber: encryptAES(formValues.phoneNumber, userProfile?.clientSecretKey),
      phoneCode: encryptAES(formValues.phoneCode, userProfile?.clientSecretKey),
      postalCode: encryptAES(formValues.postalCode, userProfile?.clientSecretKey),
      customerId: userProfile?.id,
      createdBy: userProfile?.name,
      createdDate: getCurrentDateIso(),

    };
    const urlParams = { id: userProfile?.id, obj: saveObj }
    await saveNewAddressDetails(setButtonLoader, getSaveAddress, setErrorMessage, urlParams);
  };
  const editSaveAddress = async () => {
    const formValues = form.getFieldsValue(true)
    const saveObj = {
      ...formValues,
      id: id,
      email: encryptAES(formValues.email, userProfile?.clientSecretKey),
      phoneNumber: encryptAES(formValues.phoneNumber, userProfile?.clientSecretKey),
      phoneCode: encryptAES(formValues.phoneCode, userProfile?.clientSecretKey),
      postalCode: encryptAES(formValues.postalCode, userProfile?.clientSecretKey),
      customerId: userProfile?.id,
      modifiedBy: userProfile?.name,
      modifiedDate: getCurrentDateIso(),
    };
    const urlParams = { id: userProfile?.id, obj: saveObj }
    await editAddressSave(setButtonLoader, getSaveAddress, setErrorMessage, urlParams);
  };
  const handleSaveAddress = useCallback(() => {
    if (mode === "Add") {
      saveNewAddress();
    } else {
      editSaveAddress();
    }
  }, [formData, form]);
  const handleCountry = useCallback(
    (e) => {
      setFieldValue("country", e);
      const _country = countryLookUp?.find((item) => item?.name === e);
      setTownsLookUp(_country?.towns || _country?.details);
      setStatesLu(getState(e));
      form.setFieldsValue({ town: null, state: null });
    },
    [setFieldValue, countryLookUp, form]
  );
  const closeErrorMessage = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const handleAddressHandler = useCallback(
    (e) => {
      setFieldValue("addressType", e);
    },
    [setFieldValue]
  );

    const getState = (country) => {
    return countryWithStates?.find((cn) => cn.name === country)?.details;
  };
 const handleState = useCallback(
    (e) => {
      setFieldValue("state", e);
    },
    [setFieldValue, form]
  );

  return (
    <div className="">
      {loader && (
        <TwoColFormLoader
          itemCount={13}
          showHeader={showHeader}
          isDrawer={isDrawer}
        />
      )}
      {!loader && (
        <Form
          form={form}
          className="pay-inform basicinfo-form mt-5"
          scrollToFirstError
          onFinish={handleSaveAddress}
        >
          <div className="" ref={errorRef}>
            {errorMessage && (
              <div className="alert-flex mb-24" >
                <AppAlert
                  className=" !px-0 security-error"
                  type="error"
                  description={errorMessage}
                  onClose={closeErrorMessage}
                  showIcon
                  closable
                />
              </div>
            )}
            {showHeader && (
              <div className="flex items-center justify-between mb-5">
                <h1 className="text-2xl font-semibold text-titleColor mb-2">
                  {mode !== "View" ? `${mode} Address` : "Address"}
                </h1>
                <CustomButton type="normal" onClick={backtoView}>
                  <span
                    className="icon lg close cursor-pointer"
                    title="close"
                  ></span>
                </CustomButton>
              </div>
            )}
             <div>
              <div className={`text-left payee-field relative mt-5 mb-5`}>
                <div className="flex country-form-item relative select-hover">
                  <div className="custom-input-lablel">
                    Address Type <span className="text-errorBorderRed">*</span>
                  </div>
                </div>
                <div className="text-left ">
                  <Form.Item
                    name="addressType"
                    rules={[{ required: true, message: "Is required" }]}
                    className="mb-0 custom-select-float"
                    colon={false}
                  >
                    <AppSelect
                      showSearch
                      name="addressType"
                      onChange={handleAddressHandler}
                      placeholder="Select Address Type"
                      className=""
                      maxLength={30}
                      type="input"
                      options={accountType ? type?.KYB : type?.KYC || []}
                      fieldNames={{ label: "name", value: "name" }}
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
            <div
              className={`grid grid-cols-1 ${isDrawer ? "" : "md:grid-cols-2"
                } gap-5`}
            >
              <Form.Item
                className="mb-0"
                name="firstname"
                label="First Name"
                rules={[
                  requiredValidator(),
                  regexValidator("first name", nameRegex),
                  textLengthValidator("first name"),
                ]}
                validateTrigger={["onChange", "onBlur"]}
                colon={false}
              >
                <Input
                  className="custom-input-field outline-0"
                  placeholder="Enter First Name"
                  type="input"
                  maxLength={100}
                  onBlur={handleForm("firstname")}
                />
              </Form.Item>
              <Form.Item
                className="mb-0"
                name="lastname"
                label="Last Name"
                rules={[
                  requiredValidator(),
                  regexValidator("last name", nameRegex),
                  textLengthValidator("last name"),
                ]}
                validateTrigger={["onChange", "onBlur"]}
                colon={false}
              >
                <Input
                  className="custom-input-field outline-0"
                  placeholder="Enter Last Name"
                  type="input"
                  maxLength={100}
                  onBlur={handleForm("lastname")}
                />
              </Form.Item>
              <div className={`text-left payee-field relative`}>
                <div className="flex country-form-item relative select-hover">
                  <div className="custom-input-lablel">
                    Country <span className="text-errorBorderRed">*</span>
                  </div>
                </div>
                <div className="text-left ">
                  <Form.Item
                    name="country"
                    rules={[{ required: true, message: "Is required" }]}
                    className="mb-0 custom-select-float"
                    colon={false}
                  >
                    <AppSelect
                      showSearch
                      name="country"
                      onChange={handleCountry}
                      placeholder="Select Country"
                      className=""
                      maxLength={30}
                      type="input"
                      options={countryLookUp || []}
                      fieldNames={{ label: "name", value: "name" }}
                    />
                  </Form.Item>
                </div>
              </div>
              <Form.Item
                className="mb-0"
                name="state"
                label="State"
                rules={[{ required: true, message: "Is required" }]}
                colon={false}
              >
                <AppSelect
                  showSearch
                  name="state"
                  onChange={handleState}
                  placeholder="Select State"
                  className=""
                  maxLength={30}
                  type="input"
                  options={statesLu || []}
                  fieldNames={{ label: "name", value: "name" }}
                />
              </Form.Item>
              <div className={`text-left payee-field relative`}>
                <div className="flex country-form-item relative select-hover">
                  <div className="custom-input-lablel">
                    Town <span className="text-errorBorderRed">*</span>
                  </div>
                </div>
                <div className="text-left">
                  <Form.Item
                    className="mb-0 custom-select-float"
                    name="town"
                    rules={[requiredValidator()]}
                  >
                    <AppSelect
                      showSearch
                      className=""
                      placeholder="Select Town"
                      type="input"
                      maxLength={100}
                      onChange={handleForm("town")}
                    >
                      {townsLookUp?.map((item) => (
                        <Option key={item.name} value={item.name}>
                          {item.name}
                        </Option>
                      ))}
                    </AppSelect>
                  </Form.Item>
                </div>
              </div>
              <Form.Item
                className="mb-0"
                name="city"
                label="City"
                rules={[
                  requiredValidator(),
                  { whitespace: true, message: "Invalid city" },
                  textValidator("city", "alphaNumWithSpaceAndSpecialChars"),
                ]}
                colon={false}
                validateTrigger={["onChange", "onBlur"]}
              >
                <Input
                  name="city"
                  className="custom-input-field outline-0"
                  placeholder="Enter City"
                  type="input"
                  maxLength={100}
                  onBlur={handleForm("city")}
                />
              </Form.Item>
              <Form.Item
                className={`mb-0 ${isDrawer ? "" : "md:col-span-2"}`}
                name="addressLine1"
                label="Address Line 1"
                rules={[
                  requiredValidator(),
                  regexValidator("address line 1", streetAddressRegex),
                ]}
                colon={false}
                validateTrigger={["onChange", "onBlur"]}
              >
                <Input
                  name="addressLine1"
                  className="custom-input-field outline-0"
                  placeholder="Enter Address Line 1"
                  type="input"
                  maxLength={100}
                  onBlur={handleForm("addressLine1")}
                />
              </Form.Item>
              <Form.Item
                className={`mb-0 ${isDrawer ? "" : "md:col-span-2"}`}
                name="addressLine2"
                label="Address Line 2"
                rules={[regexValidator("address line 2", streetAddressRegex)]}
                colon={false}
                validateTrigger={["onChange", "onBlur"]}
              >
                <Input
                  name="addressLine2"
                  className="custom-input-field outline-0"
                  placeholder="Enter Address Line 2"
                  type="input"
                  maxLength={100}
                  onBlur={handleForm("addressLine2")}
                />
              </Form.Item>
              <Form.Item
                className="mb-0"
                name="postalCode"
                label="Postal Code"
                rules={[
                  requiredValidator(),
                  postalCodeValidator("postal code"),
                  { whitespace: true, message: "Invalid postal code" },
                ]}
                colon={false}
                validateTrigger={["onChange", "onBlur"]}
              >
                <Input
                  name="postalCode"
                  className="custom-input-field outline-0 required-border"
                  placeholder="Enter Postal Code"
                  maxLength={8}
                  onBlur={handleForm("postalCode")}
                />
              </Form.Item>
              <Form.Item
                className="mb-0 phoneno-select phone-field-error drawer-error-msg"
                name="phoneNumber"
                label="Phone"
                required
                rules={[
                  requiredValidator(),
                  regexValidator("phone number", phoneNoRegex, false),
                ]}
                validateTrigger={["onChange", "onBlur"]}
              >
                <Input
                  className="w-full border-0 border-inputDarkBorder text-lightWhite p-0 rounded outline-0"
                  addonBefore={
                    <Form.Item
                      name="phoneCode"
                      className={`mb-0 w-32 ${!isDrawer ? "md:w-32 lg:w-48 xl:w-48" : ""
                        } outline-none phone-select-error md:w-32 lg:w-48 xl:w-48`}
                      colon={false}
                      rules={[requiredValidator()]}
                      validateTrigger={["onChange"]}
                    >
                      <PhoneCodeDropdown onChange={handleForm("phoneCode")} shouldUsePropsList={true} codes={phoneCodeLookUp} />
                    </Form.Item>
                  }
                  maxLength={12}
                  placeholder="Enter Phone Number"
                  onBlur={handleForm("phoneNumber")}
                />
              </Form.Item>
              <Form.Item
                className="mb-0"
                name="email"
                label="Email"
                rules={[
                  requiredValidator(),
                  { whitespace: true, message: "Invalid Email" },
                  regexValidator("email", emailRegex),
                ]}
                colon={false}
                validateTrigger={["onChange", "onBlur"]}
              >
                <Input
                  className="custom-input-field outline-0"
                  placeholder="Enter Email"
                  type="input"
                  maxLength={100}
                  onBlur={handleForm("email")}
                />
              </Form.Item>
            </div>
            <div className="">
              <div className={`text-left payee-field relative mt-5 flex items-center gap-4`}>
                <div className="text-left ">
                  <Form.Item name="isDefault" className="!mb-0" colon={false}>
                    <Switch
                      className=""
                      checked={formData?.isDefault}
                      onChange={handleForm("isDefault")}
                    />
                  </Form.Item>
                </div>
                <span className="payee-label">Set as Default</span>
              </div>
            {userConfig?.accountType === "Business" &&  <div >
                <div className={`text-left payee-field relative mt-3 flex items-center gap-2 ml-0.5`}>
                  <div className="">
                    <Form.Item name="isTradingAddress" className="!mb-0" colon={false}>
                      <AppCheckbox
                        checked={formData?.isTradingAddress}
                        onChange={handleForm("isTradingAddress")}
                        className="cursor-pointer"
                      />
                    </Form.Item>
                  </div>
                  <span className="payee-label">Make This My Trading Address</span>
                </div>
              </div>}
            </div>
            <div className="md:flex items-center gap-2 justify-end mobile-btns-clum mt-4">
              <CustomButton className="" onClick={backtoView}>
                Cancel
              </CustomButton>
              <CustomButton
                type="primary"
                className=""
                htmlType="submit"
                loading={buttonLoader}
              >
                Save
              </CustomButton>
            </div>
          </div>
        </Form>
      )}
    </div>
  );
};

export default ManageAddress;