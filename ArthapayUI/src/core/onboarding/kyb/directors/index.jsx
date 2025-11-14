import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Form, Input, Radio } from 'antd';
import CustomButton from '../../../button/button';
import PhoneCodeDropdown from '../../../shared/phCodeDropdown';
import moment from 'moment';
import { validateContentRules, validateDOB, validatePhoneNumber, validateRegistration } from '../../../shared/validations';
import CountriesDropdown from '../../../shared/countriesDropdown';
import { useSelector } from 'react-redux';
import DocumentUploadForm from '../ubo/document.details';
import CompanyDataloader from '../../../skeleton/kyb.loaders/companydata.loader';
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE, checkFileName, checkFileSize, checkValidExtension, fileValidations, updateFileList } from '../../../shared/fileUploadVerifications';
import AppDatePicker from '../../../shared/appDatePicker';
import { getKybDetails, sendDirectorDetails } from '../../http.services';
import { decryptAES, encryptAES } from '../../../shared/encrypt.decrypt';

const showIndividualButton = false

const DirectorsForm = ({ formData, onSave, onCancel, drawerVisible, currentState }) => {
  const [form] = Form.useForm();
  const useDivRef = React.useRef(null);
  const [companyType, setCompanyType] = useState("Individual");
  const userProfileInfo = useSelector(state => state.userConfig.details);
  const [error, setError] = useState(null);
  const [btnLoader, setBtnLoader] = useState(false);
  const kycExcemptionObj = useSelector(
    (state) => state.kybStore.kycExcemtionObj
  );
  const { data: lookups } = useSelector(state => state.kybStore.lookups)
  const [hiddenFields, setHiddenFields] = useState([]);
  const [loader, setLoader] = useState(false);

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
  const onChange = (e) => {
    form.resetFields();
    setCompanyType(e.target.value);
  };
  const getFileNameFromUrl = (url) => {
    const parsedUrl = new URL(url);
    return parsedUrl.pathname.split("/").pop();
  };
  const handleScrollTop = () => {
    useDivRef.current.scrollIntoView(0, 0);
  }
  useEffect(() => {
    if (formData) {
      form.setFieldsValue({...formData,phoneCode:decryptAES(formData?.phoneCode),phoneNumber:decryptAES(formData?.phoneNumber),registrationNumber:decryptAES(formData?.registrationNumber)});
      form.setFieldsValue({
        type: formData?.docDetails?.type,
        frontImage: formData?.docDetails?.frontImage,
        backImage: formData?.docDetails?.backImage,
        docId: decryptAES(formData?.docDetails?.number) || "",
        docExpiryDate: formData?.docDetails?.expiryDate ? moment(formData?.docDetails?.expiryDate, "YYYY-MM-DD") : null,
      });
      setCompanyType("Individual" || null);

      const frontdocName = formData?.docDetails?.frontImage
        ? getFileNameFromUrl(formData?.docDetails?.frontImage)
        : "";
      const backdocImageName = formData?.docDetails?.backImage
        ? getFileNameFromUrl(formData?.docDetails?.backImage)
        : "";
      setFileLists({
        frontImage: formData?.docDetails?.frontImage
          ? [
            {
              uid: "-1",
              name: frontdocName,
              status: "done",
              url: formData?.docDetails?.frontImage,
            },
          ]
          : [],
        backImage: formData?.docDetails?.backImage
          ? [
            {
              uid: "-5",
              name: backdocImageName,
              status: "done",
              url: formData?.docDetails?.backImage,
            },
          ]
          : [],
      });
      setPreviewImages({
        frontImage: formData?.docDetails?.frontImage,
        backImage: formData?.docDetails?.backImage,
      });
    } else {
      form.resetFields();
    }
  }, [formData, drawerVisible]);
  const handleCancel = useCallback(() => {
    form.resetFields();
    onCancel();
  }, []);
  const onSuccessData = () => {
    form.resetFields();
  }
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
      "uboPosition": 'director',
      "firstName": values.firstName,
      "lastName": values.lastName,
      "middleName": values.middleName,
      "dob": values?.dob ? moment(values.dob).format("YYYY-MM-DD") : null,
      "phoneNumber": encryptAES(values?.phoneNumber),
      "phoneCode": encryptAES(values?.phoneCode),
      "companyName": values?.companyName,
      "country": values?.country,
      "registrationNumber": encryptAES(values?.registrationNumber),
      "dateOfRegistration": values?.dateOfRegistration ? moment(values.dateOfRegistration).format("YYYY-MM-DD") : null,
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
    if (currentState === 'Review') {
      const objList = [];
      objList.push(obj);
      await sendDirectorDetails(setBtnLoader, onSuccess, setError, { details: objList, method });
    }
    onSave(obj);
    form.resetFields();
  }, [formData, userProfileInfo, currentState]);
  const handleChange = useCallback(() => {
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
  }, []);
  const onButtonChange = useCallback((e) => {
    onChange(e);
  }, []);
  const handleInputChange = useCallback((e) => {
    if (e.target.value.length > 16) {
      e.target.value = e.target.value.slice(0, 16);
    }
  }, []);
  const onClearError = useCallback(() => {
    setError(null)
  },[])

    const handleKeyDown = useCallback((e) => {
    if (e.key === "e" || e.key === "E" || e.key === "+" || e.key === "-") {
      e.preventDefault();
    }
  }, []);

  const handleFieldChange = useCallback(
      (fieldName) => (e) => {
        const value = e?.target ? e.target.value : e;
        form.setFieldValue(fieldName, value);
      },
      [form]
  );
  const createFileList = (url, fileName) => [
    {
      name: fileName,
      status: 'done',
      url: url,
    },
  ];
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
        handleChange();
      }
    }, [form, formData, getFileNameFromUrl, createFileList, handleChange]);
  return (<>
    <div ref={useDivRef}></div>
    {loader && <CompanyDataloader />}
    <Form className='basicinfo-form' form={form} onFinish={onFinish}
      scrollToFirstError={{
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      }}>
      {error !== null && (
        <div className="alert-flex">
          <Alert
            type="error"
            description={error}
            onClose={onClearError}
            showIcon
            className='items-center'
          />
          <button className="icon sm alert-close" onClick={onClearError}></button>
        </div>
      )}
      <p className='text-sm font-normal text-paraColor mb-3'>Enter information about the company's directors You can add one or several participants individuals or companies. </p>
      {showIndividualButton &&<div className='mb-10'>
        <Form.Item
          name="uboPosition"
          initialValue="Individual"
          rules={[{ required: true, message: 'Is required' }]}
        >
          <Radio.Group>
            <div className="flex items-center gap-2.5">
              {['Individual'].map((company) => (
                <div key={company} className="flex items-center gap-2.5">
                  <Radio
                    value={company}
                    checked={companyType === company}
                    onChange={onButtonChange}
                    className={`text-sm font-normal ${companyType === company && "text-lightWhite" || "text-descriptionGreyTwo"}`}
                  >
                    {company}
                  </Radio>
                </div>
              ))}
            </div>
          </Radio.Group>
        </Form.Item>
      </div>}
      <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-1 gap-6">

        {(companyType === 'Individual' && !isFieldHidden("firstName")) && <Form.Item label="First Name" name="firstName" required rules={[{ required: true, message: 'Is required' }, { whitespace: true, message: 'Invalid First Name' }, { validator: validateContentRules }]} className='mb-0'>
          <Input placeholder='Enter First Name' maxLength={50} className='bg-transparent border-[1px] border-border-inputBg text-lightWhite p-2 rounded outline-0' />
        </Form.Item>}
        {(companyType === 'Individual' && !isFieldHidden("middleName")) && <Form.Item label="Middle Name" colon={false} name="middleName" rules={[{ validator: validateContentRules }, { whitespace: true, message: 'Invalid Middle Name ' }]} className='mb-0'>
          <Input placeholder='Enter Middle Name' maxLength={50} className='bg-transparent border-[1px] border-border-inputBg text-lightWhite p-2 rounded outline-0' />
        </Form.Item>}
        {(companyType === 'Individual' && !isFieldHidden("lastName")) && <Form.Item label="Last Name" name="lastName" required rules={[{ required: true, message: 'Is required' }, { whitespace: true, message: 'Invalid Last Name' }, { validator: validateContentRules }]} className='mb-0'>
          <Input placeholder='Enter Last Name' maxLength={50} className='bg-transparent border-[1px] border-border-inputBg text-lightWhite p-2 rounded outline-0' />
        </Form.Item>}
        {(companyType === 'Individual' && !isFieldHidden("dob")) && <Form.Item label="Date Of Birth" name="dob" required rules={[{ required: true, message: 'Is required' }, { validator: validateDOB }]} className='mb-0'>
          <AppDatePicker datesToDisable='futureAndCurrentDates' />
        </Form.Item>}

        {(companyType === 'Company' && !isFieldHidden("companyName")) && <Form.Item label="Company Name" name="companyName" required rules={[{ required: true, message: 'Is required' }, { validator: validateContentRules }]} className='mb-0'>
          <Input placeholder='Enter Company Name' maxLength={50} className='bg-transparent border-[1px] border-border-inputBg text-lightWhite p-2 rounded outline-0' />
        </Form.Item>}
        {(companyType === 'Company' && !isFieldHidden("country")) && <Form.Item label="Country" name="country" className='mb-0 custom-select-float' required rules={[{ required: true, message: 'Is required' }]} colon={false}>
          <CountriesDropdown />
        </Form.Item>}
        {(companyType === 'Company' && !isFieldHidden("registrationNumber")) && <Form.Item label="Registration Number" name="registrationNumber" required rules={[{ required: true, message: 'Is required' }, { validator: validateContentRules }]} className='mb-0'>
          <Input placeholder='Enter Registration Number' maxLength={50} className='bg-transparent border-[1px] border-border-inputBg text-lightWhite p-2 rounded outline-0' />
        </Form.Item>}
        {(companyType === 'Company' && !isFieldHidden("dateOfRegistration")) && <Form.Item label="Date of Registration" name="dateOfRegistration" required rules={[{ required: true, message: 'Is required' }, { validator: validateRegistration }]} className='mb-0'>
          <AppDatePicker />
        </Form.Item>}
        {!isFieldHidden("phoneNumber") && (<div className='flex country-form-item relative select-hover'>
          <div className="custom-input-lablel">
            Phone number <span className="text-requiredRed">*</span>
          </div>
          <Form.Item className='mb-0 outline-none w-30' name="phoneCode" required rules={[{ required: true, message: 'Is required' }, { whitespace: true, message: 'Invalid phoneNumber' }]} colon={false}>
            <PhoneCodeDropdown className={"!w-40"} />
          </Form.Item>

          <Form.Item className='mb-0 w-full' colon={false} name="phoneNumber" required rules={[{ validator: validatePhoneNumber }]}>
            <Input placeholder='Enter Phone Number' type='number'
              onKeyDown={handleKeyDown}
              onInput={handleInputChange}
              className='custom-input-field rounded-l-none h-[52px]' />
          </Form.Item>
        </div>)}
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
  </>

  );
};

export default DirectorsForm;
