import React, { useCallback, useEffect, useState } from 'react'
import { fetchPayeeInfo} from './http.services';
import AppAlert from '../../core/shared/appAlert';
import FiatDetails from './fiat/details';
import CryptoDetails from './crypto/details';
import AppEmpty from '../../core/shared/appEmpty';
import { useOutletContext, useParams  } from "react-router";
import RightboxTabs, { PayeesFiatLoader } from '../../core/skeleton/rightboxskel';
import { useDispatch } from 'react-redux';
import { setPayeesDetails } from '../../reducers/payees.reducer';
const panelClass = {
  fiat: 'payees-form payees-rightpanel fiat-Details panel-card buy-card !pt-0',
  crypto: 'payees-form payees-rightpanel fiat-Details panel-card buy-card !pt-0'
}


const Payee = () => {
  const { id, type } = useParams();
  const dispatch=useDispatch();
  const {refresh,setRefresh}=useOutletContext()
  const [state,setState]=useState({loading:true,data:null,error:'',warning:''})
  useEffect(() => {
    fetchDetails()
  }, [id, type])

  useEffect(()=>{
    if(refresh){
      fetchDetails()
      setRefresh(false)
    }
  },[refresh])
  const fetchDetails=useCallback(async()=>{
    setState({loading:true,data:null,error:''})
    try{
      const data=await fetchPayeeInfo({type, id, mode:'view'})
      setState({loading:false,data,error:''})
      dispatch(setPayeesDetails(data));
    }catch(error){
      setState({loading:false,error:error.message})
    }
  },[id, type])
  const clearErrors=useCallback(()=>{
    setState(prev=>({...prev,error:''}))
  },[])

  return (
    <div>
      {state.error && (
        <div className="alert-flex">
          <AppAlert
            type="error"
            description={state.error}
            showIcon
            closable={true}
            afterClose={clearErrors}
          />
        </div>
      )}
      {!state.loading && state.data &&
        <div className={panelClass[type]}>
          {type === 'fiat' && <FiatDetails data={state.data} />}
          {type === 'crypto' && <CryptoDetails data={state.data} />}
        </div>}
        {state.loading && type === 'crypto' && <RightboxTabs/>}
        {state.loading && type === 'fiat' && <PayeesFiatLoader/>}
      {!state.loading && !state.data &&
        <div className='nodate-payees'><AppEmpty /> </div>}
    </div>
  )
}

export default Payee