import { appClientMethods } from "../../http.clients";
import { secureData } from "../../shared/encrypt.decrypt";
// import {appClientMeth}

export const getCaseDetails = async (localDispatch,id) => {
    localDispatch({ type: 'SET_LOADER', payload: true });
    localDispatch({ type: 'SET_ERROR', payload: null });
    try {
        const response = await appClientMethods.get(`cases/${id}`);
        const commonModel = secureData({
            keysToSecure:['Email','Account Number/IBAN'],
            data:response?.commonModel,
            type:'decrypt',
        });
        localDispatch({ type: 'SET_CASE_DETAILS', payload: {...response, commonModel } });
    } catch (error) {
        localDispatch({ type: 'SET_ERROR', payload: error.message });
    }
    finally {
        localDispatch({ type: 'SET_LOADER', payload: false });
    }
}

export const getMessageReplies = async (localDispatch,docId) => {
    localDispatch({ type: 'SET_LOADING_KEY', payload: { key: docId, isLoading: true } });
    localDispatch({ type: 'SET_DOCUMENT_ERROR', payload: { key: docId, error: null } });
    try {
        const response = await appClientMethods.get(`cases/${docId}/messages`);
        localDispatch({ type: 'SET_MESSAGES', payload: response });
    } catch (error) {
        localDispatch({ type: 'SET_DOCUMENT_ERROR', payload: { key: docId, error: response.error } });
    }
    finally {
        localDispatch({ type: 'SET_LOADING_KEY', payload: { key: docId, isLoading: false } });
    }
}

export const getPreviewFile = async (localDispatch,setData,docId) => {
    localDispatch({type: 'SET_PREVIEW_STATUS', payload: { loader: true, error: null } });
    try {
        const response = await appClientMethods.get(`filePreview/${docId}`);
        setData(response);
        localDispatch({type: 'SET_PREVIEW_STATUS', payload: {loader: false, error: null } });
    } catch (error) {
        localDispatch({type: 'SET_PREVIEW_STATUS', payload: {loader: false, error: error.message } });
    }
}
export const postMsgReplies = async (localDispatch,setData,obj,id) => {
    localDispatch({ type: 'SET_BTN_LOADER', payload: true });
    try {
        const response = await appClientMethods.post(`case/${id}/message`, obj);
        setData(response);
    } catch (error) {
        localDispatch({ type: 'SET_UPLOAD_ERROR', payload: error.message});
    }
    finally {
        localDispatch({ type: 'SET_BTN_LOADER', payload: false });
    }
}

