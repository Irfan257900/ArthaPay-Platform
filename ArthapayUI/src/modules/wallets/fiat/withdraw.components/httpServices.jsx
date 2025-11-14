
import { ApiControllers } from "../../../../api/config";
import { appClientMethods } from "../../../../core/http.clients";
const { exchangeWallets } = ApiControllers
const getFaitPayeesLu = async ( coin,feature) => {
    try {
        const response = await appClientMethods.get(`payees/fiat?currency=${coin}&feature=${feature}`);
        return { data: response, error: null }
    }
    catch (error) {
        return { error: error.message, data: null }
    }
}
const saveFiatWithdrawl = async (obj) => {
    try {
        const respone = await appClientMethods.post(`withdraw/fiat/fee`, obj);
        return { respone: respone, error: null }
    }
    catch (error) {
        return { error: error.message, respone: null }
    }
};
const getFiatSummarySave=async(obj,setLoader)=>{
    setLoader(true)
    try {
        const respone = await appClientMethods.post(`ExchangeTransaction/Exchange/Withdraw/Fiat`,obj);
        return { respone: respone, error: null }
    }
    catch (error) {
        setLoader(false)
        return { error: error.message, respone: null }
    }
}
export {
    getFaitPayeesLu,saveFiatWithdrawl,getFiatSummarySave
}