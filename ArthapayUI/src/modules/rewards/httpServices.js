import {loyaltyAppClientMethods } from "../../core/http.clients";


export const getRecentTransactions= async (customerId,screenName,setLoader, setData, setError)=>{
    try {
        setLoader(true);
        const response = await loyaltyAppClientMethods.get(`loyalty/ledger/${customerId}?sourceType=${screenName}&limit=5&offset=0`,'');
        setData(response);
        setLoader(false);
    } catch (error) {
        setError(error.message);
        setLoader(false);
    }
 
}

export const getRedeemTransferData= async (setNestedModelLoading, setData, setNestedModelError)=>{
    try {
        setNestedModelLoading(true);
        const response = await loyaltyAppClientMethods.get(`loyalty/redemption/config`,'');
         const result = response;
        setData(result || {});
        setNestedModelLoading(false);
    } catch (error) {
        setNestedModelError(error.message);
        setNestedModelLoading(false);
    }
 
}

export const saveRedeemTransfer= async (setLoading, payLoad, setError,setSuccess)=>{
    try {
        setLoading(true);
        const response = await loyaltyAppClientMethods.post(`loyalty/redemption/process`,'',payLoad);
        setSuccess(response)
    } catch (error) {
        setError(error.message);
        setLoading(false);
        setSuccess(null);
    }
 
}