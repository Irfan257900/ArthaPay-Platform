
import { ApiControllers } from "../../api/config";
import { appClientMethods } from "../../core/http.clients";
const { merchant, dashboard, exchangeWallets, common: commonController, cardsWallet,wallets } = ApiControllers
async function getCryptoWallets(setLoader, setData, setError, urlParams) {
    setLoader(true);
    try {
        const { id } = urlParams;
        const response = await appClientMethods.get(`${merchant}GetMerchantDetails/${id}`);
        setData(response);
    } catch (error) {
        setError(error.message)
    } finally {
        setLoader(false);
    }
}

async function getFiatwallets(setLoader, setData, setError, urlParams) {
    setLoader(true);
    try {
        const { id } = urlParams;
        const response = await appClientMethods.get(`${dashboard}Wallets/Fiat/${id}`);
        setData(response);
    } catch (error) {
        setError(error.message);
    } finally {
        setLoader(false);
    }
}

async function getWalletsRecentTransactions(setLoader, setData, setError, urlParams) {
    setLoader(true);
    try {
        const { id } = urlParams;
        const response = await appClientMethods.get(`${merchant}transactions/${id}/All/All/null?page=1&pageSize=10`);
        setData(response.data);
        
    } catch (error) {
        setError(error.message);
    } finally {
        setLoader(false);
    }
}

async function getKipsDetails(setLoader, setData, setError, urlParams) {
    setLoader(true);
    try {
        const response = await appClientMethods.get(`${dashboard}/Vaults/CustomerBalances`);
        setData(response);
    } catch (error) {
        setError(error.message);
    } finally {
        setLoader(false);
    }
}
async function getMyCardsAvailableBalance(setLoader, setData, setError, urlParams) {
    setLoader(true); setError(null);
    const { id } = urlParams
    try {
        const response = await appClientMethods.get(`${cardsWallet}MyCardsInfo/${id}`);
        setData(response);
    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false)
    }
}
async function myCardsCoinLu(setLoader, setData, setError) {
    setLoader(true); setError(null);
    try {
        const response = await appClientMethods.get(`${commonController}MyCardsLu`);
        setData(response);
    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false)
    }
}
async function cardDetails(setLoader, setData, setError, urlParams) {
    setLoader(true);
    try {
        const { id, cardid } = urlParams
        const response = await appClientMethods.get(`${cardsWallet}Customer/${id}/Card/${cardid}`)
        setData(response);
    } catch (error) {
        setError(error.message)
    } finally {
        setLoader(false);
    }
}
async function getwalletsTotalBalance(setLoader, setData, setError, urlParams) {
    setLoader(true);
    try {
        const { id, coin } = urlParams;
        const response = await appClientMethods.get(`${merchant}/availablebalance/${coin}/${id}`);
        setData(response);
    } catch (error) {
        setError(error.message)
    } finally {
        setLoader(false);
    }
}
async function getVaults(setState, urlParams) {
    try {
        const { id, pageSize, pageNo } = urlParams;
        const [vaults] = await Promise.all([appClientMethods.get(`${cardsWallet}Vaults/MyCards/${id}/${pageSize}/${pageNo}`)]);
        setState({ type: 'setLookups', payload: { vaults } });
    } catch (error) {
        setState({ type: 'setError', payload: error.message })
    } finally {
        setState({ type: 'setLoading', payload: '' })
    }
}
const getPayeesLu = async ( coin, network,searchVal,action) => {
    try {
        const response = await appClientMethods.get(`payees/crypto?coin=${coin?.toLowerCase()}&netWork=${network}&search=${searchVal}&action=${action}`);
        return { data: response, error: null }
    }
    catch (error) {
        return { error: error.message, data: null }
    }
}
const saveWithdrawl = async (obj) => {
    try {
        const respone = await appClientMethods.post(`withdraw/crypto/fee`, obj);
        return { respone: respone, error: null }
    }
    catch (error) {
        return { error: error.message, respone: null }
    }
};

const saveCryptoWithdraw = async (obj) => {
    try {
        const respone = await appClientMethods.post(`withdraw/crypto`, obj);
        return { respone: respone, error: null }
    }
    catch (error) {
        return { error: error.message, respone: null }
    }
}
async function getAvailableBalance(setLoader, setData, setError, urlParams) {
    setLoader(true); setError(null);
    const { id } = urlParams
    try {
        const response = await appClientMethods.get(`${cardsWallet}MyCardsInfo/${id}`)
        setData(response);
    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false)
    }
}
async function getGraphYearLu(setYearLu, setGettingYears) {
    setGettingYears(true)
    try {
        const response = await appClientMethods.get(`${ApiControllers.common}/yearsLookUp`)
        setYearLu(response)
    } catch (error) {
    } finally {
        setGettingYears(false)
    }
}

//https://devarthapayapi.artha.work/api/v1/Merchant/Vaults/Fiat/depositfiat

async function fetchPayins(setLoader, setData, setError, urlParams, selectPayin, setPage) {
    setLoader(true);
    const { id, searchValue, pageNo, pageSize, currentData } = urlParams
    try {
        const response = await appClientMethods.get(`${payins.payinsGridData}/${id}/all/${searchValue}?page=${pageNo}&pageSize=${pageSize}`);
        setData([...currentData, ...response.data]);
        pageNo === 1 && selectPayin(response?.data?.[0]);
        setPage(pageNo);
    } catch (error) {
        setError(error.message)
    } finally {
        setLoader(false);
    }
}

async function getFiatCurrency(setCurrency, setLoader, setError, urlParams, selectCurrency, setPage) {
    setLoader(true)
    try {
        const response = await appClientMethods.get(`${merchant}Vaults/Fiat/depositfiat`)
        setCurrency(response)
    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false)
    }
}


async function getFiatCurrencyDetails(setDetails, setLoader, setError, currency,cusId) {
    setLoader(true)
    try {
        const response = await appClientMethods.get(`${wallets}${currency}/fiat/deposit`)
        setDetails(response)
    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false)
    }
}


async function getVaultDashoardKpis(setData){
    try {
        const response = await appClientMethods.get(`${ApiControllers.common}/Payees/kpis`)
        setData(response)
    } catch (error) {
    }
}

async function getDashoardKpis(setData){
    try {
        const response = await appClientMethods.get(`${ApiControllers.dashboard}/Vaults/CustomerBalances`)
        setData(response)
    } catch (error) {
    }
}
export {
    getCryptoWallets, getFiatwallets, getWalletsRecentTransactions, getKipsDetails, getMyCardsAvailableBalance, myCardsCoinLu,
    cardDetails, getwalletsTotalBalance, getVaults, getPayeesLu, saveWithdrawl, getAvailableBalance, saveCryptoWithdraw, getGraphYearLu,
    getFiatCurrency,getFiatCurrencyDetails,getVaultDashoardKpis,getDashoardKpis
}