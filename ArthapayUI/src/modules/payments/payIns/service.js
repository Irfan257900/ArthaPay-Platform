import moment from "moment";
import debounce from "../../../utils/debounce";
import { get, fetchPayments, save, update, fetchNetworks, fetchCustomerData, fetchInvoiceDetails } from "./api";
import AppDefaults from "../../../utils/app.config";
import { deriveErrorMessage } from "../../../core/shared/deriveErrorMessage"
import { appClientMethods } from "../httpClients";
//constants

export const actionStatusList={
    'Edit':['paid','cancelled','partially paid','expired'],
    'State Change':['paid','cancelled','partially paid'],
    'Share':['paid','cancelled'],
}
export const statusWarningTexts=(action)=>{
    return {
        'partially paid':'Pay-In has been partially paid.',
        'paid':'Pay-In has been fully paid.',
        'cancelled':`Cannot ${action?.toLowerCase()} cancelled pay-In.`,
        'expired':`Cannot ${action?.toLowerCase()} expired pay-In.`
    }
}
export const toolbar=[
    // {key:'add',tooltipTitle:'Create',tooltipPlacement:'top',icon:'add-links',shouldSelect:false},
    {key:'update',tooltipTitle:'Edit',tooltipPlacement:'top',icon:'Edit-links'},
    {key:'stateChange',tooltipTitle:'Status',tooltipPlacement:'top',icon:'statechange-icon'},
    {key:'invoiceDownload',tooltipTitle:'Download',tooltipPlacement:'top',icon:'download-sample'},
    {key:'shareMenu',tooltipTitle:'Share',tooltipPlacement:'top',icon:'share-icon'},
]

//API Methods
export const getTransactionGrid = async (id, search, callback, pageNo, pageSize, transactionType, selectedDates) => {
    pageSize = pageSize || 20;
    let _fromDate = selectedDates.length > 0 ? selectedDates[0] : '';
    let _toDate = selectedDates.length > 0 ? selectedDates[1] : '';
    const response = await fetchPayments(id, search, pageNo, pageSize, transactionType, _fromDate, _toDate);
    if (response.ok) {
        callback(response.data, null)
    } else {
        callback(null, deriveErrorMessage(response))
    }
};
export const getPaymentTypes = async (url) => {
    try {
        const response = await get(url);
        if (response.status === 200) {
            return { response: response.data }
        }
        else {
            return { error: deriveErrorMessage(response) }
        }
    }
    catch (error) {
        return { error: deriveErrorMessage(error) }
    }
}
export const debouncedGrid = debounce(getTransactionGrid)


export const getVaults = async (customerId) => {
    const response = await appClientMethods.get(`Merchant/GetMerchantDetails/${customerId}`);
    if (response.status === 200) {
        return response.data;
    }
    else {
        throw new Error(deriveErrorMessage(response));
    }
}


export const getCustomerCurrencies = async (customerId) => {
    let response = await fetchCustomerData('Merchant/CurrencyLookUp', customerId);
    if (response.status === 200) {
        return response.data;
    }
    else {
        throw new Error(deriveErrorMessage(response));
    }
}
export const getCoins = async (url, customerId) => {
    try {
        let response = await get(url, customerId);
        if (response.status === 200) {
            return response.data
        }
        else {
            return response;
        }
    }
    catch (error) {
        return error
    }
}
export const getNetworkLu = async (coinName, userId) => {
    const response = await fetchNetworks(coinName, userId);
    if (response.status === 200) {
        return response.data
    }
    else {
        throw new Error(deriveErrorMessage(response));
    }
}

export const getLinkDetails = async (id,type) => {
    const urls={
        Invoice:`Merchant/InvoiceDetails/${id}`,
        Static:`Merchant/paymentdetail/${id}`
    }
    const response = await get(urls[type]);
    if (response.status === 200) {
        return response.data
    }
    else {
        throw new Error(deriveErrorMessage(response));
    }
}

export const getCustomerVaults=async (userId)=>{
    const response = await fetchCustomerData('Merchant/VaultAccounts', userId);
    if (response.status === 200) {
        return response.data;
    }
    else {
        throw new Error(deriveErrorMessage(response));
    }
}

