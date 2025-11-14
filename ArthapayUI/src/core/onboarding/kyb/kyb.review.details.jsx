import { useCallback, useEffect, useState, useMemo } from "react";
import { Alert, Form, Tooltip } from "antd";
import CustomButton from "../../button/button";
import StepProgress from "../kyc/step.progress";
import { useLocation } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import CommonDrawer from "../../shared/drawer";
import UBODrawerForm from "./ubo/ubo.details";
import DirectorsForm from "./directors";
import moment from "moment";
import CompanyData from "./company.data";
import Moment from "react-moment";
import { convertUTCToLocalTime } from "../../shared/validations";
import { errorMessages, kyckybTitles, openNotification, reKycIconTitle, tosterMessages } from "../services";
import { setCurrentKycState, setKycStatus } from "../../../reducers/userconfig.reducer";
import BusinessDataDelete from "../delete.confirmation";
import PreviewModal from "../../shared/preview.model";
import CompanyDataloader from "../../skeleton/kyb.loaders/companydata.loader";
import KycDocument from "../../shared/document.preview";
import UBOView from "./ubo/view";
import { documentTypeLabels, formatDate, getCompanyDetails, renderField, updateKYBInformation } from "../http.services";
import { decryptAES } from "../../shared/encrypt.decrypt";

// Enums for clarity and reusability
const SectionNames = {
  UBO: "UBO Details",
  DIRECTOR: "Director Details",
  SHAREHOLDER: "Shareholder Details",
  REPRESENTATIVE: "Representative Details",
};

const DrawerTypes = {
  ADD_UBO: "Add UBO",
  EDIT_UBO: "Edit UBO",
  ADD_DIRECTOR: "Add Director",
  EDIT_DIRECTOR: "Edit Director",
  ADD_SHAREHOLDER: "Add Shareholder",
  EDIT_SHAREHOLDER: "Edit Shareholder",
  ADD_REPRESENTATIVE: "Add Representative",
  EDIT_REPRESENTATIVE: "Edit Representative",
};

const DeleteModalTypes = {
  UBO: "UBO",
  DIRECTOR: "Director",
  SHAREHOLDER: "Shareholder",
  REPRESENTATIVE: "Representative",
};


const isAddress = false
const NotToDelete = false

