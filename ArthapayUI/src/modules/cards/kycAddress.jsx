import React, { useCallback, useEffect, useState } from "react";
import { connect, useSelector } from "react-redux";
import { Form, Input, Select } from "antd";
import moment from "moment";
import { getCountryTownLu, getKycSampleUrls, getAddressLU } from "./httpServices";
import FileUpload from "../../core/shared/file.upload";
import { errorToaster, successToaster } from "../../core/shared/toasters";
import { titleMapping } from "./service";
import { deriveErrorMessage } from "../../core/shared/deriveErrorMessage";
import { useTranslation } from "react-i18next";
import {
  documentNumberRegex,
  phoneNoRegex,
  validations,
  replaceExtraSpaces,
} from "../../core/shared/validations";
import AppSelect from "../../core/shared/appSelect";
import AppDefaults, { genderLookup } from "../../utils/app.config";
import ImagePreview from "../../core/shared/image.preview";
import AppDatePicker from "../../core/shared/appDatePicker";
import CustomButton from "../../core/button/button";
import CommonDrawer from "../../core/shared/drawer";
import ManageAddress from "../../core/profile/address.manage";
import PhoneCodeDropdown from "../../core/shared/phCodeDropdown";

const KycAdress = ({
  kycReqList,
  updateFormFieldValue,
  formData,
  fileLists,
  setFileLists,
  form,
  handleScrollTop,
  previewImages,
  setPreviewImages,
  isError,
  RightElement = true,
  applyCardKycInfo=null
}) => {
  const { Option } = Select;
  const [sampleUrls, setSampleUrls] = useState(null);
  const [isviewOpen, setIsviewOpen] = useState(false);
  const [imageurl, setImageurl] = useState(null);
  const [countryLookUp, setCountryLookUp] = useState();
  const [townLookUp, setTownLookUp] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [filteredCodeCountries, setFilteredCodeCountries] = useState([]);
  const [AddressLookUp, setAddressLookUp] = useState();
  const selectedAddress = useSelector((store) => store.applyCard?.selectedAddress?.data);
  const { t } = useTranslation();
  useEffect(() => {
    // as of now we are not using this API, but we can use it in future if required. // NOSONAR
    // getSampleUrls(); // NOSONAR
    getCountryLU();
    fetchAddressLU();
  }, []);

  const setGetCountryLU = (response) => {
    if (response) {
      const countryWithTowns = response?.countryWithTowns || [];
      setCountryLookUp(countryWithTowns);
      setFilteredCodeCountries(response?.phoneCodes || response?.PhoneCodes || []);
      if (formData?.country) {
        let _country = countryWithTowns?.find(
          (item) => item?.name === formData?.country
        );
        setTownLookUp(_country?.towns || _country?.details || []);
      }
    } else {
      handleScrollTop();
      isError(response);
    }
  };

  const getCountryLU = async () => {
    await getCountryTownLu(setGetCountryLU, isError);
  };

  const getSampleUrls = async () => { // NOSONAR
    await getKycSampleUrls((response) => setSampleUrls(response), isError);
  };

  const setFetchAddressLU = (response) => {
    if (response) {
      const addressId = applyCardKycInfo?.kyc?.address?.addressId;
      setAddressLookUp(response);
      updateFormFieldValue("addressId", addressId ? addressId : response[0]?.id);
    } else {
      handleScrollTop();
      isError(response);
    }
  };
  const fetchAddressLU = async () => {
    await getAddressLU(setFetchAddressLU, isError);
  };

  const viewImage = (type) => {
    let _url = sampleUrls[type];
    setIsviewOpen(true);
    setImageurl(_url);
  };

  const handleCancel = useCallback(() => {
    setIsviewOpen(false);
    setImageurl(null);
  }, []);

  const handleUploadChange = useCallback(
    (type, { fileList }) => {
      try {
        isError(null);
        const MAX_FILE_SIZE = 2 * 1024 * 1024;
        const allowedExtensions = ["png", "jpg", "jpeg", "pdf"];
        if (fileList[0]?.size > MAX_FILE_SIZE) {
          handleScrollTop();
          isError(t("cards.Messages.FILE_SIZE_EXCEEDS_LIMIT"));
          return;
        }
        const fileName = fileList[0]?.name;
        const fileNameParts = fileName.split(".");
        if (fileNameParts?.length > 2) {
          handleScrollTop();
          isError(t("cards.Messages.INVALID_DOUBLE_EXTENSION"));
          return;
        }
        const fileExtension = fileName.split(".").pop().toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
          handleScrollTop();
          isError(t("cards.Messages.INVALID_FILE_EXTENSION"));
          return;
        }
        setFileLists({ ...fileLists, [type]: fileList });
        if (fileList?.length > 0) {
          form.setFields([
            {
              name: type,
              errors: [],
            },
          ]);
        }
        const latestFile = fileList[fileList?.length - 1];
        if (latestFile && latestFile.status === "done") {
          successToaster({
            content: t("cards.Messages.UPLOAD_SUCCESS"),
            className: "custom-msg",
            duration: 3,
          });
          const imageUrl =
            latestFile.response?.url ||
            latestFile.response?.[0] ||
            URL.createObjectURL(latestFile.originFileObj);
          updateFormFieldValue(type, imageUrl);
          setFileLists({
            ...fileLists,
            [type]: [...fileList],
          });
          setPreviewImages((prevImages) => ({
            ...prevImages,
            [type]: imageUrl,
          }));
        } else if (latestFile.status === "error") {
          errorToaster({
            content: t("cards.Messages.UPLOAD_FAILED"),
            className: "custom-msg",
            duration: 3,
          });
        }
      } catch (error) {
        isError(deriveErrorMessage(error));
      }
    },
    [t, form, handleScrollTop, previewImages, fileLists, updateFormFieldValue]
  );

  const removeImage = useCallback(
    (type) => {
      updateFormFieldValue(type, null);
      setFileLists({
        ...fileLists,
        [type]: [],
      });
      setPreviewImages((prevImages) => ({ ...prevImages, [type]: "" }));
    },
    [fileLists, previewImages]
  );

  const handleChange = useCallback(
    (e) => {
      updateFormFieldValue(e.target.id, e.target.value);
    },
    [updateFormFieldValue]
  );

  const handleBlur = useCallback(
    (e) => {
      updateFormFieldValue(e.target.id, e.target.value?.trim());
    },
    [updateFormFieldValue]
  );

  const handleNameChange = useCallback(
    (e) => {
      updateFormFieldValue(e.target.id, replaceExtraSpaces(e.target.value));
    },
    [updateFormFieldValue]
  );

  const handleGenderChange = useCallback(
    (value) => {
      updateFormFieldValue("gender", value);
    },
    [updateFormFieldValue]
  );

  const handlePhoneNumberChange = useCallback(
    (e) => {
      updateFormFieldValue("phoneNo", e.target.value);
    },
    [updateFormFieldValue]
  );

  const handleMobileCodeChange = useCallback(
    (e) => {
      updateFormFieldValue("phoneCode", e);
    },
    [updateFormFieldValue]
  );

  const handleIdTypeChange = useCallback(
    (e) => {
      updateFormFieldValue("docType", e);
    },
    [updateFormFieldValue]
  );


  const handleCountry = useCallback(
    (e) => {
      updateFormFieldValue("country", e);
      updateFormFieldValue({ country: e, town: undefined });
      updateFormFieldValue("town", undefined);
      let _country = countryLookUp?.find((item) => item?.name === e);
      setTownLookUp(_country?.towns);
    },
    [countryLookUp, updateFormFieldValue, townLookUp]
  );
  const handleAddress = useCallback(
    (e) => {
      updateFormFieldValue("addressId", e);
    },
    [AddressLookUp, updateFormFieldValue]
  );
  const handleAddAddress = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);
    const handleKeyDown = useCallback((e) => {
      if (e.key === "e" || e.key === "E" || e.key === "+" || e.key === "-") {
        e.preventDefault();
      }
    }, []);

  const kycRequirementsDetails = {
    Address: (
      <div className="grid xl:grid-cols-2 md:grid-cols-2 lg:grid-cols-1 gap-6">
        <div className="text-left ">
          <Form.Item
            label={t("cards.applyCards.Select_Address")}
            name="addressId"
            rules={[{ required: true, message: t("cards.Is_required") }]}
            className="custom-select-float mb-0"
            colon={false}
          >
            <Select
              showSearch
              placeholder={t("cards.applyCards.Select_Address")}
              onChange={handleAddress}
              className=""
            >
              {AddressLookUp?.map((item) => (
                <Option key={item?.id} value={item?.id}>
                  {item?.favoriteName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>
      </div>
    ),
    FullName: (
      <div>
        <div className="">
          <div className="grid xl:grid-cols-2 md:grid-cols-2 lg:grid-cols-1 gap-6 basicinfo-form panel-form-items-bg">
            <div>
              <Form.Item
                className="mb-0"
                name="firstName"
                label={t("cards.applyCards.First_Name")}
                colon={false}
                required
                rules={[
                  { required: true, message: t("cards.Is_required") },
                  { whitespace: true, message: "Invalid First Name" },
                  validations.textValidator(
                    "First Name",
                    "alphaNumWithSpaceAndSpecialChars"
                  ),
                ]}
              >
                <Input
                  className="custom-input-field outline-0"
                  placeholder={t("cards.applyCards.Enter_First_Name")}
                  type="input"
                  maxLength={30}
                  onBlur={handleBlur}
                  onChange={handleNameChange}
                />
              </Form.Item>
            </div>
            <div>
              <Form.Item
                className="mb-0"
                name="middleName"
                label={t("cards.applyCards.Middle_Name")}
                colon={false}
                rules={[
                  { required: false, message: t("cards.Is_required") },
                  { whitespace: true, message: "Invalid Middle Name" },
                  validations.textValidator(
                    "Middle Name",
                    "alphaNumWithSpaceAndSpecialChars"
                  ),
                ]}
              >
                <Input
                  className="custom-input-field outline-0"
                  placeholder={t("cards.applyCards.Enter_Middle_Name")}
                  type="input"
                  maxLength={30}
                  onBlur={handleBlur}
                  onChange={handleNameChange}
                />
              </Form.Item>
            </div>
            <div>
              <Form.Item
                className="mb-0"
                name="lastName"
                label={t("cards.applyCards.Last_Name")}
                colon={false}
                rules={[
                  { required: true, message: t("cards.Is_required") },
                  { whitespace: true, message: "Invalid Last Name" },
                  validations.textValidator(
                    "Last Name",
                    "alphaNumWithSpaceAndSpecialChars"
                  ),
                ]}
              >
                <Input
                  className="custom-input-field outline-0"
                  placeholder={t("cards.applyCards.Enter_Last_Name")}
                  type="input"
                  maxLength={30}
                  onBlur={handleBlur}
                  onChange={handleNameChange}
                />
              </Form.Item>
            </div>
          </div>
        </div>
      </div>
    ),
    Basic: (
      <div className="grid xl:grid-cols-2 lg:grid-cols-1 md:grid-cols-1 gap-6 basicinfo-form panel-form-items-bg custom-cards-field">
        <div>
          <Form.Item
            className="mb-0"
            name="email"
            label={t("cards.applyCards.Email")}
            rules={[
              { required: true, message: t("cards.Is_required") },
              { whitespace: true, message: "Invalid Email" },
              validations.textValidator("email", "email"),
            ]}
            colon={false}
          >
            <Input
              className="custom-input-field outline-0"
              placeholder={t("cards.applyCards.Enter_Email")}
              type="input"
              maxLength={100}
              onBlur={handleBlur}
              onChange={handleChange}
            />
          </Form.Item>
        </div>
        <div className="flex country-form-item relative select-hover">
          <Form.Item
            name="phoneCode"
            className="mb-0 phoneno-select phone-field-error"
            label={t("cards.applyCards.Phone_Number")}
            colon={false}
            rules={[validations.requiredValidator()]}
            dependencies={['phoneNo']}
          >
            <PhoneCodeDropdown shouldUsePropsList={true} codes={filteredCodeCountries} className={"!w-40"} onChange={handleMobileCodeChange} />
          </Form.Item>
          <Form.Item
          className='mb-0 w-full'
            name="phoneNo"
            colon={false}
            rules={[
              validations.requiredValidator(),
              validations.regexValidator("phone number", phoneNoRegex, false),
            ]}
            dependencies={['phoneCode']}
          >
            <Input
              placeholder={t("cards.applyCards.Enter_Phone_Number")}
              // type="number"
              onKeyDown={handleKeyDown}
              onChange={handlePhoneNumberChange}
              className='bg-inputBg border border-dbkpiStroke text-lightWhite p-2 outline-0 rounded-l-none rounded h-[52px]'
              maxLength={12}
            />
          </Form.Item>
        </div>
        <div className="text-left ">
          <Form.Item
            label={t('cards.applyCards.Country')}
            name="country"
            rules={[{ required: true, message: t('cards.Is_required'), }]}
            className="custom-select-float mb-0"
            colon={false}
          >
            <AppSelect
              showSearch
              name="country"
              onChange={handleCountry}
              placeholder={t('cards.applyCards.Select_Country')}
              className=""
              maxLength={30}
              type="input"
              options={countryLookUp || []}
              fieldNames={{ label: "name", value: "name" }}
            />
          </Form.Item>
        </div>
        <div>
          <Form.Item
            className="mb-0"
            name="dob"
            label={t("cards.applyCards.Date_Of_Birth") + " (Future dates not allowed)"}
            rules={[
              { required: true, message: t("cards.Is_required") },
              {
                validator: (_, value) => {
                  const ageLimit = moment().subtract(18, "years");
                  return value && value.isAfter(ageLimit)
                    ? Promise.reject(
                      new Error("You must be 18 years or older")
                    )
                    : Promise.resolve();
                },
              },
            ]}
          >
            <AppDatePicker
              className="bg-transparent border-[1px] border-dbkpiStroke text-lightWhite p-2 rounded-5 outline-0 w-full"
              inputReadOnly={false}
              datesToDisable="futureAndCurrentDates"
            />
          </Form.Item>
        </div>
        <div>
          <Form.Item
            name="gender"
            label={t("cards.applyCards.Gender")}
            rules={[{ required: true, message: t("cards.Is_required") }]}
            className="mb-0"
          >
            <AppSelect
              className={""}
              allowClear
              placeholder="Select Gender"
              onSelect={handleGenderChange}
              options={genderLookup}
              fieldNames={{ label: "name", value: "code" }}
            />
          </Form.Item>
        </div>
      </div>
    ),
    PP: (
      <div className="">
        <div className="grid xl:grid-cols-2 md:grid-cols-2 lg:grid-cols-1 gap-6 basicinfo-form panel-form-items-bg">
          <div>
            <div className="text-left">
              <Form.Item
                label={t("cards.applyCards.Document_Type")}
                className="custom-select-float mb-0"
                name="docType"
                rules={[{ required: true, message: t("cards.Is_required") }]}
              >
                <Select
                  className=" "
                  placeholder="Select"
                  type="input"
                  onChange={handleIdTypeChange}
                >
                  <Option value="passport">Passport</Option>
                </Select>
              </Form.Item>
            </div>
          </div>
          <div>
            <Form.Item
              className="mb-0"
              name="docId"
              label={t("cards.applyCards.Document_Number")}
              required
              colon={false}
              rules={[
                { required: true, message: t("cards.Is_required") },
                { whitespace: true, message: "Invalid Document Number" },
                validations.regexValidator(
                  "document number",
                  documentNumberRegex
                ),
              ]}
            >
              <Input
                className="custom-input-field outline-0 uppercase placeholder:capitalize"
                placeholder={t("cards.applyCards.Enter_Document_Number")}
                type="input"
                maxLength={30}
                onBlur={handleBlur}
                onChange={handleChange}
              />
            </Form.Item>
          </div>
          <div className="md:col-span-2">
            <Form.Item
              name={"face"}
              className="payees-input quicklink-input  required-reverse"
              rules={[{ required: true, message: t("cards.Is_required") }]}
            >
              <div className="flex items-center justify-between mb-2 viewsmaple-image">
                {" "}
                <p className="ant-form-item-required mb-0 text-labelGrey text-sm font-medium">
                  {t("cards.applyCards.Face_Image")} (2MB)
                  <span className="text-requiredRed">*</span>
                </p>
                {sampleUrls?.faceImage && (
                  <a
                    className="m-0 !text-sm !font-medium !text-primaryColor"
                    onClick={() => viewImage("faceImage")}
                  >
                    {t("cards.applyCards.View_Sample_Image")}
                  </a>
                )}
              </div>
              <FileUpload
                name="face"
                fileList={fileLists.face}
                previewImage={previewImages.face}
                handleUploadChange={handleUploadChange}
                handleRemoveImage={removeImage}
                isImagesOnly={true}
              />
            </Form.Item>
          </div>
        </div>
      </div>
    ),
    PFC: (
      <div className="">
        <div className="grid xl:grid-cols-2 md:grid-cols-2 lg:grid-cols-1 gap-6 basicinfo-form panel-form-items-bg">
          <div>
            <div className="text-left">
              <Form.Item
                label={t("cards.applyCards.Document_Type")}
                className="custom-select-float mb-0"
                name="docType"
                rules={[{ required: true, message: t("cards.Is_required") }]}
              >
                <Select
                  className=" "
                  placeholder="Select"
                  type="input"
                  onChange={handleIdTypeChange}
                >
                  <Option value="passport">Passport</Option>
                </Select>
              </Form.Item>
            </div>
          </div>
          <div>
            <Form.Item
              className="mb-0"
              name="docId"
              label={t("cards.applyCards.Document_Number")}
              required
              colon={false}
              rules={[
                { required: true, message: t("cards.Is_required") },
                { whitespace: true, message: "Invalid Document Number" },
                validations.regexValidator(
                  "document number",
                  documentNumberRegex
                ),
              ]}
            >
              <Input
                className="custom-input-field outline-0 uppercase placeholder:capitalize"
                placeholder={t("cards.applyCards.Enter_Document_Number")}
                type="input"
                maxLength={30}
                onBlur={handleBlur}
                onChange={handleChange}
              />
            </Form.Item>
          </div>
          <div>
            <Form.Item
              className="mb-0"
              name="docExpiryDate"
              required
              label={t("cards.applyCards.Document_Expiry_Date") + " (Expiry must be in the future)"}
              rules={[{ required: true, message: t("cards.Is_required") }]}
            >
              <AppDatePicker
                className="bg-transparent border-[1px] border-dbkpiStroke text-lightWhite p-2 rounded-5 outline-0 w-full"
                datesToDisable="pastAndCurrentDates"
              />
            </Form.Item>
          </div>
          <div className="md:col-span-2">
            <Form.Item
              name={"frontDoc"}
              className="payees-input quicklink-input required-reverse"
              rules={[{ required: true, message: t("cards.Is_required") }]}
            >
              <div className="flex items-center justify-between mb-2 viewsmaple-image">
                <p className="ant-form-item-required mb-0 text-labelGrey text-sm font-medium">
                  {t("cards.applyCards.Front_Document")} (2MB){" "}
                  <span className="text-requiredRed">*</span>
                </p>
                {sampleUrls?.frontIDPhoto && (
                  <a
                    className="!text-primaryColor !text-sm !font-medium m-0"
                    onClick={() => viewImage("frontIDPhoto")}
                  >
                    {t("cards.applyCards.View_Sample_Image")}
                  </a>
                )}
              </div>
              <FileUpload
                name="frontDoc"
                fileList={fileLists.frontDoc}
                previewImage={previewImages.frontDoc}
                handleUploadChange={handleUploadChange}
                handleRemoveImage={removeImage}
                isImagesOnly={true}
              />
            </Form.Item>
          </div>
          <div className="md:col-span-2">
            <Form.Item
              name={"backDoc"}
              className="payees-input quicklink-input required-reverse"
              rules={[{ required: true, message: t("cards.Is_required") }]}
            >
              <div className="flex items-center justify-between mb-2 viewsmaple-image">
                <p className="ant-form-item-required mb-0 text-labelGrey text-sm font-medium">
                  {t("cards.applyCards.Back_Document")} (2MB){" "}
                  <span className="text-requiredRed">*</span>
                </p>
                {sampleUrls?.backIDPhoto && (
                  <a
                    className="!text-primaryColor !text-sm !font-medium m-0"
                    onClick={() => viewImage("backIDPhoto")}
                  >
                    {t("cards.applyCards.View_Sample_Image")}
                  </a>
                )}
              </div>
              <FileUpload
                name="backDoc"
                fileList={fileLists.backDoc}
                previewImage={previewImages.backDoc}
                handleUploadChange={handleUploadChange}
                handleRemoveImage={removeImage}
                isImagesOnly={true}
              />
            </Form.Item>
          </div>
          <div className="md:col-span-2">
            <Form.Item
              name={"mixDoc"}
              className="payees-input quicklink-input required-reverse"
              rules={[{ required: true, message: t("cards.Is_required") }]}
            >
              <div className="flex items-center justify-between mb-2 viewsmaple-image">
                <p className="ant-form-item-required mb-0 text-labelGrey text-sm font-medium">
                  {t("cards.applyCards.Hand_Holding_ID_Photo")} (2MB){" "}
                  <span className="text-requiredRed">*</span>
                </p>
                {sampleUrls?.mixedIDPhoto && (
                  <a
                    className="!text-primaryColor !text-sm !font-medium m-0"
                    onClick={() => viewImage("mixedIDPhoto")}
                  >
                    {t("cards.applyCards.View_Sample_Image")}
                  </a>
                )}
              </div>
              <FileUpload
                name="mixDoc"
                fileList={fileLists.mixDoc}
                previewImage={previewImages.mixDoc}
                handleUploadChange={handleUploadChange}
                handleRemoveImage={removeImage}
                isImagesOnly={true}
              />
            </Form.Item>
          </div>
          <div className="md:col-span-2">
            <Form.Item
              name={"face"}
              className="payees-input quicklink-input  required-reverse"
              rules={[{ required: true, message: t("cards.Is_required") }]}
            >
              <div className="flex items-center justify-between mb-2 viewsmaple-image">
                {" "}
                <p className="ant-form-item-required mb-0 text-labelGrey text-sm font-medium">
                  {t("cards.applyCards.Face_Image")} (2MB)
                  <span className="text-requiredRed">*</span>
                </p>
                {sampleUrls?.faceImage && (
                  <a
                    className="m-0 !text-sm !font-medium !text-primaryColor"
                    onClick={() => viewImage("faceImage")}
                  >
                    {t("cards.applyCards.View_Sample_Image")}
                  </a>
                )}
              </div>
              <FileUpload
                name="face"
                fileList={fileLists.face}
                previewImage={previewImages.face}
                handleUploadChange={handleUploadChange}
                handleRemoveImage={removeImage}
                isImagesOnly={true}
              />
            </Form.Item>
          </div>
        </div>
      </div>
    ),
    PB: (
      <div className="">
        <div className="grid xl:grid-cols-2 md:grid-cols-2 lg:grid-cols-1 gap-6 basicinfo-form panel-form-items-bg">
          <div>
            <Form.Item
              className="mb-0"
              name="docId"
              label={t("cards.applyCards.Document_Number")}
              required
              colon={false}
              rules={[
                { required: true, message: t("cards.Is_required") },
                { whitespace: true, message: "Invalid Document Number" },
                validations.regexValidator(
                  "document number",
                  documentNumberRegex
                ),
              ]}
            >
              <Input
                className="custom-input-field outline-0 uppercase placeholder:capitalize"
                placeholder={t("cards.applyCards.Enter_Document_Number")}
                type="input"
                maxLength={30}
                onBlur={handleBlur}
                onChange={handleChange}
              />
            </Form.Item>
          </div>
          <div className="md:col-span-2">
            <Form.Item
              name={"biomatricDoc"}
              className="payees-input quicklink-input required-reverse"
              rules={[{ required: true, message: t("cards.Is_required") }]}
            >
              <div className="flex items-center justify-between mb-2 viewsmaple-image">
                <p className="ant-form-item-required mb-0 text-labelGrey text-sm font-medium">
                  {t("cards.applyCards.Biometric_Document")} (2MB){" "}
                  <span className="text-requiredRed">*</span>
                </p>
                {sampleUrls?.biomatricIDPhoto && (
                  <a
                    className="!text-primaryColor !text-sm !font-medium m-0"
                    onClick={() => viewImage("biomatricIDPhoto")}
                  >
                    {t("cards.applyCards.View_Sample_Image")}
                  </a>
                )}
              </div>
              <FileUpload
                name="biomatricDoc"
                fileList={fileLists.biomatricDoc}
                previewImage={previewImages.biomatricDoc}
                handleUploadChange={handleUploadChange}
                handleRemoveImage={removeImage}
                isImagesOnly={true}
              />
            </Form.Item>
          </div>
        </div>
      </div>
    ),
    PPHS: (
      <div className="">
        <div className="grid xl:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 basicinfo-form panel-form-items-bg">
          <div className="">
            <Form.Item
              name={"handHoldingIDPhoto"}
              className="payees-input quicklink-input required-reverse"
              rules={[{ required: true, message: t("cards.Is_required") }]}
            >
              <div className="flex items-center justify-between mb-2 viewsmaple-image">
                <p className="ant-form-item-required mb-0 text-labelGrey text-sm font-medium">
                  {t("cards.applyCards.Hand_Holding_ID_Photo")} (2MB)
                  <span className="text-requiredRed">* </span>
                </p>
                {sampleUrls?.handHoldingIDPhoto && (
                  <a
                    className="m-0 !text-sm !font-medium !text-primaryColor"
                    onClick={() => viewImage("handHoldingIDPhoto")}
                  >
                    {t("cards.applyCards.View_Sample_Image")}
                  </a>
                )}
              </div>
              <FileUpload
                name="handHoldingIDPhoto"
                fileList={fileLists.handHoldingIDPhoto}
                previewImage={previewImages.handHoldingIDPhoto}
                handleUploadChange={handleUploadChange}
                handleRemoveImage={removeImage}
                isImagesOnly={true}
              />
            </Form.Item>
          </div>
          <div>
            <Form.Item
              name={"signImage"}
              className="payees-input quicklink-input required-reverse"
              rules={[{ required: true, message: t("cards.Is_required") }]}
            >
              <div className="flex items-center justify-between mb-2 viewsmaple-image">
                {" "}
                <p className="ant-form-item-required mb-0 text-labelGrey text-sm font-medium">
                  {t("cards.freeze.Sign_Photo")}(2MB)
                  <span className="text-requiredRed">*</span>
                </p>
                {sampleUrls?.signPhoto && (
                  <a
                    className="m-0 !text-sm !font-medium !text-primaryColor"
                    onClick={() => viewImage("signPhoto")}
                  >
                    {t("cards.applyCards.View_Sample_Image")}
                  </a>
                )}
              </div>
              <FileUpload
                name="signImage"
                fileList={fileLists.signImage}
                previewImage={previewImages.signImage}
                handleUploadChange={handleUploadChange}
                handleRemoveImage={removeImage}
                isImagesOnly={true}
              />
            </Form.Item>
          </div>
          <div>
            <Form.Item
              name={"faceImage"}
              className="payees-input quicklink-input  required-reverse"
              rules={[{ required: true, message: t("cards.Is_required") }]}
            >
              <div className="flex items-center justify-between mb-2 viewsmaple-image">
                {" "}
                <p className="ant-form-item-required mb-0 text-labelGrey text-sm font-medium">
                  {t("cards.applyCards.Face_Image")} (2MB)
                  <span className="text-requiredRed">*</span>
                </p>
                {sampleUrls?.faceImage && (
                  <a
                    className="m-0 !text-sm !font-medium !text-primaryColor"
                    onClick={() => viewImage("faceImage")}
                  >
                    {t("cards.applyCards.View_Sample_Image")}
                  </a>
                )}
              </div>
              <FileUpload
                name="faceImage"
                fileList={fileLists.faceImage}
                previewImage={previewImages.faceImage}
                handleUploadChange={handleUploadChange}
                handleRemoveImage={removeImage}
                isImagesOnly={true}
              />
            </Form.Item>
          </div>
          <div>
            <Form.Item
              name={"idImage"}
              className="payees-input quicklink-input  required-reverse"
              rules={[{ required: true, message: t("cards.Is_required") }]}
            >
              <div className="flex items-center justify-between mb-2 viewsmaple-image">
                {" "}
                <p className="ant-form-item-required mb-0 text-labelGrey text-sm font-medium">
                  {t("cards.applyCards.ID_Image")} (2MB)
                  <span className="text-requiredRed">*</span>
                </p>
                {sampleUrls?.idImage && (
                  <a
                    className="m-0 !text-sm !font-medium !text-primaryColor"
                    onClick={() => viewImage("idImage")}
                  >
                    {t("cards.applyCards.View_Sample_Image")}
                  </a>
                )}
              </div>
              <FileUpload
                name="idImage"
                fileList={fileLists.idImage}
                previewImage={previewImages.idImage}
                handleUploadChange={handleUploadChange}
                handleRemoveImage={removeImage}
                isImagesOnly={true}
              />
            </Form.Item>
          </div>
        </div>
      </div>
    ),

    // previous version
    FullNameOnly: (
      <div className="grid xl:grid-cols-2 md:grid-cols-2 lg:grid-cols-1 gap-6 basicinfo-form panel-form-items-bg">
        <div>
          <Form.Item
            className="mb-0"
            name="firstName"
            label={t("cards.applyCards.First_Name")}
            colon={false}
            required
            rules={[
              { required: true, message: t("cards.Is_required") },
              { whitespace: true, message: "Invalid First Name" },
              validations.textValidator(
                "First Name",
                "alphaNumWithSpaceAndSpecialChars"
              ),
            ]}
          >
            <Input
              className="custom-input-field outline-0"
              placeholder={t("cards.applyCards.Enter_First_Name")}
              type="input"
              maxLength={30}
              onBlur={handleBlur}
              onChange={handleNameChange}
            />
          </Form.Item>
        </div>
        <div>
          <Form.Item
            className="mb-0"
            name="lastName"
            label={t("cards.applyCards.Last_Name")}
            colon={false}
            rules={[
              { required: true, message: t("cards.Is_required") },
              { whitespace: true, message: "Invalid Last Name" },
              validations.textValidator(
                "Last Name",
                "alphaNumWithSpaceAndSpecialChars"
              ),
            ]}
          >
            <Input
              className="custom-input-field outline-0"
              placeholder={t("cards.applyCards.Enter_Last_Name")}
              type="input"
              maxLength={30}
              onBlur={handleBlur}
              onChange={handleNameChange}
            />
          </Form.Item>
        </div>
      </div>
    ),
    comms: (
      <div className="grid xl:grid-cols-2 lg:grid-cols-1 md:grid-cols-1 gap-6 basicinfo-form panel-form-items-bg">
        <div className="flex country-form-item relative select-hover">
          <Form.Item
            name="phoneCode"
            className="mb-0 phoneno-select phone-field-error"
            label={t("cards.applyCards.Phone_Number")}
            colon={false}
            rules={[validations.requiredValidator()]}
            dependencies={['phoneNo']}
          >
            <PhoneCodeDropdown shouldUsePropsList={true} codes={filteredCodeCountries} className={"!w-40"} onChange={handleMobileCodeChange} />
          </Form.Item>
          <Form.Item
          className='mb-0 w-full'
            name="phoneNo"
            colon={false}
            rules={[
              validations.requiredValidator(),
              validations.regexValidator("phone number", phoneNoRegex, false),
            ]}
            dependencies={['phoneCode']}
          >
            <Input
              placeholder={t("cards.applyCards.Enter_Phone_Number")}
              // type="number"
              onKeyDown={handleKeyDown}
              onChange={handlePhoneNumberChange}
              className="bg-inputBg border border-dbkpiStroke text-lightWhite p-2 outline-0 rounded-l-none rounded h-[52px]"
              maxLength={12}
            />
          </Form.Item>
        </div>
        <div>
          <Form.Item
            className="mb-0"
            name="email"
            label={t("cards.applyCards.Email")}
            rules={[
              { required: true, message: t("cards.Is_required") },
              { whitespace: true, message: "Invalid Email" },
              validations.textValidator("email", "email"),
            ]}
            colon={false}
          >
            <Input
              className="custom-input-field outline-0"
              placeholder={t("cards.applyCards.Enter_Email")}
              type="input"
              maxLength={100}
              onBlur={handleBlur}
              onChange={handleChange}
            />
          </Form.Item>
        </div>
      </div>
    ),
    passportonly: (
      <div className="">
        <div className="grid xl:grid-cols-2 md:grid-cols-2 lg:grid-cols-1 gap-6 basicinfo-form panel-form-items-bg">
          <div>
            <div className="">
              <Form.Item
                className="custom-select-float mb-0"
                name="docType"
                rules={[{ required: true, message: t("cards.Is_required") }]}
              >
                <Select
                  placeholder="Select"
                  type="input"
                  onChange={handleIdTypeChange}
                >
                  <Option value="passport">Passport</Option>
                </Select>
              </Form.Item>
            </div>
          </div>
          <div>
            <Form.Item
              className="mb-0"
              name="idNumber"
              label={t("cards.applyCards.Document_Number")}
              colon={false}
              required
              rules={[
                { required: true, message: t("cards.Is_required") },
                { whitespace: true, message: "Invalid Document Number" },
                validations.regexValidator(
                  "document number",
                  documentNumberRegex
                ),
              ]}
            >
              <Input
                className="custom-input-field outline-0 uppercase placeholder:capitalize"
                placeholder={t("cards.applyCards.Enter_Document_Number")}
                type="input"
                maxLength={30}
                onBlur={handleBlur}
                onChange={handleChange}
              />
            </Form.Item>
          </div>
        </div>
      </div>
    ),
    Passport: (
      <div className="">
        <div className="grid xl:grid-cols-2 md:grid-cols-2 lg:grid-cols-1 gap-6 basicinfo-form panel-form-items-bg">
          <div>
            <div className="text-left">
              <Form.Item
                label={t("cards.applyCards.Document_Type")}
                className="custom-select-float mb-0"
                name="docType"
                rules={[{ required: true, message: t("cards.Is_required") }]}
              >
                <Select
                  className=" "
                  placeholder="Select"
                  type="input"
                  onChange={handleIdTypeChange}
                >
                  <Option value="passport">Passport</Option>
                </Select>
              </Form.Item>
            </div>
          </div>
          <div>
            <Form.Item
              className="mb-0"
              name="idNumber"
              label={t("cards.applyCards.Document_Number")}
              required
              colon={false}
              rules={[
                { required: true, message: t("cards.Is_required") },
                { whitespace: true, message: "Invalid Document Number" },
                validations.regexValidator(
                  "document number",
                  documentNumberRegex
                ),
              ]}
            >
              <Input
                className="custom-input-field outline-0 uppercase placeholder:capitalize"
                placeholder={t("cards.applyCards.Enter_Document_Number")}
                type="input"
                maxLength={30}
                onBlur={handleBlur}
                onChange={handleChange}
              />
            </Form.Item>
          </div>
          <div>
            <Form.Item
              className="mb-0"
              name="docExpiryDate"
              required
              label={t("cards.applyCards.Document_Expiry_Date") + " (Expiry must be in the future)"}
              rules={[{ required: true, message: t("cards.Is_required") }]}
            >
              <AppDatePicker
                className="bg-transparent border-[1px] border-dbkpiStroke text-lightWhite p-2 rounded-5 outline-0 w-full"
                datesToDisable="pastAndCurrentDates"
              />
            </Form.Item>
          </div>
          <div className="md:col-span-2">
            <Form.Item
              name={"frontDoc"}
              className="payees-input quicklink-input required-reverse"
              rules={[{ required: true, message: t("cards.Is_required") }]}
            >
              <div className="flex items-center justify-between mb-2 viewsmaple-image">
                <p className="ant-form-item-required mb-0 text-labelGrey text-sm font-medium">
                  {t("cards.applyCards.Front_Document")} (2MB){" "}
                  <span className="text-requiredRed">*</span>
                </p>
                {sampleUrls?.frontIDPhoto && (
                  <a
                    className="!text-primaryColor !text-sm !font-medium m-0"
                    onClick={() => viewImage("frontIDPhoto")}
                  >
                    {t("cards.applyCards.View_Sample_Image")}
                  </a>
                )}
              </div>
              <FileUpload
                name="frontDoc"
                fileList={fileLists.frontDoc}
                previewImage={previewImages.frontDoc}
                handleUploadChange={handleUploadChange}
                handleRemoveImage={removeImage}
                isImagesOnly={true}
              />
            </Form.Item>
          </div>
        </div>
      </div>
    ),
    handedpassport: (
      <div className="">
        <Form.Item
          name={"handHoldingImage"}
          className="payees-input quicklink-input required-reverse"
          rules={[{ required: true, message: t("cards.Is_required") }]}
        >
          <div className="flex items-center justify-between mb-2 viewsmaple-image">
            <p className="ant-form-item-required mb-0 text-labelGrey text-sm font-medium">
              {t("cards.applyCards.Hand_Holding_ID_Photo")} (2MB)
              <span className="text-requiredRed">* </span>
            </p>
            {sampleUrls?.handHoldingImage && (
              <a
                className="m-0 !text-sm !font-medium !text-primaryColor"
                onClick={() => viewImage("handHoldingImage")}
              >
                {t("cards.applyCards.View_Sample_Image")}
              </a>
            )}
          </div>
          <FileUpload
            name="handHoldingImage"
            fileList={fileLists.handHoldingImage}
            previewImage={previewImages.handHoldingImage}
            handleUploadChange={handleUploadChange}
            handleRemoveImage={removeImage}
            isImagesOnly={true}
          />
        </Form.Item>
      </div>
    ),
    Face: (
      <div>
        <Form.Item
          name={"faceImage"}
          className="payees-input quicklink-input  required-reverse"
          rules={[{ required: true, message: t("cards.Is_required") }]}
        >
          <div className="flex items-center justify-between mb-2 viewsmaple-image">
            {" "}
            <p className="ant-form-item-required mb-0 text-labelGrey text-sm font-medium">
              {t("cards.applyCards.Face_Image")} (2MB)
              <span className="text-requiredRed">*</span>
            </p>
            {sampleUrls?.faceImage && (
              <a
                className="m-0 !text-sm !font-medium !text-primaryColor"
                onClick={() => viewImage("faceImage")}
              >
                {t("cards.applyCards.View_Sample_Image")}
              </a>
            )}
          </div>
          <FileUpload
            name="faceImage"
            fileList={fileLists.faceImage}
            previewImage={previewImages.faceImage}
            handleUploadChange={handleUploadChange}
            handleRemoveImage={removeImage}
            isImagesOnly={true}
          />
        </Form.Item>
      </div>
    ),
    sign: (
      <div>
        <Form.Item
          name={"signature"}
          className="payees-input quicklink-input required-reverse"
          rules={[{ required: true, message: t("cards.Is_required") }]}
        >
          <div className="flex items-center justify-between mb-2 viewsmaple-image">
            {" "}
            <p className="ant-form-item-required mb-0 text-labelGrey text-sm font-medium">
              {t("cards.freeze.Sign_Photo")}(2MB)
              <span className="text-requiredRed">*</span>
            </p>
            {sampleUrls?.signPhoto && (
              <a
                className="m-0 !text-sm !font-medium !text-primaryColor"
                onClick={() => viewImage("signPhoto")}
              >
                {t("cards.applyCards.View_Sample_Image")}
              </a>
            )}
          </div>
          <FileUpload
            name="signature"
            fileList={fileLists.signature}
            previewImage={previewImages.signature}
            handleUploadChange={handleUploadChange}
            handleRemoveImage={removeImage}
            isImagesOnly={true}
          />
        </Form.Item>
      </div>
    ),
    biometric: (
      <div className="">
        <Form.Item
          name={"biometric"}
          className="payees-input quicklink-input required-reverse"
          rules={[{ required: true, message: t("cards.Is_required") }]}
        >
          <div className="flex items-center justify-between mb-2 viewsmaple-image">
            {" "}
            <p className="ant-form-item-required mb-0 text-labelGrey text-sm font-medium">
              {t("cards.applyCards.biometric")} (2MB)
              <span className="text-requiredRed">*</span>
            </p>
            {sampleUrls?.signPhoto && (
              <a
                className="m-0 !text-sm! font-medium !text-primaryColor"
                onClick={() => viewImage("signPhoto")}
              >
                {t("cards.applyCards.View_Sample_Image")}
              </a>
            )}
          </div>
          <FileUpload
            name="biometric"
            fileList={fileLists.biometric}
            previewImage={previewImages.biometric}
            handleUploadChange={handleUploadChange}
            handleRemoveImage={removeImage}
            isImagesOnly={true}
          />
        </Form.Item>
      </div>
    ),
    FullAddress: (
      <div>
        <div className="grid xl:grid-cols-2 md:grid-cols-2 lg:grid-cols-1 gap-6 basicinfo-form panel-form-items-bg">
          <div className="text-left">
            <Form.Item
              label={t("cards.applyCards.Address")}
              name="addressId"
              rules={[{ required: true, message: t("cards.Is_required") }]}
              className="custom-select-float mb-0"
              colon={false}
            >
              <Select
                showSearch
                placeholder={"Select Address"}
                onChange={handleAddress}
                className=""
              >
                {AddressLookUp?.map((item) => (
                  <Option key={item?.id} value={item?.id}>
                    {item?.favoriteName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        </div>
      </div>
    ),
    EmergencyContact: (
      <div className="">
        <div className="grid xl:grid-cols-2 md:grid-cols-2 lg:grid-cols-1 gap-6 basicinfo-form panel-form-items-bg">
          <Form.Item
            className="mb-0"
            name="emergencyContactName"
            label={t("cards.applyCards.emergencyContactName")}
            colon={false}
            required
            rules={[
              { required: true, message: t("cards.Is_required") },
              { whitespace: true, message: "Invalid Name" },
              validations.textValidator(
                "Name",
                "alphaNumWithSpaceAndSpecialChars"
              ),
            ]}
          >
            <Input
              className="custom-input-field outline-0"
              placeholder={t("cards.applyCards.enterEmergencyContactName")}
              type="input"
              maxLength={30}
              onBlur={handleBlur}
              onChange={handleChange}
            />
          </Form.Item>
        </div>
      </div>
    ),
  };
  const onDrawerClose = useCallback(() => {
    setIsDrawerOpen(false);
    fetchAddressLU();
  }, []);
  return (
    <>
      {kycReqList.map((kycKey) => (
        <div key={kycKey} className="">
          <div className="flex gap-4 items-center mb-5 mt-4">
            <h2 className="text-xl font-semibold text-titleColor  mb-0 capitalize">
              {titleMapping[kycKey]}
            </h2>
            {RightElement && titleMapping[kycKey] === "Address Information" && <div>
              <CustomButton
                type="normal"
                onClick={handleAddAddress}
                className="secondary-outline h-full flex gap-2 items-center"

              >Add <span className="icon btn-add shrink-0 ml-2 "></span></CustomButton>
            </div>}
          </div>
          {kycRequirementsDetails[kycKey]}
        </div>
      ))}
      {isviewOpen && (
        <ImagePreview
          src={imageurl}
          isOpen={isviewOpen}
          displayDownload={false}
          onClose={handleCancel}
        />
      )}

      <CommonDrawer
        isOpen={isDrawerOpen}
        title={'Add Address'}
        onClose={onDrawerClose}
      >
        <ManageAddress
          isDrawer={isDrawerOpen}
          address={selectedAddress}
          showHeader={false}
          onSuccess={onDrawerClose}
          onCancel={onDrawerClose}
          formMode={"Add"}
          addressId={AppDefaults.GUID_ID}
        />
      </CommonDrawer>
    </>
  );
};
const connectStateToProps = ({ userConfig, applyCard }) => {
  return {
    user: userConfig.details,
  };
};

export default connect(connectStateToProps)(KycAdress);
