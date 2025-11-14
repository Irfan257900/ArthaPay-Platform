import { ApiControllers } from "../../api/config";
import { appClientMethods as  coreClientMethods} from "../../core/http.clients";
import { secureData } from "../../core/shared/encrypt.decrypt";
const { team} = ApiControllers

async function fetchKpis(localDispatch, urlParams) {
    localDispatch({ type: 'setKpisLoader', payload: true });
    localDispatch({ type: 'setError', payload: null });
    const {id,referrer} = urlParams
    try {
        const response = await coreClientMethods.get(referrer?`referrals/kpi`:`referrers/${id}/kpi`);
        localDispatch({ type: 'setKpisInfo', payload: response });
    } catch (error) {
        localDispatch({ type: 'setError', payload: error.message });
    }
    finally {
        localDispatch({ type: 'setKpisLoader', payload: false });
    }
}
async function fetchMemberInfo(localDispatch, urlParams) {
    localDispatch({ type: 'setMemberLoader', payload: true });
    localDispatch({ type: 'setError', payload: null });
    const {id} = urlParams
    try {
        const response = await coreClientMethods.get(`referrals/${id}`);
        const secureDataDetails = secureData({
            keysToSecure: ['refId', 'email','phoneNo'],
            data:response,
            type: 'decrypt',
        })
        localDispatch({ type: 'setMemberData', payload: secureDataDetails });
    } catch (error) {
        localDispatch({ type: 'setError', payload: error.message });
    }
    finally {
        localDispatch({ type: 'setMemberLoader', payload: false });
    }
}
async function fetchStatusLookupData(localDispatch) { 
     localDispatch({ type: 'setError', payload: null });
    try {
        const response = await coreClientMethods.get(`referrals/lookup`)
        localDispatch({ type: 'setStatusLookupData', payload: response?.ReferralStatus });
    } catch (error) {
        localDispatch({ type: 'setError', payload: error.message });
    }
}
async function fetchFeeDetails(localDispatch, urlParams) {
    localDispatch({ type: 'setLoader', payload: true });
    localDispatch({ type: 'setError', payload: null });
    const {id} = urlParams
    try {
        const response = await coreClientMethods.get(`${team}/ReferralFees/${id}`);
        localDispatch({ type: 'setData', payload: response });
    } catch (error) {
        localDispatch({ type: 'setError', payload: error.message });
    }
    finally {
        localDispatch({ type: 'setLoader', payload: false });
    }
}
async function fetchSelectedFeeDetails(localDispatch, id,form) {
    localDispatch({ type: 'setFormLoader', payload: true });
     localDispatch({ type: 'setFormErrorMsg', payload: null });
    try {
        const response = await coreClientMethods.get(`${team}/Fees/${id}`);
        localDispatch({ type: 'setFormData', payload: response });
        form.setFieldsValue(response);
    } catch (error) {
        localDispatch({ type: 'setFormErrorMsg', payload: error.message });
    }
    finally {
        localDispatch({ type: 'setFormLoader', payload: false });
    }
}
async function updateFees(localDispatch, setData, urlParams) {
    localDispatch({ type: 'setBtnLoader', payload: true });
    localDispatch({ type: 'setFormErrorMsg', payload: false });
    const {obj} = urlParams;
    try {
        const response = await coreClientMethods.put(`${team}/UpdateFees`,obj);
        setData(response);
    } catch (error) {
        localDispatch({ type: 'setFormErrorMsg', payload: error.message });
    }
    finally {
        localDispatch({ type: 'setBtnLoader', payload: false });
    }
}
export {
    fetchKpis,fetchStatusLookupData,fetchMemberInfo,fetchFeeDetails,fetchSelectedFeeDetails,updateFees
}