export const getCountries=async ()=>{
    const response = await get('Common/CountryLu');
    if (response.status === 200) {
        return response.data.Country;
    }
    else {
        throw new Error(deriveErrorMessage(response));
    }
}
export const getStatesOfCountry=async (country)=>{
    const response = await get(`Common/States/${country}`);
    if (response.status === 200) {
        const data=JSON.parse(response.data)
        return data.States;
    }
    else {
        throw new Error(deriveErrorMessage(response));
    }
}
export const getInvoiceCurrencies=async ()=>{
    const response = await get('Common/InvoiceSupportedCurrencyLu');
    if (response.status === 200) {
        return response.data.InvoiceSupportedCurrency;
    }
    else {
        throw new Error(deriveErrorMessage(response));
    }
}

export const getInvoiceDetails=async (id)=>{
    const response = await fetchInvoiceDetails(id);
    if (response.status === 200) {
        return response.data;
    }
    else {
        throw new Error(deriveErrorMessage(response));
    }
}

const getInvoiceSaveObj = (values,customer,selectedType,mode) => {
    const currDate = new Date().toISOString()
    return mode==='generate' ? {
        ...values,
        customerId: values.customerId || customer?.id,
        id: values.id || AppDefaults.GUID_ID,
        paymentType: values.paymentType || selectedType || 'Invoice',
        createdDate: values.createdDate || currDate,
        issuedDate: moment(values.issuedDate)?.toISOString(),
        dueDate: moment(values.dueDate)?.toISOString(),
        invoiceNumber: values.invoiceNumber || '',
        paymentLink:values.paymentLink ||'',
        createdBy: values.createdBy || customer?.name || customer?.firstName,
        modifiedBy: customer?.name || customer?.firstName,
        modifiedDate: currDate,
        status: values.status || 'Not Paid',
        clientWillPayCommission: false,
        isCryptoTransfer:values.isCryptoTransfer || false
    } : {
        "id": values.id,
        "dueDate": moment(values.dueDate)?.toISOString(),
        "modifiedBy": customer?.name || customer?.firstName,
        "modifiedDate":currDate
      }

}
const getStaticSaveObj = (values,customer,selectedType,mode) => {
    const currDate = new Date().toISOString()
    return mode==='generate' ?{
        ...values,
        customerId: values.customerId || customer?.id,
        id: values.id || AppDefaults.GUID_ID,
        invoiceType: values.paymentType || selectedType || 'Static',
        createdDate: values.createdDate || currDate,
        dueDate: moment(values.dueDate)?.toISOString(),
        createdBy: values.createdBy || customer?.name,
        modifiedBy: customer?.name,
        amount:values.amount ||0,
        modifiedDate: currDate,
        clientWillPayCommission:values.clientWillPayCommission || false,
    } : {
        "id": values.id,
        "dueDate": moment(values.dueDate)?.toISOString(),
        "modifiedBy": customer?.name || customer?.firstName,
        "modifiedDate":currDate
      }
}

export const getStatusChangeLookup=async (fromStatus)=>{
    const response = await get(`features/payin/status/${fromStatus}/next`);
    if (response) {
        return response;
    }
    else {
        throw new Error(deriveErrorMessage(response));
    }
}

export const updatePayinStatus=async (selectedPayin,status,customer)=>{
    const obj={
        status,
        modifiedBy:customer?.name || customer?.firstName,
    }
    try {
        const response = await update(`payments/payins/${selectedPayin?.id}/state`,obj);
        if (response) {
            return {
                data: true, error: ''
            }
        }
        return { data: null, error: deriveErrorMessage(response) }
    }
    catch (error) {
        return { data: null, error: error.message }
    }
}

export const createOrUpdatePaymentLink = async (values, customer, mode, type) => {
    const apiEndpoints = {
        generate: {
            Static: 'Merchant/createpaymentlinks',
            Invoice: 'Merchant/CreateInvoice'
        },
        update:`Merchant/updatepaymentlink`
    };
    const actions = {
        'generate': save,
        'update': update
    }

    const getSaveObjByType={
        'Static':()=>getStaticSaveObj(values,customer,type,mode),
        'Invoice':()=>getInvoiceSaveObj(values,customer,type,mode)
    }
    try {
        const endPoint = typeof apiEndpoints[mode]==='string' ? apiEndpoints[mode] : apiEndpoints[mode][type]
        const method=actions[mode]
        const response = await method(endPoint, getSaveObjByType[type]?.());
        if (response.ok) {
            return {
                data: {
                    ...values,
                    ...response.data
                }, error: ''
            }
        }
        return { data: null, error: deriveErrorMessage(response.data) }
    }
    catch (error) {
        return { data: null, error: error.message }
    }
};
