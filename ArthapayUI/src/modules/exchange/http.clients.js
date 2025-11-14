import { create } from "apisauce";
import { store } from "../../store";
import { deriveErrorMessage } from "../../core/shared/deriveErrorMessage";
import { getAccessTokenSilentlyGlobal } from "../../core/authentication/auth0AccessToken";
export const currentApiVersion='api/v1/'
const createApiClient = (baseURL) => {
    const client = create({ baseURL });

    client.axiosInstance.interceptors.request.use(async (config) => {
        const token = await getAccessTokenSilentlyGlobal();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    return client;
};

const apiClient = createApiClient(window.runtimeConfig.VITE_API_EXCHANGE_END_POINT);
const ipRegistry = createApiClient('https://api4.ipregistry.co');
const ipStackClient = create({baseURL:window.runtimeConfig.VITE_IPSTACK_API});
const uploadClient = createApiClient(window.runtimeConfig.VITE_UPLOAD_API_END_POINT);
const paymentsWeb3Client = createApiClient(window.runtimeConfig.VITE_WEB3_API_END_POINT);


const APP_TYPE = window.runtimeConfig.VITE_WALLET_TYPE;

const handleResponse = (response) => {
    if (response.ok) {
        return response.data;
    }
    throw new Error(deriveErrorMessage(response));
};


const createRequest = (client) => ({
    get: async (url, apiVersion=currentApiVersion,throwErrorOnNoContent = false,) => {
        const response = await client.get(`${apiVersion}${url}`);
        if (throwErrorOnNoContent && response.status === 204) {
            throw new Error(deriveErrorMessage(response));
        }
        return handleResponse(response);
    },
    post: async (url, data,apiVersion=currentApiVersion) => handleResponse(await client.post(`${apiVersion}${url}`, data)),
    put: async (url, data,apiVersion=currentApiVersion) => handleResponse(await client.put(`${apiVersion}${url}`, data)),
    delete: async (url,apiVersion=currentApiVersion) => handleResponse(await client.delete(`${apiVersion}${url}`)),
});


const appClientMethods = createRequest(APP_TYPE === 'custodial' ? apiClient : paymentsWeb3Client);
const ipRegistryClientMethods = createRequest(ipRegistry);
const ipStackClientMethods = createRequest(ipStackClient);
const uploadClientMethods = createRequest(uploadClient);

export {
    appClientMethods,
    ipRegistryClientMethods,
    ipStackClientMethods,
    uploadClientMethods,
    apiClient,
    ipRegistry,
    ipStackClient,
    uploadClient,
    paymentsWeb3Client,
};
