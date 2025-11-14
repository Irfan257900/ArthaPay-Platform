import React, { useCallback, useEffect, useState } from "react";
import { getDataForFeeSetup } from "../http.services";
import { useNavigate, useOutletContext, useParams } from "react-router";
import AppAlert from "../../shared/appAlert";
import bronzeimag from "../../../assets/images/bronzeimag.svg";
import CustomButton from "../../button/button";
import NumericText from "../../shared/numericText";
import AppDefaults from "../../../utils/app.config";
import FeeAccordions from "../fees/fees.accordions";
import { FeeDetailsLoader } from "../../skeleton/fees.loaders";
import FeeSetup from "./feesetup";

const SetFees = () => {
  const [state, setState] = useState({
    loading: "data",
    data: null,
    error: "",
  });
  const { baseBreadCrumb, setBreadCrumb } = useOutletContext();
  const { membershipId, membershipName } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    if (membershipId) {
      getDataForFeeSetup({
        membershipId: membershipId,
        setLoader: (payload) =>
          setState((prev) => ({ ...prev, loading: payload ? "data" : "" })),
        setData: (data) => setState((prev) => ({ ...prev, data })),
        setErrpr: (error) => setState((prev) => ({ ...prev, error })),
      });
    }
    setBreadCrumb([
      ...baseBreadCrumb,
      {
        id: "3",
        title: "Memberships",
        handleClick: () => navigate(`/profile/memberships`),
      },
      { id: "4", title: membershipName },
    ]);
  }, []);
  const handleBack = useCallback(() => {
    navigate(`/profile/memberships`);
  }, [navigate]);
  const closeErrorMessage = useCallback(() => {
    setState((prev) => ({ ...prev, loading: "", error: null }));
  }, []);
  return (
    <>
      {state.loading === "data" && <FeeDetailsLoader />}
      {state.error && (
        <AppAlert
          type={"error"}
          showIcon
          closable
          afterClose={closeErrorMessage}
          description={state.error}
        />
      )}
      {state.data && (
        <div className="kpicardbg h-full">
          <div className="border border-dbkpiStroke rounded-5 py-6 mb-5   ">
            <div className="grid grid-col-3 md:grid-cols-3 gap-28 ">
              <div className="flex items-center gap-4 pl-5">
                <div>
                  <img src={bronzeimag} alt="membership-logo" />
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
                <div className="flex items-center justify-center bg-browncolor w-10 h-10 rounded-full">
                  <span className="text-md font-medium text-white">P</span>
                </div>
                <div>
                  <h3 className="font-semibold text-md text-lightWhite">
                    <NumericText
                      value={state.data?.price}
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

              <div className="flex items-center gap-4 pl-5 ">
                <div className="flex items-center justify-center bg-browncolor w-10 h-10 rounded-full">
                  <span className="text-md font-medium text-white">R</span>
                </div>
                <div>
                  <h3 className="font-semibold text-md text-lightWhite">
                    <NumericText
                      value={state.data?.referralBonus}
                      fixedDecimals={null}
                      decimalScale={AppDefaults.percentageDecimals}
                    />
                  </h3>
                  <span className="text-textGrey text-xs font-semibold">
                    Referral Bonus (%){" "}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <FeeAccordions mode="edit" membership={state.data} PanelComponent={FeeSetup} />
          <div className="flex justify-end">
            <CustomButton type="" onClick={handleBack} className="">
              Back
            </CustomButton>
          </div>
        </div>
      )}
    </>
  );
};
export default SetFees;
