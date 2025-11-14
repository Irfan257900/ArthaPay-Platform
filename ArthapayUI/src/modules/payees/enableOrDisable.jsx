import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { fetchCryptoPayees, fetchFiatPayees } from "../../reducers/payees.reducer";
import { store } from "../../store";
import { Disable, Enable } from "./http.services";
import AppAlert from "../../core/shared/appAlert";
import CustomButton from '../../core/button/button';

const EnableOrDisable = ({
  payeeType,
  data,
  setShowModal,
  userConfig,
  onSuccess,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const confirmActivate = useCallback(async () => {
    error && setError("");
    try {
      const saveObj = {
        tableName: "Common.PayeeAccounts",
        modifiedBy: userConfig?.name,
        status: data?.status === "Active" ? "Inactive" : "Active",
      };
      const additionalArgs = {
        successCallback: onSuccess,
        errorCallback: (payload) => setError(payload),
        setLoading: (payload) => setIsSaving(payload),
      };
      data?.status === "Active"?await Disable(saveObj, additionalArgs,data?.id):await Enable(saveObj, additionalArgs,data?.id);
      const parameters = {
        id: userConfig?.id,
        pageNo: 1,
        pageSize: 10,
        data: null,
        search: null,
      };
      payeeType === 'fiat' ? store.dispatch(fetchFiatPayees(parameters)) : store.dispatch(fetchCryptoPayees(parameters));
    } catch (err) {
      setError(err.message || err);
    }
  }, [error,data,userConfig,payeeType]);
   const clearErrorMsg = useCallback(()=>{
    setError("")
    },[]);
  return (
    <>
      <div className="text-left card-disable py-6">
        {error && (
          <div className="alert-flex">
            <AppAlert
              type="error"
              description={error}
              onClose={clearErrorMsg}
              showIcon
            />
          </div>
        )}
        <p className="!text-md mb-0 !text-lightWhite font-semibold">
          Do you really want to{" "}
          {data && data?.status === "Active" ? "Deactivate" : "Activate"}?
        </p>
      </div>
      <div className="mt-9 text-right">
      <CustomButton
        onClick={setShowModal}
        className={''}
      >
        No
      </CustomButton>  
      <CustomButton
        type="primary"
        onClick={confirmActivate}
        loading={isSaving}
        disabled={isSaving}
        className={'md:ml-3.5'}
      >
        Yes
      </CustomButton>  
      </div>       
    </>
  );
};
const connectStateToProps = ({ userConfig }) => {
  return { userConfig: userConfig.details };
};
const connectDispatchToProps = dispatch => {
  return {
    dispatch
  };
};
EnableOrDisable.propTypes = {
  data: PropTypes.object,
  onSuccess: PropTypes.func,
  setShowModal: PropTypes.func,
  userConfig: PropTypes.object
};
export default connect(connectStateToProps, connectDispatchToProps)(EnableOrDisable);

