import { useCallback, useEffect, useState, useMemo } from "react";
import StepProgress from "./step.progress";
import { Alert, Form, Tooltip } from "antd";
import CustomButton from "../../button/button";
import { useLocation } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import Drawer from "../../../core/shared/drawer";
import BasicInfo from "./basic.info";
import IdentityDocuments from "./identity.documents";
import { kyckybTitles, openNotification, reKycIconTitle } from "../services";
import { setCurrentKycState, setIsKycorKybFlowEbabled, setKycStatus } from "../../../reducers/userconfig.reducer";
import PreviewModal from "../../shared/preview.model";
import KycDocument from "../../shared/document.preview";
import {
  fetchKycReviewInfo,
  formatDate,
  renderField,
  submitKycDetails,
} from "../http.services";
import KycDetailsloader from "../../skeleton/kycDetails.loader";
import { decryptAES } from "../../shared/encrypt.decrypt";

const isAddress = false

const ReviewComponent = ({ setShowStatus }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const userProfileInfo = useSelector((state) => state.userConfig.details);
  const currentKycStatus = useSelector((state) => state.userConfig.kycStatus);
  const [error, setError] = useState(null);
  const [loader, setLoader] = useState(false);
  const [btnLoader, setBtnLoader] = useState(false);
  const [data, setData] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openIdentityDrawer, setOpenIdentityDrawer] = useState(false);
  const location = useLocation();
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const actionFrom = useMemo(() => {
    const action = queryParams.get("actionFrom");
    return action && action !== "null" && action !== "undefined"
      ? action
      : "default";
  }, [queryParams]);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState("");
  const reKycEnabled = useSelector((store) => store.userConfig.reKycEnabled);
  const kycType = useSelector((store) => store.userConfig.metadata?.kycType);
  const fetchKycDetails = useCallback(async () => {
    await fetchKycReviewInfo(setLoader, onSuccessData, setError);
  }, []);
  const onSuccessData = useCallback((data) => {
    setData(data);
  }, []);
  const onSuccessUpdate = useCallback(() => {
    fetchKycDetails();
    setOpenDrawer(false);
    openNotification("Personal details updated successfully");
  }, [fetchKycDetails]);
  const onCancel = useCallback(() => {
    setOpenDrawer(false);
  }, []);
  const onsuccessDocs = useCallback(() => {
    fetchKycDetails();
    setOpenIdentityDrawer(false);
    openNotification("Identity details updated successfully");
  }, [fetchKycDetails]);
  const steps = useMemo(() => [
    { number: 1, label: "Basic Information", isActive: true, isCompleted: true },
    { number: 2, label: "Identification Document", isActive: true, isCompleted: true },
    { number: 3, label: "Review", isActive: true, isCompleted: true },
  ], []);
  const onSuccess = useCallback(() => {
    const KycStatus = currentKycStatus === 'Rejected' ? 'Pending' : 'Submitted';
    dispatch(setKycStatus(KycStatus));
    setShowStatus(true);
  }, [currentKycStatus, dispatch, setShowStatus]);
  const onSubmit = useCallback(async () => {
    await submitKycDetails(setBtnLoader, onSuccess, setError, { userProfileInfo });
  }, [userProfileInfo, onSuccess]);
  const handleDrawer = useCallback((e) => {
    e.preventDefault();
    setOpenDrawer(true);
  }, []);
  const handleIdentityDrawer = useCallback((e) => {
    e.preventDefault();
    setOpenIdentityDrawer(true);
  }, []);
  const onIdentityDrawerClose = useCallback(() => {
    setOpenIdentityDrawer(false);
  }, []);
  const handleClosePreview = useCallback(() => {
    setIsPreviewVisible(false);
    setPreviewFile("");
  }, []);
  const handlePreview = useCallback((file) => {
    const fileUrl = file.url || file.thumbUrl || file.response?.url;
    if (fileUrl) {
      setPreviewFile(fileUrl);
      setIsPreviewVisible(true);
    } else {
      console.error("Preview URL is not available.");
    }
  }, []);
  const onDownload = useCallback((file) => {
    const fileUrl = file.url || file.response?.url;
    if (fileUrl) {
      window.open(fileUrl, "_self");
    } else {
      console.error("Download URL is not available.");
    }
  }, []);
  const bgColors = useMemo(() => ({
    Approved: "!text-paidApproved !border !border-paidApproved",
    Submitted: "!text-submiteted !border !border-submiteted",
    Rejected: "!text-canceled !border !border-canceled",
    "under review": "!text-submiteted !border !border-submiteted",
    "Under Review": "!text-submiteted !border !border-submiteted",
    "approval in progress": "!text-submiteted !border !border-submiteted",
    "Approval In Progress": "!text-submiteted !border !border-submiteted",
    Pending: "bg-skyBlueGradient"
  }), []);
  const clearErrorMessage = useCallback(() => {
    setError(null);
  }, []);
  const handleReKyc = useCallback(() => {
    dispatch(setCurrentKycState(null));
    dispatch(setKycStatus("Draft"));
    dispatch(setIsKycorKybFlowEbabled(true));
  }, [dispatch]);

  useEffect(() => {
    if (userProfileInfo) {
      fetchKycDetails();
    }
  }, [userProfileInfo, fetchKycDetails]);

  return (
    <>
      {loader && <KycDetailsloader />}
      <div className="text-secondaryColor kpicardbg h-full">
        <div className="h-full rounded-2xl bg-kpiCard">
          <div className="basicinfo-form">
            <div className="w-full px-5 py-5 flex gap-4">
              <div className="text-right flex-1">
                <h1 className="text-lightWhite text-3xl font-semibold text-center mb-1">
                  KYC
                </h1>
                <div className="flex items-center gap-1 justify-center">
                  {![null, "draft", "Draft"].includes(currentKycStatus) &&
                    <span className={`${bgColors[currentKycStatus]} font-semibold text-xs px-2 py-1 rounded-full`}>
                      {currentKycStatus}
                    </span>
                  }
                  {currentKycStatus === "Rejected" &&
                    <Tooltip title={`${userProfileInfo?.kycRemarks}`}>
                      <span className="icon md info"></span>
                    </Tooltip>
                  }
                </div>
              </div>
              {reKycEnabled &&
                <div className="gap-2 flex items-center ">
                  <Tooltip title={`Re KYC`}>
                    <button className="icon re-kyc" onClick={handleReKyc}></button>
                  </Tooltip>
                  <Tooltip title={`${reKycIconTitle}`}>
                    <span className="icon provider-info" ></span>
                  </Tooltip>
                </div>
              }
            </div>
            {currentKycStatus !== "Approved" &&
              userProfileInfo?.currentKycState !== 2 && (
                <p className="text-sm font-normal text-lightWhite text-center mt-4 mb-7">
                  {`${kyckybTitles[actionFrom]}`} our partners require some information from you
                </p>
              )}
            <div className="">
              <div className="w-full ">
                {currentKycStatus !== "Approved" &&
                  userProfileInfo?.currentKycState !== 2 && (
                    <StepProgress steps={steps} />
                  )}
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
                <Form form={form} onFinish={onSubmit}>
                  <div className="mt-3 w-full rounded-5 border-dbkpiStroke p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-semibold text-titleColor mb-2" id="basic-info-title">
                        1. Basic Information
                      </h3>
                      {kycType.toLowerCase() !== "sumsub" &&
                        <>
                          {!["under review", "rejected"].includes(
                            currentKycStatus?.toLowerCase()
                          ) && (
                              <Tooltip title="Edit">
                                <button onClick={(e) => handleDrawer(e)} className="">
                                  <span className="icon Edit-links cursor-pointer"></span>
                                </button>
                              </Tooltip>
                            )}
                        </>
                      }
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                      {data?.customerKycDetails?.firstName &&
                        renderField("First Name", data?.customerKycDetails?.firstName)}
                      {data?.customerKycDetails?.lastName &&
                        renderField("Last Name", data?.customerKycDetails?.lastName)}
                      {data?.customerKycDetails?.gender &&
                        renderField("Gender", data?.customerKycDetails?.gender, "", "capitalize")}
                      {data?.customerKycDetails?.dob &&
                        renderField("Date Of Birth", data?.customerKycDetails?.dob, formatDate)}
                    </div>
                    {isAddress &&
                      <>
                        <div className="flex items-center justify-between">
                          <h3 className="text-2xl font-semibold text-titleColor mb-2 mt-5" id="address-title">
                            2. Address
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                          {data?.customerKycDetails?.addressDetails?.country &&
                            renderField("Country", data?.customerKycDetails?.addressDetails?.country)}
                          {data?.customerKycDetails?.addressDetails?.state &&
                            renderField("State", data?.customerKycDetails?.addressDetails?.state)}
                          {data?.customerKycDetails?.addressDetails?.town &&
                            renderField("Town", data?.customerKycDetails?.addressDetails?.town)}
                          {data?.customerKycDetails?.addressDetails?.city &&
                            renderField("City", data?.customerKycDetails?.addressDetails?.city)}
                          {data?.customerKycDetails?.addressDetails?.addressLine1 &&
                            renderField("Address Line 1", data?.customerKycDetails?.addressDetails?.addressLine1)}
                          {data?.customerKycDetails?.addressDetails?.addressLine2 &&
                            renderField("Address Line 2", data?.customerKycDetails?.addressDetails?.addressLine2)}
                          {data?.customerKycDetails?.addressDetails?.postalCode &&
                            renderField("Postal Code", data?.customerKycDetails?.addressDetails?.postalCode, "", "uppercase")}
                          {data?.customerKycDetails?.addressDetails?.phoneNumber &&
                            renderField("Phone Number", `${data?.customerKycDetails?.addressDetails?.phoneCode} ${data?.customerKycDetails?.addressDetails?.phoneNumber}`)}
                          {data?.customerKycDetails?.addressDetails?.email &&
                            renderField("Email", data?.customerKycDetails?.addressDetails?.email)}
                        </div>
                      </>
                    }
                  </div>
                  <div className="mt-6 w-full rounded-5 border-dbkpiStroke px-5 py-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-semibold text-titleColor mb-2" id="identification-title">
                        2. Identification Document
                      </h3>
                      {kycType.toLowerCase() !== "sumsub" &&
                        <> {!["under review"].includes(
                          currentKycStatus?.toLowerCase()
                        ) && (
                            <Tooltip title="Edit">
                              <button
                                onClick={(e) => handleIdentityDrawer(e)}
                                className=""
                              >
                                <span className="icon Edit-links cursor-pointer"></span>
                              </button>
                            </Tooltip>
                          )}
                        </>
                      }
                    </div>
                    <div>
                      {data?.kycDocInfo?.kycDocInfo?.map((doc, index) => {
                        const docType = decryptAES(doc?.documentType) || "--";
                        let docNumber = doc?.number || "";
                        let docExpireDate = doc?.expiryDate || "";
                        // if (docType.toLowerCase() === "passport") {
                        //   docNumber = doc.ppDocNumber || "";
                        //   docExpireDate = doc.ppDocExpireDate || "";
                        // } else if (docType.toLowerCase() === "national id") {
                        //   docNumber = doc.niDocNumber || "";
                        //   docExpireDate = doc.niDocExpireDate || "";
                        // }
                        return (
                          <div key={doc.id || index}>
                            <div className="grid md:grid-cols-2 gap-6 mb-4">
                              <div>
                                <label htmlFor={`doc-type-${index}`} className="mb-0 text-paraColor text-sm font-medium">
                                  Document Type
                                </label>
                                <p id={`doc-type-${index}`} className="mb-0 text-subTextColor text-sm font-semibold">
                                  {docType || "--"}
                                </p>
                              </div>
                              {docNumber && <div>
                                <label htmlFor={`doc-number-${index}`} className="mb-0 text-paraColor text-sm font-medium">
                                  Document Number
                                </label>
                                <p id={`doc-number-${index}`} className="mb-0 text-subTextColor text-sm font-semibold">
                                  {docNumber || "--"}
                                </p>
                              </div>}
                              {docExpireDate && <div>
                                <label htmlFor={`doc-expiry-${index}`} className="mb-0 text-paraColor text-sm font-medium">
                                  Document Expiry Date
                                </label>
                                <p id={`doc-expiry-${index}`} className="mb-0 text-subTextColor text-sm font-semibold">
                                  {formatDate(docExpireDate) || "--"}
                                </p>
                              </div>}
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
                              {doc?.selfieImage && (
                                <KycDocument
                                  label="Face Photo"
                                  imageUrl={doc.selfieImage}
                                  onPreview={handlePreview}
                                  onDownload={onDownload}
                                />
                              )}
                              {doc?.frontImage && (
                                <KycDocument
                                  label="Front ID Photo"
                                  imageUrl={doc.frontImage}
                                  onPreview={handlePreview}
                                  onDownload={onDownload}
                                />
                              )}
                              {doc?.backDocImage && (
                                <KycDocument
                                  label="Back ID Photo"
                                  imageUrl={doc.backDocImage}
                                  onPreview={handlePreview}
                                  onDownload={onDownload}
                                />
                              )}
                              {doc?.handHoldingImage && (
                                <KycDocument
                                  label="Hand Holding ID Photo"
                                  imageUrl={doc.handHoldingImage}
                                  onPreview={handlePreview}
                                  onDownload={onDownload}
                                />
                              )}
                              {doc?.singatureImage && (
                                <KycDocument
                                  label="Signature Photo"
                                  imageUrl={doc.singatureImage}
                                  onPreview={handlePreview}
                                  onDownload={onDownload}
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {(currentKycStatus === null ||
                    currentKycStatus === "Draft" || currentKycStatus === "Rejected") && (
                      <div className="text-end mt-[30px]">
                        <CustomButton
                          type="primary"
                          htmlType="submit"
                          loading={btnLoader}
                          disabled={btnLoader}
                        >
                          {currentKycStatus === 'Rejected' ? 'Resubmit' : ' Save & Continue'}
                        </CustomButton>
                      </div>
                    )}
                </Form>
              </div>
            </div>
          </div>
        </div>
        <PreviewModal
          isVisible={isPreviewVisible}
          fileUrl={previewFile}
          onClose={handleClosePreview}
        />
        <Drawer isOpen={openDrawer} onClose={onCancel} title={"Edit KYC"}>
          <BasicInfo
            hideWizard={true}
            onSuccessInfo={onSuccessUpdate}
            onCancel={onCancel}
          />
        </Drawer>
        <Drawer
          isOpen={openIdentityDrawer}
          onClose={onIdentityDrawerClose}
          title={"Edit Identification Document"}
        >
          <IdentityDocuments hideWizard={true} onsuccessDocs={onsuccessDocs} />
        </Drawer>
      </div>
    </>
  );
};

export default ReviewComponent;