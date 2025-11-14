import { useCallback, useEffect, useState } from "react";
import { deriveErrorMessage } from "../core/shared/deriveErrorMessage";
const useApi = () => {
    const [awaitingResponse, setAwaitingResponse] = useState({});
    const [data, setData] = useState({});
    const [error, setError] = useState({});
    useEffect(() => {
        return () => {
            cleanState()
        }
    }, [])
    const cleanState = () => {
        setAwaitingResponse({})
        setData({})
        setError({})
    }
    const handleApi = useCallback(async function(fetchMethod, fetchDetails, dataFor, hasFetchParams, fetchParams, shouldClear) {
        if (shouldClear) {
            cleanState();
        }
    
        if (!dataFor) return;
    
        setAwaitingResponse((prev) => ({ ...prev, [dataFor]: true }));
    
        try {
            if (fetchMethod) {
                await handleMethod(fetchMethod, hasFetchParams, fetchParams, dataFor);
            } else if (fetchDetails) {
                await handleFetch(fetchDetails, dataFor);
            }
        } catch (error) {
            setError({ [dataFor]: error?.message || error.toString() });
        } finally {
            setAwaitingResponse((prev) => ({ ...prev, [dataFor]: false }));
        }
    }, [setData, setError, setAwaitingResponse, cleanState, deriveErrorMessage]);
    const handleMethod = async (fetchMethod, hasFetchParams, fetchParams, dataFor) => {
        try {
            const response = hasFetchParams ? await fetchMethod(...fetchParams) : await fetchMethod();
            setData((prev) => ({ ...prev, [dataFor]: response }));
        } catch (error) {
            setError((prev) => ({ ...prev, [dataFor]: error.message }));
        }
    };
    const handleFetch = async (fetchDetails, dataFor) => {
        try {
            const response = await fetch(fetchDetails.url, fetchDetails.options || {});
            const responseData = await response.json();
            
            if (response.ok) {
                setData((prev) => ({ ...prev, [dataFor]: responseData }));
            } else {
                setError((prev) => ({ ...prev, [dataFor]: deriveErrorMessage(responseData) }));
            }
        } catch (error) {
            setError((prev) => ({ ...prev, [dataFor]: error.message }));
        }
    };

    return { awaitingResponse, data, error, handleApi };
};
export default useApi