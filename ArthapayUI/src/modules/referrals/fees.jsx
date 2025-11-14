import React, { useMemo, useEffect, useReducer } from "react";
import CommonDrawrer from "../../core/shared/drawer"
import { useNavigate } from "react-router";
import { fetchFeeDetails, updateFees } from "./httpServices";
import { Form } from 'antd';
import EditFees from "./editFees";
import { useSelector } from "react-redux";
import AppAlert from "../../core/shared/appAlert";
import { VALIDATION_ERROR_MESSAGES } from "../../utils/validations";
import { referralReducer, referralState } from "./reducer";
import PageHeader from "../../core/shared/page.header";
import GridLoader from "../../core/skeleton/grid.loader/grid.loader";
import { successToaster } from "../../core/shared/toasters";
import darknoData from '../../assets/images/dark-no-data.svg';
import lightnoData from '../../assets/images/light-no-data.svg';

const Fees = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const customerInfo = useSelector((store) => store.userConfig.details)
  const [localState, localDispatch] = useReducer(referralReducer, referralState);

  const navigateToDashboard = () => {
    navigate(`/referrals`)
  }
  const breadCrumbList = useMemo(() => [
    { id: "1", title: "Referrals", handleClick: () => navigateToDashboard() },
    { id: "2", title: "Fees" },
  ], []);
  useEffect(() => {
    getFeeDetails();
  }, [customerInfo?.id])
  const toggleDrawer = useCallback(
    (value) => {
      localDispatch({ type: "setIsOpen", payload: value });
      if (!value) {
        form.resetFields();
      }
    },
    [form, localDispatch]
  );
  const getFeeDetails = async () => {
    const urlParams = { id: customerInfo?.id }
    await fetchFeeDetails(localDispatch, urlParams)
  }
  const clearError = () => {
    localDispatch({ type: 'setError', payload: null });
  }

  const setField = useCallback(
    (fieldName, value) => {
      form.setFieldsValue({ [fieldName]: value });
      localDispatch({
        type: "setFormData",
        payload: {
          ...localState?.formData,
          [fieldName]: value,
        },
      });
    },
    [form, localDispatch, localState?.formData]
  );
  const gethandleUpdate=()=>{
    form.resetFields();
    toggleDrawer(false);
    getFeeDetails();
  successToaster({content :  VALIDATION_ERROR_MESSAGES.FEE_DETAILS_UPDATE_SUCCESS,className : "custom-msg",duration : 3});
  }
  const handleUpdate = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        await form.validateFields();
        const allValues = form.getFieldsValue();
        let _obj = {
          ...allValues,
          customerId: customerInfo?.id,
          id: localState?.selectedRecord?.id,
          modifiedBy: customerInfo?.name,
        };
        const urlParams = { obj: _obj };
        await updateFees(localDispatch, gethandleUpdate, urlParams);
      } catch (error) {
        console.error("Validation failed or update error: ", error);
      }
    },
    [form, customerInfo, localState?.selectedRecord, localDispatch]
  );
  const toggleDrawerCloseHandler = useCallback(() => {
    toggleDrawer(false);
  }, []);
  return (
    <div>
      <PageHeader breadcrumbList={breadCrumbList}  />
      {localState?.error &&
        <div className="alert-flex mb-24">
          <AppAlert
            className="w-100 "
            type="warning"
            description={localState?.error}
            showIcon
          />
          <span className="icon sm alert-close" onClick={() => clearError()}></span>
        </div>
      }
      <div className="mb-10 mt-3 overflow-x-auto">
         {localState?.loader && <GridLoader iskpi={false}/>}
         {!localState?.loader && localState?.data?.length === 0  &&
         <div className='nodata-content my-6'>
         <div className='no-data'>
           <img src={darknoData} width={'100px'} alt="" className="dark:block hidden mx-auto"></img>
          <img src={lightnoData} width={'100px'} alt="" className="dark:hidden block mx-auto"></img>
           <p className='text-lightWhite text-sm font-medium mt-3'>No Data Found </p>
         </div>
       </div>
         }
        <CommonDrawrer title="Edit Apply Card Fees" isOpen={localState?.isOpen} onClose={toggleDrawerCloseHandler}>
          <EditFees form={form} 
          loader={localState?.btnLoader} 
          formData={localState?.formData}
          handleUpdate={handleUpdate} 
          setField={setField} 
          toggleDrawer={toggleDrawer} 
          localDispatch={localDispatch}
          formLoader={localState?.formLoader} formErrorMsg={localState?.formErrorMsg}
          />
        </CommonDrawrer>
      </div>
    </div>
  );
};
export default Fees;
