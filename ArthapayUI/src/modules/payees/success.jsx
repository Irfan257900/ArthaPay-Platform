import React, { useCallback, useEffect, useRef } from "react";
import { connect, useDispatch } from 'react-redux';
import {useNavigate, useParams } from "react-router";
import successImg from '../../assets/images/gifSuccess.gif';
import CustomButton from "../../core/button/button";
import AppDefaults from "../../utils/app.config";
import { fetchCryptoPayees, fetchFiatPayees, fetchKpis, fetchRecentActivityGraphData } from "../../reducers/payees.reducer";
const PayeesSuccess = (props) => {
  const pageSize = 10
  const { type,mode,step } = useParams()
  const declarationRef = useRef(null)
  const navigate=useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    declarationRef?.current?.scrollIntoView({ behavior: "smooth", block: "center" });

    if(step === "success"){
      const parameters = {
        id: props?.userConfig?.id,
        pageNo: 1,
        pageSize: pageSize,
        data: null,
      };
      type === 'fiat' ? props?.dispatch(fetchFiatPayees(parameters)) : props?.dispatch(fetchCryptoPayees(parameters))
    }
    dispatch(fetchKpis({ showLoading: false }))
    dispatch(fetchRecentActivityGraphData({ showLoading: false }));
    }, [type,step]);
    
  const handleOk = useCallback(() => {
    navigate(`/payees/${type}/${AppDefaults.GUID_ID}/new/add`);
  }, [type]);

  const closeHandler=useCallback(()=>{
    if(type === 'fiat'){
      navigate(`/payees/${type}/${props?.fiatPayees?.data?.[0]?.id}/${props?.fiatPayees?.data?.[0]?.favoriteName}/view`);
    }
    else{
      navigate(`/payees/${type}/${props?.cryptoPayees?.data?.[0]?.id}/${props?.cryptoPayees?.data?.[0]?.favoriteName}/view`);
    }
    
  },[props?.fiatPayees?.data,props?.cryptoPayees?.data])
  return (
      <div className="panel-card buy-card rounded-5 bg-rightincard  !pt-0">
                <div className=''>
                    <div className='text-center relative'>
                      <div className="absolute right-3 top-3">
                       <span class="icon lg close cursor-pointer" title="Close" onClick={closeHandler}></span>
                      </div>
                        <div className='bg-SuccessBg bg-no-repeat bg-cover h-[200px]'>
                            <div className='w-[260px] mx-auto relative'>
                                <img src={successImg} className='mx-auto absolute w-28 h-28 right-[89px] top-14' alt="" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-semibold text-titleColor text-center"> {mode === 'add' ? "Payee saved Successfully." : "Payee updated Successfully."}</h1>
                        <div className='md:max-w-[400px] mx-auto mt-5 p-2 md:p-0'>
                            <CustomButton type='primary' className={'w-full'} onClick={handleOk}>Add New Payee</CustomButton>
                        </div>
                    </div>
                </div>
            </div>
  )
}
const connectStateToProps = ({ userConfig, payeeStore }) => {
  return { userConfig: userConfig.details, fiatPayees: payeeStore.fiatPayees, cryptoPayees: payeeStore.cryptoPayees }
}
const connectDispatchToProps = dispatch => {
  return {
    dispatch
  }
}

export default connect(connectStateToProps, connectDispatchToProps)(PayeesSuccess);


