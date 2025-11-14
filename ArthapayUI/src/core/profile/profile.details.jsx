import React, { useCallback, useEffect, useState } from "react";
import { Button, Upload, Alert} from "antd";
import { useDispatch, useSelector } from "react-redux";
import DefaultUser from "../../assets/images/defaultuser.jpg";
import ProfileImageLoader from "../skeleton/profile.image.loader";
import CopyComponent from "../shared/copyComponent";
import { FetchProfileDetails, UploadProfileSave } from "./http.services";
import { successToaster } from "../shared/toasters";
import moment from "moment";
import { useOutletContext } from "react-router";
import CloseAccount from "./closeAccount";
import BusinessLogo from "./business.logo";
import Addresses from "./addresses";
import { updateProfileImage } from "../../reducers/userconfig.reducer";
import SecurityLoader from "../skeleton/manage.account/security.loader";
import { decryptAES } from "../shared/encrypt.decrypt";
const ProfileDetails = () => {
  const dispatch = useDispatch()
  const userConfig = useSelector(state => state.userConfig.details)
  const [profileDetatils, setProfileDetails] = useState({})
  const [isLoader, setIsLoader] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  useEffect(() => {
    fetchProfileDetails()
  }, [userConfig])
  const [state, setState] = useState({
    Loader: false,
    errorMessage: null,
  });
  const { baseBreadCrumb, setBreadCrumb } = useOutletContext();
  useEffect(() => {
    setBreadCrumb([...baseBreadCrumb, { id: "3", title: "Profile" }]);
  }, []);

  const fetchProfileDetails = async () => {
    try {
      await FetchProfileDetails(setIsLoader, setErrorMessage, setProfileDetails, userConfig?.accountType)
    } catch (error) {
      setErrorMessage(error)
    }
  }



  const setUploadProfile = (res) => {
    if (res.ok) {
      setState((prevState) => ({
        ...prevState,
        Loader: false,
        errorMessage: null,
      }));
      dispatch(updateProfileImage(res.data[0]))
      successToaster({
        content: "Profile image uploaded successfully",
        className: "custom-msg",
        duration: 3,
      });
    } else {
      setState((prevState) => ({
        ...prevState,
        Loader: false,
      }));
    }
  };
  const handleCustomRequest = async ({ file }) => {
    const formData = new FormData();
    setState((prevState) => ({ ...prevState, Loader: true }));
    formData.append("file", file, file.name);
    await UploadProfileSave(
      formData,
      setUploadProfile,
      setState
    );
  };
  const handleBeforeUpload = (file) => {
    const fileType = {
      "image/png": true,
      "image/jpg": true,
      "image/jpeg": true,
      "image/PNG": true,
      "image/JPG": true,
      "image/JPEG": true,
    };
    const isFileName = file.name.split(".").length <= 2;
    if (fileType[file.type] && isFileName) {
      setState((prevState) => ({
        ...prevState,
        Loader: false,
        errorMessage: null,
      }));
      return true;
    } else {
      setState((prevState) => ({
        ...prevState,
        Loader: false,
        errorMessage: isFileName
          ? `File is not allowed. You can upload jpg, png, jpeg files`
          : "File don't allow double extension",
      }));
      return Upload.LIST_IGNORE;
    }
  };
  const uploadProps = {
    name: "file",
    multiple: false,
    fileList: [],
    customRequest: handleCustomRequest,
    beforeUpload: handleBeforeUpload,
  };
  const closeErrorMessage = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      Loader: false,
      errorMessage: null,
    }));
    setErrorMessage(null)
  });
  return (
    <>
    {isLoader ?(
        <div className="flex justify-center items-center h-96">
        <SecurityLoader/>
      </div>
    ) : (
      <>
      <div>
        {(state.errorMessage||errorMessage) && (
          <div className="alert-flex !w-auto mb-24 !mx-3">
            <Alert
              className="security-error"
              closable
              type="error"
              description={(state.errorMessage||errorMessage)}
              onClose={closeErrorMessage}
            />
          </div>
        )}
      </div>
      <div className="block gap-4 items-start kpicardbg">
        <div className="relative manage-pf-img w-28 h-28 m-auto">
          {state.Loader ? (
            <div className="imager-loader flex items-center justify-center h-28 rounded-full">
              <ProfileImageLoader />
            </div>
          ) : (
            <>
              {profileDetatils?.businessLogo||profileDetatils?.logo ? (
                <img
                  src={profileDetatils.businessLogo || profileDetatils.logo}
                  className="user-profile rounded-full w-28 h-28 object-cover"
                  alt="img"
                />
              ) : (
                <img
                  src={DefaultUser}
                  className="user-profile rounded-full w-28 h-28 object-cover"
                  alt="img"
                />
              )}
              <Upload {...uploadProps} accept=".png,.jpeg,.jpg,.JPG,.JPEG,.PNG">
                <Button
                  shape="circle"
                  type="primary"
                  className="img-upld"
                  size="large"
                  icon={<span className="icon camera" />}
                />
              </Upload>
            </>
          )}
        </div>
        <div className="text-center mb-5 mt-3">
          <h2 className="text-2xl font-semibold text-titleColor mb-2">
            {userConfig?.accountType === "Business" ? (
              profileDetatils.businessName
            ) : (
              <>
                {userConfig?.firstName} {userConfig?.lastName}
              </>
            )}{" "}
            <span className="text-sm text-subTextColor font-medium inline-block">
              ({userConfig?.accountType})
            </span>
          </h2>
          <div className="flex items-center gap-1 justify-center mb-4">
            <h4 className="text-sm text-paraColor font-normal whitespace-nowrap">
              Ref ID:
            </h4>
            <span className="text-sm font-medium text-paraColor">
              {profileDetatils.reference &&
                      decryptAES(profileDetatils?.reference)}
            </span>
            <CopyComponent
              text=  {profileDetatils.reference &&
                decryptAES(profileDetatils?.reference)}
              noText="No refId"
              shouldTruncate={false}
              type=""
              className="icon copy-icon cursor-pointer text-primaryColor"
              textClass="text-primaryColor"
            />
          </div>
          <CloseAccount />
        </div>
        <div className="relative left-7">
          <div className="grid grid-cols-2 md:grid-cols-2 gap-x-12 md:gap-x-36 md:gap-y-4 mt-2 md:w-[568px] md:m-auto">
            {userConfig?.accountType === "Business" && (
              <div>
                <h5 className="mb-0 text-paraColor text-sm font-medium">
                  Email
                </h5>
                <p className="mb-0 text-subTextColor text-sm font-semibold">
                {profileDetatils.email &&
                        decryptAES(profileDetatils?.email)}
                </p>
              </div>
            )}
            {userConfig?.accountType === "Business" && (
              <div>
                <h5 className="mb-0 text-paraColor text-sm font-medium">
                  Phone Number
                </h5>
                <p className="mb-0 text-subTextColor text-sm font-semibold">
                {profileDetatils?.phoneCode &&
                        decryptAES(profileDetatils?.phoneCode)}
                         {" "}
                         {profileDetatils?.phoneNumber &&
                        decryptAES(profileDetatils?.phoneNumber)}
                </p>
              </div>
            )}
            {userConfig?.accountType === "Business" && (
              <div>
                <h5 className="mb-0 text-paraColor text-sm font-medium">
                  Incorporation Date
                </h5>
                <p className="mb-0 text-subTextColor text-sm font-semibold">
                  {profileDetatils?.incorporationDate
                    ? moment(profileDetatils?.incorporationDate)?.format(
                      "DD/MM/YYYY"
                    )
                    : ""}
                </p>
              </div>
            )}
            {userConfig?.accountType === "Business" && (
              <div>
                <h5 className="mb-0 text-paraColor text-sm font-medium">
                  Incorporation Country
                </h5>
                <p className="mb-0 text-subTextColor text-sm font-semibold">
                  {profileDetatils?.country}
                </p>
              </div>
            )}
            {(userConfig?.accountType === "Personal" ||
              userConfig?.accountType === "Employee") && (
                <>
                  <div>
                    <h5 className="mb-0 text-paraColor text-sm font-medium">
                      First Name
                    </h5>
                    <p className="mb-0 text-subTextColor text-sm font-semibold break-words whitespace-pre-line">
                      {profileDetatils?.firstName}
                    </p>
                  </div>
                  <div>
                    <h5 className="mb-0 text-paraColor text-sm font-medium">
                      Last Name
                    </h5>
                    <p className="mb-0 text-subTextColor text-sm font-semibold break-words whitespace-pre-line">
                      {profileDetatils?.lastName}
                    </p>
                  </div>
                  <div>
                    <h5 className="mb-0 text-paraColor text-sm font-medium">
                      Email
                    </h5>
                    <p className="mb-0 text-subTextColor text-sm font-semibold break-words whitespace-pre-line">
                    {profileDetatils.email &&
                        decryptAES(profileDetatils?.email)}
                    </p>
                  </div>
                  <div>
                    <h5 className="mb-0 text-paraColor text-sm font-medium">
                      Phone Number
                    </h5>
                    <p className="mb-0 text-subTextColor text-sm font-semibold">
                    {profileDetatils?.phoneCode &&
                        decryptAES(profileDetatils?.phoneCode)}
                         {" "}
                         {profileDetatils?.phoneNumber &&
                        decryptAES(profileDetatils?.phoneNumber)}
                        
                    </p>
                  </div>
                  <div>
                    <h5 className="mb-0 text-paraColor text-sm font-medium">
                      Country
                    </h5>
                    <p className="mb-0 text-subTextColor text-sm font-semibold break-words whitespace-pre-line">
                      {profileDetatils?.country}
                    </p>
                  </div>
                </>
              )}
              <div>
                    <h5 className="mb-0 text-paraColor text-sm font-medium">
                      User Name
                    </h5>
                    <p className="mb-0 text-subTextColor text-sm font-semibold break-words whitespace-pre-line">
                      {profileDetatils?.userName}
                    </p>
                  </div>
          </div>
        </div>
        {(userConfig?.role === "Business" ||
          userConfig?.role === "Affiliate") && (
            <div className="grid grid-cols-1 gap-4 w-full mt-8">
              <BusinessLogo />
            </div>
          )}
      </div>
      </>
    
    )}
      <Addresses />
    </>
  );
};

export default ProfileDetails;
