import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Form, Input } from "antd";
import CustomButton from "../../button/button";
import StepProgress from "../kyc/step.progress";
import { useLocation } from "react-router";
import { useSelector, useDispatch, connect } from "react-redux";
import {
  documentNumberRegex,
  validateContentRules,
  validateRegistration,
  validations,
} from "../../shared/validations";
import moment from "moment";
import {
  errorMessages,
  kyckybTitles,
  openNotification,
  tosterMessages,
} from "../services";
import { setCurrentKycState } from "../../../reducers/userconfig.reducer";
import {
  extractDocuments,
  getFormattedDate,
  getKybDetails,
  sendKYBDocumentInformation,
  uploadDataListPoints,
} from "../http.services";
import DocumentUploadForm from "./document.upload";
import CompanyDataloader from "../../skeleton/kyb.loaders/companydata.loader";
import AddAddress from "../address.component";
import {
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
  checkFileName,
  checkFileSize,
  checkValidExtension,
  fileValidations,
  updateFileList,
} from "../../shared/fileUploadVerifications";
import AppDatePicker from "../../shared/appDatePicker";
import AppSelect from "../../shared/appSelect";
 
const CompanyData = (props) => {
  const useDivRef = React.useRef(null);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const userProfileInfo = useSelector((state) => state.userConfig.details);
  const { data: lookups } = useSelector((state) => state.kybStore.lookups);
  const [fileLists, setFileLists] = useState({
    firstDocument: [],
    secondDocument: [],
    thirdDocument: [],
    fourthDocument: [],
    fifthDocument: [],
  });
  const [error, setError] = useState(null);
  const [deletedRecord, setDeletedRecord] = useState([]);
  const [btnLoader, setBtnLoader] = useState(false);
  const [loader, setLoader] = useState(false);
  const [uploadDataList, setUploadDataList] = useState([]);
  const [kycDetails, setKycDetails] = useState(null);
  const [previewImages, setPreviewImages] = useState({
    firstDocument: "",
    secondDocument: "",
    thirdDocument: "",
  });
  const [pdfPreview, setPdfPreview] = useState({
    firstDocument: null,
    secondDocument: null,
    thirdDocument: null,
  });
  const steps = [
    { number: 1, label: "Company", isActive: true },
    { number: 2, label: "UBO", isActive: false },
    { number: 3, label: "Directors", isActive: false },
    { number: 4, label: "Review", isActive: false },
  ];
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const actionFrom = useMemo(() => {
    const action = queryParams.get("actionFrom");
    return action && action !== "null" && action !== "undefined"
      ? action
      : "default";
  }, [queryParams.get("actionFrom")]);
  const kycExcemptionObj = useSelector(
    (state) => state.kybStore.kycExcemtionObj
  );
  const [hiddenFields, setHiddenFields] = useState([]);
  const [hideDocumentUpload, setHideDocumentUpload] = useState(false);
 
  const isFieldHidden = (fieldName) => hiddenFields?.includes(fieldName);
 
  useEffect(() => {
    if (kycExcemptionObj) {
      const step1Fields = kycExcemptionObj.step1?.split(",") || [];
      setHiddenFields(step1Fields);
      if (step1Fields.includes("documents")) {
        setHideDocumentUpload(true);
      }
    }
  }, [kycExcemptionObj]);
  useEffect(() => {
    uploadDataListPoints(setUploadDataList, setLoader, setErrorState);
  }, []);
  useEffect(() => {
    if (userProfileInfo?.id) {
      fetchKybDetails();
    }
  }, [userProfileInfo]);
  const setErrorState = useCallback((error) => {
    handleScrollTop();
    setError(error);
  }, []);
  const getBaseFormValues = (response, formattedDate) => ({
    companyName: response?.companyName || "",
    registrationNumber: response?.registrationNumber || "",
    dateOfRegistration: formattedDate,
    companyCountry: response?.country,
    addressFirstName: response?.addressDetails?.firstName,
    addressLastName: response?.addressDetails?.lastName,
    state: response?.addressDetails?.state,
    town: response?.addressDetails?.town,
    city: response?.addressDetails?.city,
    line1: response?.addressDetails?.line1,
    line2: response?.addressDetails?.line2,
    postalCode: response?.addressDetails?.postalCode,
    email: response?.addressDetails?.email,
    country: response?.addressDetails?.country,
    phoneNumber: response?.addressDetails?.phoneNumber,
    phoneCode: response?.addressDetails?.phoneCode,
  });
  const getDocumentFields = (documents) => (
    {
      firstDocumentType: documents.fileLists.firstDocument[0]?.docType || "",
      secondDocumentType: documents.fileLists.secondDocument[0]?.docType || "",
      thirdDocumentType: documents.fileLists.thirdDocument[0]?.docType || "",
      fourthDocumentType: documents?.fileLists?.fourthDocument[0]?.docType || "",
      fifthDocumentType: documents?.fileLists?.fifthDocument[0]?.docType || "",
      firstDocument: documents?.previewImages?.firstDocument || "",
      secondDocument: documents?.previewImages?.secondDocument || "",
      thirdDocument: documents?.previewImages?.thirdDocument || "",
      fourthDocument: documents?.previewImages?.fourthDocument || "",
      fifthDocument: documents?.previewImages?.fifthDocument || "",
    });
  const setData = useCallback((response) => {
    setKycDetails(response);
    const formattedDate = getFormattedDate(response?.dateOfRegistration);
    if (response?.kybDocs?.length > 0) {
      const documents = extractDocuments(response?.kybDocs);
      setFileLists(documents?.fileLists);
      setPreviewImages(documents?.previewImages);
      form.setFieldsValue({
        ...getBaseFormValues(response, formattedDate),
        ...getDocumentFields(documents),
      });
    } else {
      form.setFieldsValue({
        ...getBaseFormValues(response, formattedDate),
      });
    }
  }, []);
  const fetchKybDetails = async () => {
    await getKybDetails(setLoader, setData, setErrorState);
  };
  const onFieldChange = useCallback((fieldName, value) => {
    if (fieldName === "dateOfRegistration") {
      if (value) value = moment(value, "DD/MM/YYYY", true);
    }
    form.setFieldsValue({ [fieldName]: value });
  }, []);
 
  const onSuccess = (res) => {
    if (!props?.hideWizard) {
      openNotification(tosterMessages.success);
      dispatch(setCurrentKycState(1));
      dispatch(setKycStatus("Draft"));
    } else {
      props?.onsuccessDocs(res);
    }
  };
  const handleCancel = useCallback(() => {
    props?.onCancel();
  }, []);
  const onSubmit = useCallback(async () => {
    const rawValues = { ...form.getFieldsValue(true) };
    const values = Object.keys(rawValues).reduce((acc, key) => {
      acc[key] =
        typeof rawValues[key] === "string"
          ? rawValues[key]?.trim()
          : rawValues[key];
      return acc;
    }, {});
    const selectedDocTypes = [
      values.firstDocumentType,
      values.secondDocumentType,
      values.thirdDocumentType,
      values.fourthDocumentType,
      values.fifthDocumentType,
    ].filter(Boolean);
      const hasDuplicates = new Set(selectedDocTypes).size !== selectedDocTypes.length;
      if (hasDuplicates) {
        handleScrollTop();
        setError(errorMessages.documentsError);
        return;
      }
    const documents = Object.keys(fileLists).reduce((acc, key) => {
      const files = fileLists[key];
      const fileObjects = files
        .filter((file) => file.status === "done")
        .map((file) => ({
          docType: values[`${key}Type`],
          url: file?.response?.[0] || file?.url,
          recordStatus: file.recordStatus || null,
          id: file?.id,
          recorder: file?.recorder,
        }));
      return [...acc, ...fileObjects];
    }, []);
    let delRec = [];
    if (deletedRecord?.length > 0) {
      delRec = deletedRecord.map((deletedFile) => ({
        docType: deletedFile?.docType,
        url: deletedFile?.url,
        recordStatus: "Deleted",
        id: deletedFile?.id,
        recorder: deletedFile?.recorder,
      }));
    }
    const finalDocuments = [...documents, ...delRec];
    await sendKYBDocumentInformation(setBtnLoader, onSuccess, setErrorState, {
      values,
      userProfileInfo,
      id: kycDetails?.id,
      documents: finalDocuments,
      method: props?.hideWizard,
    });
  }, [
    hideDocumentUpload,
    fileLists,
    deletedRecord,
    userProfileInfo,
    kycDetails,
  ]);
  const handleScrollTop = () => {
    useDivRef.current.scrollIntoView(0, 0);
  };
  const handleUploadChange = useCallback((type, { fileList }) => {
    setError(null);
    const file = fileList[0]?.name || "";
    const fileExtension = file?.split(".").pop().toLowerCase();
    const recorderMapping = { firstDocument: 1, secondDocument: 2, thirdDocument: 3, fourthDocument: 4, fifthDocument: 5 };
    const isValidFileExtension = checkValidExtension(
      fileExtension,
      ALLOWED_EXTENSIONS
    );
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
    const updatedFileList = updateFileList(
      fileList,
      type,
      recorderMapping[type]
    );
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
        const imageUrl =
          latestFile?.response[0] ||
          URL.createObjectURL(latestFile?.originFileObj);
        form.setFieldsValue({ [type]: imageUrl });
        setPreviewImages((prevImages) => ({ ...prevImages, [type]: imageUrl }));
      } else if (latestFile.type === "application/pdf") {
        const pdfUrl =
          latestFile?.response[0] ||
          URL.createObjectURL(latestFile?.originFileObj);
        setPdfPreview((prev) => ({ ...prev, [type]: pdfUrl }));
        form.setFieldsValue({ [type]: pdfUrl });
        setPreviewImages((prevImages) => ({ ...prevImages, [type]: pdfUrl }));
      }
    } else if (latestFile?.status === "error") {
      setError("Upload failed. Please try again.");
    }
  };
 
  const removeImage = useCallback(
    (type) => {
      setError(null);
      const deletedRecords = fileLists[type]
        .filter(
          (file) =>
            file.id && file.id !== "00000000-0000-0000-0000-000000000000"
        )
        .map((file) => ({
          ...file,
          recordStatus: "Deleted",
          id: file?.id,
          recorder: file?.recorder,
        }));
      if (deletedRecords.length > 0) {
        setDeletedRecord((prev) => [...prev, ...deletedRecords]);
      }
 
      setFileLists((prevFileLists) => ({
        ...prevFileLists,
        [type]: [],
      }));
      form.setFieldsValue({ [type]: null });
      setPreviewImages((prevImages) => ({ ...prevImages, [type]: "" }));
      setPdfPreview((prev) => ({ ...prev, [type]: null }));
    },
    [fileLists]
  );
  const onCloseError = useCallback(() => {
    setError(null);
  }, []);
  const handleDateChange = useCallback(
    (_, dateString) =>
      onFieldChange(
        "dateOfRegistration",
        dateString ? moment(dateString, "DD/MM/YYYY") : null
      ),
    [onFieldChange]
  );
  const handleFieldChange = useCallback(
    (fieldName) => (e) => {
      const value = e?.target ? e.target.value : e;
      onFieldChange(fieldName, value);
    },
    [onFieldChange]
  );
  return (
    <div>
      <div ref={useDivRef}></div>
      {loader && <CompanyDataloader />}
      {!loader && (
        <div className="">
          <div
            className={`h-full kpicardbg ${(!props?.hideWizard && "pb-8") || ""}`}
          >
            <div className="basicinfo-form">
              {!props?.hideWizard && (
                <h1 className="flex text-center justify-center items-center text-lightWhite text-3xl font-semibold ">
                  KYB
                </h1>
              )}
              {!props?.hideWizard && (
                <p
                  className={`text-sm font-normal text-paraColor mt-4 mb-7 ${(!props?.hideWizard && "text-center") || ""
                    }`}
                >
                  {kyckybTitles[actionFrom]} our partners require some
                  information from you
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
                        onClose={onCloseError}
                        showIcon
                      />
                      <button
                        className="icon sm alert-close"
                        onClick={onCloseError}
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
                      className={`mt-10 w-full ${(!props?.hideWizard && "px-5 py-4") || ""
                        }`}
                    >
                      <div
                        className={`grid grid-cols-1 gap-6 ${(!props?.hideWizard &&
                            "lg:grid-cols-2 md:grid-cols-2 xl:grid-cols-2") ||
                          ""
                          }`}
                      >
                        {!isFieldHidden("companyName") && (
                          <Form.Item
                            label="Company Name"
                            name="companyName"
                            rules={[
                              { required: true, message: "Is required" },
                              {
                                whitespace: true,
                                message: "Invalid Company Name ",
                              },
                              { validator: validateContentRules },
                            ]}
                            className="mb-0"
                          >
                            <Input
                              placeholder="Enter Company Name"
                              maxLength={50}
                              className="bg-transparent border-[1px] border-inputBg text-lightWhite p-2 rounded outline-0"
                              onChange={handleFieldChange("companyName")}
                            />
                          </Form.Item>
                        )}
                        {!isFieldHidden("country") && (
                          <Form.Item
                            label="Country"
                            name="companyCountry"
                            className="mb-0 custom-select-float"
                            rules={[{ required: true, message: "Is required" }]}
                            colon={false}
                          >
                            <AppSelect
                              showSearch
                              autoComplete="off"
                              className="p-0 rounded outline-0 w-full text-lightWhite"
                              placeholder="Select Country"
                              options={lookups?.countries || []}
                              onChange={handleFieldChange("companyCountry")}
                              fieldNames={{ label: "name", value: "name" }}
                            />
                          </Form.Item>
                        )}
                        {!isFieldHidden("registrationNumber") && (
                          <Form.Item
                            label="Registration Number"
                            name="registrationNumber"
                            rules={[
                              { required: true, message: "Is required" },
                              {
                                whitespace: true,
                                message: "Invalid Registration Number",
                              },
                              validations.regexValidator(
                                "registration number",
                                documentNumberRegex
                              ),
                            ]}
                            className="mb-0"
                            colon={false}
                          >
                            <Input
                              placeholder="Enter Registration Number"
                              maxLength={50}
                              className="bg-transparent border-[1px] border-inputBg text-lightWhite p-2 rounded outline-0 uppercase placeholder:capitalize"
                              onChange={handleFieldChange("registrationNumber")}
                            />
                          </Form.Item>
                        )}
                        {!isFieldHidden("dateOfRegistration") && (
                          <Form.Item
                            label="Date of Registration (Future dates not allowed)"
                            name="dateOfRegistration"
                            rules={[
                              { required: true, message: "Is required" },
                              { validator: validateRegistration },
                            ]}
                            className="mb-0"
                          >
                            <AppDatePicker onChange={handleDateChange} />
                          </Form.Item>
                        )}
                      </div>
                    </div>
                    {/* <AddAddress
                      isVisible={true}
                      hideWizard={props?.hideWizard}
                      address={kycDetails?.addressDetails}
                      form={form}
                      FormInstance={Form}
                      countries={lookups?.countries || []}
                      phoneCodes={lookups?.phoneCodes || []}
                      states={lookups?.states || []}
                    /> */}
                    {!hideDocumentUpload && (
                      <DocumentUploadForm
                        props={props}
                        documentTypeLu={lookups?.kybDocTypes || []}
                        fileLists={fileLists}
                        previewImages={previewImages || pdfPreview}
                        handleUploadChange={handleUploadChange}
                        removeImage={removeImage}
                        uploadDataList={uploadDataList}
                        hideWizard={props?.hideWizard}
                      />
                    )}
                    <div className="mt-6 text-right">
                      {!props?.hideWizard && (
                        <CustomButton
                          type="primary"
                          className={"md:ml-3.5"}
                          loading={btnLoader}
                          disabled={btnLoader}
                          htmlType="submit"
                        >
                          Save & Continue
                        </CustomButton>
                      )}
                      {props?.hideWizard && (
                        <CustomButton
                          type="primary"
                          loading={btnLoader}
                          className={""}
                          disabled={btnLoader}
                          htmlType="submit"
                        >
                          SAVE
                        </CustomButton>
                      )}
                       {props?.hideWizard && (
                        <CustomButton
                          className={"md:ml-3.5"}
                          htmlType="reset"
                          onClick={handleCancel}
                        >
                          Close
                        </CustomButton>
                      )}
                    </div>
                  </Form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
const connectStateToProps = ({ userConfig }) => {
  return {
    trackauditlogs: userConfig?.trackAuditLogData,
  };
};
export default connect(connectStateToProps)(CompanyData);