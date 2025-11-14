import {appClientMethods as apiClient,paymentsWeb3Client } from '../httpClients.js';
import { appClientMethods } from '../../../core/http.clients.js';
const environment = window.runtimeConfig.VITE_WALLET_TYPE;
const fetchPayments=(id,search,pageNo,pageSize,transactionType,fromDate,toDate)=>{
    if(environment === 'non_custodial'){
        return paymentsWeb3Client.get(`Merchant/payments/${id}/${transactionType}/${search}/${fromDate}/${toDate}?page=${pageNo}&pageSize=${pageSize}`)
    }else{
        return apiClient.get(`Merchant/payments/${id}/${transactionType}/${search}/${fromDate}/${toDate}?page=${pageNo}&pageSize=${pageSize}`)
    }
}
const fetchCustomerData = (url,customerId) =>{
    if(environment === 'non_custodial'){
        return paymentsWeb3Client.get(`${url}/${customerId}`);
    }else{
        return apiClient.get(`${url}/${customerId}`);
    }
}
const get = (url) =>{
    if(environment === 'non_custodial'){
        return paymentsWeb3Client.get(`${url}`);
    }else{
        return appClientMethods.get(`${url}`);
    }
}
const fetchNetworks = (coin,customerId) =>{
    if(environment === 'non_custodial'){
        return paymentsWeb3Client.get(`Merchant/NetWorkLookUp/${coin}/${customerId}`);
    }else{
        return apiClient.get(`Merchant/NetWorkLookUp/${coin}/${customerId}`);
    }
}
const fetchTokenCurrency = (url, merchant, network, coin) => {
    if(environment === 'non_custodial'){
        return paymentsWeb3Client.get(`${url}/${merchant}/${network}/${coin}`);
    }else{
        return apiClient.get(`${url}/${merchant}/${network}/${coin}`);
    }
}
const save = (url,obj) =>{
    if(environment === 'non_custodial'){
        return paymentsWeb3Client.post(`${url}`,obj);
    }else{
        return apiClient.post(`${url}`,obj);
    }
}
const update = (url,obj) =>{
    if(environment === 'non_custodial'){
        return paymentsWeb3Client.put(`${url}`,obj);
    }else{
        return apiClient.put(`${url}`,obj);
    }
}
const fetchInvoiceDetails=(id)=>{
    if(environment === 'non_custodial'){
        return paymentsWeb3Client.get(`Merchant/InvoiceDetails/${id}`);
    }else{
        return apiClient.get(`Merchant/InvoiceDetails/${id}`);
    }
}
const getMerchantLU = () => {
    if(environment === 'non_custodial'){
        return paymentsWeb3Client.get(`Merchant/GetMerchantDetails`);
    }else{
        return apiClient.get(`Merchant/GetMerchantDetails`);
    }
}
export {get,fetchPayments,fetchInvoiceDetails,fetchCustomerData,fetchNetworks,save,update,fetchTokenCurrency,getMerchantLU}
