
import React, { useCallback, useEffect, useState } from "react";
import StepProgress from "./step.progress";
import { Form, Alert } from "antd";
import { useDispatch, useSelector } from "react-redux";
import CustomButton from "../../button/button";
import { openNotification } from "../services";
import { setCurrentKycState } from "../../../reducers/userconfig.reducer";
import FileUpload from "../../shared/file.upload";
import CompanyDataloader from "../../skeleton/kyb.loaders/companydata.loader";
import {
  checkFileName,
  checkFileSize,
  checkValidExtension,
  updateFileList,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
  fileValidations,
} from "../../shared/fileUploadVerifications";
import {
  fetchKycDocDetails,
  sendKYCDocumentInformation,
} from "../http.services";
import { decryptAES, encryptAES } from "../../shared/encrypt.decrypt";

const IdentityDocuments = (props) => {
  const [form] = Form.useForm();
  const useDivRef = React.useRef(null);
  const dispatch = useDispatch();
  const [fileLists, setFileLists] = useState({
    frontImage: [],
    handHoldingImage: [],
    singatureImage: [],
    backDocImage: [],
    selfieImage: [],
    passwordImage: [],
    nationalIdFrontImage: [],
    nationalIdBackImage: [],
  });
  const userProfileInfo = useSelector((state) => state.userConfig.details);
  const [error, setError] = useState(null);
  const [loader, setLoader] = useState(false);
  const [btnLoader, setBtnLoader] = useState(false);
  const [docData, setDocData] = useState(null);
  const [previewImages, setPreviewImages] = useState({
    frontImage: "",
    handHoldingImage: "",
    singatureImage: "",
    backDocImage: "",
    selfieImage: "",
    passwordImage: "",
    nationalIdFrontImage: "",
    nationalIdBackImage: "",
  });
  const [pdfPreview, setPdfPreview] = useState({
    frontImage: "",
    handHoldingImage: "",
    singatureImage: "",
    backDocImage: "",
    selfieImage: "",
    passwordImage: "",
    nationalIdFrontImage: "",
    nationalIdBackImage: "",
  });
  const kycExcemptionObj = useSelector(
    (state) => state.kycStore.excemptionFields
  );
  const [hiddenFields, setHiddenFields] = useState([]);

  const isFieldHidden = (fieldName) => hiddenFields?.includes(fieldName);
  useEffect(() => {
    if (kycExcemptionObj) {
      const step2Fields = kycExcemptionObj.step2?.split(",") || [];
      setHiddenFields(step2Fields);
    }
  }, [kycExcemptionObj]);

  const steps = [
    {
      number: 1,
      label: "Basic Information",
      isActive: true,
      isCompleted: true,
    },
    { number: 2, label: "Identification Document", isActive: true },
    { number: 3, label: "Review", isActive: false },
  ];
  useEffect(() => {
    if (userProfileInfo?.id || props?.hideWizard) {
      fetchKycDetails();
    }
  }, [userProfileInfo, props?.hideWizard]);
  const setErrorState = useCallback((error) => {
    handleScrollTop();
    setError(error);
  }, []);


  const setData = (response) => {
    setDocData(response);
    const getFileNameFromUrl = (url) => {
      const parsedUrl = new URL(url);
      return parsedUrl.pathname.split("/").pop();
    };
    const passportData = response.find(doc => decryptAES(doc.documentType) === "Passport" || decryptAES(doc.documentType) === "PASSPORT" || decryptAES(doc.documentType).toLowerCase() === "passport");
    const nationalIdData = response.find(doc => decryptAES(doc.documentType) === "National ID" || decryptAES(doc.documentType) === "National_ID")
    form.setFieldsValue({
      documentType: passportData?.documentType || nationalIdData?.documentType,
      frontImage: passportData?.frontImage,
      handHoldingImage: passportData?.handHoldingImage,
      singatureImage: passportData?.singatureImage,
      backDocImage: passportData?.backDocImage,
      selfieImage: passportData?.selfieImage,
      passwordImage: passportData?.passwordImage,
      nationalIdFrontImage: nationalIdData?.frontImage,
      nationalIdBackImage: nationalIdData?.backDocImage,
    });

    const newFileLists = {
      frontImage: [],
      handHoldingImage: [],
      singatureImage: [],
      backDocImage: [],
      selfieImage: [],
      passwordImage: [],
      nationalIdFrontImage: [],
      nationalIdBackImage: [],
    };

    const newPreviewImages = {
      frontImage: "",
      handHoldingImage: "",
      singatureImage: "",
      backDocImage: "",
      selfieImage: "",
      passwordImage: "",
      nationalIdFrontImage: "",
      nationalIdBackImage: "",
    };

    if (passportData) {
      if (passportData.frontImage) {
        newFileLists.frontImage = [{ uid: "-1", name: getFileNameFromUrl(passportData.frontImage), status: "done", url: passportData.frontImage }];
        newPreviewImages.frontImage = passportData.frontImage;
      }
      if (passportData.handHoldingImage) {
        newFileLists.handHoldingImage = [{ uid: "-2", name: getFileNameFromUrl(passportData.handHoldingImage), status: "done", url: passportData.handHoldingImage }];
        newPreviewImages.handHoldingImage = passportData.handHoldingImage;
      }
      if (passportData.singatureImage) {
        newFileLists.singatureImage = [{ uid: "-3", name: getFileNameFromUrl(passportData.singatureImage), status: "done", url: passportData.singatureImage }];
        newPreviewImages.singatureImage = passportData.singatureImage;
      }
      if (passportData.selfieImage) {
        newFileLists.selfieImage = [{ uid: "-4", name: getFileNameFromUrl(passportData.selfieImage), status: "done", url: passportData.selfieImage }];
        newPreviewImages.selfieImage = passportData.selfieImage;
      }
      if (passportData.backDocImage) {
        newFileLists.backDocImage = [{ uid: "-5", name: getFileNameFromUrl(passportData.backDocImage), status: "done", url: passportData.backDocImage }];
        newPreviewImages.backDocImage = passportData.backDocImage;
      }
      if (passportData.passwordImage) {
        newFileLists.passwordImage = [{ uid: "-6", name: getFileNameFromUrl(passportData.passwordImage), status: "done", url: passportData.passwordImage }];
        newPreviewImages.passwordImage = passportData.passwordImage;
      }
    }

    if (nationalIdData) {
      if (nationalIdData.frontImage) {
        newFileLists.nationalIdFrontImage = [{ uid: "-7", name: getFileNameFromUrl(nationalIdData.frontImage), status: "done", url: nationalIdData.frontImage }];
        newPreviewImages.nationalIdFrontImage = nationalIdData.frontImage;
      }
      if (nationalIdData.backDocImage) {
        newFileLists.nationalIdBackImage = [{ uid: "-8", name: getFileNameFromUrl(nationalIdData.backDocImage), status: "done", url: nationalIdData.backDocImage }];
        newPreviewImages.nationalIdBackImage = nationalIdData.backDocImage;
      }
    }

    setFileLists(newFileLists);
    setPreviewImages(newPreviewImages);
  };
  const fetchKycDetails = async () => {
    await fetchKycDocDetails(setLoader, setData, setErrorState);
  };
  const handleScrollTop = () => {
    useDivRef.current.scrollIntoView(0, 0);
  };
  const handleUploadChange = useCallback((type, { fileList }) => {
    setError(null);

    const file = fileList[0]?.name || "";
    const fileExtension = file?.split(".").pop().toLowerCase();

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
  const removeImage = useCallback((type) => {
    setFileLists((prevFileLists) => ({
      ...prevFileLists,
      [type]: [],
    }));

    form.setFieldsValue({ [type]: null });
    setPreviewImages((prevImages) => ({ ...prevImages, [type]: "" }));
    setPdfPreview((prev) => ({ ...prev, [type]: null }));
  }, []);
  const onSuccess = (response) => {
    if (!props?.hideWizard) {
      openNotification("Identity details saved successfully");
      dispatch(setCurrentKycState(2));
      dispatch(setKycStatus("Draft"));
    } else {
      props?.onsuccessDocs(response);
    }
  };
  const getDocumentId = (type) => {
    return docData?.find(doc =>
      decryptAES(doc.documentType)?.toLowerCase() === type.toLowerCase()
    )?.id || "00000000-0000-0000-0000-000000000000";
  };
  const onSubmit = useCallback(
    async (values) => {
      const documents = [
        {
          selfieImage: values.selfieImage,
          frontImage: values.frontImage,
          handHoldingImage: values.handHoldingImage,
          singatureImage: values.singatureImage,
          backDocImage: values.backDocImage,
          documentType: encryptAES("Passport"),
          id: getDocumentId("Passport")
        },
        {
          frontImage: values.nationalIdFrontImage,
          backDocImage: values.nationalIdBackImage,
          documentType: encryptAES("National ID"),
          id: getDocumentId("National ID")
        }
      ];
      await sendKYCDocumentInformation(setBtnLoader, onSuccess, setErrorState, {
        values: { documents },
        method: props.hideWizard,
        docData,
      });
    },
    [
      userProfileInfo,
      setErrorState,
      onSuccess,
      setBtnLoader,
      props.hideWizard,
    ]
  );
  const clearErrorMessage = useCallback(() => {
    setError(null);
  }, []);
  return (
    <div>
      <div ref={useDivRef}></div>
      {loader && (
        <div className="">
          <CompanyDataloader />
        </div>
      )}
      <div
        className={` py-0  text-secondaryColor ${(!props?.hideWizard && "lg:px-2 md:px-6 sm:px-2") || ""
          } `}
      >
        <div
          className={` h-full rounded-5 kpicardbg ${(!props?.hideWizard && "lg:px-2 py-2 px-6 sm:px-3") || ""
            }`}
        >
          <div>
            {!props?.hideWizard && (
              <h1 className="text-paraColor text-3xl font-semibold text-center mb-1">
                KYC
              </h1>
            )}
            <p
              className={`text-sm font-normal text-lightWhite mt-4 mb-7 ${(!props?.hideWizard && "text-center") || ""
                }`}
            >
            </p>
            <div className="">
              <div className="w-full ">
                {!props.hdeWizard && <StepProgress steps={steps} />}
                {error !== null && (
                  <div className="alert-flex">
                    <Alert
                      type="error"
                      description={error}
                      onClose={clearErrorMessage}
                      showIcon
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
                  scrollToFirstError={{
                    behavior: "smooth",
                    block: "center",
                    inline: "center",
                  }}
                >
                  <div
                    className={`mt-6 w-full ${(!props?.hideWizard && "px-5 py-4") || ""
                      }`}
                  >

                    <div
                      className={`grid ${(!props?.hideWizard && "gap-7 xl:grid-cols-3") ||
                        "gap-6"
                        }`}
                    >
                      <h1 className="text-lg text-subTextColor font-medium mb-1.5">Passport</h1>
                    </div>
                    <div
                      className={`grid md:grid-cols-1 gap-4 ${(!props?.hideWizard && "xl:grid-cols-2") || ""
                        }`}
                    >

                      {!isFieldHidden("frontImage") && (
                        <Form.Item
                          name="frontImage"
                          className={`payees-input required-reverse ${(!props?.hideWizard && "!mb-4") || "mb-0"
                            }`}
                          rules={[{ required: true, message: "Is required" }]}
                        >
                          <div className="flex items-center justify-between mb-2 viewsmaple-image">
                            <p className="ant-form-item-required text-labelGrey text-sm font-medium">
                              Front ID Photo{" "}
                              <span className="text-requiredRed">*</span>
                            </p>
                          </div>
                          <FileUpload
                            name="frontImage"
                            fileList={fileLists.frontImage}
                            previewImage={
                              previewImages.frontImage || pdfPreview.frontImage
                            }
                            handleUploadChange={handleUploadChange}
                            handleRemoveImage={removeImage}
                          />
                        </Form.Item>
                      )}
                      {!isFieldHidden("backDocImage") && (<Form.Item
                        name="backDocImage"
                        className={`payees-input required-reverse ${(!props?.hideWizard && "!mb-4") || "mb-0"
                          }`}
                        rules={[{ required: true, message: "Is required" }]}
                      >
                        <div className="flex items-center justify-between mb-2 viewsmaple-image">
                          <p className="ant-form-item-required text-labelGrey text-sm font-medium">
                            Back ID Photo{" "}
                            <span className="text-requiredRed">*</span>
                          </p>
                        </div>
                        <FileUpload
                          name="backDocImage"
                          fileList={fileLists.backDocImage}
                          previewImage={
                            previewImages.backDocImage ||
                            pdfPreview.backDocImage
                          }
                          handleUploadChange={handleUploadChange}
                          handleRemoveImage={removeImage}
                        />
                      </Form.Item>)}
                      {!isFieldHidden("handHoldingImage") && (
                        <Form.Item
                          name="handHoldingImage"
                          className={`payees-input required-reverse ${(!props?.hideWizard && "!mb-4") || "mb-0"
                            }`}
                          rules={[{ required: true, message: "Is required" }]}
                        >
                          <div className="flex items-center justify-between mb-2 viewsmaple-image">
                            <p className="ant-form-item-required text-labelGrey text-sm font-medium">
                              Hand Holding ID Photo{" "}
                              <span className="text-requiredRed">*</span>
                            </p>
                          </div>
                          <FileUpload
                            name="handHoldingImage"
                            fileList={fileLists.handHoldingImage}
                            previewImage={
                              previewImages.handHoldingImage ||
                              pdfPreview.handHoldingImage
                            }
                            handleUploadChange={handleUploadChange}
                            handleRemoveImage={removeImage}
                          />
                        </Form.Item>
                      )}
                      {!isFieldHidden("selfieImage") && (
                        <Form.Item
                          name="selfieImage"
                          className={`payees-input required-reverse ${(!props?.hideWizard && "!mb-4") || "mb-0"
                            }`}
                          rules={[{ required: true, message: "Is required" }]}
                        >
                          <div className="flex items-center justify-between mb-2 viewsmaple-image">
                            <p className="ant-form-item-required text-labelGrey text-sm font-medium">
                              Face Photo{" "}
                              <span className="text-requiredRed">*</span>
                            </p>
                          </div>
                          <FileUpload
                            name="selfieImage"
                            fileList={fileLists.selfieImage}
                            previewImage={
                              previewImages.selfieImage ||
                              pdfPreview.selfieImage
                            }
                            handleUploadChange={handleUploadChange}
                            handleRemoveImage={removeImage}
                          />
                        </Form.Item>
                      )}
                      {!isFieldHidden("singatureImage") && (
                        <Form.Item
                          name="singatureImage"
                          className="payees-input !mb-4 required-reverse"
                          rules={[{ required: true, message: "Is required" }]}
                        >
                          <div className="flex items-center justify-between mb-2 viewsmaple-image">
                            {" "}
                            <p className="ant-form-item-required text-labelGrey text-sm font-medium">
                              Signature Photo{" "}
                              <span className="text-requiredRed">*</span>
                            </p>
                          </div>
                          <FileUpload
                            name="singatureImage"
                            fileList={fileLists.singatureImage}
                            previewImage={
                              previewImages.singatureImage ||
                              pdfPreview.singatureImage
                            }
                            handleUploadChange={handleUploadChange}
                            handleRemoveImage={removeImage}
                          />
                        </Form.Item>
                      )}
                    </div>
                    <div>
                      <h1 className="text-lg text-subTextColor font-medium mb-1.5"> National ID</h1>
                      <div className={`grid md:grid-cols-1 gap-4 ${(!props?.hideWizard && "xl:grid-cols-2") || ""
                        }`}>
                        <Form.Item
                          name="nationalIdFrontImage"
                          className={`payees-input required-reverse ${(!props?.hideWizard && "!mb-4") || "mb-0"
                            }`}
                          rules={[{ required: true, message: "Is required" }]}
                        >
                          <div className="flex items-center justify-between mb-2 viewsmaple-image">
                            <p className="ant-form-item-required text-labelGrey text-sm font-medium">
                              Front ID Photo{" "}
                              <span className="text-requiredRed">*</span>
                            </p>
                          </div>
                          <FileUpload
                            name="nationalIdFrontImage"
                            fileList={fileLists.nationalIdFrontImage}
                            previewImage={
                              previewImages.nationalIdFrontImage ||
                              pdfPreview.nationalIdFrontImage
                            }
                            handleUploadChange={handleUploadChange}
                            handleRemoveImage={removeImage}
                          />
                        </Form.Item>
                        <Form.Item
                          name="nationalIdBackImage"
                          className={`payees-input required-reverse ${(!props?.hideWizard && "!mb-4") || "mb-0"
                            }`}
                          rules={[{ required: true, message: "Is required" }]}
                        >
                          <div className="flex items-center justify-between mb-2 viewsmaple-image">
                            <p className="ant-form-item-required text-labelGrey text-sm font-medium">
                              Back ID Photo{" "}
                              <span className="text-requiredRed">*</span>
                            </p>
                          </div>
                          <FileUpload
                            name="nationalIdBackImage"
                            fileList={fileLists.nationalIdBackImage}
                            previewImage={
                              previewImages.nationalIdBackImage ||
                              pdfPreview.nationalIdBackImage
                            }
                            handleUploadChange={handleUploadChange}
                            handleRemoveImage={removeImage}
                          />
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                  <div className="text-end mt-[30px]">
                    {!props.hideWizard && (
                      <CustomButton
                        type="primary"
                        loading={btnLoader}
                        disabled={btnLoader}
                        htmlType="submit"
                      >
                        Next
                      </CustomButton>
                    )}
                    {props.hideWizard && (
                      <CustomButton
                        type="primary"
                        loading={btnLoader}
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

export default IdentityDocuments;