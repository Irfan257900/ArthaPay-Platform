import React, { useCallback, useEffect, useMemo, useState } from "react";
import CustomButton from "../../button/button";
import arthaimage from "../../../assets/images/arthaimage.svg";
import { fetchMemberships } from "../http.services";
import {
  Link,
  useNavigate,
  useOutletContext,
  useSearchParams,
} from "react-router";
import { useSelector } from "react-redux";
import { productIcon } from "./service";
import CommonDrawer from "../../shared/drawer";
import MembershipUpgrade from "./membership.upgrade";
import bronzeimag from "../../../assets/images/bronzeimag.svg";
import goldimg from "../../../assets/images/goldimg.svg";
import membershipplatinumimg from "../../../assets/images/membership platinumimg.svg";
import AppAlert from "../../shared/appAlert";
import UpgradeButton from "./upgrade.button";
import AppEmpty from "../../shared/appEmpty";
import { membershipUpgradeTexts } from "../membership/services";
import { ExploreMembershipsLoader } from "../../skeleton/memberships.loaders";
function findProduct(acc, productName) {
  return acc.find((p) => p.productName === productName);
}

function updateProductActions(existingProduct, actions) {
  actions.forEach((action) => {
    if (!existingProduct.actions.some((a) => a.action === action.action)) {
      existingProduct.actions.push(action);
    }
  });
}

function addProductToAcc(acc, productName, actions) {
  acc.push({ productName, actions: [...actions] });
}

