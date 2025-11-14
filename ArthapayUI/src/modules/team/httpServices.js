import { ApiControllers } from "../../api/config"
import { encryptAES } from "../../core/shared/encrypt.decrypt"
import { successToaster } from "../../core/shared/toasters"
import { TOASTER_MESSAGES } from "./toasterMessages"
import { appClientMethods as  coreClientMethods} from "../../core/http.clients";
import { cardClientMethods } from "../cards/httpClients"
const { common: commonController,
    cardsWallet,
    exchangeTransaction,
} = ApiControllers

// -------------------- Team Dashboard ------------------------
export const getTeamKpis = async (setState) => {
    setState({ type: "setKpiLoading", payload: true });
    try {
        const data = await coreClientMethods.get(`teams/kpi`)
        setState({ type: "setRefresh", payload: false });
        setState({ type: "setKpiData", payload: data });
    } catch (error) {
        setState({ type: "setError", payload: error.message });
    } finally {
        setState({ type: "setKpiLoading", payload: false });
    }
}

export const enableOrDisable = async (setState, onSuccess, { selection }) => {
    setState(prev => ({ ...prev, loading: 'save', error: '' }))
    try {
        const enableOrDisable = selection.status === 'Active' ? 'disable' : 'enable'
        const data = await coreClientMethods.put(`teams/members/${selection.id}/${enableOrDisable}`,{});
        onSuccess(data)
    } catch (error) {
        setState(prev => ({ ...prev, error: error.message }))
    } finally {
        setState(prev => ({ ...prev, loading: '' }))
    }
}


// -------------------- Invite Member -----------------------------
export const sendInvitation = async (onSuccess, onError, { values, userProfile }) => {
    try {
        const reqObj = {
            firstName: values.firstName,
            lastName: values.lastName,
            email: encryptAES(values.email,userProfile.clientSecretKey),
            phoneCode: encryptAES(values.phoneCode,userProfile.clientSecretKey),
            phoneNo: encryptAES(values.phoneNo,userProfile.clientSecretKey),
            membershipType: values.membershipType || null,
            referrerId: userProfile?.id,
            status: 'Active',
            gender: values.gender,
            country: values.country,
            userName: encryptAES(values.userName,userProfile.clientSecretKey),
        }
        const data = await coreClientMethods.post(`teams/invite`, reqObj)
        onSuccess(data)
    } catch (error) {
        onError(error.message)
    }
}


// ------------------ Member Details ---------------------

export const getMemberDetails = async (setState,id) => {
    setState(prev => ({ ...prev, loading: true }))
    try {
        const data = await coreClientMethods.get(`teams/members/${id}`)
        setState(prev => ({ ...prev, profileDetails: data }))
    } catch (error) {
        setState(prev => ({ ...prev, errorMsg: error.message }))
    }
    finally {
        setState(prev => ({ ...prev, loading: false }))
    }
}



export const getMemberCardsKpis= async (setState,id) => {
    setState(prev => ({ ...prev, loading: true }))
    try {
        const data = await coreClientMethods.get(`members/id/cards/kpi?id=${id}`)
        setState(prev => ({ ...prev, data }))
    } catch (error) {
        setState(prev => ({ ...prev, error: error.message }))
    } finally {
        setState(prev => ({ ...prev, loading: false }))
    }
}
export const getAddCardDetails = async (setState, params) => {
    const { customerId, shoudFetchMembers } = params
    setState({ type: 'setLoading', payload: 'data' })
    try {
        const requests = shoudFetchMembers ? [coreClientMethods.get(`${ApiControllers.team}CardsLu/${customerId}`), coreClientMethods.get(`${ApiControllers.team}Details/${customerId}`)] : [coreClientMethods.get(`${ApiControllers.team}CardsLu/${customerId}`),]
        const [cards, members] = await Promise.all(requests)
        setState({ type: 'setLookups', payload: { cards, members } })
    } catch (error) {
        setState({ type: 'setError', payload: { message: error.message } })
    } finally {
        setState({ type: 'setLoading', payload: '' })
    }
}

export const addCardToMember = async (setState, onSuccess, { values, userProfile }) => {
    setState({ type: 'setLoading', payload: 'save' })
    try {
        const reqObj = {
            assigneeId: values.member,
            assignerId: userProfile?.id,
            cardId: values.card
        }
        const data = await coreClientMethods.post(`${ApiControllers.team}AddCard`, reqObj)
        onSuccess(data)
    } catch (error) {
        setState({ type: 'setError', payload: { message: error.message } })
    } finally {
        setState({ type: 'setLoading', payload: '' })
    }
}

