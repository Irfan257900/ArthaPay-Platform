import React, { useCallback, useEffect, useState } from "react";
import { getMemberDetails } from "../httpServices";
import moment from "moment/moment";
import CopyComponent from "../../../core/shared/copyComponent";
import { useParams } from "react-router";
import AppAlert from "../../../core/shared/appAlert";
import AppEmpty from "../../../core/shared/appEmpty";
import defaultProfile from "../../../assets/images/defaultuser.jpg";
import ProfileLoader from "../../../core/skeleton/profile.loader";
import { decryptAES } from "../../../core/shared/encrypt.decrypt";
const Profile = () => {
  const [state, setState] = useState({
    errorMsg: "",
    profileDetails: null,
    loading: true,
  });
  const { memberId } = useParams();
  useEffect(() => {
    getMemberDetails(setState, memberId);
  }, [memberId]);
  const closeError = useCallback(() => {
    setState((prev) => ({ ...prev, errorMsg: "" }))
  }, [])
  const formatPhoneNumber = (phoneCode, phoneNumber) => {
        if (phoneNumber) {
            return phoneCode ? `${decryptAES(phoneCode)} ${decryptAES(phoneNumber)}` : decryptAES(phoneNumber);
        }
        return '';
    };
  return (
    <>
      {state.errorMsg && (
        <div className="alert-flex">
          <AppAlert
            type="error"
            description={state.errorMsg}
            showIcon
            closable
            afterClose={closeError}
          />
        </div>
      )}
      {state?.loading && <ProfileLoader />}
      {state.profileDetails && !state.loading && (
        <div className="kpicardbg border border-StrokeColor p-5 rounded-5 ">
          <div className="md:flex block gap-4 items-start">
            <div className="text-center">
              <img
                className="lg:h-28 lg:w-28 h-24 w-24 object-cover rounded-full"
                src={state?.profileDetails?.profileImage || state?.profileDetails?.image || defaultProfile}
                alt={state?.profileDetails?.fullName}
              />
            </div>

            <div className="md:flex-1">
              <h4 className="text-2xl font-semibold text-titleColor mb-2">
                {state?.profileDetails.fullName}
              </h4>
              <div className="grid xl:grid-cols-3 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-subTextColor lg:text-xs xl:text-sm font-normal">
                    {state?.profileDetails.email && decryptAES(state?.profileDetails.email)}
                  </h4>
                  <h4 className="text-subTextColor lg:text-xs xl:text-sm font-normal mt-1">
                    {formatPhoneNumber(state?.profileDetails?.phoneCode,state?.profileDetails?.phoneNo)}
                  </h4>
                  <div className="flex items-center gap-1">
                    <h4 className="lg:text-xs xl:text-sm text-paraColor font-normal whitespace-nowrap">Ref ID:</h4><span className="text-sm font-medium text-paraColor">{state?.profileDetails?.refId  && decryptAES(state?.profileDetails?.refId)}</span>
                    <CopyComponent
                      text={state?.profileDetails?.refId && decryptAES(state?.profileDetails?.refId)}
                      noText="No refId"
                      shouldTruncate={false}
                      type=""
                      className="icon copy-icon cursor-pointer text-primaryColor"
                      textClass="text-primaryColor"
                    />
                  </div>
                </div>
                <div>
                  <h4 className="mb-0 text-paraColor lg:text-xs xl:text-sm font-medium">
                    Reg. Date
                  </h4>
                  <p className="mb-0 text-subTextColor lg:text-xs xl:text-sm font-semibold">
                    {moment
                      .utc(state?.profileDetails.registeredDate)
                      .local()
                      .format("DD/MM/YYYY")}{" "}
                  </p>
                </div>
                <div className="flex justify-between">
                <div>
                  <h4 className="mb-0 text-paraColor lg:text-xs xl:text-sm font-medium">
                    Gender
                  </h4>
                    <p className="mb-0 text-subTextColor lg:text-xs xl:text-sm font-semibold">
                    {state?.profileDetails.gender && state?.profileDetails.gender}
                  </p>
                </div>
                <div>
                  <h4 className="mb-0 text-paraColor lg:text-xs xl:text-sm font-medium">
                    Country
                  </h4>
                   <p className="mb-0 text-subTextColor lg:text-xs xl:text-sm font-semibold">
                    {state?.profileDetails.country && state?.profileDetails.country}
                  </p>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {!state.loading && !state.profileDetails && <AppEmpty />}
    </>
  );
};
export default Profile;
