import { ApiControllers } from "../../api/config";
import { cardClientMethods } from "../../modules/cards/httpClients";
import { appClientMethods } from "../http.clients";
import { appClientMethods as  coreClientMethods} from "../../modules/payments/httpClients";
import { appClientMethods as  BankClientMethods} from "../../modules/banks/http.clients";
import { appClientMethods as  arthaClientMethods} from "../../modules/cards/httpClients";






 
const {dashboard:dashboardController,common:commonController,cardsWallet}=ApiControllers
async function getAdvertisements(setAdvertisment, screenName) {
    try {
        const response = await appClientMethods.get(`${dashboardController}GetAdvertisements/${screenName}`)
        setAdvertisment(response)
    } catch (error) {
    }
}


async function getCardsKpis(setCards) {
    try {
        const response = await appClientMethods.get(`${dashboardController}/Cards/Kpis`)
        setCards(response)
    } catch (error) {
    }
}
async function getPaymentKpis(setPaymentStats) {
    try {
        const response = await coreClientMethods.get(`Payments/Kpi`)
        setPaymentStats(response)
    } catch (error) {
    }
}
async function getVaultsKpis(setVaultsData) {
    try {
        const response = await appClientMethods.get(`${dashboardController}vaults/depositcrypto`)
        setVaultsData(response)
    } catch (error) {
    }
}

async function getTopGainers(setMarketData) {
    try {
        const response = await appClientMethods.get(`${dashboardController}TopGainers`)
        setMarketData(response)
    } catch (error) {
    }
}

async function getKipsDetails(setData) {
    try {
        const response = await appClientMethods.get(`vaults/kpi`);
        setData(response);
    } catch (error) {
    }
}


async function getKipsAccounts(setAccountskips) {

    try {
        const response = await BankClientMethods.get(`banks/kpi`);
        setAccountskips(response);
    } catch (error) {

    }
}



export async function fetchUserCards(localDispatch, setData, urlParams) {
    localDispatch({ type: 'setCardsLoader', payload: true });
    try {
        const { pageSize, pageNo ,isBussines} = urlParams
        // const response = isBussines ?  await arthaClientMethods.get(`${cardsWallet}MyCards/${pageSize}/${pageNo}`):await cardClientMethods.get(`cards?pageSize=${pageSize}&pageNo=${pageNo}`);
         const response = await cardClientMethods.get(`cards?pageSize=${pageSize}&pageNo=${pageNo}`);
        setData(response);
    } catch (error) {
    } finally {
        localDispatch({ type: 'setCardsLoader', payload: false });
    }
}


async function getReferralsKpis(setReferralsStats) {
    try {
        const response = await appClientMethods.get(`${dashboardController}/Referrals/Kpis`)
        setReferralsStats(response)
    } catch (error) {
    }
}
async function getGraphYearLu(setYearLu,setGettingYears) {
    setGettingYears(true)
    try {
        const response = await appClientMethods.get(`${commonController}/yearsLookUp`)
        setYearLu(response)
    } catch (error) {
    }finally{
        setGettingYears(false)
    }
}
async function getCardsGraph(setCardsGraphData, id) {
    try {
        const response = await appClientMethods.get(`${dashboardController}DashBoardCardsTransactionsGraph/${id}`)
        setCardsGraphData(response)
    } catch (error) {
    }
}
async function getDashboardGraph(setDashboardGraphData) {
    try {
        const response = await appClientMethods.get(`${dashboardController}DashBoardCustomerBalance`)
        setDashboardGraphData(response)
    } catch (error) {
    }
}

async function getRecentActivites(setrecentActivitiesData) {
    try {
        const response = await appClientMethods.get(`transactions/recent?pageSize=${5}&pageNo=${1}`)
        setrecentActivitiesData(response)
    } catch (error) {
    }
}

export async function fetchMarketCoinDetails(dispatch, urlParams) {
    dispatch({ type: 'setLoader', payload: true });
    try {
        const { coin } = urlParams
        const response = await appClientMethods.get(`${dashboardController}TopGainers/${coin}`);
        dispatch({ type: 'setData', payload: response });
    } catch (error) {
        dispatch({ type: 'setError', payload: error.message });
    } finally {
        dispatch({ type: 'setLoader', payload: false });
    }
};

export async function fetchMarketTopGainers(dispatch) {
    dispatch({ type: 'setMarketDataLoader', payload: true });
    try {
        const response = await appClientMethods.get(`${dashboardController}TopGainers`)
        dispatch({ type: 'setMarketData', payload: response });
    } catch (error) {
        dispatch({ type: 'setError', payload: error.message });
    } finally {
        dispatch({ type: 'setMarketDataLoader', payload: false });
    }
}

const tickFormatter = (value) => {
    if (value === 0) {
        return ''; 
    }
    const units = ['K', 'M', 'B', 'T'];
    let unitIndex = -1; 
    let scaleValue = value;

    while (scaleValue >= 1000 && unitIndex < units.length - 1) {
        scaleValue /= 1000;
        unitIndex++;
    }
    return unitIndex >= 0 ? `${scaleValue}${units[unitIndex]}` : value;
};
export { getAdvertisements,getCardsKpis,getPaymentKpis,getReferralsKpis,getGraphYearLu,getKipsDetails,getTopGainers,getVaultsKpis,getCardsGraph,getDashboardGraph,tickFormatter,getKipsAccounts,getRecentActivites }