const ExploreMemberships = () => {
  const { baseBreadCrumb,setBreadCrumb } = useOutletContext();
  const isSubscribed = useSelector((store) => store.userConfig.isSubscribed);
  const [state, setState] = useState({
    data: null,
    loading: "data",
    membershipToUpgrade: null,
    error: "",
  });
  const [urlParams] = useSearchParams();
  const navigate = useNavigate();
  useEffect(() => {
      fetchMemberships({
        setLoader:(payload)=>(setState(prev=>({...prev,loading:payload ? 'data' : ''}))),
        setData:(data)=>setState(prev=>({...prev,data})),
        setError:(error)=>setState(prev=>({...prev,error}))
      });
    setBreadCrumb([
    ...baseBreadCrumb,
      { id: "3", title: "Fees", handleClick:()=>navigate(`/profile/fees`) },
      { id: "4", title: "Explore Memberships" }
    ])
  }, []);
  const allProducts = useMemo(() => {
    return state.data?.reduce((acc, membership) => {
      membership.products.forEach((product) => {
        const existingProduct = findProduct(acc, product.productName);

        if (existingProduct) {
          updateProductActions(existingProduct, product.productType);
        } else {
          addProductToAcc(acc, product.productName, product.productType);
        }
      });
      return acc;
    }, []);
  }, [state.data]);
  const handleDrawerClose = useCallback(() => {
    setState((prev) => ({ ...prev, membershipToUpgrade: null }));
  }, []);
  const handleMembershipToUpgrade = useCallback((payload) => {
    setState((prev) => ({ ...prev, membershipToUpgrade: payload }));
  }, []);
  const handleBack = useCallback(() => {
    navigate(urlParams.get("redirectTo") || `/profile/fees`);
  }, [urlParams.get("redirectTo")]);
  const closeErrorMessage = useCallback(() => {
    setState((prev) => ({ ...prev, error: "" }));
  }, []);
  return (
    <>
      {state.loading === "data" && <ExploreMembershipsLoader />}
      {state.loading !== "data" && (
        <div>
          {state.error && (<div className="px-4">
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
          <div className="">
            <h3 className=" text-titleColor text-large font-semibold">
              Explore Memberships
            </h3>
            <p className="text-base font-normal text-paraColor">
              The membership program is designed to provide increasing benefits
              as your engagement grows. Enjoy exclusive perks, rewards, and
              enhanced experiences with every upgrade.
            </p>
          </div>
          <div className="overflow-x-auto rounded-5">
            {!state.data?.length && <AppEmpty />}
            {state.data?.length > 0 && (
              <table className="mt-5 upgrade-table">
                <tr className="align-middle">
                  <th className="w-auto min-w-40 min-h-52 rounded-5 text-center py-6 px-4 border border-StrokeColor">
                    <div className="flex justify-center">
                      <img src={arthaimage} alt="Arthapay"></img>
                    </div>
                    <p className="mt-2 text-sm font-normal text-paraColor">
                      {membershipUpgradeTexts('upgradeBenefitsDescription',isSubscribed)}
                    </p>
                  </th>
                  {state.data?.map((tier) => (
                    <th
                      className="min-w-40 min-h-52  rounded-5 text-center py-6 px-4 border border-StrokeColor"
                      key={tier.id}
                    >
                      {tier.isCurrent ? (
                        <img
                          src={membershipplatinumimg}
                          alt={tier.name}
                          className="mx-auto"
                        ></img>
                      ) : (
                        <>
                          {tier.isUpgradable ? (
                            <img
                              src={goldimg}
                              alt={tier.name}
                              className="mx-auto"
                            ></img>
                          ) : (
                            <img
                              src={bronzeimag}
                              alt={tier.name}
                              className="mx-auto"
                            ></img>
                          )}
                        </>
                      )}
                      <h3 className="text-2xl font-semibold text-membershiptextblue mt-1">
                        {tier?.name}
                      </h3>
                      <p className="text-sm font-normal mt-1 text-paraColor">
                        {tier?.membershipPrice} {tier?.currency || "USD"}
                      </p>
                      {tier.isCurrent ? (
                        <div className="mt-5 flex items-center justify-center gap-1 bg-greenLightDarkGradiant rounded-5 py-2">
                          <span className="icon check-white"></span>
                          <span className="text-base font-normal text-textWhite">
                            Current
                          </span>
                        </div>
                      ) : (
                        <>
                          {tier.isUpgradable && (
                            <div className="flex justify-center   text-center mt-5">
                              <UpgradeButton
                                membership={tier}
                                handleClick={handleMembershipToUpgrade}
                              />
                            </div>
                          )}
                        </>
                      )}
                    </th>
                  ))}
                </tr>
                {allProducts.map((product) => (
                  <React.Fragment key={product.productName}>
                    <tr>
                      <td
                        colSpan={state.data?.length + 2}
                        className="pb-3 pt-6"
                      >
                        <div className=" flex items-center gap-2.5 ">
                          <span
                            className={
                              productIcon[product.productName.toLowerCase()] ||
                              "icon db-vault-icon"
                            }
                          ></span>
                          <span className="text-xl font-semibold text-titleColor">
                            {product.productName}
                          </span>
                        </div>
                      </td>
                    </tr>
                    {product.actions.map((action) => (
                      <tr key={action.name}>
                        <td className="p-4 text-sm font-semibold text-left border border-StrokeColor text-paraColor">
                          {action.name}
                        </td>
                        {state.data?.map((membership) => {
                          const matchingProduct = membership.products.find(
                            (p) => p.productName === product.productName
                          );
                          const matchingAction = matchingProduct?.productType.find(
                            (a) => a.name === action.name
                          );
                          return (
                            <td
                              className="p-4 text-sm font-semibold text-center  border border-StrokeColor text-subTextColor"
                              key={membership.id}
                            >
                              {matchingAction
                                ? matchingAction.fee
                                : "N/A"}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
                <tr className="align-baseline">
                  <td className="p-4 text-sm font-semibold text-left border border-StrokeColor"></td>
                  {state.data?.map((member) => (
                    <td
                      key={member.id}
                      className=" p-4 text-sm font-semibold text-center border border-StrokeColor border-l-0 "
                    >
                      {member.isCurrent && (
                        <div className="flex items-center justify-center gap-1 bg-greenLightDarkGradiant rounded-5 py-2">
                          <span className="icon check-white"></span>
                          <span className="text-base font-normal text-textWhite">
                            Current
                          </span>
                        </div>
                      )}
                      {member.isUpgradable && !member.isCurrent && (
                        <UpgradeButton
                          membership={member}
                          handleClick={handleMembershipToUpgrade}
                          className="w-28 h-8 block text-textBlack text-sm font-semibold"
                        />
                      )}
                      <Link
                        to={`/profile/fees/memberships/${member?.id}/${member?.name}/${member?.isUpgradable}`}
                        className="text-base font-semibold hover:text-primaryColor text-center inline-block mt-2"
                      >
                        View More{" "}
                        <span className="icon lg square-arrow cursor-pointer"></span>
                      </Link>
                    </td>
                  ))}
                </tr>
              </table>
            )}
          </div>
          <div className="flex justify-end mt-4">
            <CustomButton type="" onClick={handleBack} className="">
              Back
            </CustomButton>
          </div>
        </div>
      )}
      <CommonDrawer
        title={membershipUpgradeTexts('upgradeDrawerTitle',isSubscribed)}
        isOpen={state.membershipToUpgrade !== null}
        onClose={handleDrawerClose}
      >
        <MembershipUpgrade
          data={state.membershipToUpgrade}
          onSuccess={handleDrawerClose}
        />
      </CommonDrawer>
    </>
  );
};

export default ExploreMemberships;
