
import { appClientMethods } from "./http.clients";
import { appClientMethods as  coreClientMethods} from "../../core/http.clients";
import { cardClientMethods } from "../cards/httpClients";

// ----------------------- Dashboard ------------------------------
export async function getGraphYearLu(setYearLu, setGettingYears) {
    setGettingYears(true)
    try {
        const response = await appClientMethods.get(`yearsLookUp`)
        setYearLu(response)
    } catch (error) {
    } finally {
        setGettingYears(false)
    }
}

export async function fetchKpiMetrics() {
    return await appClientMethods.get('banks/kpi')
}
export async function getBeneficiaries(type) {
    return await appClientMethods.get(`beneficiaries?beneficiaryType=${type}`);
}

export async function fetchUbos(id){
    return await appClientMethods.get(`uboDetails?id=${id}`);
}

export async function fetchRecentActivityGraph() {
    return await appClientMethods.get('banks/summary/transactions')
}
export async function getDetails() {
    return await appClientMethods.get(`accounts`);
}
export async function fetchAccountDetails(currency) {
    return await appClientMethods.get(`accounts/${currency}/deposit`);
}

export const fetchDepositAccountBanks = (currency) => {
    return appClientMethods.get(`accounts/${currency}?type=deposit`)
}
export const fetchWithdrawAccountBanks = (currency) => {
    return appClientMethods.get(`accounts/${currency}?type=withdraw`)
}
export const fetchAccountPayees = (currency) => {
    return coreClientMethods.get(`payees/fiat?currency=${currency}&feature=Banks`)
}
export const fetchWithdrawSummary = (payload) => {
    return appClientMethods.post(`accounts/withdraw/fee`, payload)
}
export const withdrawAmount = (payload) => {
    return appClientMethods.post(`accounts/withdraw`, payload)
}

// -------------------------------- Create Account ------------------------------------
export const fetchAccountsForCreation = () => {
    return appClientMethods.get(`banks`);
};

export const fetchRequirements=(bankId)=>{
    return  appClientMethods.get(`banks/${bankId}/kycrequirements`);

}

export const fetchFiatVaultCurrencies=()=>{
    return appClientMethods.get(`banks/payments/fiat`);
}
export const fetcchCryptoVaults=()=>{
    return appClientMethods.get(`banks/payments/crypto`);
}

export const fetchFiatPaymentSummary=(bankId,payload)=>{
    return appClientMethods.post(`banks/payments/${bankId}/fiat/fee`, payload);
}

export const fetchCryptoPaymentSummary=(bankId,payload)=>{
    return appClientMethods.post(`banks/payments/${bankId}/crypto/fee`, payload);
}

export const createAccount=(bankId,payload)=>{
    return appClientMethods.post(`banks/${bankId}/account`, payload);
}
export async function banksTransactions(url, setLoader, setData, setError) {
    setLoader(true);
    try {
        const endpoint =url
        const response = await appClientMethods.get(`${endpoint}?page=1&pageSize=5`);
        setData(response.data);
    } catch (error) {
        setError(error?.message || "Something went wrong");
    } finally {
        setLoader(false);
    }
}

export async function editAddressSave(setLoader, setData, setError, urlParams) {
    setLoader(true); setError(null);
    const {obj} = urlParams
    try {
        const response = await coreClientMethods.put(`Customer/Address`, obj);
        setData(response);
    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false)
    }
}
export const fetchAddressDetails=async ({setData,setError,addressId})=>{ 
    try {
        setData(await coreClientMethods.get(`Customer/Address/${addressId}`))
    } catch (error) {
        setError(error.message);
    }
}
export async function getCountryTownLu( setData, setError) { 
    setError(null)
    try {
        const response = await coreClientMethods.get(`kyc/lookup`);
        setData(response);
    } catch (error) {
        setError(error.message)
    }
}
export async function saveNewAddressDetails(setLoader, setData, setError, urlParams) { 
    setLoader(true); setError(null);
    const {obj} = urlParams
    try {
        const response = await coreClientMethods.post(`Customer/Address`, obj);
        setData(response);
    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false)
    }
}
export async function getAddressLU( setData, setError) { 
    setError(null)
    try {
        const response = await coreClientMethods.get(`addresses`);
        setData(response);
    } catch (error) {
        setError(error.message)
    }
}

export async function getSelctorLU( setData, setError) { 
    setError(null)
    try {
        const response = await appClientMethods.get(`sectors`);
        setData(response);
    } catch (error) {
        setError(error.message)
    }
}


export async function getTypeLU( setData, setError) { 
    setError(null)
    try {
        const response = await appClientMethods.get(`types`);
        setData(response);
    } catch (error) {
        setError(error.message)
    }
}