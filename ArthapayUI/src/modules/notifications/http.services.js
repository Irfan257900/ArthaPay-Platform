import { appClientMethods } from "./http.clients"



export const readNotification = async (onSuccess,  obj, appName) => {
    try {
        const data = await appClientMethods.put(`read`, obj)
        onSuccess(data)
    } catch (error) {

    }
}

export const fetchNotifications = async (setState, appName) => {
    setState((prev) => ({ ...prev, loading: true }))
    try {
        const data = await appClientMethods.get(`notifications?pageSize=10&pageNo=1&search=all`)
        setState((prev) => ({ ...prev, data }))
    } catch (error) {
        setState((prev) => ({ ...prev, error: error.message }))
    } finally {
        setState((prev) => ({ ...prev, loading: false }))
    }
}


async function fetchNotificationAll(setLoader, setData, setError, urlParams, setSelectedNotification, setPage) {
    setLoader(true);
    const { searchValue, pageNo, pageSize, currentData } = urlParams
    try {
        const response = await appClientMethods.get(`notifications?pageSize=${pageSize}&pageNo=${pageNo}&search=${searchValue}`);
        setData([...currentData, ...response]);
        pageNo === 1 && setSelectedNotification(response?.[0]);
        setPage(pageNo);
    } catch (error) {
        setError(error.message)
    } finally {
        setLoader(false);
    }
}


export { fetchNotificationAll }