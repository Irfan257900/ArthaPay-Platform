import React, { useCallback, useEffect, useState } from "react";
import CustomButton from "../../button/button";
import { fetchFeeDetails } from "../http.services";
import { useSelector } from "react-redux";
import AppAlert from "../../shared/appAlert";
import { useNavigate, useOutletContext, useParams } from "react-router";
import bronzeimag from "../../../assets/images/bronzeimag.svg";
import MembershipUpgrade from "./membership.upgrade";
import CommonDrawer from "../../shared/drawer";
import NumericText from "../../shared/numericText";
import AppDefaults from "../../../utils/app.config";
import AppEmpty from "../../shared/appEmpty";
import FeeAccordions from "./fees.accordions";
import UpgradeButton from "./upgrade.button";
import { membershipUpgradeTexts } from "../membership/services";
import NoActiveMembership from "../../shared/noActiveMembership"
import { FeeDetailsLoader } from "../../skeleton/fees.loaders";
const FeeDetails = () => {
  const { baseBreadCrumb, setBreadCrumb } = useOutletContext();
  const [state, setState] = useState({
    loading: "data",
    data: null,
    error: "",
    showUpgrade: false,
  });
  const isSubscribed = useSelector((state) => state.userConfig.isSubscribed);
  const navigate = useNavigate();
  const { membershipId, membershipName } = useParams();
  useEffect(() => {
    fetchFeeDetails({
      setLoader: (payload) => setState(prev => ({ ...prev, loading: payload ? 'data' : '' })),
      setData: (data) => setState(prev => ({ ...prev, data, error: '' })),
      setError: (error) => setState(prev => ({ ...prev, error, data: null })),
      membershipId: membershipId || AppDefaults.GUID_ID,
    });
  }, [membershipId]);
  useEffect(() => {
    if (membershipId) {
      setBreadCrumb([
        ...baseBreadCrumb,
        {
          id: "3",
          title: "Fees",
          handleClick: () => navigate(`/profile/fees`),
        },
        {
          id: "4",
          title: "Explore Memberships",
          handleClick: () => navigate(`/profile/fees/memberships/explore`),
        },
        { id: "5", title: membershipName },
      ]);
    } else {
      setBreadCrumb([...baseBreadCrumb, { id: "3", title: "Fees" }]);
    }
  }, [membershipId, membershipName]);
  const handleUpgrade = useCallback(() => {
    if ((state.data?.canUpgrade || !isSubscribed) && membershipId) {
      setState((prev) => ({ ...prev, showUpgrade: true }));
    } else {
      navigate(`/profile/fees/memberships/explore`);
    }
  }, [state.data, membershipId, isSubscribed]);
  const handleDrawerClose = useCallback(() => {
    setState((prev) => ({ ...prev, showUpgrade: false }));
  }, []);
  const handleBack = useCallback(() => {
    navigate(`/profile/fees/memberships/explore`);
  }, []);
  const closeErrorMessage = useCallback(() => {
    setState((prev) => ({ ...prev, error: "" }));
  }, []);

  return (
    <div>
      {state.loading === "data" && <FeeDetailsLoader />}
      {state.error && (
        <div className="px-4">
          <div className="alert-flex withdraw-alert fiat-alert">
            <AppAlert
              type={"error"}
              description={state.error}
              showIcon
              closable
              afterClose={closeErrorMessage}
            />
          </div>
        </div>
      )}
      {state.loading !== "data" && state.data && (isSubscribed || membershipId) && (
        <div>
          {state?.data?.hideMembership && <div className="border border-dbkpiStroke rounded-5 py-6 mb-5  ">
            <div className="grid grid-col-1 lg:grid-cols-2 xl:grid-cols-4 md:grid-cols-3 gap-2">
              <div className="flex items-center gap-4 pl-5">
                <div>
                  <img src={bronzeimag} alt="membership"></img>
                </div>
                <div>
                  <h3 className="font-semibold text-md text-lightWhite">
                    {state.data?.name}
                  </h3>
                  <span className="text-textGrey text-xs font-semibold">
                    Membership{" "}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 pl-5">
                <div className="flex items-center justify-center  bg-browncolor w-10 h-10 border border-feesviewborder rounded-full">
                  <span className="text-md font-medium text-lightWhite">P</span>
                </div>
                <div>
                  <h3 className="font-semibold text-md  text-lightWhite">
                    <NumericText
                      value={state.data?.membershipPrice}
                      prefixText={"$"}
                      fixedDecimals={null}
                      decimalScale={AppDefaults.fiatDecimals}
                    />
                  </h3>
                  <span className="text-textGrey text-xs font-semibold">
                    Price{" "}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 pl-5">
                <div className="flex items-center justify-center  bg-browncolor w-10 h-10 border border-feesviewborder rounded-full">
                  <span className="text-md font-medium text-lightWhite">R</span>
                </div>
                <div>
                  <h3 className="font-semibold text-md text-lightWhite">
                    {state.data?.referralBonus}%
                  </h3>
                  <span className="text-textGrey text-xs font-semibold">
                    Referral Bonus (%){" "}
                  </span>
                </div>
              </div>
              <div className="p-4 ">
                {(state.data?.canUpgrade || !isSubscribed) && (
                  <UpgradeButton
                    className="w-32 h-8 text-textBlack font-semibold text-xs"
                    membership={null}
                    handleClick={handleUpgrade} />
                )}
              </div>
            </div>
          </div>}
          <FeeAccordions mode="view" membership={state.data} />
        </div>
      )}
      {state.loading !== "data" && !state.data && <AppEmpty />}
      {state.loading !== 'data' && state.data && !isSubscribed && !membershipId && <div>
        <NoActiveMembership />
      </div>}
      {membershipId && (
        <div className="flex justify-end">
          <CustomButton type="" onClick={handleBack} className="">
            Back
          </CustomButton>
        </div>
      )}
      <CommonDrawer
        title={membershipUpgradeTexts('upgradeDrawerTitle', isSubscribed)}
        isOpen={state.showUpgrade}
        onClose={handleDrawerClose}
      >
        <MembershipUpgrade data={state.data} onSuccess={handleDrawerClose} />
      </CommonDrawer>
    </div>
  );
};
export default FeeDetails;
