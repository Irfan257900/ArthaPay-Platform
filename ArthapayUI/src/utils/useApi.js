import { useCallback, useEffect, useState } from "react";
import { deriveErrorMessage } from "../core/shared/deriveErrorMessage";
const useApi = (shouldFetchMultiple) => {
    const [awaitingResponse, setAwaitingResponse] = useState(shouldFetchMultiple ? {} : false);
    const [data, setData] = useState(shouldFetchMultiple ? {} : null);
    const [error, setError] = useState(shouldFetchMultiple ? {} : '');

    const cleanState = useCallback(() => {
        setAwaitingResponse(shouldFetchMultiple ? {} : false)
        setData(shouldFetchMultiple ? {} : null)
        setError(shouldFetchMultiple ? {} : '')
    }, [shouldFetchMultiple])

    useEffect(() => {
        return () => {
            cleanState(shouldFetchMultiple)
        }
    }, [shouldFetchMultiple,cleanState])

    const handleAwait = useCallback((isWaiting,dataFor) => {
        !shouldFetchMultiple && setAwaitingResponse(isWaiting)
        shouldFetchMultiple && setAwaitingResponse((prev) => ({ ...prev, [dataFor]: isWaiting }));
    }, [shouldFetchMultiple])

    const handleError = useCallback((errorToSet,dataFor) => {
        !shouldFetchMultiple && setError(deriveErrorMessage(errorToSet))
        shouldFetchMultiple && setError((prev) => ({ ...prev, [dataFor]: deriveErrorMessage(errorToSet) }));
    }, [shouldFetchMultiple])

    const handleResponseData = useCallback((dataToHandle,dataFor) => {
        !shouldFetchMultiple && setData(dataToHandle)
        shouldFetchMultiple && setData((prev) => ({ ...prev, [dataFor]: dataToHandle }));
    }, [shouldFetchMultiple])

    const handleApi = useCallback(async (fetchMethod, fetchDetails, dataFor, hasFetchParams, fetchParams,methodResponseType='api') => {
        if (!dataFor && shouldFetchMultiple) {
            return;
        }
        const handleMethod = async () => {
            try{
                const response = hasFetchParams ? await fetchMethod(...fetchParams) : await fetchMethod()
                if(methodResponseType==='api' && response.status===200){
                    handleResponseData(response.data,dataFor) 
                    return
                } 
                if(methodResponseType==='api' && response.status!==200){
                    handleError(response.data,dataFor)
                    return
                }  
                methodResponseType==='dataWithError' && response.data && handleResponseData(response.data,dataFor)
                methodResponseType==='dataWithError' && response.error && handleError(response.error,dataFor)
                methodResponseType==='onlyData' && handleResponseData(response,dataFor)
            }catch(errorMessage){
                handleError(errorMessage,dataFor)
            }
           

        }
        const handleFetch = async () => {
            const response = fetchDetails.options ? await fetch(fetchDetails.url, fetchDetails.options) : await fetch(fetchDetails.url);
            const responseData = await response.json();
            response.status===200 ? handleResponseData(responseData,dataFor) : handleError(responseData,dataFor)
        }
        handleAwait(true,dataFor)
        try {
            if (fetchMethod && !fetchDetails) {
                await handleMethod()
            }
            if (!fetchMethod && fetchDetails) {
                await handleFetch()
            }
        } catch (caughtError) {
            handleError(caughtError,dataFor)
        } finally {
            handleAwait(false,dataFor)
        }
    }, [shouldFetchMultiple,handleAwait,handleError,handleResponseData]);

    const clearError=(errorOf)=>{
        if(errorOf && shouldFetchMultiple){
            setError(prev=>({...prev,[errorOf]:''}))
            return
        } 
        setError(shouldFetchMultiple ?{} : '')
    }
    return { awaitingResponse, data, error, handleApi,clearError };
};
export default useApi