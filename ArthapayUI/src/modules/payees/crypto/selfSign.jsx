import React, { useState, lazy, Suspense, useCallback } from "react";
import { connect, useSelector } from "react-redux";
import { assets } from "../../../core/shared/validations";
import { handleSelfSignatureSubmission } from "../http.services";
import { useNavigate, useParams } from "react-router";
import AppAlert from "../../../core/shared/appAlert";
import { setCryptoPayeeDetails } from "../../../reducers/payees.reducer";
import ContentLoader from "../../../core/skeleton/common.page.loader/content.loader";
const Signer = lazy(() => import("../selfsign"));
const SelfSign = (props) => {
  const { id, mode, name } = useParams();
const cryptoPayeeDetails = useSelector((state) => state.payeeStore.cryptoPayeeDetails);

const formData = cryptoPayeeDetails?.formData;
const details = cryptoPayeeDetails?.saveResponse;

  const userProfile=useSelector((state)=>state.userConfig.details)
  const [state, setState] = useState({ loading: "", error: "" });
  const navigate = useNavigate();
  const selfSignHandler = useCallback(async(signObj, successCallback, failureCallback) => {
    setState((prev) => ({ ...prev, loading: "save", error: "" }));
    try {
      if (signObj?.message !== formData?.iframId) {
        setState((prev) => ({
          ...prev,
          loading: "",
          error: `Invalid Message`,
        }));
        return;
      }
      const values = { ...formData, ...signObj };
      await handleSelfSignatureSubmission(values,userProfile,details);
      successCallback();
      setState((prev) => ({ ...prev, loading: "", error: "" }));
      props.dispatch(setCryptoPayeeDetails(null));
      navigate(`/payees/crypto/${id}/${name}/${mode}/success`);
    } catch (error) {
      failureCallback();
      setState((prev) => ({ ...prev, loading: "", error: error.message }));
    }
  },[formData, userProfile, details, id, name, mode]);
  const clearErrorMsg = useCallback(() => {
    setState((prev) => ({ ...prev, error:'' }))
  }, []);
  const setErrorMsg = useCallback((error) => {
    setState((prev) => ({ ...prev, error }))
  }, []);


  return (
    <>
       {state.error && (
        <div className="alert-flex withdraw-alert fiat-alert">
          <AppAlert
            type={'error'}
            description={state.error}
            showIcon
            closable
            afterClose={clearErrorMsg }
          />
        </div>
      )}
      <Suspense fallback={<ContentLoader />}>
      <div className=' border-2 border-cardBorder  rounded-sm'>
        <Signer
          message={formData?.iframId}
          onSignatureFailure={setErrorMsg}
          onSignatureComplete={selfSignHandler}
          asset={
            assets[formData?.network?.toLowerCase()] ||
            formData?.network?.toLowerCase()
          }
          saving={state.loading==='save'}
          addressFormat={formData?.addressFormatForUrl}
          componentClass=" grid grid-cols-2 rounded-sm w-[80%] m-auto"
          buttonsClass="w-full p-5 custom-br-none"
          imageClass="img-bg walletadd"
          formData ={formData}
        />
        </div>
      </Suspense>
    </>
  );
};

const connectStateToProps = ({ userConfig }) => {
  return { userConfig: userConfig.details };
};
const connectDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(connectStateToProps, connectDispatchToProps)(SelfSign);
