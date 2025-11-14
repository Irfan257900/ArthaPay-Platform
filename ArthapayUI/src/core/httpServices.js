import { ApiControllers } from "../api/config";
import { appClientMethods, ipStackClientMethods } from "./httpClients";
import { appClientMethods as coreClientMethods,apiClient as coreApiClient, currentApiVersion } from "./http.clients";
import { deriveErrorMessage } from "./shared/deriveErrorMessage";
const ipstackAccessKey = window.runtimeConfig.VITE_IPSTACK_ACCESS_KEY
const { notification: notificationController,common:commonController } = ApiControllers

// ---------------------- Lookups ------------------------------

export const getCountriesAndTowns = async (onSuccess,onError) => {
    try {
        const response = await appClientMethods.get(`${commonController}countrytownlu` )
        onSuccess(response)
    } catch (error) {
        onError?.(error.message)
    }
}



export async function getIpStock(onSuccess, onError) {
    try {
        const response = await ipStackClientMethods.get(`/check?access_key=${ipstackAccessKey}`);
        onSuccess(response)
    } catch (error) {
        onError(error.message)
    }
}


//---------------------- Notifications -----------------------------
export const fetchNotifications = async (setState, appName) => {
    setState((prev) => ({ ...prev, loading: true }))
    try {
        const data = await appClientMethods.get(`${notificationController}Notifications/${appName}`)
        setState((prev) => ({ ...prev, data }))
    } catch (error) {
        setState((prev) => ({ ...prev, error: error.message }))
    } finally {
        setState((prev) => ({ ...prev, loading: false }))
    }
}

export const readNotification = async (onSuccess,  obj, appName) => {
    try {
        const data = await appClientMethods.put(`${notificationController}UpdateReadCount/${appName}`, obj)
        onSuccess(data)
    } catch (error) {

    }

}

//----------------------- Upload Files -----------------------------
export const uploadFile = async (onSuccess, onError, file) => {
    try {
        const data = await coreClientMethods.post('uploadfile', file)
        onSuccess(data)
    } catch (error) {
        onError(error.message)
    }
}
export const uploadFileWithProgress = async (onSuccess, onError,onProgress, file) => {
    try {
        const response = await coreApiClient.post(`/${currentApiVersion}uploadfile`, file,{
            headers:{
                'Content-Type':'multipart/form-data'
            },
            onUploadProgress:(progressEvent) => {
                const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                onProgress(progress);
              },
        })
        if(response.ok){
            onSuccess(response.data?.[0])
        }else{
            throw new Error(deriveErrorMessage(response))
        }
    } catch (error) {
        onError(error.message)
    }
}