import React, { useCallback, useEffect, useState, useMemo } from "react";
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

const KybReviewDetails = ({ setShowStatus }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [data, setData] = useState("");
  const [documents, setDocuments] = useState([]);
  const userProfileInfo = useSelector((state) => state.userConfig.details);

  // Extract lookups and sections from store
  const { data: lookups } = useSelector((state) => state.kybStore.lookups);
  const kybSections = [
    {
      "id": null,
      "name": "UBO Details",
      "code": "UBO Details",
      "image": null,
      "recorder": 4,
      "remarks": null,
      "states": null,
      "details": null,
      "isMandatory": null
    },
    {
      "id": null,
      "name": "Director Details",
      "code": "Director Details",
      "image": null,
      "recorder": 5,
      "remarks": null,
      "states": null,
      "details": null,
      "isMandatory": null
    },
    {
      "id": null,
      "name": "Shareholder Details",
      "code": "Shareholder Details",
      "image": null,
      "recorder": 6,
      "remarks": null,
      "states": null,
      "details": null,
      "isMandatory": null
    },
    {
      "id": null,
      "name": "Representative Details",
      "code": "Representative Details",
      "image": null,
      "recorder": 7,
      "remarks": null,
      "states": null,
      "details": null,
      "isMandatory": null
    }
  ]
  // lookups?.KybDetailSections || [];

  // Sectional Data States
  const [ubosData, setUbosData] = useState([]);
  const [directorsData, setDirectorsData] = useState([]);
  const [shareholdersData, setShareholdersData] = useState([]);
  const [shareholdersIndData, setShareholdersIndData] = useState([]);

  // Sectional Modal States
  const [showForm, setShowForm] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const [ubosDrawer, setUbosDrawer] = useState(false);
  const [selectedUbosData, setSelectedUbosData] = useState(null);
  const [ubosViewDrawer, setUbosViewDrawer] = useState(false);
  const [isDirector, setIsDirector] = useState(false);

  const [shareholderDrawer, setShareholderDrawer] = useState(false);
  const [selectedShareholderData, setSelectedShareholderData] = useState(null);
  const [shareholderIndDrawer, setShareholderIndDrawer] = useState(false);
  const [selectedShareholderIndData, setSelectedShareholderIndData] = useState(null);
  const [showShareholderDelete, setShowShareholderDelete] = useState(false);
  const [showRepresentativeDelete, setShowRepresentativeDelete] = useState(false);
  const [deletedShareholderIndex, setDeletedShareholderIndex] = useState(null);
  const [deletedRepresentativeIndex, setDeletedRepresentativeIndex] = useState(null);

  const [openDrawer, setOpenDrawer] = useState(false);
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState(null);
  const [btnLoader, setBtnLoader] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showDirectorsDelete, setShowDirectorsDelete] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState("");
  const [addressDetails, setAddressDetails] = useState(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [deletedIndex, setDeletedIndex] = useState(null);

  const actionFrom = useMemo(() => {
    const action = queryParams.get("actionFrom");
    return (action && action !== 'null' && action !== 'undefined') ? action : 'default';
  }, [queryParams.get("actionFrom")]);

  useEffect(() => {
    if (userProfileInfo?.id) {
      fetchKycDetails();
    }
    // If your shareholdersData and shareholdersIndData come from server, fetch them here too.
  }, [userProfileInfo]);

  const currentKybStatus = useSelector((state) => state.userConfig.kycStatus);
  const reKycEnabled = useSelector((store) => store.userConfig.reKycEnabled);

  const fetchKycDetails = async () => {
    getCompanyDetails(setLoader, onSuccessData, setError);
  };

  const onSuccessData = (data) => {
    setData(data?.businessCustomerDetails || {});
    setDocuments(data?.businessCustomerDetails?.kybDocs || []);
    setUbosData(data?.ubos || []);
    setDirectorsData(data?.directors || []);
    setShareholdersData(data?.shareholder || []); // Assuming "shareholders" array for shareholder section
    setShareholdersIndData(data?.representative || []); // Assuming "shareholdersInd" for individuals
    setAddressDetails(data?.businessCustomerDetails?.addressDetails || null);
  };

  const onsuccessDocs = useCallback(() => {
    fetchKycDetails();
    setOpenDrawer(false);
    dispatch(setKycStatus("Pending"));
    openNotification(tosterMessages.update);
  }, []);

  const steps = [
    { number: 1, label: "Company", isActive: true, isCompleted: true },
    { number: 2, label: "UBO", isActive: true, isCompleted: true },
    { number: 3, label: "Directors", isActive: true, isCompleted: true },
    { number: 4, label: "Review", isActive: true },
  ];

  // Save Handlers for each modal type
  const handleSave = useCallback((obj) => {
    setUbosDrawer(false);
    fetchKycDetails();
    obj.id === "00000000-0000-0000-0000-000000000000"
      ? openNotification(tosterMessages.UBOSuccessMsg)
      : openNotification(tosterMessages.UBOUpdateMsg);
  }, []);

  const handleDirectorsSave = useCallback((obj) => {
    setShowForm(false);
    fetchKycDetails();
    obj.id === "00000000-0000-0000-0000-000000000000"
      ? openNotification(tosterMessages.DirectorSuccessMsg)
      : openNotification(tosterMessages.DirectorUpdateMsg);
  }, []);

  const handleShareholderSave = useCallback((obj) => {
    setShareholderDrawer(false);
    fetchKycDetails();
    openNotification("Shareholder saved successfully!");
  }, []);

  const handleShareholderIndSave = useCallback((obj) => {
    setShareholderIndDrawer(false);
    fetchKycDetails();
    openNotification("Shareholder Individual saved successfully!");
  }, []);

  // CRUD Handlers for each modal
  const handleUbosDrawer = () => { setSelectedUbosData(null); setUbosDrawer(true); };
  const hnadleUbosUpdate = data => { setUbosDrawer(true); setSelectedUbosData(data); };
  const viewUBO = (data, screen) => { setUbosViewDrawer(true); setIsDirector(screen === 'director'); setSelectedUbosData(data); };
  const handleDirectorEdit = data => {
    setShowForm(true);
    let _obj = { ...data };
    _obj.dob = moment(_obj.dob).isValid() ? moment(_obj.dob) : null;
    _obj.dateOfRegistration = moment(_obj.dateOfRegistration).isValid() ? moment(_obj.dateOfRegistration) : null;
    setSelectedData(_obj);
  };
  const handleShareholderDrawer = () => { setSelectedShareholderData(null); setShareholderDrawer(true); };
  const handleShareholderEdit = data => { setSelectedShareholderData(data); setShareholderDrawer(true); };
  const handleShareholderIndDrawer = () => { setSelectedShareholderIndData(null); setShareholderIndDrawer(true); };
  const handleShareholderIndEdit = data => { setSelectedShareholderIndData(data); setShareholderIndDrawer(true); };

  // Delete handlers (stub for now)
  const handleUBODeleteDrawer = index => { setShowDelete(true); setDeletedIndex(index); };
  const handleDirectorDeleteDrawer = index => { setShowDirectorsDelete(true); setDeletedIndex(index); };
  const handleShareholderDeleteDrawer = (index) => {
    setShowShareholderDelete(true);
    setDeletedShareholderIndex(index);
  };

  const handleRepresentativeDeleteDrawer = (index) => {
    setShowRepresentativeDelete(true);
    setDeletedRepresentativeIndex(index);
  };

  const onSuccessShareholderDelete = useCallback(() => {
    setShowShareholderDelete(false);
    setDeletedShareholderIndex(null);
    fetchKycDetails();
    openNotification("Shareholder deleted successfully!");
  }, []);

  const onSuccessRepresentativeDelete = useCallback(() => {
    setShowRepresentativeDelete(false);
    setDeletedRepresentativeIndex(null);
    fetchKycDetails();
    openNotification("Representative deleted successfully!");
  }, []);

  // You can add similar for Shareholder Individual if wanted

  const handleDirectoresDrwer = () => { setShowForm(true); setSelectedData(null); };
  const handleCloseDrawer = useCallback(() => { setShowDelete(false); setShowDirectorsDelete(false); setDeletedIndex(null); }, []);
  const onCancel = useCallback(() => {
    setSelectedUbosData(null);
    setSelectedData(null);
    setShowForm(false);
    setUbosDrawer(false);
    setOpenDrawer(false);
  }, []);
  const onDrawerClose = useCallback(() => { setUbosViewDrawer(false) }, []);
  const handleDrawer = () => { setOpenDrawer(true); };

  const onSuccess = () => {
    const KybStatus = currentKybStatus === 'Rejected' ? 'Pending' : 'Submitted';
    dispatch(setKycStatus(KybStatus));
    setShowStatus(true);
  };

  const onSuccessDelete = useCallback(() => {
    setShowDirectorsDelete(false);
    setShowDelete(false);
    setDeletedIndex(null);
    fetchKycDetails();
    openNotification(tosterMessages.UBODeleteMsg);
  }, []);
  const onSuccessDirectorsDelete = useCallback(() => {
    setShowDelete(false);
    setShowDirectorsDelete(false);
    setDeletedIndex(null);
    openNotification(tosterMessages.DirectorDeleteMsg);
    fetchKycDetails();
  }, []);

  // Submission
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
    await updateKYBInformation(setBtnLoader, onSuccess, setError, { userProfileInfo });
  }, [userProfileInfo, btnLoader, error, ubosData, directorsData]);

  // File preview/download
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
  });
  const handleClosePreview = useCallback(() => { setIsPreviewVisible(false); setPreviewFile(""); }, []);

  // Error notification/close
  const onCloseError = useCallback(() => { setError(null); }, []);
  const handleReKyc = useCallback(() => {
    dispatch(setCurrentKycState(null));
    dispatch(setKycStatus("Draft"));
    dispatch(setIsKycorKybFlowEbabled(true));
  }, [dispatch]);

  const bgColors = {
    Approved: "!text-paidApproved !border !border-paidApproved",
    Submitted: "!text-submiteted !border !border-submiteted",
    Rejected: "!text-canceled !border !border-canceled",
    "under review": "!text-submiteted !border !border-submiteted",
    "Under Review": "!text-submiteted !border !border-submiteted",
    "approval in progress": "!text-submiteted !border !border-submiteted",
    "Approval In Progress": "!text-submiteted !border !border-submiteted",
    Pending: "bg-skyBlueGradient"
  };

  // Dynamic SECTION RENDER MAPPING
  const renderSection = (section, idx) => {
    const isReadOnly = ["under review"].includes(currentKybStatus?.toLowerCase());
    const sectionNumber = idx + 4;
    switch (section.name) {
      case "UBO Details":
        return (
          <div
            className="mt-6 w-full rounded-5 border border-StrokeColor px-5 py-5"
            key={section.code}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-titleColor">{sectionNumber}. {section.name}</h3>
              {!isReadOnly && (
                <div className="text-end">
                  <button
                    onClick={handleUbosDrawer}
                    className="p-0 bg-0 outline-none focus:bg-none hover:bg-none focus:border-none"
                  >
                    <Tooltip title="Add UBO">
                      <span className="icon add"></span>
                    </Tooltip>
                  </button>
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
                  {ubosData
                    ?.filter(row => row.recordStatus !== "Deleted")
                    ?.map((row, index) => (
                      <tr key={row?.id} className="mt-3 dark:bg-transparent">
                        <td className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-subTextColor">
                          <div className="gridLink cursor-pointer text-primaryColor" onClick={() => viewUBO(row, 'ubo')}>
                            {row.firstName}
                          </div>
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
                          {decryptAES(row.phoneCode)}{' '}{decryptAES(row.phoneNumber)}
                        </td>
                        {!isReadOnly && <td className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-subTextColor">
                          <div className="flex items-center gap-4">
                            <Tooltip title="Edit UBO">
                              <span className="icon edit-active cursor-pointer" onClick={() => hnadleUbosUpdate(row)}></span>
                            </Tooltip>
                            <Tooltip title="Delete UBO">
                              <span className="icon delete cursor-pointer" onClick={() => handleUBODeleteDrawer(index)}></span>
                            </Tooltip>
                          </div>
                        </td>}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "Director Details":
        return (
          <div className="mt-6 w-full rounded-5 border border-StrokeColor px-5 py-5" key={section.code}>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-titleColor">{sectionNumber}. {section.name}</h3>
              {!isReadOnly && (
                <div className="text-end">
                  <button
                    onClick={handleDirectoresDrwer}
                    className="p-0 bg-0 outline-none focus:bg-none hover:bg-none focus:border-none"
                  >
                    <Tooltip title="Add Director">
                      <span className="icon add"></span>
                    </Tooltip>
                  </button>
                </div>
              )}
            </div>
            <div className="overflow-auto">
              <table className="w-full table-style">
                <thead>
                  <tr className="dark:bg-transparent border border-StrokeColor rounded-5">
                    <th className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-paraColor">Name</th>
                    <th className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-paraColor">Type</th>
                    <th className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-kheadText">Phone Number</th>
                    {!isReadOnly && <th className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-paraColor"> Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {directorsData
                    ?.filter(row => row.recordStatus !== "Deleted")
                    ?.map((row, index) => (
                      <tr key={row.id} className="dark:bg-transparent mt-3">
                        <td className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-subTextColor">
                          <div className="gridLink cursor-pointer text-primaryColor" onClick={() => viewUBO(row, 'director')}>
                            {row.companyName || row.firstName}
                          </div>
                        </td>
                        <td className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-subTextColor">
                          {row.uboPosition}
                        </td>
                        <td className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-subTextColor">
                          {decryptAES(row.phoneCode)}{' '}{decryptAES(row.phoneNumber)}
                        </td>
                        {!isReadOnly && <td className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-subTextColor">
                          <div className="flex items-center gap-4">
                            <Tooltip title="Edit Director">
                              <span className="icon edit-active cursor-pointer" onClick={() => handleDirectorEdit(row)}></span>
                            </Tooltip>
                            <Tooltip title="Delete Director">
                              <span className="icon delete cursor-pointer" onClick={() => handleDirectorDeleteDrawer(index)}></span>
                            </Tooltip>
                          </div>
                        </td>}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "Shareholder Details":
        return (
          <div
            className="mt-6 w-full rounded-5 border border-StrokeColor px-5 py-5"
            key={section.code}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-titleColor">{sectionNumber}. {section.name}</h3>
              {!isReadOnly && (
                <div className="text-end">
                  <button
                    onClick={handleShareholderDrawer}
                    className="p-0 bg-0 outline-none focus:bg-none hover:bg-none focus:border-none"
                  >
                    <Tooltip title="Add Shareholder">
                      <span className="icon add"></span>
                    </Tooltip>
                  </button>
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
                  {shareholdersData
                    ?.filter(row => row.recordStatus !== "Deleted")
                    ?.map((row, index) => (
                      <tr key={row?.id} className="mt-3 dark:bg-transparent">
                        <td className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-subTextColor">
                          <div className="gridLink cursor-pointer text-primaryColor" onClick={() => viewUBO(row, 'ubo')}>
                            {row.firstName}
                          </div>
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
                          {decryptAES(row.phoneCode)}{' '}{decryptAES(row.phoneNumber)}
                        </td>
                        {!isReadOnly && <td className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-subTextColor">
                          <div className="flex items-center gap-4">
                            <Tooltip title="Edit Shareholder">
                              <span className="icon edit-active cursor-pointer" onClick={() => handleShareholderEdit(row)}></span>
                            </Tooltip>
                            <Tooltip title="Delete Shareholder">
                              <span className="icon delete cursor-pointer" onClick={() => handleShareholderDeleteDrawer(index)}></span>
                            </Tooltip>
                          </div>
                        </td>}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "Representative Details":
        return (
          <div
            className="mt-6 w-full rounded-5 border border-StrokeColor px-5 py-5"
            key={section.code}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-titleColor">{sectionNumber}. {section.name}</h3>
              {!isReadOnly && (
                <div className="text-end">
                  <button
                    onClick={handleShareholderIndDrawer}
                    className="p-0 bg-0 outline-none focus:bg-none hover:bg-none focus:border-none"
                  >
                    <Tooltip title="Add Shareholder">
                      <span className="icon add"></span>
                    </Tooltip>
                  </button>
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
                  {shareholdersIndData
                    ?.filter(row => row.recordStatus !== "Deleted")
                    ?.map((row, index) => (
                      <tr key={row?.id} className="mt-3 dark:bg-transparent">
                        <td className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-subTextColor">
                          <div className="gridLink cursor-pointer text-primaryColor" onClick={() => viewUBO(row, 'Representative')}>
                            {row.firstName}
                          </div>
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
                          {decryptAES(row.phoneCode)}{' '}{decryptAES(row.phoneNumber)}
                        </td>
                        {!isReadOnly && <td className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-subTextColor">
                          <div className="flex items-center gap-4">
                            <Tooltip title="Edit Representative">
                              <span className="icon edit-active cursor-pointer" onClick={() => handleShareholderIndEdit(row)}></span>
                            </Tooltip>
                            <Tooltip title="Delete Representative">
                              <span className="icon delete cursor-pointer" onClick={() => handleRepresentativeDeleteDrawer(index)}></span>
                            </Tooltip>
                          </div>
                        </td>}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return null;
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
          {/* Header Section */}
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
                <Tooltip title={`Re KYC`}>
                  <span className="icon re-kyc" onClick={handleReKyc} ></span>
                </Tooltip>
                <Tooltip title={`${reKycIconTitle}`}>
                  <span className="icon provider-info" onClick={handleReKyc}></span>
                </Tooltip>
              </div>
            }
          </div>

          <div className="w-full ">
            {currentKybStatus !== "Approved" && userProfileInfo?.currentKycState !== 3 && (
              <StepProgress steps={steps} />
            )}
            <Form form={form}>
              {/* Company/Address/Documents */}
              <div className="mt-3 w-full px-5 py-3">
                {/* Company */}
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold text-titleColor mb-2">1. Company</h3>
                  <div className="flex items-center gap-1">
                    {!["under review"].includes(currentKybStatus?.toLowerCase()) && (
                      <Tooltip title="Edit">
                        <button onClick={handleDrawer} className="">
                          <span className="icon Edit-links cursor-pointer"></span>
                        </button>
                      </Tooltip>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                  {data?.companyName && renderField("Company Name", data?.companyName)}
                  {data?.country && renderField("Country", data?.country)}
                  {data?.registrationNumber && renderField("Registration Number", data?.registrationNumber, '', 'uppercase')}
                  {data?.dateOfRegistration && renderField("Date of Registration", data?.dateOfRegistration, formatDate)}
                </div>
                {/* Address */}
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
                  {addressDetails?.phoneNumber && renderField("Phone Number", `${addressDetails?.phoneCode}${' '}${addressDetails?.phoneNumber}`)}
                  {addressDetails?.email && renderField("Email", addressDetails?.email)}
                </div>
                {/* Documents */}
                <h3 className="text-2xl font-semibold text-titleColor mt-4">3. Uploaded Document</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {documents.filter(doc => doc.recorder !== null)?.map((doc, index) => (
                    <div key={doc.id || index}>
                      <label className="mb-0 text-paraColor text-sm font-medium">
                        {documentTypeLabels[doc.docType]}
                      </label>
                      {doc.url && (
                        <KycDocument imageUrl={doc.url} onPreview={handlePreview} onDownload={onDownload} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* DYNAMIC KYB SECTIONS */}
              {kybSections?.map((section, idx) => renderSection(section, idx))}

              {(currentKybStatus === null || currentKybStatus === "Rejected" || currentKybStatus === "Draft") && (
                <div className="text-end mt-9">
                  <CustomButton
                    type="primary"
                    loading={btnLoader}
                    disabled={btnLoader}
                    onClick={onSubmit}
                    className={"ml-3.5"}
                  >
                    {currentKybStatus === 'Rejected' ? 'Resubmit' : ' Save & Continue'}
                  </CustomButton>
                </div>
              )}
            </Form>


            {/* MODALS & DRAWERS */}
            {showForm && (
              <CommonDrawer title={selectedData ? "Edit Directors" : "Add Directors"} isOpen={showForm} onClose={onCancel}>
                <DirectorsForm
                  onSave={handleDirectorsSave}
                  onCancel={onCancel}
                  formData={selectedData}
                  drawerVisible={showForm}
                  currentState="Review"
                />
              </CommonDrawer>
            )}
            <PreviewModal isVisible={isPreviewVisible} fileUrl={previewFile} onClose={handleClosePreview} />
            {ubosDrawer && (
              <CommonDrawer title={selectedUbosData ? "Edit UBO" : "Add UBO"} isOpen={ubosDrawer} onClose={onCancel}>
                <UBODrawerForm
                  onSave={handleSave}
                  onCancel={onCancel}
                  formData={selectedUbosData}
                  currentState="Review"
                  drawerVisible={ubosDrawer}
                  type='ubo'
                />
              </CommonDrawer>
            )}
            {ubosViewDrawer && (
              <CommonDrawer title={isDirector ? 'Director' : 'UBO'} isOpen={ubosViewDrawer} onClose={onDrawerClose}>
                <UBOView data={selectedUbosData} onClose={onDrawerClose} />
              </CommonDrawer>
            )}
            <CommonDrawer isOpen={openDrawer} onClose={onCancel} title={"Edit KYB"}>
              <CompanyData hideWizard={true} onsuccessDocs={onsuccessDocs} onCancel={onCancel} />
            </CommonDrawer>
            <CommonDrawer isOpen={showDelete} onClose={handleCloseDrawer} title={"Delete"}>
              <BusinessDataDelete
                userConfig={userProfileInfo}
                setShowModal={handleCloseDrawer}
                data={ubosData}
                selectedIndex={deletedIndex}
                setUbosData={setUbosData}
                onSuccessDelete={onSuccessDelete}
              />
            </CommonDrawer>
            <CommonDrawer isOpen={showDirectorsDelete} onClose={handleCloseDrawer} title={"Delete"}>
              <BusinessDataDelete
                userConfig={userProfileInfo}
                setShowModal={handleCloseDrawer}
                data={directorsData}
                selectedIndex={deletedIndex}
                setUbosData={setDirectorsData}
                onSuccessDelete={onSuccessDirectorsDelete}
                type="directors"
              />
            </CommonDrawer>
            {shareholderDrawer && (
              <CommonDrawer
                title={selectedShareholderData ? "Edit Shareholder" : "Add Shareholder"}
                isOpen={shareholderDrawer}
                onClose={() => { setShareholderDrawer(false); setSelectedShareholderData(null); }}
              >
                <UBODrawerForm
                  onSave={handleShareholderSave}
                  onCancel={() => { setShareholderDrawer(false); setSelectedShareholderData(null); }}
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
                onClose={() => { setShareholderIndDrawer(false); setSelectedShareholderIndData(null); }}
              >
                <UBODrawerForm
                  onSave={handleShareholderIndSave}
                  onCancel={() => { setShareholderIndDrawer(false); setSelectedShareholderIndData(null); }}
                  formData={selectedShareholderIndData}
                  currentState="Review"
                  drawerVisible={shareholderIndDrawer}
                  type="representative"
                />
              </CommonDrawer>
            )}
            <CommonDrawer
              isOpen={showShareholderDelete}
              onClose={() => setShowShareholderDelete(false)}
              title={"Delete Shareholder"}
            >
              <BusinessDataDelete
                userConfig={userProfileInfo}
                setShowModal={() => setShowShareholderDelete(false)}
                data={shareholdersData}
                selectedIndex={deletedShareholderIndex}
                setUbosData={setShareholdersData}
                onSuccessDelete={onSuccessShareholderDelete}
                type="shareholder"
              />
            </CommonDrawer>
            <CommonDrawer
              isOpen={showRepresentativeDelete}
              onClose={() => setShowRepresentativeDelete(false)}
              title={"Delete Representative"}
            >
              <BusinessDataDelete
                userConfig={userProfileInfo}
                setShowModal={() => setShowRepresentativeDelete(false)}
                data={shareholdersIndData}
                selectedIndex={deletedRepresentativeIndex}
                setUbosData={setShareholdersIndData}
                onSuccessDelete={onSuccessRepresentativeDelete}
                type="representative"
              />
            </CommonDrawer>

          </div>
        </div>
      </div>
    </div>
  );
};

export default KybReviewDetails;