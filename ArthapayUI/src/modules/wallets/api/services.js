
import { appClientMethods } from "../../../core/http.clients";
import { Dashboardfiat, common, getAssets, getFiatAssets, getbalance, kips, transcations, valutNetwork } from "./endpoints";


async function getCryptoWallets(setData, urlParams) {
    try {
        const response = await appClientMethods.get(`${common.valuts}/depositcrypto`);
        setData(response);
    } catch (error) {
    }
}
async function getFiatwallets(setData, urlParams) {
    try {
        const { id } = urlParams;
        const response = await appClientMethods.get(`${Dashboardfiat.fiat}/${id}/cards`);
        setData(response);
    } catch (error) {
    }
}
async function getCryptoAssets( setIsLoadingCrypto,setData) {
    setIsLoadingCrypto(true)
    try {
        const response = await appClientMethods.get(`${getAssets.cryptoAssets}`);
        setData(response);
    } catch (error) {
    }
    finally{
        setIsLoadingCrypto(false)
    }
}
async function getFiatAsset(setData) {
    try {
        const response = await appClientMethods.get(`${getFiatAssets.fiatAssets}/depositfiat`);
        setData(response);
    } catch (error) {
    }
}
async function getWalletsRecentTransactions(setLoader, setData, setError) {
    setLoader(true);
    try {
        const response = await appClientMethods.get(`${transcations.walletrecenttranscation}/All/All/null?page=1&pageSize=10`);
        setData(response.data);
    } catch (error) {
        setError(error?.message);
    } finally {
        setLoader(false);
    }
}
async function getKipsDetails( setData) {
    try {
        const response = await appClientMethods.get(`${kips.dashBoardkips}`);
        setData(response);
    } catch (error) {
    }
}
async function getwalletsTotalBalance(setLoader, setData, setError,isLoader) {
    setLoader(isLoader);
    try {
        const response = await appClientMethods.get(`${getbalance.gettotalBalance}`);
        setData(response);
    } catch (error) {
        setError(error?.message);
    } finally {
        setLoader(false);
    }
}

async function getWalletsNetworklookup(urlParams) {
    const {coinCode, merchantId, setLoader, setData, setError,screenName,isLoading} = urlParams
    setLoader(isLoading);
    try {
        const url = `${valutNetwork.ValutNetworkLU}/${merchantId}/wallets/${coinCode}/crypto/${screenName}`;
        const response = await appClientMethods.get(url);
        setData(response);
    } catch (error) {
        setError(error?.message || "Failed to fetch data.");
        setLoader(false);
    }
    finally {
        setLoader(false);
    }
}
async function GetAdvertisements(setData,screenName) {
    try {
        const response = await appClientMethods.get(`${common.advertisment}/${screenName}`)
        setData(response)
    } catch (error) {
    }
}


export async function ActivityTransactions(actionType, setLoader, setData, setError) {
    setLoader(true);
    try {
        const endpoint =
            actionType === "withdraw"
                ? "withdraw/crypto/transactions"
                : "deposit/crypto/transactions";

        const response = await appClientMethods.get(`${endpoint}?page=1&pageSize=10`);
        setData(response.data);
    } catch (error) {
        setError(error?.message || "Something went wrong");
    } finally {
        setLoader(false);
    }
}


export async function FaitTransactions(actionType, setLoader, setData, setError) {
    setLoader(true);
    try {
        const endpoint =
            actionType === "deposit"
                
                ? "deposit/fiat/transactions"
                 :"withdraw/fiat/transactions";
 
        const response = await appClientMethods.get(`${endpoint}?page=1&pageSize=10`);
        setData(response.data);
    } catch (error) {
        setError(error?.message || "Something went wrong");
    } finally {
        setLoader(false);
    }
}
export {
    getCryptoWallets,getFiatwallets,getWalletsRecentTransactions,getKipsDetails,getWalletsNetworklookup,getFiatAsset,getCryptoAssets,GetAdvertisements,getwalletsTotalBalance,
   }
