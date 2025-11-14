import { ApiControllers } from "../../../api/config"

const  ExchangeDashBoardEndPoints={
dashBoardAdvertisment:`${ApiControllers.dashboard}GetAdvertisements`,
topgainers:`${ApiControllers.dashboard}TopGainers`,
Kpis:`${ApiControllers.dashboard}Exchange/Kpis`,
customerBalance:`${ApiControllers.dashboard}DashBoardCustomerBalance`,
cryptoDetails:`${ApiControllers.buySell}/Buy`,
}
export {
    ExchangeDashBoardEndPoints
}