import React, { useCallback, useEffect, useState,useMemo } from 'react';
import UBOTable from './ubos';
import { Alert, Form, Tooltip } from 'antd';
import StepProgress from '../../kyc/step.progress';
import CustomButton from '../../../button/button';
import CommonDrawer from '../../../shared/drawer';
import UBODrawerForm from './ubo.details';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentKycState } from '../../../../reducers/userconfig.reducer';
import CompanyDataloader from '../../../skeleton/kyb.loaders/companydata.loader';
import { errorMessages, kyckybTitles, openNotification, tosterMessages } from '../../../onboarding/services';
import { getCompanyUboDetails, sendUBODetails } from '../../http.services';


const UboDetails = () => {
  const dispatch = useDispatch()
  const [form] = Form.useForm();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [error, setError] = useState(null);
  const [loader, setLoader] = useState(false);
  const [btnLoader, setBtnLoader] = useState(false);
  const userProfileInfo = useSelector(state => state.userConfig.details);
  const [data, setData] = useState([]);
  const steps = [
    { number: 1, label: "Company", isActive: true, isCompleted: true },
    { number: 2, label: "UBO", isActive: true },
    { number: 3, label: "Directors", isActive: false },
    { number: 4, label: "Review", isActive: false },
  ];
const queryParams = new URLSearchParams(location.search);
  const actionFrom=useMemo(()=>{
    const action=queryParams.get("actionFrom")
    return (action && action!=='null' && action!=='undefined') ? action : 'default'
  },[queryParams.get("actionFrom")])
  useEffect(() => {
    if (userProfileInfo?.id)
      fetchUBODetails();
  }, [userProfileInfo])

  const fetchUBODetails = async () => {
    await getCompanyUboDetails(setLoader,setData, setError);
  }
  const onSuccess = () => {
    openNotification(tosterMessages.UBOSSuccessMsg);
    dispatch(setCurrentKycState(2));
    dispatch(setKycStatus('Draft'));    
  }
  const handleSubmit = useCallback(async () => {
    if (data.length === 0) {
      setError(errorMessages.UBORequiredMsg);
      return;
    }
    await sendUBODetails(setBtnLoader, onSuccess,setError, {details:data, method:false});
  },[data,userProfileInfo])
  const handleSave = useCallback((obj) => {
    setError(null);
    if (obj.dob && obj.dob._isAMomentObject) {
      obj.dob = obj.dob.format('YYYY-MM-DD');
    }
    setDrawerVisible(!drawerVisible);
    if (obj.id !== '00000000-0000-0000-0000-000000000000') {
      setData((prevData) => {
        const existingIndex = prevData.findIndex((item) => item.id === obj.id);
        if (existingIndex !== -1) {
          const updatedData = [...prevData];
          updatedData[existingIndex] = { ...updatedData[existingIndex], ...obj };
          return updatedData;
        }
        return [...prevData, obj];
      });
    } else {
      setData((prevData) => [...prevData, obj]);
    }

  },[drawerVisible]);
  const toggleDrawer = useCallback(() => {
    setDrawerVisible(!drawerVisible);
  },[drawerVisible]);
  const handleDelete = useCallback((index) => {
    const newData = [...data];
    if (newData[index].id !== "00000000-0000-0000-0000-000000000000") {
      newData[index].recordStatus = 'deleted';
    } else {
      newData.splice(index, 1);
    }
    setData(newData);
  },[data]);
  const onCloseError = useCallback(()=>{
    setError(null);
},[])
  return (
    <div>
      {loader && <CompanyDataloader />}
      <div className="lg:px-2 py-2 md:px-6 sm:px-2 text-secondaryColor ">
        <div className="py-8 px-6 pt-0 sm:px-3 h-full rounded-5 kpicardbg">

          <div className='basicinfo-form'>
            <h1 className="text-center text-lightWhite text-3xl font-semibold">
              KYB
            </h1>
            <p className='text-sm font-normal text-lightWhite text-center mt-4 mb-7'>{kyckybTitles[actionFrom]} our partners require some information from you</p>
            <div className="">
              <div className="w-full ">
                <StepProgress steps={steps} />
                {error !== null && (
                  <div className="alert-flex">
                    <Alert
                      type="error"
                      description={error}
                      onClose={onCloseError}
                      showIcon
                      className='items-center'

                    />
                    <button className="icon sm alert-close" onClick={onCloseError}></button>
                  </div>
                )}
                <Form form={form}>

                  <div className="mt-10 w-full px-5 py-4">

                    <div>
                      <div className='text-end'>
                        <Tooltip title="Add UBO">
                          <button
                            onClick={toggleDrawer}
                            className="p-0 bg-0 outline-none focus:bg-none hover:bg-none focus:border-none"
                          >
                            <span className='icon add'></span>
                          </button>
                        </Tooltip>
                      </div>
                      <CommonDrawer title="Add UBO"
                        isOpen={drawerVisible}
                        onClose={toggleDrawer}

                      >
                        <UBODrawerForm onSave={handleSave} onCancel={toggleDrawer} drawerVisible={drawerVisible} type='ubo'/>
                      </CommonDrawer>
                      <div>
                        <div className='overflow-auto'>

                          {data?.length > 0 && <UBOTable data={data} onDelete={handleDelete} />}
                          {data?.length == 0 &&<div className='text-center'>
                            <h3 className='text-xl font-medium text-lightWhite mb-4'>Click Here To Add UBO</h3>
                            <CustomButton type='primary' className={"ml-3.5"} loading={btnLoader} disabled={btnLoader} onClick={toggleDrawer} >
                              Add UBO
                            </CustomButton>
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='text-end mt-9'>
                    <CustomButton type='primary' className={"ml-3.5"} loading={btnLoader} disabled={btnLoader} onClick={handleSubmit} >
                    Save & Continue
                    </CustomButton>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UboDetails;
