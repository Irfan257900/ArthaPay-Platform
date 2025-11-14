import React, { useCallback, useEffect, useState } from 'react';
import { Form, Input, Radio, Alert } from 'antd';
import CustomButton from '../../../button/button';
import moment from 'moment';
import PhoneCodeDropdown from '../../../shared/phCodeDropdown';
import { numberValidateContentRules, phoneNoRegex, replaceExtraSpaces, validateContentRules, validateDOB, validateEmail, validations } from '../../../shared/validations';
import { useSelector } from 'react-redux';
import { NumericFormat } from 'react-number-format';
import DocumentUploadForm from './document.details';
import AppDefaults from '../../../../utils/app.config';
import CompanyDataloader from '../../../skeleton/kyb.loaders/companydata.loader';
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE, checkFileName, checkFileSize, checkValidExtension, fileValidations, updateFileList } from '../../../shared/fileUploadVerifications';
import AppDatePicker from '../../../shared/appDatePicker';
import { getKybDetails, sendRepresentiveDetails, sendShareHolderDetails, sendUBODetails } from '../../http.services';
import { decryptAES, encryptAES } from '../../../shared/encrypt.decrypt';
import AppSelect from '../../../shared/appSelect';
const { TextArea } = Input;

const UBODrawerForm = ({ onSave, onCancel, formData, drawerVisible, currentState, type }) => {
  const [form] = Form.useForm();
  const useDivRef = React.useRef(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [error, setError] = useState(null);
  const userProfileInfo = useSelector(state => state.userConfig.details);
  const [btnLoader, setBtnLoader] = useState(false);
  const [loader, setLoader] = useState(false);
  const kycExcemptionObj = useSelector(
    (state) => state.kybStore.kycExcemtionObj
  );
  const { data: lookups } = useSelector(state => state.kybStore.lookups)
  const [hiddenFields, setHiddenFields] = useState([]);

  const isFieldHidden = (fieldName) => hiddenFields?.includes(fieldName);
  const [fileLists, setFileLists] = useState({
    frontImage: [],
    backImage: [],
  });
  const [previewImages, setPreviewImages] = useState({
    frontImage: "",
    backImage: "",
  });
  const [pdfPreview, setPdfPreview] = useState({
    frontImage: null,
    backImage: null,
  });
  useEffect(() => {
    if (kycExcemptionObj) {
      const step3Fields = kycExcemptionObj.step3?.split(",") || [];
      setHiddenFields(step3Fields);
    }
  }, [kycExcemptionObj]);
  const getFileNameFromUrl = (url) => {
    const parsedUrl = new URL(url);
    return parsedUrl.pathname.split("/").pop();
  };
  const handleScrollTop = () => {
    useDivRef.current.scrollIntoView(0, 0);
  }
  useEffect(() => {
    if (!formData) {
      form.resetFields();
      return;
    }
    const formattedDob = getFormattedDob(formData.dob);
    const docDetails = formData.docDetails || {};
    const { frontImage, backImage } = docDetails;

    form.setFieldsValue({
      ...formData,
      phoneCode: decryptAES(formData?.phoneCode),
      phoneNumber: decryptAES(formData?.phoneNumber),
      email: decryptAES(formData?.email),
      dob: formattedDob,
      type: docDetails.type,
      docId: decryptAES(docDetails.number) || "",
      docExpiryDate: docDetails.expiryDate ? moment(docDetails.expiryDate, "YYYY-MM-DD") : null,
      frontImage,
      backImage,
    });

    setSelectedPosition(formData.uboPosition || null);

    const frontdocName = frontImage ? getFileNameFromUrl(frontImage) : '';
    const backdocImageName = backImage ? getFileNameFromUrl(backImage) : '';

    setFileLists({
      frontImage: frontImage ? createFileList(frontImage, frontdocName) : [],
      backImage: backImage ? createFileList(backImage, backdocImageName) : [],
    });

    setPreviewImages({
      frontImage,
      backImage,
    });
  }, [formData, drawerVisible]);
  const getFormattedDob = (dob) => {
    return dob && moment(dob).isValid() ? moment(dob) : null;
  };
  const createFileList = (url, fileName) => [
    {
      name: fileName,
      status: 'done',
      url: url,
    },
  ];

  const handleDocumentChange = useCallback(() => {
    setFileLists((prevFileLists) => ({
      ...prevFileLists,
      frontImage: [],
      backImage: [],
    }));

    form.setFieldsValue({
      ["frontImage"]: null,
      ["backImage"]: null,
      ["docId"]: null,
      ["docExpiryDate"]: null,
    });
    setPreviewImages((prevImages) => ({
      ...prevImages,
      frontImage: "",
      backImage: "",
    }));
    setPdfPreview((prev) => ({
      ...prev,
      frontImage: "",
      backImage: "",
    }));
  }, [])

  const handleChange = useCallback((e) => {
    form.resetFields();
    handleDocumentChange();
    setSelectedPosition(e.target.value);
  }, []);
  const handlePhoneNumberInput = useCallback((e) => {
    if (e.target.value.length > 16) {
      e.target.value = e.target.value.slice(0, 16);
    }
  }, []);
  const handleUploadChange = useCallback((type, { fileList }) => {
    setError(null);

    const file = fileList[0]?.name || "";
    const fileExtension = file?.split(".").pop().toLowerCase();

    const isValidFileExtension = checkValidExtension(fileExtension, ALLOWED_EXTENSIONS);
    if (!isValidFileExtension) {
      setError(fileValidations.fileExtension);
      handleScrollTop();
      return;
    }
    const isFileSizeValid = checkFileSize(fileList[0]?.size, MAX_FILE_SIZE);
    if (!isFileSizeValid) {
      setError(fileValidations.fileSize);
      handleScrollTop();
      return;
    }
    const isValidFileName = checkFileName(fileList[0]?.name);
    if (!isValidFileName) {
      setError(fileValidations.fileName);
      handleScrollTop();
      return;
    }
    const updatedFileList = updateFileList(fileList, type);
    setFileLists((prevFileLists) => ({
      ...prevFileLists,
      [type]: updatedFileList,
    }));
    handleFilePreview(fileList, type);
  }, []);
  const handleFilePreview = (fileList, type) => {
    const latestFile = fileList[fileList.length - 1];
    if (latestFile?.status === "done") {
      if (latestFile.type.startsWith("image/")) {
        const imageUrl = latestFile?.response[0] || URL.createObjectURL(latestFile?.originFileObj);
        form.setFieldsValue({ [type]: imageUrl });
        setPreviewImages((prevImages) => ({ ...prevImages, [type]: imageUrl }));
      } else if (latestFile.type === "application/pdf") {
        const pdfUrl = latestFile?.response[0] || URL.createObjectURL(latestFile?.originFileObj);
        setPdfPreview((prev) => ({ ...prev, [type]: pdfUrl }));
        form.setFieldsValue({ [type]: pdfUrl });
        setPreviewImages((prevImages) => ({ ...prevImages, [type]: pdfUrl }));
      }
    } else if (latestFile?.status === "error") {
      setError("Upload failed. Please try again.");
    }
  };
  const removeImage = useCallback((type) => {
    setFileLists((prevFileLists) => ({
      ...prevFileLists,
      [type]: [],
    }));
    form.setFieldsValue({ [type]: null });
    setPreviewImages((prevImages) => ({ ...prevImages, [type]: "" }));
    setPdfPreview((prev) => ({ ...prev, [type]: null }));
  }, []);

  const handleCancel = useCallback(() => {
    form.resetFields();
    onCancel();
  }, []);
  const onSuccessData = () => {
    form.resetFields();
  }
  const onSuccess = async () => {
    await getKybDetails(
      setLoader,
      onSuccessData,
      setError
    );
  }
  const onFinish = useCallback(async (values) => {
    const method = formData?.id ? true : false;
    const obj = {
      id: formData?.id || "00000000-0000-0000-0000-000000000000",
      uboPosition: type,
      firstName: values.firstName,
      lastName: values.lastName,
      middleName: values.middleName,
      dob: values?.dob.format("YYYY-MM-DD") || null,
      phoneCode: encryptAES(values?.phoneCode),
      phoneNumber: encryptAES(values?.phoneNumber),
      email: encryptAES(values?.email),
      country: values?.country,
      shareHolderPercentage: values?.shareHolderPercentage,
      positionWithCompany: values?.positionWithCompany,
      note: values?.note,
      recordStatus: formData?.id ? "Modified" : "Added",
      docDetails: {
        "id": formData?.docDetails?.id ? formData?.docDetails?.id : "00000000-0000-0000-0000-000000000000",
        "frontImage": values?.frontImage,
        "backImage": values?.backImage,
        "type": values?.type,
        "number": encryptAES(values?.docId),
        "expiryDate": values?.docExpiryDate ? moment(values.docExpiryDate).format("YYYY-MM-DD") : null,
      }
    };
    if (currentState === 'Review' && type === 'ubo') {
      const objList = [];
      objList.push(obj);
      await sendUBODetails(setBtnLoader, onSuccess, setError, { details: objList, method })
    } else if (currentState === 'Review' && type === 'shareholder') {
      const objList = [];
      objList.push(obj);
      await sendShareHolderDetails(setBtnLoader, onSuccess, setError, { details: objList, method })
    } else if (currentState === 'Review' && type === 'representative') {
      const objList = [];
      objList.push(obj);
      await sendRepresentiveDetails(setBtnLoader, onSuccess, setError, { details: objList, method })
    }

    onSave(obj);
    form.resetFields();
  }, [formData, currentState, userProfileInfo, onSave, type]);
  const clearErrors = useCallback(() => {
    setError(null)
  }, []);
  const handleInputBlur = useCallback((e) => {
    const { name, value } = e.target;
    form.setFieldValue(name, replaceExtraSpaces(value))
  }, [form])
  const handleFieldChange = useCallback(
    (fieldName) => (e) => {
      const value = e?.target ? e.target.value : e;
      form.setFieldValue(fieldName, value);
    },
    [form]
  );
   const handleKeyDown = useCallback((e) => {
    if (e.key === "e" || e.key === "E" || e.key === "+" || e.key === "-") {
      e.preventDefault();
    }
  }, []);

  const handleDocumentFieldChange = useCallback((selectedType) => {
    const docDetails = formData?.docDetails || {};

    if (docDetails.type === selectedType) {
      const frontdocName = docDetails.frontImage ? getFileNameFromUrl(docDetails.frontImage) : '';
      const backdocImageName = docDetails.backImage ? getFileNameFromUrl(docDetails.backImage) : '';

      setFileLists({
        frontImage: docDetails.frontImage ? createFileList(docDetails.frontImage, frontdocName) : [],
        backImage: docDetails.backImage ? createFileList(docDetails.backImage, backdocImageName) : [],
      });
      setPreviewImages({
        frontImage: docDetails.frontImage,
        backImage: docDetails.backImage,
      });
      setPdfPreview((prev) => ({
        ...prev,
        frontImage: docDetails.frontImage,
        backImage: docDetails.backImage,
      }));

      form.setFieldsValue({
        docExpiryDate: docDetails.expiryDate ? moment(docDetails.expiryDate, "YYYY-MM-DD") : null,
        docId: docDetails.number || "",
        frontImage: docDetails.frontImage || null,
        backImage: docDetails.backImage || null,
      });
    } else {
      handleDocumentChange();
    }
  }, [form, formData, getFileNameFromUrl, createFileList, handleDocumentChange]);

  return (
    <div>
      <div ref={useDivRef}></div>
      {loader && <CompanyDataloader />}
      {error !== null && (
        <div className="alert-flex">
          <Alert
            type="error"
            description={error}
            onClose={clearErrors}
            showIcon
            className='items-center'

          />
          <button className="icon sm alert-close" onClick={clearErrors}></button>
        </div>
      )}
      {/* <h4 className='text-left text-lightWhite text-sm font-semibold'>
        Choose the UBO's position within the company:
      </h4>
      <p className='text-xs font-normal text-descriptionGreyTwo mb-7'>
        Provide information about the UBOs that hold 25% or more of the company <br />
        We will send them an email asking them to go through the KYC/AML procedure.
      </p> */}
      <Form form={form} onFinish={onFinish}
        scrollToFirstError={{
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        }}>
        {/* <div className='basicinfo-radioform'>
          <Form.Item
            name="uboPosition"
            initialValue="Shareholder"
            rules={[{ required: true, message: 'Is required' }]}
          >
            <Radio.Group>
              <div className="flex items-center gap-[10px]">
                {['Shareholder', 'Director'].map((position) => (
                  <div key={position} className="flex items-center gap-[10px]">
                    <Radio
                      value={position}
                      checked={selectedPosition === position}
                      onChange={handleChange}
                      className={`text-sm font-normal ${selectedPosition === position && "text-lightWhite" || "text-descriptionGreyTwo"}`}
                      disabled={
                        !!formData?.uboPosition &&
                        formData.uboPosition !== position
                      }
                    >
                      {position}
                    </Radio>
                  </div>
                ))}
              </div>
            </Radio.Group>
          </Form.Item>
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-1 xl:grid-cols-1 gap-6 basicinfo-form mt-4">
          {!isFieldHidden("firstName") && (<Form.Item
            label="First Name"
            name="firstName"
            rules={[validations.requiredValidator(), validations.whitespaceValidator('first name'), validations.textValidator('first name', 'alphaNumWithSpaceAndSpecialChars')]}
            className='mb-0'
          >
            <Input name='firstName' placeholder='Enter First Name' maxLength={50} className='bg-transparent border-[1px] !border-inputBg text-lightWhite p-2 rounded outline-0' onBlur={handleInputBlur} />
          </Form.Item>)}

          {!isFieldHidden("middleName") && (<Form.Item
            label="Middle Name"
            colon={false}
            name="middleName"
            rules={[validations.textValidator('middle name', 'alphaNumWithSpaceAndSpecialChars'), { whitespace: true, message: 'Invalid Middle Name ' }]}
            className='mb-0'
          >
            <Input name="middleName" onBlur={handleInputBlur} placeholder='Enter Middle Name' maxLength={50} className='bg-transparent border-[1px] border-inputBg text-lightWhite p-2 rounded outline-0' />
          </Form.Item>)}

          {!isFieldHidden("lastName") && (<Form.Item
            label="Last Name"
            name="lastName"
            rules={[validations.requiredValidator(), validations.whitespaceValidator('last name'), validations.textValidator('last name', 'alphaNumWithSpaceAndSpecialChars')]}
            className='mb-0'
          >
            <Input name="lastName" onBlur={handleInputBlur} placeholder='Enter Last Name' maxLength={50} className='bg-transparent border-[1px] border-border-inputBg text-lightWhite p-2 rounded outline-0' />
          </Form.Item>)}
          {!isFieldHidden("email") && <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Is required' }, { whitespace: true, message: 'Invalid Email' }, { validator: validateEmail }]}
            className='mb-0'
          >
            <Input name="email" onBlur={handleInputBlur} type="email" maxLength={100} placeholder='Enter mail' className='bg-transparent border-[1px] border-border-inputBg text-lightWhite p-2 rounded outline-0' />
          </Form.Item>}
          {!isFieldHidden("shareHolderPercentage") && (<Form.Item
            label="Shareholder Percentage"
            name="shareHolderPercentage"

            rules={[validations.requiredValidator(),
            {
              validator: (_, value) => {
                if (value && /^\s*$/.test(value)) {
                  return Promise.reject(new Error('Invalid input'));
                }
                return Promise.resolve();
              }
            },
            { validator: numberValidateContentRules }]}
            className='mb-0'
          >
            <NumericFormat
              name={'shareHolderPercentage'}
              decimalScale={AppDefaults.fiatDecimals}
              customInput={Input}
              className="bg-transparent border-[1px] border-inputBg p-2 rounded outline-0 w-full text-lightWhite"
              thousandSeparator={false}
              allowNegative={false}
              placeholder='Enter Percentage'
            />
          </Form.Item>)}

          {!isFieldHidden("dob") && (<Form.Item
            label="Date Of Birth (Future dates not allowed)"
            name="dob"
            rules={[{ required: true, message: 'Is required' }, { validator: validateDOB }]}
            className='mb-0'
          >
            <AppDatePicker
              datesToDisable='futureAndCurrentDates'
              className="bg-transparent border-[1px] border-inputBg p-2 rounded outline-0 w-full text-lightWhite"
            />
          </Form.Item>)}
          {!isFieldHidden("country") && (<Form.Item
            name="country"
            label="Country"
            rules={[{ required: true, message: "Is required" }]}
            className="mb-0 custom-select-float"
            colon={false}
          >
            <AppSelect
              showSearch
              name="country"
              onSelect={handleFieldChange("country")}
              placeholder="Select Country"
              className=""
              maxLength={30}
              options={lookups?.countries || []}
              fieldNames={{ label: "name", value: "name" }}
            />
          </Form.Item>)}
          {!isFieldHidden("phoneNumber") && (<div className='flex country-form-item relative select-hover'>
            <div className="custom-input-lablel">
              Phone number <span className="text-requiredRed">*</span>
            </div>
            <Form.Item
              name="phoneCode"
              className='mb-0 outline-none'
              colon={false}
              rules={[{ required: true, message: 'Is required' }, { whitespace: true, message: 'Invalid phoneCode' }]}
            >
              <PhoneCodeDropdown className={"!w-40"} />
            </Form.Item>
            <Form.Item
              name="phoneNumber"
              className='mb-0 w-full custom-input-ubo'
              colon={false}
              required
              rules={[validations.requiredValidator(),
              validations.whitespaceValidator('phone number'),
              validations.regexValidator("phone number", phoneNoRegex, false)]}
            >
              <Input placeholder='Enter Phone Number'
                type="number"
                onKeyDown={handleKeyDown}
                onInput={handlePhoneNumberInput}
                className='custom-input-field p-2 h-[52px]'
              />
            </Form.Item>
          </div>)}
          {!isFieldHidden("note") && (<Form.Item
            name="note"
            className='mb-0 w-full basicinfo-form'
            label="Note"
            rules={[{ whitespace: true, message: 'Invalid Note' }]}
            colon={false}
          >
            <TextArea name='note' onBlur={handleInputBlur} rows={4} maxLength={250} placeholder="Type your note..." className='bg-transparent border border-border-inputBg text-lightWhite p-2 outline-0 rounded-5 h-36' />
          </Form.Item>)}
          {selectedPosition === 'Other' && <Form.Item
            label="Position within the company"
            name="positionWithCompany"
            rules={[{ required: true, message: 'Is required' }, { whitespace: true, message: 'Invalid' }, { validator: validateContentRules }]}
            className='mb-0'
          >
            <Input name="positionWithCompany" onBlur={handleInputBlur} placeholder='Enter Position' maxLength={50} className='bg-transparent border-[1px] border-inputBg text-lightWhite p-2 rounded outline-0' />
          </Form.Item>}

        </div>
        <DocumentUploadForm
          documentTypeLu={lookups?.kycDocTypes}
          fileLists={fileLists}
          previewImages={previewImages || pdfPreview}
          handleUploadChange={handleUploadChange}
          removeImage={removeImage}
          handleChange={handleDocumentFieldChange}
          handleFieldChange={handleFieldChange}
        />
        <div className='mt-6 text-right'>
          <CustomButton className={""} htmlType="reset" onClick={handleCancel}>Close</CustomButton>
          {currentState != 'Review' && <CustomButton type='primary' className={"md:ml-3.5"} htmlType="submit">Ok</CustomButton>}
          {currentState === 'Review' && <CustomButton loading={btnLoader} disabled={btnLoader} type='primary' className={"md:ml-3.5"} htmlType="submit">Save</CustomButton>}
        </div>
      </Form>
    </div>
  );
};

export default UBODrawerForm;
