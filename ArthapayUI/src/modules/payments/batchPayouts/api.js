import { apiClient, paymentsWeb3Client } from '../../../api/clients';
const environment = window.runtimeConfig.VITE_WALLET_TYPE;


const get = (url) =>{
    if(environment === 'non_custodial'){
        return paymentsWeb3Client.get(`${url}`);
    }else{
        return apiClient.get(`${url}`);
    }
}
const fetchNetworks = (coin,customerId) =>{
    if(environment === 'non_custodial'){
        return paymentsWeb3Client.get(`Merchant/NetWorkLookUp/${coin}/${customerId}`);
    }else{
        return apiClient.get(`Merchant/NetWorkLookUp/${coin}/${customerId}`);
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
export {get,fetchNetworks,save,update}
