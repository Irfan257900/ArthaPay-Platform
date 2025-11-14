
import { appClientMethods } from "./http.clients";
import debounce from "../../utils/debounce";

// ----------------------- Common ------------------------------
export const fetchQuote = async (urlParams) => {
    const { coin,
        value,
        isCrypto,
        currency,
        callback,
        action
    } = urlParams
    try {
        const response = await appClientMethods.get(`asset/ExchangeRate/${coin}/${currency}?fromAssetValue=${value}&type=${action}`)
        callback(value, response, '', isCrypto)
    } catch (error) {
        callback(value, null, error.message, isCrypto)
    }
};

export const debouncedCryptoFiatConverter = debounce(fetchQuote, 1000);

// ----------------------- Buy ------------------------------

export async function fetchBuySummary(urlParams) {
    const { selectedCryptoCoin, selectedFiatCoin, amount } = urlParams;
    const response = await appClientMethods.post(`asset/buy/fee`, {
        fromAsset: selectedFiatCoin?.code,
        toAsset: selectedCryptoCoin?.code,
        assetValue: amount
    })
    return {
        fromAssetId: selectedFiatCoin?.id,
        fromAssetName: selectedFiatCoin?.name || null,
        fromAsset: selectedFiatCoin?.code,
        fromValue: response?.totalAmount,
        toAssetId: selectedCryptoCoin?.id,
        toAsset: selectedCryptoCoin?.code,
        toAssetName: selectedCryptoCoin?.name,
        toValue: response?.assetValue,
        currency: response?.fromAsset,
        credits: response?.credits || 0,
        fee: response?.fee,
        oneCoinValue: response?.oneCoinValue,
        totalAmount: response?.totalAmount,
        feeInfo: response?.feeInfo,
    };
}
export async function handleBuyCrypto(setState, onSuccess, onError, urlParams) {
    setState((prev) => ({ ...prev, loading: 'save', errorMessage: '' }))
    try {
        const { summaryDetails, trackAuditLogData } = urlParams
        const requestPayload = {
            fromAssetId: summaryDetails?.fromAssetId,
            fromAsset: summaryDetails?.fromAsset,
            fromValue: summaryDetails?.totalAmount,
            toAssetId: summaryDetails?.toAssetId,
            toAsset: summaryDetails?.toAsset,
            toValue: summaryDetails?.toValue,
            metadata: JSON.stringify(trackAuditLogData)
        };
        const response = await appClientMethods.post(`buy`, requestPayload)
        setState((prev) => ({ ...prev, loading: '', errorMessage: '' }))
        onSuccess(response)
    }
    catch (error) {
        setState((prev) => ({ ...prev, loading: '', errorMessage: error.message }))
        onError?.()
    }
}

// ----------------------- Sell ------------------------------

export async function fetchSellSummary(urlParams) {
    const { selectedCryptoCoin, selectedFiatCoin, amount } = urlParams;
    const response = await appClientMethods.post(`asset/sell/fee`,{
        fromAsset:selectedCryptoCoin?.code,
        toAsset:selectedFiatCoin?.code,
        assetValue:amount
    })
    return {
        fromAssetId: selectedCryptoCoin?.id,
        fromAsset: selectedCryptoCoin?.code,
        fromValue: response?.assetValue,
        toAssetId: selectedFiatCoin?.id,
        toAssetName: selectedFiatCoin?.name || null,
        toAsset: selectedFiatCoin?.code,
        toValue: response?.totalAmount,
        credits: response?.credits || 0,
        fee: response?.fee,
        oneCoinValue: response?.oneCoinValue,
        totalAmount: response?.totalAmount,
        feeInfo: response?.feeInfo,
    };
}

export async function handleSellCrypto(setState, onSuccess, onError, urlParams) {
    setState((prev) => ({ ...prev, loading: 'save', errorMessage: '' }))
    try {
        const { summaryDetails, trackAuditLogData } = urlParams
        const requestPayload = {
            fromAssetId: summaryDetails?.fromAssetId,
            fromAsset: summaryDetails?.fromAsset,
            fromValue: summaryDetails?.fromValue,
            toAssetId: summaryDetails?.toAssetId,
            toAsset: summaryDetails?.toAsset,
            toValue: summaryDetails?.totalAmount,
            metadata: JSON.stringify(trackAuditLogData)
        };
        const response = await appClientMethods.post(`sell`, requestPayload)
        setState((prev) => ({ ...prev, loading: '', errorMessage: '' }))
        onSuccess(response)
    }
    catch (error) {
        onError?.()
        setState((prev) => ({ ...prev, loading: '', errorMessage: error.message }))
    }
}