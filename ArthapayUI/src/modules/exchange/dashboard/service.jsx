import { appClientMethods } from "../../../api/clients"
import { ExchangeDashBoardEndPoints } from "./endPoints"
async function getAdvertisements(setAdvertisment, screenName) {
    try {
        const response = await appClientMethods.get(`${ExchangeDashBoardEndPoints.dashBoardAdvertisment}/${screenName}`)
        setAdvertisment(response)
    } catch (error) {
    }
}
async function getTopGainers(setMarketData) {
    try {
        const response = await appClientMethods.get(`${ExchangeDashBoardEndPoints.topgainers}`)
        setMarketData(response)
    } catch (error) {
    }
}
async function getCrypto(setCryptoDetails) {
    try {
        const response = await appClientMethods.get(`${ExchangeDashBoardEndPoints.cryptoDetails}`)
        setCryptoDetails(response)
    } catch (error) {
    }
}
async function getKipsDetails(setData) {
    try {
        const response = await appClientMethods.get(`${ExchangeDashBoardEndPoints.Kpis}`);
        setData(response);
    } catch (error) {
    }
}

async function getDashboardGraph(setDashboardGraphData, id) {
    try {
        const response = await appClientMethods.get(`${ExchangeDashBoardEndPoints.customerBalance}/${id}`)
        setDashboardGraphData(response)
    } catch (error) {
    }
}
export {getDashboardGraph,getKipsDetails,getTopGainers,getAdvertisements,getCrypto }