const KybReviewDetails = ({ setShowStatus }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [data, setData] = useState("");
  const [documents, setDocuments] = useState([]);
  const userProfileInfo = useSelector((state) => state.userConfig.details);
  const { data: lookups } = useSelector((state) => state.kybStore.lookups);
  const kybSections = lookups?.KybDetailSections
  // [
  //   { name: SectionNames.UBO, code: "UBO Details" },
  //   { name: SectionNames.DIRECTOR, code: "Director Details" },
  //   { name: SectionNames.SHAREHOLDER, code: "Shareholder Details" },
  //   { name: SectionNames.REPRESENTATIVE, code: "Representative Details" }
  // ];
  const kycType = useSelector((store) => store.userConfig.metadata?.kycType);
  const [ubosData, setUbosData] = useState([]);
  const [directorsData, setDirectorsData] = useState([]);
  const [shareholdersData, setShareholdersData] = useState([]);
  const [shareholdersIndData, setShareholdersIndData] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const [ubosDrawer, setUbosDrawer] = useState(false);
  const [selectedUbosData, setSelectedUbosData] = useState(null);
  const [ubosViewDrawer, setUbosViewDrawer] = useState(false);
  const [isDirector, setIsDirector] = useState(false);
  const [viewingType, setViewingType] = useState(null);
  const [shareholderDrawer, setShareholderDrawer] = useState(false);
  const [selectedShareholderData, setSelectedShareholderData] = useState(null);
  const [shareholderIndDrawer, setShareholderIndDrawer] = useState(false);
  const [selectedShareholderIndData, setSelectedShareholderIndData] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalType, setDeleteModalType] = useState(null);
  const [deletedIndex, setDeletedIndex] = useState(null);

  const [openDrawer, setOpenDrawer] = useState(false);
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState(null);
  const [btnLoader, setBtnLoader] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState("");
  const [addressDetails, setAddressDetails] = useState(null);
  const location = useLocation();
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const actionFrom = useMemo(() => {
    const action = queryParams.get("actionFrom");
    return (action && action !== 'null' && action !== 'undefined') ? action : 'default';
  }, [queryParams]);

  const fetchKycDetails = useCallback(async () => {
    getCompanyDetails(setLoader, onSuccessData, setError);
  }, []);

  useEffect(() => {
    if (userProfileInfo?.id) {
      fetchKycDetails();
    }
  }, [userProfileInfo, fetchKycDetails]);

  const currentKybStatus = useSelector((state) => state.userConfig.kycStatus);
  const reKycEnabled = useSelector((store) => store.userConfig.reKycEnabled);

  const onSuccessData = (data) => {
    setData(data?.businessCustomerDetails || {});
    setDocuments(data?.businessCustomerDetails?.kybDocs || []);
    setUbosData(data?.ubos || []);
    setDirectorsData(data?.directors || []);
    setShareholdersData(data?.shareholder || []);
    setShareholdersIndData(data?.representative || []);
    setAddressDetails(data?.businessCustomerDetails?.addressDetails || null);
  };

  const onsuccessDocs = useCallback(() => {
    fetchKycDetails();
    setOpenDrawer(false);
    //dispatch(setKycStatus("Pending"));
    openNotification(tosterMessages.update);
  }, [dispatch, fetchKycDetails]);

  const steps = [
    { number: 1, label: "Company", isActive: true, isCompleted: true },
    { number: 2, label: "UBO", isActive: true, isCompleted: true },
    { number: 3, label: "Directors", isActive: true, isCompleted: true },
    { number: 4, label: "Review", isActive: true },
  ];

  const handleSave = useCallback((obj, type) => {
    const isNew = obj.id === "00000000-0000-0000-0000-000000000000";
    let message = "";
    switch (type) {
      case 'ubo':
        setUbosDrawer(false);
        message = isNew ? tosterMessages.UBOSuccessMsg : tosterMessages.UBOUpdateMsg;
        break;
      case 'director':
        setShowForm(false);
        message = isNew ? tosterMessages.DirectorSuccessMsg : tosterMessages.DirectorUpdateMsg;
        break;
      case 'shareholder':
        setShareholderDrawer(false);
        message = isNew ? "Shareholder saved successfully!" : "Shareholder updated successfully!";
        break;
      case 'representative':
        setShareholderIndDrawer(false);
        message = isNew ? "Representative saved successfully!" : "Representative updated successfully!";
        break;
      default:
        break;
    }
    fetchKycDetails();
    openNotification(message);
  }, [fetchKycDetails]);

  const handleOpenDrawer = useCallback((type, data = null) => {
    switch (type) {
      case DrawerTypes.ADD_UBO:
        setSelectedUbosData(null);
        setUbosDrawer(true);
        break;
      case DrawerTypes.EDIT_UBO:
        setSelectedUbosData(data);
        setUbosDrawer(true);
        break;
      case DrawerTypes.ADD_DIRECTOR:
        setSelectedData(null);
        setShowForm(true);
        break;
      case DrawerTypes.EDIT_DIRECTOR:
        setSelectedData({
          ...data,
          dob: moment(data.dob).isValid() ? moment(data.dob) : null,
          dateOfRegistration: moment(data.dateOfRegistration).isValid() ? moment(data.dateOfRegistration) : null,
        });
        setShowForm(true);
        break;
      case DrawerTypes.ADD_SHAREHOLDER:
        setSelectedShareholderData(null);
        setShareholderDrawer(true);
        break;
      case DrawerTypes.EDIT_SHAREHOLDER:
        setSelectedShareholderData(data);
        setShareholderDrawer(true);
        break;
      case DrawerTypes.ADD_REPRESENTATIVE:
        setSelectedShareholderIndData(null);
        setShareholderIndDrawer(true);
        break;
      case DrawerTypes.EDIT_REPRESENTATIVE:
        setSelectedShareholderIndData(data);
        setShareholderIndDrawer(true);
        break;
      default:
        break;
    }
  }, []);

  const handleOpenDeleteDrawer = useCallback((type, index) => {
    setDeleteModalType(type);
    setDeletedIndex(index);
    setShowDeleteModal(true);
  }, []);

  const handleCloseDeleteDrawer = useCallback(() => {
    setShowDeleteModal(false);
    setDeletedIndex(null);
    setDeleteModalType(null);
  }, []);

  const onSuccessDelete = useCallback((type) => {
    handleCloseDeleteDrawer();
    fetchKycDetails();
    let message = "";
    switch (type) {
      case DeleteModalTypes.UBO:
        message = tosterMessages.UBODeleteMsg;
        break;
      case DeleteModalTypes.DIRECTOR:
        message = tosterMessages.DirectorDeleteMsg;
        break;
      case DeleteModalTypes.SHAREHOLDER:
        message = "Shareholder deleted successfully!";
        break;
      case DeleteModalTypes.REPRESENTATIVE:
        message = "Representative deleted successfully!";
        break;
      default:
        break;
    }
    openNotification(message);
  }, [fetchKycDetails, handleCloseDeleteDrawer]);

  const onCancel = useCallback(() => {
    setSelectedUbosData(null);
    setSelectedData(null);
    setShowForm(false);
    setUbosDrawer(false);
    setOpenDrawer(false);
    setShareholderDrawer(false);
    setShareholderIndDrawer(false);
    setSelectedShareholderData(null);
    setSelectedShareholderIndData(null);
  }, []);

  const onSubmit = useCallback(async () => {
    if (ubosData.length === 0) {
      setError(errorMessages.UBORequiredMsg);
      window.scrollTo(0, 0);
      return;
    }
    if (directorsData.length === 0) {
      setError(errorMessages.DirectorRequiredMsg);
      window.scrollTo(0, 0);
      return;
    }
    await updateKYBInformation(setBtnLoader, () => {
      const KybStatus = currentKybStatus === 'Rejected' ? 'Pending' : 'Submitted';
      dispatch(setKycStatus(KybStatus));
      setShowStatus(true);
    }, setError, { userProfileInfo });
  }, [userProfileInfo, ubosData, directorsData, currentKybStatus, dispatch, setShowStatus]);

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
    if (fileUrl) { window.open(fileUrl, "_self"); }
    else { console.error("Download URL is not available."); }
  }, []);
  const handleClosePreview = useCallback(() => { setIsPreviewVisible(false); setPreviewFile(""); }, []);

  const onCloseError = useCallback(() => { setError(null); }, []);
  const handleReKyc = useCallback(() => {
    dispatch(setCurrentKycState(null));
    dispatch(setKycStatus("Draft"));
    // dispatch(setIsKycorKybFlowEbabled(true)); // Assuming this is defined elsewhere
  }, [dispatch]);

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

  const getDrawerTitle = useCallback((type) => {
    switch (type) {
      case 'ubo':
        return 'UBO';
      case 'director':
        return 'Director';
      case 'shareholder':
        return 'Shareholder';
      case 'representative':
        return 'Representative';
      default:
        return '';
    }
  }, []);

  const renderTableSection = useCallback((section, idx, dataList, onAdd, onEdit, onDelete, viewDetails) => {
    const isReadOnly = ["under review"].includes(currentKybStatus?.toLowerCase());
    const sectionNumber = idx + 3;
    return (
      <div className="mt-6 w-full rounded-5 border border-StrokeColor px-5 py-5" key={section.code}>
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold text-titleColor">{sectionNumber}. {section.name}</h3>
          {!isReadOnly && (
            <div className="text-end">
              {kycType?.toLowerCase() !== "sumsub" && <Tooltip title={`Add ${section.name.split(' ')[0]}`}>
                <button
                  onClick={onAdd}
                  className="p-0 bg-0 outline-none focus:bg-none hover:bg-none focus:border-none"
                >
                  <span className="icon add"></span>
                </button>
              </Tooltip>}
            </div>
          )}
        </div>
        <div className="overflow-auto">
          <table className="w-full table-style">
            <thead>
              <tr className="dark:bg-transparent border border-StrokeColor rounded-5">
                <th className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-paraColor">Name</th>
                <th className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-paraColor">Position</th>
                <th className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-paraColor">Date Of Birth</th>
                <th className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-paraColor">Phone Number</th>
                {!isReadOnly && <th className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-paraColor">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {dataList?.filter(row => row.recordStatus !== "Deleted")?.map((row, index) => (
                <tr key={row?.id} className="mt-3 dark:bg-transparent">
                  <td className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-subTextColor">
                    <button
                      className="gridLink cursor-pointer text-primaryColor fileuploadtext font-semibold"
                      onClick={() => viewDetails(row, section.name.toLowerCase().includes('director') ? 'director' : 'ubo')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          viewDetails(row, section.name.toLowerCase().includes('director') ? 'director' : 'ubo');
                        }
                      }}
                    >
                      {row.companyName || row.firstName}
                    </button>
                  </td>
                  <td className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-subTextColor">
                    {row.uboPosition}
                  </td>
                  <td className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-subTextColor">
                    {row.dob && (
                      <Moment format="DD/MM/YYYY">
                        {convertUTCToLocalTime(row.dob)}
                      </Moment>
                    )}
                  </td>
                  <td className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-subTextColor">
                    {decryptAES(row.phoneCode)} {decryptAES(row.phoneNumber)}
                  </td>
                  {!isReadOnly && <td className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-subTextColor">
                    <div className="flex items-center gap-4">
                      <Tooltip title={`View ${section.name.split(' ')[0]}`}>
                        <button className="p-0 bg-transparent border-none outline-none" onClick={() => viewDetails(row, section.name.toLowerCase().includes('director') ? 'director' : 'ubo')}>
                          <span className="icon view-hide cursor-pointer"></span>
                        </button>
                      </Tooltip>

                      {kycType?.toLowerCase() !== "sumsub" && <Tooltip title={`Edit ${section.name.split(' ')[0]}`}>
                        <button className="p-0 bg-transparent border-none outline-none" onClick={() => onEdit(row)}>
                          <span className="icon edit-active cursor-pointer"></span>
                        </button>
                      </Tooltip>}

                      {NotToDelete && <Tooltip title={`Delete ${section.name.split(' ')[0]}`}>
                        <button className="p-0 bg-transparent border-none outline-none" onClick={() => onDelete(index)}>
                          <span className="icon delete cursor-pointer"></span>
                        </button>
                      </Tooltip>}

                    </div>
                  </td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }, [currentKybStatus]);


  const getDeleteData = () => {
    switch (deleteModalType) {
      case DeleteModalTypes.UBO:
        return ubosData;
      case DeleteModalTypes.DIRECTOR:
        return directorsData;
      case DeleteModalTypes.SHAREHOLDER:
        return shareholdersData;
      case DeleteModalTypes.REPRESENTATIVE:
        return shareholdersIndData;
      default:
        return [];
    }
  };

  const getSetDataFunction = () => {
    switch (deleteModalType) {
      case DeleteModalTypes.UBO:
        return setUbosData;
      case DeleteModalTypes.DIRECTOR:
        return setDirectorsData;
      case DeleteModalTypes.SHAREHOLDER:
        return setShareholdersData;
      case DeleteModalTypes.REPRESENTATIVE:
        return setShareholdersIndData;
      default:
        return () => { };
    }
  };


  return (
    <div>
      {loader && <CompanyDataloader />}
      <div className="h-full rounded-5 bg-kpiCard kpicardbg">
        {error && (
          <div className="alert-flex">
            <Alert
              type="error"
              description={error}
              onClose={onCloseError}
              showIcon
              className="items-center"
            />
            <button
              className="icon sm alert-close"
              onClick={onCloseError}
            ></button>
          </div>
        )}
        <div className="basicinfo-form">
          <div className="w-full px-5 py-5 flex  gap-4">
            <div className="flex-1">
              <div className="text-center">
                <h1 className="text-lightWhite text-3xl font-semibold text-center mb-1">KYB</h1>
                <div className="flex items-center gap-1 justify-center">
                  {![null, 'draft', 'Draft'].includes(currentKybStatus) &&
                    <span className={`${bgColors[currentKybStatus]} font-semibold text-xs px-2 py-1 rounded-full`}>{currentKybStatus}</span>}
                  {currentKybStatus === "Rejected" &&
                    <Tooltip title="Your request has been rejected. Please check the details and try again.">
                      <span className="icon md info"></span>
                    </Tooltip>}
                </div>
              </div>
              <div>
                {currentKybStatus !== "Approved" && userProfileInfo?.currentKycState !== 3 && (
                  <p className="text-sm font-normal text-lightWhite text-center mt-4 mb-7">
                    {kyckybTitles[actionFrom]} our partners require some
                    information from you
                  </p>
                )}
              </div>
            </div>
            {reKycEnabled &&
              <div className="flex items-center gap-3">
                <Tooltip title="Re KYC">
                  <button className="p-0 bg-transparent" onClick={handleReKyc} >
                    <span className="icon re-kyc"></span>
                  </button>
                </Tooltip>
                <Tooltip title={reKycIconTitle}>
                  <button className="p-0 bg-transparent" onClick={handleReKyc}>
                    <span className="icon provider-info"></span>
                  </button>
                </Tooltip>
              </div>
            }
          </div>

          <div className="w-full ">
            {currentKybStatus !== "Approved" && userProfileInfo?.currentKycState !== 3 && (
              <StepProgress steps={steps} />
            )}
            <Form form={form}>
              <div className="mt-3 w-full px-5 py-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold text-titleColor mb-2">1. Company</h3>
                  <div className="flex items-center gap-1">
                    {kycType.toLowerCase() !== "sumsub" && <>{!["under review"].includes(currentKybStatus?.toLowerCase()) && (
                      <Tooltip title="Edit">
                        <button onClick={() => setOpenDrawer(true)} className="">
                          <span className="icon Edit-links cursor-pointer"></span>
                        </button>
                      </Tooltip>
                    )}</>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                  {data?.companyName && renderField("Company Name", data?.companyName)}
                  {data?.country && renderField("Country", data?.country)}
                  {data?.registrationNumber && renderField("Registration Number", data?.registrationNumber, '', 'uppercase')}
                  {data?.dateOfRegistration && renderField("Date of Registration", data?.dateOfRegistration, formatDate)}
                  {data?.website && renderField("Website", data?.website)}
                  {data?.flatNumber && renderField("Flat Number", data?.flatNumber)}
                  {data?.buildingNumber && renderField("Building Number", data?.buildingNumber)}
                  {data?.street && renderField("Street", data?.street)}
                  {data?.town && renderField("Town", data?.town)}
                  {data?.city && renderField("City", data?.city)}
                  {data?.state && renderField("State", data?.state)}
                  {data?.postCode && renderField("Postal Code", data?.postCode)}

                </div>

                {isAddress &&
                  <>
                    <h3 className="text-2xl font-semibold text-titleColor mt-3 mb-2">2. Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                      {addressDetails?.firstName && renderField("First Name", addressDetails?.firstName)}
                      {addressDetails?.lastName && renderField("Last Name", addressDetails?.lastName)}
                      {addressDetails?.country && renderField("Country", addressDetails?.country)}
                      {addressDetails?.state && renderField("State", addressDetails?.state)}
                      {addressDetails?.town && renderField("Town", addressDetails?.town)}
                      {addressDetails?.city && renderField("City", addressDetails?.city)}
                      {addressDetails?.addressLine1 && renderField("Address Line1", addressDetails?.addressLine1)}
                      {addressDetails?.addressLine2 && renderField("Address Line2", addressDetails?.addressLine2)}
                      {addressDetails?.postalCode && renderField("Postal Code", addressDetails?.postalCode)}
                      {addressDetails?.phoneNumber && renderField("Phone Number", `${addressDetails?.phoneCode} ${addressDetails?.phoneNumber}`)}
                      {addressDetails?.email && renderField("Email", addressDetails?.email)}
                    </div>
                  </>
                }

                <h3 className="text-2xl font-semibold text-titleColor mt-4">2. Uploaded Document</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {documents?.filter(doc => doc.recorder !== null)?.map((doc, index) => (
                    <div key={doc.id || index}>
                      <label className="mb-0 text-paraColor text-sm font-medium">
                        {/* {documentTypeLabels[doc.docType]} */}
                        {doc.docType}
                      </label>
                      {doc.url && (
                        <KycDocument imageUrl={doc.url} onPreview={handlePreview} onDownload={onDownload} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* DYNAMIC KYB SECTIONS */}
              {kybSections?.map((section, idx) => {
                switch (section.name) {
                  case SectionNames.UBO:
                    return renderTableSection(
                      section, idx, ubosData,
                      () => handleOpenDrawer(DrawerTypes.ADD_UBO),
                      (row) => handleOpenDrawer(DrawerTypes.EDIT_UBO, row),
                      (index) => handleOpenDeleteDrawer(DeleteModalTypes.UBO, index),
                      (row, type) => { setUbosViewDrawer(true); setIsDirector(type === 'director'); setSelectedUbosData(row); setViewingType(SectionNames.UBO); }
                    );
                  case SectionNames.DIRECTOR:
                    return renderTableSection(
                      section, idx, directorsData,
                      () => handleOpenDrawer(DrawerTypes.ADD_DIRECTOR),
                      (row) => handleOpenDrawer(DrawerTypes.EDIT_DIRECTOR, row),
                      (index) => handleOpenDeleteDrawer(DeleteModalTypes.DIRECTOR, index),
                      (row, type) => { setUbosViewDrawer(true); setIsDirector(type === 'director'); setSelectedUbosData(row); setViewingType(SectionNames.DIRECTOR) }
                    );
                  case SectionNames.SHAREHOLDER:
                    return renderTableSection(
                      section, idx, shareholdersData,
                      () => handleOpenDrawer(DrawerTypes.ADD_SHAREHOLDER),
                      (row) => handleOpenDrawer(DrawerTypes.EDIT_SHAREHOLDER, row),
                      (index) => handleOpenDeleteDrawer(DeleteModalTypes.SHAREHOLDER, index),
                      (row, type) => { setUbosViewDrawer(true); setIsDirector(type === 'director'); setSelectedUbosData(row); setViewingType(SectionNames.SHAREHOLDER) }
                    );
                  case SectionNames.REPRESENTATIVE:
                    return renderTableSection(
                      section, idx, shareholdersIndData,
                      () => handleOpenDrawer(DrawerTypes.ADD_REPRESENTATIVE),
                      (row) => handleOpenDrawer(DrawerTypes.EDIT_REPRESENTATIVE, row),
                      (index) => handleOpenDeleteDrawer(DeleteModalTypes.REPRESENTATIVE, index),
                      (row, type) => { setUbosViewDrawer(true); setIsDirector(type === 'director'); setSelectedUbosData(row); setViewingType(SectionNames.REPRESENTATIVE); }
                    );
                  default:
                    return null;
                }
              })}

              {(currentKybStatus === null || currentKybStatus === "Rejected" || currentKybStatus === "Draft") && (
                <div className="text-end mt-9">
                  <CustomButton
                    type="primary"
                    loading={btnLoader}
                    disabled={btnLoader}
                    onClick={onSubmit}
                    className="ml-3.5"
                  >
                    {currentKybStatus === 'Rejected' ? 'Resubmit' : ' Save & Continue'}
                  </CustomButton>
                </div>
              )}
            </Form>

            <PreviewModal isVisible={isPreviewVisible} fileUrl={previewFile} onClose={handleClosePreview} />

            {/* Common Drawers for different sections */}
            {showForm && (
              <CommonDrawer title={selectedData ? "Edit Directors" : "Add Directors"} isOpen={showForm} onClose={onCancel}>
                <DirectorsForm
                  onSave={(obj) => handleSave(obj, 'director')}
                  onCancel={onCancel}
                  formData={selectedData}
                  currentState="Review"
                  drawerVisible={showForm}
                />
              </CommonDrawer>
            )}

            {ubosDrawer && (
              <CommonDrawer title={selectedUbosData ? "Edit UBO" : "Add UBO"} isOpen={ubosDrawer} onClose={onCancel}>
                <UBODrawerForm
                  onSave={(obj) => handleSave(obj, 'ubo')}
                  onCancel={onCancel}
                  formData={selectedUbosData}
                  currentState="Review"
                  drawerVisible={ubosDrawer}
                  type='ubo'
                />
              </CommonDrawer>
            )}
            {shareholderDrawer && (
              <CommonDrawer
                title={selectedShareholderData ? "Edit Shareholder" : "Add Shareholder"}
                isOpen={shareholderDrawer}
                onClose={onCancel}
              >
                <UBODrawerForm
                  onSave={(obj) => handleSave(obj, 'shareholder')}
                  onCancel={onCancel}
                  formData={selectedShareholderData}
                  currentState="Review"
                  drawerVisible={shareholderDrawer}
                  type="shareholder"
                />
              </CommonDrawer>
            )}
            {shareholderIndDrawer && (
              <CommonDrawer
                title={selectedShareholderIndData ? "Edit Individual Shareholder" : "Add Individual Shareholder"}
                isOpen={shareholderIndDrawer}
                onClose={onCancel}
              >
                <UBODrawerForm
                  onSave={(obj) => handleSave(obj, 'representative')}
                  onCancel={onCancel}
                  formData={selectedShareholderIndData}
                  currentState="Review"
                  drawerVisible={shareholderIndDrawer}
                  type="representative"
                />
              </CommonDrawer>
            )}

            {ubosViewDrawer && (
              <CommonDrawer title={viewingType} isOpen={ubosViewDrawer} onClose={() => setUbosViewDrawer(false)}>
                <UBOView data={selectedUbosData} onClose={() => setUbosViewDrawer(false)} />
              </CommonDrawer>
            )}
            <CommonDrawer isOpen={openDrawer} onClose={onCancel} title="Edit KYB">
              <CompanyData hideWizard={true} onsuccessDocs={onsuccessDocs} onCancel={onCancel} />
            </CommonDrawer>

            {/* Generic Delete Drawer */}
            {showDeleteModal && (
              <CommonDrawer isOpen={showDeleteModal} onClose={handleCloseDeleteDrawer} title={`Delete ${deleteModalType}`}>
                <BusinessDataDelete
                  userConfig={userProfileInfo}
                  setShowModal={handleCloseDeleteDrawer}
                  data={getDeleteData()}
                  selectedIndex={deletedIndex}
                  setUbosData={getSetDataFunction()}
                  onSuccessDelete={() => onSuccessDelete(deleteModalType)}
                  type={deleteModalType.toLowerCase()}
                />
              </CommonDrawer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KybReviewDetails;