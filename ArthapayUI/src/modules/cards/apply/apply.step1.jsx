import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { connect, useDispatch, useSelector } from 'react-redux';
import { Form, Button, Select } from 'antd';
import moment from 'moment';
import KycAddressComponent from '../kycAddress';
import CustomButton from '../../../core/button/button';
import { fetchBeneficiaryTypeLu, fetchBeneficiariesLu, getApplicationInfo, fetchUboDetailsInfo } from '../httpServices';
import ContentLoader from '../../../core/skeleton/common.page.loader/content.loader';
import { getResetFields, initialFormData } from '../service';
import { deriveErrorMessage } from '../../../core/shared/deriveErrorMessage';
import { useTranslation } from 'react-i18next';
import { setApplyCardKycInfo } from '../../../reducers/cards.reducer';
import { decryptAES, encryptAES } from '../../../core/shared/encrypt.decrypt';

const StepOne = (props) => {
  const { Option } = Select;
  const [loader, setLoader] = useState(false)
  const [info, setInfo] = useState();
  const cardDivRef = React.useRef(null)
  const { cardId } = useParams()
  const [form] = Form.useForm()
  const [fileLists, setFileLists] = useState({ face: [], frontDoc: [], backDoc: [], mixDoc: [], biomatricDoc: [], handHoldingIDPhoto: [], signImage: [], faceImage: [], idImage: [] });
  const [btnLoader, setBtnLoader] = useState(false);
  const [beneficiaryTypeLu, setBeneficiaryTypeLu] = useState([]);
  const [beneficiariesLu, setBeneficiariesLu] = useState([]);
  const [uboLoader, setUboLoader] = useState(false);
  const rulesRef = useRef();
  const [formData, setFormData] = useState({ ...initialFormData });
  const [previewImages, setPreviewImages] = useState({ face: "", frontDoc: "", backDoc: "", mixDoc: "", biomatricDoc: "", handHoldingIDPhoto: "", signImage: "", faceImage: "", idImage: "" });
  const [kycReqList, setKycReqList] = useState([]);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const applyCardKycInfo = useSelector((state) => state.cardsStore.applyCardKycInfo);
  useEffect(() => {
    applicationInfo(props?.user?.id, props?.cardId || cardId)
    if (props?.user?.accountType === "Business") {
      getBeneficiaryTypeLu();
    }
    const beneficiaryType = applyCardKycInfo && applyCardKycInfo?.kyc?.beneficiaryType?.beneficiaryTypeId || null;
    if((props?.currentStep === 0 && applyCardKycInfo && beneficiaryType)){
      getBeneficiariesLu(beneficiaryType)
    }
  }, [props?.user]);
  const fileListTransform = (url, name) => [
    {
      uid: '-1',
      name: name || 'image.png',
      status: 'done',
      url,
    },
  ];
  const processFileLists = (response) => {
    const filesData = response?.kyc;
    setFileLists({
      face: filesData?.pfc?.face ? fileListTransform(filesData?.pfc?.face, 'Face') : [],
      frontDoc: filesData?.pfc?.frontDoc ? fileListTransform(filesData?.pfc?.frontDoc, 'Front Doc') : [],
      backDoc: filesData?.pfc?.backDoc ? fileListTransform(filesData?.pfc?.backDoc, 'Back Doc') : [],
      mixDoc: filesData?.pfc?.mixDoc ? fileListTransform(filesData?.pfc?.mixDoc, 'Mix Doc') : [],
      biomatricDoc: filesData?.pb?.biomatricDoc ? fileListTransform(filesData?.pb?.biomatricDoc, 'Biometric') : [],
      handHoldingIDPhoto: filesData?.pphs?.handHoldingIDPhoto ? fileListTransform(filesData?.pphs?.handHoldingIDPhoto, 'Hand Holding Photo') : [],
      signImage: filesData?.pphs?.signImage ? fileListTransform(filesData?.pphs?.signImage, 'Signature') : [],
      faceImage: filesData?.pphs?.faceImage ? fileListTransform(filesData?.pphs?.faceImage, 'Face Image') : [],
      idImage: filesData?.pphs?.idImage ? fileListTransform(filesData?.pphs?.idImage, 'Id Image') : [],
    });
  };
  const processFormData = (response) => {
    const { kyc } = response;
    setFormData({
      firstName: kyc?.fullName?.firstName && decryptAES(kyc?.fullName?.firstName) || "",
      middleName: kyc?.fullName?.middleName || "",
      lastName: kyc?.fullName?.lastName && decryptAES(kyc?.fullName?.lastName) || "",
      email: kyc?.basic?.email && decryptAES(kyc?.basic?.email) || "",
      phoneNo: kyc?.basic?.phoneNo && decryptAES(kyc?.basic?.phoneNo) || "",
      phoneCode: kyc?.basic?.phoneCode && decryptAES(kyc?.basic?.phoneCode) || "",
      country: kyc?.basic?.country || null,
      dob: kyc?.basic?.dob ? moment(kyc.basic.dob) : null,
      city: kyc?.basic?.city || "",
      gender: kyc?.basic?.gender ?? null,
      docType: "passport",
      docId: (kyc?.pfc?.docId || kyc?.pb?.docId) && decryptAES(kyc?.pfc?.docId || kyc?.pb?.docId) || "",
      docExpiryDate: kyc?.pfc?.docExpiryDate ? moment(kyc.pfc.docExpiryDate) : null,
      addressId: kyc?.address?.addressId || null,
      face: kyc?.pfc?.face || '',
      frontDoc: kyc?.pfc?.frontDoc || '',
      backDoc: kyc?.pfc?.backDoc || '',
      mixDoc: kyc?.pfc?.mixDoc || '',
      biomatricDoc: kyc?.pb?.biomatricDoc || '',
      handHoldingIDPhoto: kyc?.pphs?.handHoldingIDPhoto || '',
      signImage: kyc?.pphs?.signImage || '',
      faceImage: kyc?.pphs?.faceImage || '',
      idImage: kyc?.pphs?.idImage || '',
      beneficiaryType: kyc?.beneficiaryType?.beneficiaryTypeId && kyc?.beneficiaryType?.beneficiaryTypeId || null,
      beneficiary: kyc?.beneficiary?.beneficiaryId && kyc?.beneficiary?.beneficiaryId || null,
      emergencyContactName: kyc?.emergencyContact?.emergencyContactName || "",
    });
    form.setFieldsValue({emergencyContactName: kyc?.emergencyContact?.emergencyContactName || ""});
  };
  const processPreviewImages = (response) => {
    const filesData = response?.kyc;
    setPreviewImages({
      face: filesData?.pfc?.face || '',
      frontDoc: filesData?.pfc?.frontDoc || '',
      backDoc: filesData?.pfc?.backDoc || '',
      mixDoc: filesData?.pfc?.mixDoc || '',
      biomatricDoc: filesData?.pb?.biomatricDoc || '',
      handHoldingIDPhoto: filesData?.pphs?.handHoldingIDPhoto || '',
      signImage: filesData?.pphs?.signImage || '',
      faceImage: filesData?.pphs?.faceImage || '',
      idImage: filesData?.pphs?.idImage || '',
    });
  };
  const setResponce = (response) => {
    try {
      if (props?.user?.accountType === "Business" && response.kyc.requirement) {
        setLoader(false);
      } else {
        processFileLists(response);
        processFormData(response);
        processPreviewImages(response);
        setLoader(false);
      }
    } catch (error) {
      setLoader(false);
      props?.isError(deriveErrorMessage(error));
    }
  }
   const setBusinesResponce = (response) => {
    try {
        processFileLists(response);
        processFormData(response);
        processPreviewImages(response);
        setLoader(false);
    } catch (error) {
      setLoader(false);
      props?.isError(deriveErrorMessage(error));
    }
  }
  const setGetApplicationInfo = (response) => {
    try {
      if (response) {
        setInfo({ ...response });
        props?.isError(null)
        if (response?.kyc?.requirement && response?.kyc?.requirement.indexOf(',') > -1) {
          const mappedKycRequirements = response?.kyc?.requirement.split(',') || [];
          setKycReqList(mappedKycRequirements);
        }
        if(props?.user?.accountType !== "Business"){
        setResponce((props?.currentStep === 0 && applyCardKycInfo) ? applyCardKycInfo : response );
        }else if (props?.user?.accountType === "Business" && props?.currentStep === 0 && applyCardKycInfo) {
        setBusinesResponce((props?.currentStep === 0 && applyCardKycInfo) ? applyCardKycInfo : {});
        }
      }
      else {
        setLoader(false)
        props?.isError(response)
      }
    } catch (error) {
      props?.isError(deriveErrorMessage(error));
    }
  }
  const applicationInfo = async (customerId, cardId) => {
    const urlParams = { id: customerId, cardId: cardId }
    await getApplicationInfo(setLoader, setGetApplicationInfo, props?.isError, urlParams);
  }
  const setSaveCard = (response) => {
    if (response) {
      props?.isError(null)
      cardDivRef.current?.scrollIntoView(0, 0);
      props?.changeNextStep(info)
      dispatch(setApplyCardKycInfo(response))
      setBtnLoader(false)
    }
    else {
      setBtnLoader(false)
      props?.isError(response);
      cardDivRef.current?.scrollIntoView(0, 0);
    }
  }
  const handleValidationError = (message) => {
    setBtnLoader(false);
    cardDivRef.current?.scrollIntoView(0, 0);
    props?.isError(message);
  };
  const handleError = (error) => {
    setBtnLoader(false);
    props?.isError(error);
    cardDivRef.current?.scrollIntoView(0, 0);
  };

  const preparePersonalDetails = (formattedValues) => ({
    fullName: {
      firstName: formattedValues?.firstName && encryptAES(formattedValues?.firstName) || "",
      middleName: formattedValues?.middleName || "",
      lastName: formattedValues?.lastName && encryptAES(formattedValues?.lastName) || "",
    },
    basic: {
      email: formattedValues?.email && encryptAES(formattedValues?.email) || '',
      phoneNo: formattedValues?.phoneNo && encryptAES(formattedValues?.phoneNo) || '',
      phoneCode: formattedValues?.phoneCode && encryptAES(formattedValues?.phoneCode) || '',
      country: formattedValues?.country || null,
      dob: formattedValues?.dob || null,
      gender: formattedValues?.gender ?? null, // allow 0
    }
  });

  const prepareDocumentDetails = (formattedValues) => ({
    pfc: {
      face: formattedValues?.face || "",
      docType: formattedValues?.docType || "passport",
      docId: formattedValues?.docId && encryptAES(formattedValues?.docId) || '',
      docExpiryDate: formattedValues?.docExpiryDate || "",
      frontDoc: formattedValues?.frontDoc || "",
      backDoc: formattedValues?.backDoc || "",
      mixDoc: formattedValues?.mixDoc || ""
    },
    pb: {
      biomatricDoc: formattedValues?.biomatricDoc || "",
      docId: formattedValues?.docId && encryptAES(formattedValues?.docId) || '',
    },
    pphs: {
      handHoldingIDPhoto: formattedValues?.handHoldingIDPhoto || "",
      signImage: formattedValues?.signImage || "",
      faceImage: formattedValues?.faceImage || "",
      idImage: formattedValues?.idImage || ""
    }
  });

  const prepareAddressDetails = (formattedValues) => ({
    address: {
      addressId: formattedValues?.addressId || null
    }
  });
  const prepareRoleForKycDetails = (formattedValues) => ({
    beneficiaryType: {
      beneficiaryTypeId: formattedValues?.beneficiaryTypeId || null
    }
  });
  const prepareIndividualsDetails = (formattedValues) => ({
    beneficiary: {
      beneficiaryId: formattedValues?.beneficiaryId || null
    }
  });
  const emergencyContact = (formattedValues) => ({
    emergencyContact: {
      emergencyContactName: formattedValues?.emergencyContactName || ""
    }
  });

  const prepareKycData = (formValues) => ({
    kyc: {
      requirement: info?.kyc?.requirement || "",
      ...preparePersonalDetails(formValues),  // returns fullName + basic
      ...prepareDocumentDetails(formValues),  // returns pp, pb, pphs
      ...prepareAddressDetails(formValues),   // returns address
      ...((props?.user?.accountType === "Business" && formValues?.beneficiaryTypeId) ? prepareRoleForKycDetails(formValues) : {}), // returns role for kyc
      ...((props?.user?.accountType === "Business" && formValues?.beneficiaryId) ? prepareIndividualsDetails(formValues) : {}), // returns individuals
      ...emergencyContact(formValues) // returns emergency contact
    }
  });

  const formatFileList = (fileList, fallbackValue) => {
    if (fileList?.length > 0) {
      return fileList[0].response?.[0] || fileList[0].url;
    }
    return fallbackValue || null;
  };



  const handleKycRequirements = async (values) => {
    try {
      await form?.validateFields()
      form.submit()
    } catch (errors) {
      setBtnLoader(false)
      return
    }
    await form.validateFields();
    setBtnLoader(true);
    const formattedValues = {
      ...values,
      beneficiaryTypeId : values?.beneficiaryType || null,
      beneficiaryId : values?.beneficiary || null,
      dob: values?.dob && values?.dob?.format('YYYY-MM-DD') || null,
      docExpiryDate: values.docExpiryDate && values.docExpiryDate?.format('YYYY-MM-DD') || null,
      handHoldingIDPhoto: formatFileList(fileLists.handHoldingIDPhoto, values?.handHoldingIDPhoto),
      face: formatFileList(fileLists.face, values?.face),
      frontDoc: formatFileList(fileLists.frontDoc, values?.frontDoc),
      backDoc: formatFileList(fileLists.backDoc, values?.backDoc),
      signature: formatFileList(fileLists.signature, values?.signature),
      mixDoc: formatFileList(fileLists.mixDoc, values?.mixDoc),
      biomatricDoc: formatFileList(fileLists.biomatricDoc, values?.biomatricDoc),
      signImage: formatFileList(fileLists.signImage, values?.signImage),
      faceImage: formatFileList(fileLists.faceImage, values?.faceImage),
      idImage: formatFileList(fileLists.idImage, values?.idImage),
    }
    if (formattedValues?.docExpiryDate < formattedValues?.dob) {
      handleValidationError(t('cards.Messages.EXPIRY_DATE'));
      return;
    }
    const saveObject = prepareKycData(formattedValues)
    try {
      setSaveCard(saveObject)
    } catch (error) {
      handleError(error);
    }
  };
  const saveCard = useCallback(async () => {
    const values = form.getFieldsValue(true);
    // Remove the key named '[object Object]' if it exists
    if (Object.prototype.hasOwnProperty.call(values, "[object Object]")) {
      delete values["[object Object]"];
    }

    const kycRequirements = info?.kyc?.requirement;
    if (!kycRequirements) {
      cardDivRef.current?.scrollIntoView(0, 0);
      props?.changeNextStep(info.kyc);
    } else {
      await handleKycRequirements(values);
    }
  }, [form, info, cardDivRef, props]);

  const getDocDetail = (response, key, defaultValue = null) => response?.docDetails?.[key] || defaultValue;

  const getFileList = (response, key, label) => {
    const detail = getDocDetail(response, key);
    return detail ? fileListTransform(detail, label) : [];
  }

  const getSetUboDetailsInfo = (response) => {
    try {
      if (response) {
        const isDocType = response?.docDetails?.docType?.toLowerCase() === "passport";
        const docExpiryDate = decryptAES(response?.docExpiryDate);
        form.setFieldsValue({
          ...response,
          firstName: response?.firstName && decryptAES(response?.firstName) || "",
          middleName: response?.middleName || "",
          lastName: response?.lastName && decryptAES(response?.lastName) || "",
          email: response?.email && decryptAES(response?.email) || null,
          dob: response?.dob ? moment(response.dob) : null,
          phoneNo: response?.phoneNumber && decryptAES(response?.phoneNumber) || null,
          phoneCode: response?.phoneCode && decryptAES(response?.phoneCode) || null,
          docType: "passport",
          docExpiryDate: docExpiryDate ? moment(docExpiryDate) : null,
          docId: response?.docId && decryptAES(response?.docId),
          handHoldingIDPhoto: getDocDetail(response, 'handHoldingIDPhoto', ''),
          face: getDocDetail(response, 'face', ''),
          frontDoc: getDocDetail(response, 'frontDoc', ''),
          backDoc: getDocDetail(response, 'backDoc', ''),
          signature: getDocDetail(response, 'signature', ''),
          mixDoc: getDocDetail(response, 'mixDoc', ''),
          biomatricDoc: getDocDetail(response, 'biomatricDoc', ''),
          signImage: getDocDetail(response, 'signImage', ''),
          faceImage: getDocDetail(response, 'faceImage', ''),
          idImage: getDocDetail(response, 'idImage', ''),
          emergencyContactName: response?.emergencyContactName || "",
        });
        updateFormDataAndFiles(response, isDocType);
      }
    } catch (error) {
      props?.isError(deriveErrorMessage(error));
    }
  }
  const updateFormDataAndFiles = (response, isDocType) => {
    const docExpiryDate = decryptAES(response?.docExpiryDate);
    setFormData({
      ...initialFormData,
      firstName: response?.firstName && decryptAES(response?.firstName),
      lastName: response?.lastName && decryptAES(response?.lastName),
      middleName: response?.middleName,
      dob: response?.dob && moment(response?.dob) || null,
      phoneNo: response?.phoneNumber && decryptAES(response?.phoneNumber) || null,
      phoneCode: response?.phoneCode && decryptAES(response?.phoneCode) || null,
      country: response?.country || null,
      email: response?.email && decryptAES(response?.email) || null,
      city: response?.city || null,
      gender: response?.gender || null,
      docType: "passport",
      docId: response?.docId && decryptAES(response?.docId) || '',
      docExpiryDate: docExpiryDate ? moment(docExpiryDate) : null,
      face: getDocDetail(response, 'face'),
      frontDoc: getDocDetail(response, 'frontDoc'),
      backDoc: getDocDetail(response, 'backDoc'),
      mixDoc: getDocDetail(response, 'mixDoc'),
      biomatricDoc: getDocDetail(response, 'biomatricDoc'),
      handHoldingIDPhoto: getDocDetail(response, 'handHoldingIDPhoto'),
      signImage: getDocDetail(response, 'signImage'),
      faceImage: getDocDetail(response, 'faceImage'),
      idImage: getDocDetail(response, 'idImage'),
      emergencyContactName: response?.emergencyContactName || "",
    });
    setPreviewImages({
      face: getDocDetail(response, 'face', ''),
      frontDoc: getDocDetail(response, 'frontDoc', ''),
      backDoc: getDocDetail(response, 'backDoc', ''),
      mixDoc: getDocDetail(response, 'mixDoc', ''),
      biomatricDoc: getDocDetail(response, 'biomatricDoc', ''),
      handHoldingIDPhoto: getDocDetail(response, 'handHoldingIDPhoto', ''),
      signImage: getDocDetail(response, 'signImage', ''),
      faceImage: getDocDetail(response, 'faceImage', ''),
      idImage: getDocDetail(response, 'idImage', ''),
    });
    setFileLists({
      face: getFileList(response, 'faceImage', 'Face Image'),
      frontDoc: getFileList(response, 'frontDoc', 'Front Image'),
      backDoc: getFileList(response, 'backDoc', 'Back Image'),
      mixDoc: getFileList(response, 'mixDoc', 'Mixed Image'),
      biomatricDoc: getFileList(response, 'biomatricDoc', 'Biometric Image'),
      handHoldingIDPhoto: getFileList(response, 'handHoldingIDPhoto', 'Hand Holding Photo'),
      signImage: getFileList(response, 'signImage', 'Sign Image'),
      faceImage: getFileList(response, 'faceImage', 'Face Image'),
      idImage: getFileList(response, 'idImage', 'Id Image'),
    });
  }
  const resetFormData = () => {
    const currentValues = form.getFieldsValue();
    const resetFields = getResetFields(currentValues, ["beneficiaryType", "beneficiary"]);
    form.setFieldsValue(resetFields);
    setFormData({
      ...initialFormData,
    });
    setFileLists({ face: [], frontDoc: [], backDoc: [], mixDoc: [], biomatricDoc: [], handHoldingIDPhoto: [], signImage: [], faceImage: [], idImage: [] });
    setPreviewImages({ face: "", frontDoc: "", backDoc: "", mixDoc: "", biomatricDoc: "", handHoldingIDPhoto: "", signImage: "", faceImage: "", idImage: "" })
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
      form.setFieldsValue({ beneficiary: null });
      setFormData(prevData => ({ ...prevData, beneficiary: null }));
      getBeneficiariesLu(value)
    } else if (fieldName === "beneficiary") {
      const selectedRecord = beneficiariesLu?.find(item => item.name === value)
      const urlParams = { id: selectedRecord?.id }
      fetchUboDetailsInfo(setUboLoader, getSetUboDetailsInfo, props?.isError, urlParams);
    }
  }, [beneficiariesLu, formData, form, props?.isError]);
  const handleScrollTop = useCallback(() => {
    rulesRef.current?.scrollIntoView({ behavior: 'smooth', top: 100 });
  }, [rulesRef]);
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
  return (
    <>
      {loader && <ContentLoader />}
      {!loader &&
        <>
          <div ref={cardDivRef}></div>
          <div className="mt-4 darkbg-section">
            {info?.applyCarddetails?.map((item) => (
              <div className="summary-list-item" key={item?.name}>
                <div className="summary-label">{item.name}</div>
                <div className="summary-text m-0 break-all text-right">
                  {typeof item.value === "object"
                    ? item.value instanceof Error
                      ? item.value.message
                      : JSON.stringify(item.value)
                    : String(item.value)}
                </div>
              </div>
            ))}
          </div>
          <div ref={rulesRef}></div>
          {uboLoader && <ContentLoader />}
          {!uboLoader &&
            info?.kyc?.requirement && <Form
              form={form}
              enableReinitialize
              scrollToFirstError={{
                behavior: 'smooth',
                block: 'center',
                inline: 'center',
              }}
              className="payees-form custom-label mb-0 fw-400 apllication-infoform"
              initialValues={formData}
              onFinish={saveCard}
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

              <KycAddressComponent info={info?.kyc} kycReqList={kycReqList} updateFormFieldValue={updateFormFieldValue} formData={formData} fileLists={fileLists} setFileLists={setFileLists} form={form} handleScrollTop={handleScrollTop} previewImages={previewImages} setPreviewImages={setPreviewImages} isError={props?.isError} applyCardKycInfo={applyCardKycInfo} />
              <Form.Item className="w-full mt-7">
                <Button block className="rounded-5 border-0 bg-primaryColor hover:!bg-buttonActiveBg h-[38px] dark:hover:!bg-buttonActiveBg text-sm font-medium !text-textWhite md:min-w-[100px] uppercase disabled:!bg-btnDisabled disabled:cursor-not-allowed disabled:text-textBlack applynow-btn w-full" htmlType="submit" loading={btnLoader}
                  onClick={saveCard}  >{t('cards.applyCards.Next')}
                </Button>
              </Form.Item>
            </Form>}
          {/* {!info?.kyc?.requirement &&
            <div className="mt-6">
              <CustomButton block type='primary'
                className="!h-14"
                onClick={saveCard}>
                {t('cards.applyCards.Next')}
              </CustomButton>
            </div>
          } */}
        </>}
    </>);
};
const connectStateToProps = ({ userConfig, applyCard }) => {
  return {
    user: userConfig.details,
    allAddresses: applyCard?.allAddresses?.data,
    selectedAddress: applyCard?.selectedAddress?.data,
  };
};

export default connect(connectStateToProps)(StepOne);