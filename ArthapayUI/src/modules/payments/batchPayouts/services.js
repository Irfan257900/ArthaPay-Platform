import { appClientMethods } from "../httpClients"
import { save, update } from "./api"


export const actionStatusList={
    'Edit':['paid','cancelled',"process",'processed',"processing"],
    'State Change':['process',"processing",'processed','cancelled'],
}
export const statusWarningTexts=(action)=>{
    return {
        'partially paid':'Batch payout has been partially paid.',
        'paid':'Batch payout has been fully paid.',
        'cancelled':`Cannot ${action} cancelled Batch payout`,
        "processed":`Cannot ${action} processed Batch payout`,
        'processing':`Cannot ${action} processing Batch payout`,
    }
}
export const toolbar=[
    {key:'update',tooltipTitle:'Update',tooltipPlacement:'top',icon:'Edit-links',shouldSelect:true},
    {key:'stateChange',tooltipTitle:'Change Status',tooltipPlacement:'top',icon:'statechange-icon',shouldSelect:true},
]

export const getStatusChangeLookup=async (fromStatus)=>{
    const response = await appClientMethods.get(`Common/StateChange/Batch-PayOut/${fromStatus}`);
    if (response) {
        return response;
    }
    else {
        throw new Error(response);
    }
}

export const updatePayoutStatus=async (selectedPayin,status,customer)=>{
    const obj={
        status,
        modifiedBy:customer?.name || customer?.firstName,
        modifiedDate:new Date().toISOString()
    }
    try {
        const response = await appClientMethods.put(`Merchant/BatchPayOut/StateChange/${selectedPayin?.id}`,obj);
        if (response) {
            return {
                data: true, error: ''
            }
        }
        return { data: null, error: response }
    }
    catch (error) {
        return { data: null, error: error.message }
    }
}

export const getSampleFile = async (url) => {
    try {
        let response = await appClientMethods.get(url);
        if (response) {
            return response
        }
        else{
            return 
        }
    }
    catch (error) {
        return error.message
    }

}

export const saveBatchPayment = async (url, values, customerId, id,mode) => {
    try {
        let obj = {
            ...values,
            id: id,
            customerId: customerId,
        }
        let _url = (mode === 'create' || !mode) ? url : 'Merchant/updatebatchpayments'
        let _methods = mode === 'create' ? save : update;
        let response = await _methods(_url, obj);
        return response;
    }
    catch (error) {
        return error
    }

}