//-----------------------------Member Topup Cards--------------------------
export async function fetchDepositDetails(setLoader, setData, setError, urlParams) {
    setLoader(true); setError(null);
    const { id, cardId } = urlParams
    try {
        const response = await coreClientMethods.get(`${cardsWallet}Deposit/${id}/Card/${cardId}/Fee`)
        setData(response);
    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false)
    }
}

export async function getAssetInCards(setLoader, setData, setError, urlParams) {
    setLoader(true); setError(null);
    const { id } = urlParams
    try {
        const response = await coreClientMethods.get(`${commonController}Customer/walletcode/${id}`);
        setData(response);
    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false)
    }
}

export async function getNetworkLuCrads(setLoader, setData, setError, urlParams) {
    setLoader(true); setError(null);
    const { id, walletCode } = urlParams
    try {
        const response = await coreClientMethods.get(`${commonController}Wallets/NetWorkLU/${walletCode}/${id}`);
        setData(response);
    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false)
    }
}

export async function getTopUpCommissions(setLoader, setData, setError, urlParams) {
    setLoader(true); setError(null);
    const { id, cardid, amount, coin } = urlParams
    try {
        const response = await coreClientMethods.get(`${cardsWallet}DepositFeeComission/Customer/${id}/Cards/${cardid}/${amount}/${coin}`);
        setData(response);
    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false)
    }
}
export async function saveTopupDetails(setLoader, setData, setError, urlParams) {
    setLoader(true); setError(null);
    const { obj } = urlParams
    try {
        const response = await coreClientMethods.post(`${exchangeTransaction}Deposit/TopUp`, obj);
        setData(response);
    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false)
    }
}

// ---------------------------------- Member Transactions -----------------------------------

export const getPageInititalDetails = async (setState) => {
    setState({ type: 'setStates', payload: { loading: 'data', error: { message: '' } } })
    try {
        const transactionTypes = await coreClientMethods.get(`teams/lookup`)
        setState({ type: 'setLookups', payload: { transactionTypes: transactionTypes?.TeamStatus } })
    } catch (error) {
        setState({ type: 'setError', payload: { message: error.member, type: 'error' } })
    } finally {
        setState({ type: 'setLoading', payload: '' })
    }
}


export const getTransactionDetails = async (setState, { id }) => {
    setState(prev => ({ ...prev, loading: 'data', errorMessage: '' }))
    try {
        const details = await coreClientMethods.get(`teams/member/${id}/transactions`)
        setState(prev => ({ ...prev, loading: '', errorMessage: '', details }))
    } catch (error) {
        setState(prev => ({ ...prev, loading: '', errorMessage: error.message }))
    }
}

export const downloadTransaction = async (setState, { id, type }) => {
    setState(prev => ({ ...prev, loading: 'download', errorMessage: '' }))
    try {
        const data = await coreClientMethods.get(`transaction/download?id=${id}`)
        const link = document.createElement('a');
        link.href = data;
        link.target = '_blank';
        link.download = 'TransactionDetails.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setState(prev => ({ ...prev, loading: '', errorMessage: '' }))
        successToaster({content:TOASTER_MESSAGES.TRANSACTION_DOWNLOAD});
    } catch (error) {
        setState(prev => ({ ...prev, loading: '', errorMessage: error.message }))
    }
}
//---------------------------------Card Freez View------------------------------
export async function carddetails(setLoader, setData, setError, urlParams) {
    setLoader(true);
    try {
        const {  cardid } = urlParams
        const response = await cardClientMethods.get(`cards/${cardid}` )
        setData(response);
    } catch (error) {
        setError(error.message)
    } finally {
        setLoader(false);
    }
}

export async function freezeunfreezeCard(setLoader, setData, setError, urlParams) {
    setLoader(true); setError(null);
    const { cardid, obj ,isFreezed} = urlParams
    try {
        let response;
        if(isFreezed){
            response =  await cardClientMethods.put(`cards/${cardid}/unfreeze`, obj);
        }else{
            response = await cardClientMethods.put(`cards/${cardid}/freeze`, obj);
        }
        setData(response);
    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false)
    }
}