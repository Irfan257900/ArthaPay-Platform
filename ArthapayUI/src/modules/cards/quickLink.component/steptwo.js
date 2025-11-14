import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { connect } from 'react-redux';
import { Form, Select } from 'antd';
import moment from 'moment';
import KycAddressComponent from '../kycAddress';
import { fetchBeneficiariesLu, fetchBeneficiaryTypeLu, fetchUboDetailsInfo, getQuickLinkKYCInfo, updateApplyCardKycrequirement } from '../httpServices';
import ContentLoader from '../../../core/skeleton/common.page.loader/content.loader';
import CustomButton from '../../../core/button/button';
import { getResetFields, initialFormData } from '../service';
import { useTranslation } from 'react-i18next';

const StepTwo = (props) => {
  const { Option } = Select;
  const [loader, setLoader] = useState(false)
  const { cardId } = useParams()
  const [info, setInfo] = useState();
  const [btnLoader, setBtnLoader] = useState(false);
  const [kycReqList, setKycReqList] = useState([]);
  const [fileLists, setFileLists] = useState({ handHoldingIDPhoto: [] });
  const [form] = Form.useForm();
  const profilePicRef = useRef(null);
  const [formData, setFormData] = useState({ ...initialFormData });
  const [previewImages, setPreviewImages] = useState({ profilePicFront: "", handHoldingIDPhoto: "", faceImage: "", signature: "", biometric: "", });
  const [beneficiaryTypeLu, setBeneficiaryTypeLu] = useState([]);
  const [beneficiariesLu, setBeneficiariesLu] = useState([]);
  const [uboLoader, setUboLoader] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    getKycInfo(props?.user?.id, props?.cardId || cardId)
    if (props?.user?.accountType === "Business") {
      getBeneficiaryTypeLu();
    }
  }, [props?.user?.id, cardId, props.cardId])

  const fileListTransform = (url, name) => [
    {
      uid: '-1',
      name: name || 'image.png',
      status: 'done',
      url,
    },
  ];
  const processFileLists = (response) => {
    setFileLists({
      faceImage: response.faceImage ? fileListTransform(response.faceImage, 'Face Image') : [],
      handHoldingIDPhoto: (response.handHoldingIDPhoto && response.idType?.toLowerCase() === "passport") ? fileListTransform(response.handHoldingIDPhoto, 'Hand Holding Photo') : [],
      profilePicFront: (response.profilePicFront && response.idType?.toLowerCase() === "passport") ? fileListTransform(response.profilePicFront, 'Front ID Photo') : [],
      profilePicBack: response.profilePicBack ? fileListTransform(response.profilePicBack, 'Back ID Photo') : [],
      signature: response.signature ? fileListTransform(response.signature, 'Signature') : [],
      biometric: response.biometric ? fileListTransform(response.biometric, 'Biometric') : [],
    });
  };
  const processFormData = (response) => {
    setFormData({
      ...formData,
      ...response,
      dob: response?.dob ? moment(response?.dob) : null,
      docExpiryDate: response?.docExpiryDate ? moment(response?.docExpiryDate) : null,
      idType: "passport",
      idNumber: response?.idNumber,
    });
  };
  const processPreviewImages = (response) => {
    setPreviewImages({
      faceImage: response.faceImage || '',
      handHoldingIDPhoto: response.idType?.toLowerCase() === "passport" && response.handHoldingIDPhoto || '',
      profilePicFront: response.idType?.toLowerCase() === "passport" && response.profilePicFront || '',
      profilePicBack: response.profilePicBack || '',
      signature: response.signature || '',
      biometric: response.biometric || '',
    });
  };
  const setResponce = (response) => {
    if (props?.user?.accountType === "Business") {
      setLoader(false);
    } else {
      processFileLists(response);
      processFormData(response);
      processPreviewImages(response);
      form.setFieldsValue({
        ...response,
        dob: response?.dob ? moment(response.dob) : null,
        docExpiryDate: response?.docExpiryDate ? moment(response.docExpiryDate) : null,
        idType: "passport",
        idNumber: response?.idNumber,
      });
      setLoader(false);
    }
  }
  const setGetKycInfo = (response) => {
    if (response) {
      setInfo(response);
      setLoader(false);
      if (response?.kycRequirements && response?.kycRequirements.indexOf(',') > -1) {
        const mappedKycRequirements = response?.kycRequirements.split(',') || [];
        setKycReqList(mappedKycRequirements);
      }
      setResponce(response);
      props?.isError(null);
    }
    else {
      setLoader(false)
      props.isError(response)
    }
  }
  const getKycInfo = async (customerId, cardId) => {
    setLoader(true)
    props?.isError(null);
    const urlParams = { id: customerId, cardId: props?.cardId || cardId }
    await getQuickLinkKYCInfo(setLoader, setGetKycInfo, props?.isError, urlParams);
  }
  const setSaveCard = useCallback((response) => {
    if (response) {
      props?.isError(null)
      window.scroll(0, 0);
      props.applyPhycialCard(props?.user?.id, props?.cardId);
    }
    else {
      setBtnLoader(false)
      props?.isError(response);
      window.scroll(0, 0);
    }
  }, [props]);
  const handleValidationError = (message) => {
    window.scroll(0, 0);
    setBtnLoader(false);
    props?.isError(message);
  };
  const handleError = (error) => {
    window.scroll(0, 0);
    setBtnLoader(false)
    props?.isError(error)
  };

  const preparePersonalDetails = (formattedValues) => ({
    firstName: formattedValues?.firstName,
    lastName: formattedValues?.lastName,
    dob: formattedValues?.dob || null,
    gender: formattedValues?.gender || null,
    email: formattedValues?.email || null,
    mobile: formattedValues?.mobile || null,
    mobileCode: formData?.mobileCode || null,
    emergencyContactName: formattedValues?.emergencyContactName || null,
  });

  const prepareDocumentDetails = (formattedValues) => ({
    docExpiryDate: formattedValues?.docExpiryDate,
    handHoldingIDPhoto: formattedValues?.handHoldingIDPhoto,
    faceImage: formattedValues?.faceImage,
    profilePicFront: formattedValues?.profilePicFront || null,
    profilePicBack: formattedValues?.profilePicFront || null,
    backDocImage: formattedValues?.profilePicBack || null,
    signature: formattedValues?.signature || null,
    biometric: formattedValues?.biometric || null,
  });

  const prepareAddressDetails = (formattedValues) => ({
    addressLine1: formattedValues?.addressLine1,
    city: formattedValues?.city || null,
    state: formattedValues?.state || null,
    country: formattedValues?.country || null,
    town: formattedValues?.town || null,
    postalCode: formattedValues?.postalCode || null,
  });

  const prepareIdentificationDetails = (formattedValues) => ({
    idNumber: formattedValues?.idNumber,
    idType: formattedValues?.idType,
  });

  const prepareKycData = (formValues) => ({
    customerId: props?.user?.id,
    cardId: info?.programId,
    ...preparePersonalDetails(formValues),
    ...prepareDocumentDetails(formValues),
    ...prepareAddressDetails(formValues),
    ...prepareIdentificationDetails(formValues),
    kycRequirements: info?.kycRequirements,
  });

  const formatFileList = (fileList, fallbackValue) => {
    if (fileList?.length > 0) {
      return fileList[0].response?.[0] || fileList[0].url;
    }
    return fallbackValue || null;
  };

  const applyPhycialCard = useCallback(async (values) => {
    await form.validateFields();
    setBtnLoader(true);
    const formattedValues = {
      ...values,
      dob: values?.dob && moment(values?.dob).toISOString() || null,
      docExpiryDate: values.docExpiryDate && moment(values.docExpiryDate).toISOString() || null,
      handHoldingIDPhoto: formatFileList(fileLists.handHoldingIDPhoto, values?.handHoldingIDPhoto),
      faceImage: formatFileList(fileLists.faceImage, values?.faceImage),
      profilePicFront: formatFileList(fileLists.profilePicFront, values?.profilePicFront),
      profilePicBack: formatFileList(fileLists.profilePicFront, values?.profilePicFront),
      signature: formatFileList(fileLists.signature, values?.signature),
    }
    if (formattedValues?.docExpiryDate < formattedValues?.dob) {
      handleValidationError(t('cards.Messages.EXPIRY_DATE'));
      return;
    }

    const saveObject = prepareKycData(formattedValues)

    try {
      const urlParams = { obj: saveObject };
      await updateApplyCardKycrequirement(setBtnLoader, setSaveCard, props?.isError, urlParams);
    }
    catch (error) {
      handleError(error);
    }
  }, [form, fileLists]);

  const getSetUboDetailsInfo = (response) => {
    if (response) {
      const getDocDetail = (key, defaultValue = null) => response?.docDetails?.[key] || defaultValue;
      const getFileList = (key, label) => getDocDetail(key) ? fileListTransform(getDocDetail(key), label) : [];

      updateFormDataAndFiles(response, getDocDetail, getFileList);

      form.setFieldsValue({
        ...response,
        faceImage: getDocDetail('faceImage', ''),
        handHoldingIDPhoto: response?.docDetails?.docType?.toLowerCase() === "passport" ? getDocDetail('handHoldingIDPhoto', '') : null,
        profilePicFront: response?.docDetails?.docType?.toLowerCase() === "passport" ? getDocDetail('frontIdPhoto', '') : null,
        profilePicBack: getDocDetail('profilePicBack', ''),
        dob: response?.dob ? moment(response.dob) : null,
        mobile: response?.phoneNumber || null,
        mobileCode: response?.phoneCode || null,
        idType: "passport",
        docExpiryDate: response?.docDetails?.docExpiryDate ? moment(response?.docDetails?.docExpiryDate) : null,
        idNumber: response?.docDetails?.docNumber,
      });
    }
  }
  const updateFormDataAndFiles = (response, getDocDetail, getFileList) => {
    setFormData({
      ...initialFormData,
      firstName: response?.firstName,
      lastName: response?.lastName,
      dob: response?.dob && moment(response?.dob) || null,
      mobile: response?.phoneNumber || null,
      mobileCode: response?.phoneCode || null,
      country: response?.country || null,
      email: response?.email || null,
      handHoldingIDPhoto: response?.docDetails?.docType?.toLowerCase() === "passport" ? getDocDetail('handHoldingIDPhoto') : null,
      faceImage: getDocDetail('faceImage'),
      profilePicFront: response?.docDetails?.docType?.toLowerCase() === "passport" ? getDocDetail('frontIdPhoto') : null,
      profilePicBack: getDocDetail('profilePicBack'),
      backDocImage: getDocDetail('backDocImage'),
      idType: "passport",
      docExpiryDate: response?.docDetails?.docExpiryDate ? moment(response?.docDetails?.docExpiryDate) : null,
      idNumber: response?.docDetails?.docNumber,
    });
    setPreviewImages({
      faceImage: getDocDetail('faceImage', ''),
      handHoldingIDPhoto: response?.docDetails?.docType?.toLowerCase() === "passport" ? getDocDetail('handHoldingIDPhoto', '') : '',
      profilePicFront: response?.docDetails?.docType?.toLowerCase() === "passport" ? getDocDetail('frontIdPhoto', '') : '',
      profilePicBack: getDocDetail('profilePicBack', ''),
    });
    setFileLists({
      faceImage: getFileList('faceImage', 'Face Image'),
      handHoldingIDPhoto: response?.docDetails?.docType?.toLowerCase() === "passport" ? getFileList('handHoldingIDPhoto', 'Hand Holding Photo') : [],
      profilePicFront: response?.docDetails?.docType?.toLowerCase() === "passport" ? getFileList('frontIdPhoto', 'Front ID Photo') : [],
      profilePicBack: getFileList('profilePicBack', 'Back ID Photo'),
      signature: getFileList('signature', 'Signature'),
      biometric: getFileList('biometric', 'Biometric'),
    });
  }
  const resetFormData = () => {
    const currentValues = form.getFieldsValue();
    const resetFields = getResetFields(currentValues, ["beneficiaryType", "beneficiary"]);
    form.setFieldsValue(resetFields);
    setFormData({
      ...initialFormData,
    });
    setFileLists([]);
    setPreviewImages({ profilePicFront: "", handHoldingIDPhoto: "", faceImage: "", signature: "", biometric: "", })
  }
  const updateFormFieldValue = useCallback((fieldName, value) => {
    form.setFieldsValue({ [fieldName]: value });
    setFormData(prevData => ({
      ...prevData,
      [fieldName]: value
    }));
    if (fieldName === 'beneficiaryType') {
      resetFormData();
      setBeneficiariesLu([]);
      getBeneficiariesLu(value)
      form.setFieldsValue({ beneficiary: null });
      setFormData(prevData => ({ ...prevData, beneficiary: null }));
    } else if (fieldName === "beneficiary") {
      const selectedRecord = beneficiariesLu?.find(item => item.name === value)
      const urlParams = { id: selectedRecord?.id }
      fetchUboDetailsInfo(setUboLoader, getSetUboDetailsInfo, props?.isError, urlParams);
    }
  }, [beneficiariesLu, formData, form]);
  const handleScrollTop = useCallback(() => {
    window.scroll(0, 0);
  }, []);
  const setGetBeneficiaryTypeLu = (response) => {
    if (response) {
      setBeneficiaryTypeLu(response);
    }
  }
  const getBeneficiaryTypeLu = async () => {
    await fetchBeneficiaryTypeLu(setGetBeneficiaryTypeLu, props?.isError);
  }
  const setGetBeneficiariesLu = (response) => {
    if (response) {
      setBeneficiariesLu(response);
    }
  }
  const getBeneficiariesLu = async (value) => {
    const urlParams = { id: props?.user?.id, type: value }
    await fetchBeneficiariesLu(setGetBeneficiariesLu, props?.isError, urlParams);
  }
  const getBeneficiaryTypeValues = useCallback((e) => {
    updateFormFieldValue("beneficiaryType", e);
  }, [updateFormFieldValue])
  const getBeneficiaryValues = useCallback((e) => {
    updateFormFieldValue("beneficiary", e);
  }, [updateFormFieldValue])

  return (<>
    {loader && <ContentLoader />}

    <div>
      {!loader && (
        <div className="last-step-bg text-left ">
          {uboLoader && <ContentLoader />}
          {!uboLoader &&
            <Form
              form={form}
              enableReinitialize
              scrollToFirstError={{
                behavior: 'smooth',
                block: 'center',
                inline: 'center',
              }}
              onFinish={applyPhycialCard}
              className="payees-form custom-label apllication-infoform mt-0"
              initialValues={formData}

            >
              {props?.user?.accountType === "Business" &&
                <div className="grid md:grid-cols-2 gap-6 basicinfo-form panel-form-items-bg mt-6">
                  <Form.Item
                    label={t('cards.applyCards.Select_Role_For_KYC_Verification')}
                    name="beneficiaryType"
                    rules={[{ required: false, message: t('cards.Is_required'), }]}
                    className="custom-select-float mb-0"
                    colon={false}
                  >
                    <Select
                      showSearch
                      placeholder={t('cards.applyCards.Select_Role_For_KYC_Verification')}
                      onChange={getBeneficiaryTypeValues}
                      className=""
                    >
                      {beneficiaryTypeLu?.map((item) => (
                        <Option key={item?.name} value={item?.code}>
                          {item?.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    label={t('cards.applyCards.Select_Individual_To_Verify')}
                    name="beneficiary"
                    rules={[{ required: false, message: t('cards.Is_required'), }]}
                    className="custom-select-float mb-0"
                    colon={false}
                  >
                    <Select
                      showSearch
                      placeholder={t('cards.applyCards.Select_Individual_To_Verify')}
                      onChange={getBeneficiaryValues}
                      className=""
                    >
                      {beneficiariesLu?.map((item) => (
                        <Option key={item?.name} value={item?.name}>
                          {item?.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
              }
              <KycAddressComponent ref={profilePicRef} removeSpace={true} info={info} kycReqList={kycReqList} updateFormFieldValue={updateFormFieldValue} formData={formData} fileLists={fileLists} setFileLists={setFileLists} form={form} handleScrollTop={handleScrollTop} previewImages={previewImages} setPreviewImages={setPreviewImages} isError={props?.isError} />
              <Form.Item className="mt-9">
                <CustomButton className="w-full" type='primary' htmlType={applyPhycialCard} loading={btnLoader}>
                  {t('cards.applyCards.Next')}
                </CustomButton>
              </Form.Item>
            </Form>}

        </div>)}
    </div>

  </>);
};
const connectStateToProps = ({ userConfig }) => {
  return { user: userConfig.details };
};

export default connect(connectStateToProps)(StepTwo);