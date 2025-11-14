import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Form, Input, Switch } from "antd";
import AppSelect from "../shared/appSelect";
import {
  editAddress,
  fetchAddressDetails,
  getAddressType,
  getCountry,
  saveAddress,
} from "./http.services";
import { useNavigate, useParams } from "react-router";
import { deriveErrorMessage } from "../shared/deriveErrorMessage";
import {
  AddressLineRegex,
  emailRegex,
  nameRegex,
  phoneNoRegex,
  replaceExtraSpaces,
  streetAddressRegex,
  validations,
} from "../shared/validations";
import PhoneCodeDropdown from "../shared/phCodeDropdown";
import { successToaster } from "../shared/toasters";
import { TwoColFormLoader } from "../skeleton/form.loaders";
import CustomButton from "../button/button";
import { useDispatch, useSelector } from "react-redux";
import AppDefaults, { getCurrentDateIso, isObject } from "../../utils/app.config";
import { setBreadCrumb } from "../../reducers/appconfig.reducer";
import { encryptAES } from "../shared/encrypt.decrypt";
import AppAlert from "../shared/appAlert";
import AppCheckbox from "../shared/appCheckbox";
const {
  requiredValidator,
  regexValidator,
  textLengthValidator,
  numberOnlyValidator,
  textValidator,
  cityValidator
} = validations;
const baseBreadCrumb = [
  { id: "1", title: "Home", path: "/dashboard" },
  { id: "2", title: "Profile", path: "/profile/details" },
];
const ManageAddress = ({
  address,
  addressId,
  formMode,
  showHeader = true,
  onSuccess,
  onCancel,
  isDrawer,
}) => {
  
  const [form] = Form.useForm();
  const params = useParams();
  const dispatch = useDispatch();
  const errorRef = useRef(null)
  const [id, mode] = useMemo(() => {
    return !(addressId && formMode)
      ? [params.id, params.mode]
      : [addressId, formMode];
  }, [params.id, params.mode, addressId, formMode]);
  const userProfile = useSelector((store) => store.userConfig.details);
  const auditLogData = useSelector(
    (store) => store.userConfig.trackAuditLogData
  );
  const userConfig = useSelector((store) => store.userConfig.details);
  const accountType = userConfig?.accountType === "Business"

  const [loader, setLoader] = useState(true);
  const [errorMessage, setErrorMessage] = useState();
  const [countryLookUp, setCountryLookUp] = useState();
  const [type, setType] = useState();

  const [countryWithStates, setCountryWithStates] = useState();
  const [townsLookUp, setTownsLookUp] = useState();
  const [statesLookUp, setStatesLookUp] = useState();
  const [statesLu, setStatesLu] = useState([]);
  const [phoneCodes, setPhoneCodes] = useState([]);
  const [buttonLoader, setButtonLoader] = useState();
  const navigate = useNavigate();
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
    addressType: "",
  });
  useEffect(() => {
    if (errorRef.current && errorMessage) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [errorMessage])
  useEffect(() => {
    getDetails();
    !isDrawer &&
      dispatch(
        setBreadCrumb([
          ...baseBreadCrumb,
          {
            id: "3",
            title: "Address",
          },
          { id: "4", title: mode },
        ])
      );
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
    await getCountry(setErrorMessage, setCountryLu);
    await getAddressType(setErrorMessage, setType);
    setLoader(false);
  };
  const setFieldValue = (field, value) => {
    form.setFieldValue(field, value);
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
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
      onCancel ? onCancel() : navigate(`/profile/details`);
    },
    [onCancel]
  );
  const setCountryLu = (response) => {
    if (response) {
      setLoader(false);
      setCountryLookUp(response.countryWithTowns);
      setCountryWithStates(response.countryWithStates);
      setStatesLookUp(response.states);
      setPhoneCodes(response.PhoneCodes);
      if (address?.country !== null) {
        const selectedCountry = response?.data?.find(
          (item) => item?.name === address?.country
        );
        setTownsLookUp(selectedCountry?.details || []);
      }
    } else {
      setErrorMessage(deriveErrorMessage(response));
      setLoader(false);
    }
  };
  const getSaveAddress = () => {
    setButtonLoader(false);
    successToaster({
      content:
        mode === "Add"
          ? "Address saved successfully."
          : "Address updated successfully.",
      className: "custom-msg",
      duration: 3,
    });
    onSuccess
      ? onSuccess(form.getFieldsValue(true))
      : navigate(`/profile/details`);

  };
  const saveNewAddress = async () => {
    const formValues = form.getFieldsValue(true)
    let saveObj = {
      ...formValues,
      id: id,
      email: encryptAES(formValues.email, userProfile?.clientSecretKey),
      postalCode: encryptAES(formValues.postalCode),
      phoneCode: encryptAES(formValues.phoneCode),
      phoneNumber: encryptAES(formValues.phoneNumber, userProfile?.clientSecretKey),
      customerId: userProfile?.id,
      createdBy: userProfile?.name,
      createdDate: getCurrentDateIso(),
    };
    saveAddress(
      setButtonLoader,
      setErrorMessage,
      saveObj,
      getSaveAddress,
      userProfile
    );
  };

  const editSaveAddress = async () => {
    const formValues = form.getFieldsValue(true)
    const saveObj = {
      ...formValues,
      id: id,
      email: encryptAES(formValues.email, userProfile?.clientSecretKey),
      phoneNumber: encryptAES(formValues.phoneNumber, userProfile?.clientSecretKey),
      postalCode: encryptAES(formValues.postalCode),
      phoneCode: encryptAES(formData?.phoneCode),
      customerId: userProfile?.id,
      modifiedBy: userProfile?.name,
      modifiedDate: getCurrentDateIso(),
      // phoneCode: formData?.phoneCode,
    };
    editAddress(
      setButtonLoader,
      setErrorMessage,
      saveObj,
      getSaveAddress,
      userProfile
    );
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
      setFieldValue("town", null);
      setFieldValue("country", e);
      const _country = countryLookUp?.find((item) => item?.name === e);
      setTownsLookUp(_country?.details);
      setStatesLu(getState(e));
      setFieldValue("state", null);
    },
    [setFieldValue, countryLookUp, form]
  );
  const handleState = useCallback(
    (e) => {
      setFieldValue("state", e);
    },
    [setFieldValue, form]
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
                <Form.Item
                className="mb-0"
                name="favoriteName"
                label="Favorite Name"
                rules={[
                  requiredValidator(),
                  regexValidator("favorite name", nameRegex),
                  textLengthValidator("favorite name"),
                ]}
                validateTrigger={["onChange", "onBlur"]}
                colon={false}
              >
                <Input
                  className="custom-input-field outline-0"
                  placeholder="Enter Favorite Name"
                  type="input"
                  maxLength={50}
                  onBlur={handleForm("favoriteName")}
                />
              </Form.Item>
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
                name="state"
                label="State"
                rules={[{ required: true, message: "Is required" }]}
                className="mb-0 custom-select-float"
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
                  cityValidator(), requiredValidator()
                ]}
                colon={false}
                validateTrigger={["onChange", "onBlur"]}
              >
                <Input
                  name="city"
                  className="custom-input-field outline-0"
                  placeholder="Enter City"
                  type="input"
                  maxLength={50}
                  onBlur={handleForm("city")}
                />
              </Form.Item>
              <Form.Item
                className={`mb-0 ${isDrawer ? "" : "md:col-span-2"}`}
                name="addressLine1"
                label="Address Line 1"
                rules={[
                  requiredValidator(),
                  regexValidator("address line 1", AddressLineRegex),
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
                rules={[regexValidator("address line 2", AddressLineRegex)]}
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
                  validations.postalCodeValidator("postal code"),
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
              <div className="mb-2">
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
                  className="w-full border-0  border-dbkpiStroke text-lightWhite p-0 rounded outline-0"
                  addonBefore={
                    <Form.Item
                      name="phoneCode"
                      className={`mb-0 w-32 ${!isDrawer ? "md:w-32 lg:w-36 xl:w-48" : ""
                        } outline-none phone-select-error md:w-32 lg:w-48 xl:w-48`}
                      colon={false}
                      rules={[requiredValidator()]}
                      validateTrigger={["onChange"]}
                    >
                      <PhoneCodeDropdown shouldUsePropsList={true} codes={phoneCodes} onChange={handleForm("phoneCode")} />
                    </Form.Item>
                  }
                  maxLength={15}
                  placeholder="Enter Phone Number"
                  onBlur={handleForm("phoneNumber")}
                />
              </Form.Item>
              </div>
              <Form.Item
                className="mb-0 mt-1"
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
            <div >
            {userConfig?.accountType === "Business" && mode ==='Add' &&
            <div className={`text-left payee-field relative mt-3 flex items-center gap-2`}>
                  <div className="">
                    <Form.Item name="isTradingAddress" className="!mb-0" colon={false}>
                      <AppCheckbox
                        checked={formData?.isTradingAddress}
                        onChange={handleForm("isTradingAddress")}
                        className="cursor-pointer"
                      />
                    </Form.Item>
                  </div>
              <span className="payee-label text-sm">Make This My Trading Address</span>
            </div>}
            </div>
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
