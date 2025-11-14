import { apiClient, paymentsWeb3Client } from "../../api/clients";
import { appClientMethods } from "../../core/http.clients";
// import {appClientMethods} from "../../core/newHttpClient"
const environment = process.env.REACT_APP_WALLET_TYPE;
export const saveMerchant = (obj) => {
    if(environment === 'non_custodial'){
        return paymentsWeb3Client.post(`Merchant/MerchantSave`, obj);
    }else{
        return appClientMethods.post(`vault`, obj);
    }
};

export const updateMerchant=(id,obj)=>{
    if(environment === 'non_custodial'){
        return paymentsWeb3Client.put(`Merchant/UpdateMerchant/${id}`, obj);
    }else{
        return apiClient.put(`Merchant/UpdateMerchant/${id}`, obj);
    }
}

export const getDepositWithdrawMerchants = (screenName) => {
	if (environment === 'non_custodial') {
		return paymentsWeb3Client.get(`Merchant/Deposit/Withdraw`);
	} else {
		return appClientMethods.get(`vaults/${screenName}`);
	}
}