import { appClientMethods, cardClientMethods } from "./httpClients"
import { ApiControllers } from "../../api/config";
import { appClientMethods as  coreClientMethods} from "../../core/http.clients";
const {
    cardsWallet,
    security,
} = ApiControllers


// ----------------------- Dashboard ------------------------------

async function getAdvertisementDetails(setData, urlParams) { // using
    try {
        const { screenName } = urlParams
        const response = await coreClientMethods.get(`GetAdvertisements/${screenName}`)
        setData(response);
    } catch (error) {
    }}
async function getDashboardAllCardDetails(setData, urlParams) { // using
    try {
        const { pageSize, pageNo } = urlParams
        const response = await appClientMethods.get(`${cardsWallet}/AllCards/${pageSize}/${pageNo}`)
        setData(response);
    } catch (error) {
    }
}

// ----------------------- All Cards ------------------------------

async function getAllCardDetails(setLoader, setData, setError, urlParams) { // using
    setLoader(true);
    try {
        const { pageSize, pageNo } = urlParams
        const response = await cardClientMethods.get(`cards/available?pagesize=${pageSize}&pageno=${pageNo}`)
        setData(response);
    } catch (error) {
        setError(error.message)
    } finally {
        setLoader(false);
    }
}
async function getAllMyCardDetails(localDispatch, setData, urlParams) { //using
    localDispatch({ type: 'setCardsLoader', payload: true });
    try {
        const { pageSize, pageNo } = urlParams
        const response = await appClientMethods.get(`${cardsWallet}MyCards/${pageSize}/${pageNo}`)
        setData(response);
    } catch (error) {
    } finally {
        localDispatch({ type: 'setCardsLoader', payload: false });
    }
}
async function getCountryTownLu( setData, setError) { //using
    setError(null)
    try {
        const response = await coreClientMethods.get(`kyc/lookup`);
        setData(response);
    } catch (error) {
        setError(error.message)
    }
}
async function getAddressLU( setData, setError) { //using
    setError(null)
    try {
        const response = await coreClientMethods.get(`addresses`);
        setData(response);
    } catch (error) {
        setError(error.message)
    }
}
async function getAllAddressesDetails(setLoader, setData, setError) { //using
    setLoader(true); setError(null);
    try {
        const response = await coreClientMethods.get(`Customer/Address`);
        setData(response);
    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false)
    }
}
async function getPhysicalCardDetails(setLoader, setData, setError) { //using
    setLoader(true);
    try {
        const response = await cardClientMethods.get(`cards/physical/bind`)
        setData(response);
    } catch (error) {
        setError(error.message)
    } finally {
        setLoader(false);
    }
}
async function fetchPhysicalCards(localDispatch, urlParams) {  //using  
    localDispatch({ type: 'setLoader', payload: true });
    localDispatch({ type: 'setErrorMsg', payload: null });
    try {
        const { cardType,pazeNo,pageSize } = urlParams
        const response = await appClientMethods.get(`${cardsWallet}/${cardType}/${pazeNo}/${pageSize}`)
        localDispatch({ type: 'setCardsData', payload: response });
    } catch (error) {
        localDispatch({ type: 'setErrorMsg', payload: error.message });
    } finally {
        localDispatch({ type: 'setLoader', payload: true });
    }
}

// ----------------------- My Cards ------------------------------

async function getMyCardsDetails(setLoader, setData, setError, urlParams) { //using
    setLoader(true);
    try {
        const {  pageSize, pageNo,url,isExclude,isBussinesMyCards} = urlParams;
        const path = isBussinesMyCards ? `${url}?pageSize=${pageSize}&pageNo=${pageNo}&isExclude=${isExclude}` :`cards?pageSize=${pageSize}&pageNo=${pageNo}`;
        const response = await cardClientMethods.get(path);
        setData(response);
    } catch (error) {
        setError(error.message)
    } finally {
        setLoader(false);
    }
}
async function getShowPin(localDispatch, urlParams) { //using
    localDispatch({ type: 'setLoader', payload: true });
    localDispatch({ type: 'setErrorMsg', payload: null });
    const { obj } = urlParams
    try {
        const response = await cardClientMethods.post(`cards/${obj.cardId}/pin`,obj);
        localDispatch({ type: 'setGetPin', payload: response });
    } catch (error) {
        localDispatch({ type: 'setErrorMsg', payload: error.message });
    }
    finally {
        localDispatch({ type: 'setLoader', payload: false });
    }
}
async function freezeunfreezeCard(localDispatch, setData, urlParams) { // using
    localDispatch({ type: 'setBtnLoader', payload: true });
    localDispatch({ type: 'setError', payload: null });
    const { cardid ,obj,isFreezed} = urlParams
    try {
        let response;
        if(isFreezed){
            response =  await cardClientMethods.put(`cards/${cardid}/unfreeze`, obj);
        }else{
            response = await cardClientMethods.put(`cards/${cardid}/freeze`, obj);
        }
        setData(response);
    } catch (error) {
        localDispatch({ type: 'setError', payload: error.message });
    }
    finally {
        localDispatch({ type: 'setBtnLoader', payload: false });
    }
}
async function saveTopupDetails(localDispatch, setData, urlParams) { // using
    localDispatch({ type: 'setTopupLoader', payload: true });
    localDispatch({ type: 'setErrorMsg', payload: null });
    const { obj } = urlParams
    try {
        const response = await cardClientMethods.post(`cards/topup`,obj);
        setData(response);
    } catch (error) {
        localDispatch({ type: 'setErrorMsg', payload: error.message });
    }
    finally {
        localDispatch({ type: 'setTopupLoader', payload: false });
    }
}
async function saveCreateCard( setData, setError, urlParams) { // using
   setError(null);
    const { id,obj } = urlParams
    try {
        const response = await appClientMethods.post(`cards/CreateCards/${id}`,obj);
        setData(response);
    } catch (error) {
        setError(error.message)
    }
}
async function setpin(localDispatch, setData, urlParams) { // using
    localDispatch({ type: 'setSetPinLoader', payload: true});
    localDispatch({ type: 'setError', payload: null});
    const {obj } = urlParams
    try {
        const response = await cardClientMethods.post(`cards/${obj.cardId}/pin`,obj);
        setData(response);
    } catch (error) {
        localDispatch({ type: 'setError', payload: error.message});
    }
    finally {
        localDispatch({ type: 'setSetPinLoader', payload: false});
    }
}
async function getTopUpCommissions(localDispatch,setData, urlParams) { // using
    localDispatch({ type: 'setTopUpCommissionLoader', payload: true });
    localDispatch({ type: 'setErrorMsg', payload: null });
    const {cardid,amount,coin } = urlParams
    try {
        const response = await cardClientMethods.get(`cards/${cardid}/estimatefee?amount=${amount}&Currency=${coin}`);
        setData(response);
    } catch (error) {
        localDispatch({ type: 'setErrorMsg', payload: error.message });
    }
    finally {
        localDispatch({ type: 'setTopUpCommissionLoader', payload: false });
    }
}
async function getNewCardDetails(setLoader, setData, setError, urlParams) { //using
    setLoader(true); setError(null);
    const {id } = urlParams
    try {
        const response = await cardClientMethods.get(`cards/${id}/apply`);
        setData(response);
        setLoader(false)
    } catch (error) {
        setError(error.message)
        setLoader(false)
    }
}
async function fetchFaqs(setData, setError) { //using
     setError(null);
    try {
        const response = await coreClientMethods.get(`faq`);
        setData(response);
    } catch (error) {
        setError(error.message)
    }
}
async function getApplicationInfo(setLoader, setData, setError, urlParams) { // using
    setLoader(true); setError(null);
    const {cardId} = urlParams
    try {
        const response = await cardClientMethods.get(`cards/${cardId}/kycrequirements`);
        setData(response);
    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false)
    }
}
async function fetchFeeInfo(setLoader, setData, setError, urlParams) { //using
    setLoader(true); setError(null);
    const {cardId,walletId,isHaveCard} = urlParams
    try {
        const response = await cardClientMethods.get(`applycards/${cardId}/info/${walletId}/${isHaveCard}`);
        setData(response);
    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false)
    }
}
async function saveApplyCard(setLoader, setData, setError, urlParams) { //using
    setLoader(true); setError(null);
    const {obj,type} = urlParams
    try {
        let response;
        if(type?.toLowerCase() ==='virtual'){
            response = await cardClientMethods.post(`cards/virtual/apply`,obj);
        }else{
            response = await cardClientMethods.post(`cards/customerphysical/apply`,obj);
        }
        setData(response);
    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false)
    }
}
async function myCardsCoinLu(localDispatch) { // not using remove from screentabs file also
    localDispatch({ type: 'setAvailableBalanceLoader', payload: true });
    localDispatch({ type: 'setErrorMsg', payload: null });
    try {
        const response = await coreClientMethods.get(`MyCardsLu`);
        localDispatch({ type: 'setCoins', payload: response.Coins });
    } catch (error) {
        localDispatch({ type: 'setErrorMsg', payload: error.message });
    }
    finally {
        localDispatch({ type: 'setAvailableBalanceLoader', payload: false });
    }
}
async function getMyCradsAvailableBalance(localDispatch, setData) { // using
    localDispatch({ type: 'setAvailableBalanceLoader', payload: true });
    localDispatch({ type: 'setErrorMsg', payload: null });
    try {
        const response = await cardClientMethods.get(`cards/balances/summary`);
        setData(response);
    } catch (error) {
        localDispatch({ type: 'setErrorMsg', payload: error.message });
    }
    finally {
        localDispatch({ type: 'setAvailableBalanceLoader', payload: false });
    }
}
async function getAssetInCards(localDispatch, setData, urlParams) { // using
    localDispatch({ type: 'setLoader', payload: true });
    localDispatch({ type: 'setErrorMsg', payload: null });
    const {cardId} = urlParams
    try {
        const response = await cardClientMethods.get(`cards/walletcode/${cardId}`);
        setData(response);
    } catch (error) {
        localDispatch({ type: 'setErrorMsg', payload: error.message });
    }
    finally {
        localDispatch({ type: 'setLoader', payload: false });
    }
}
async function getNetworkLuCrads(localDispatch, setData, urlParams) { // using
    localDispatch({ type: 'setLoader', payload: true });
    localDispatch({ type: 'setErrorMsg', payload: null });
    const {walletCode,cardId} = urlParams
    try {
        const response = await cardClientMethods.get(`cards/networks/${walletCode}/Card/${cardId}`);
        setData(response);
    } catch (error) {
        localDispatch({ type: 'setErrorMsg', payload: error.message });
    }
    finally {
        localDispatch({ type: 'setLoader', payload: false });
    }
}
async function quickLinkpost(setLoader, setData, setError, urlParams) { //using
    setLoader(true); setError(null);
    const {obj} = urlParams
    try {
        const response = await cardClientMethods.post(`cards/physical/bind`,obj);
        setData(response);
    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false)
    }
}
async function getQuickLinkApplicationInfo(setLoader, setData, setError, urlParams) { // using
    setLoader(true); setError(null);
    const {cardId} = urlParams
    try {
        const response = await coreClientMethods.get(`Customer/Physical/ApplicationInformation/${cardId}`);
        setData(response);
    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false)
    }
}
async function getQuickLinkKYCInfo(setLoader, setData, setError, urlParams) { // using
    setLoader(true); setError(null);
    const {cardId} = urlParams
    try {
        const response = await coreClientMethods.get(`Customer/Card/${cardId}/KYCInformation`)
        setData(response);
    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false)
    }
}
async function getAssignCardsData(setAssignCardDetails) { // using
    try {
        const response = await appClientMethods.get(`AssignCards/10/1`)
        setAssignCardDetails(response)
    } catch (error) {
    }
}
async function getQuickLinkKYCSave(setLoader, setData, setError, urlParams) { //using
    setLoader(true); setError(null);
    const {obj} = urlParams
    try {
        const response = await appClientMethods.post(`${cardsWallet}Customer/Physical/ApplyCard`,obj)
        setData(response);
    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false)
    }
}
async function KyckybUpdateDetails(setLoader, setData, setError, urlParams) { // not using
    setLoader(true); setError(null);
    const {obj} = urlParams
    try {
        const response = await coreClientMethods.put(`UpdateProfile`, obj);
        setData(response);
    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false)
    }
}
async function saveNewAddressDetails(setLoader, setData, setError, urlParams) { //using
    setLoader(true); setError(null);
    const {obj} = urlParams
    try {
        const response = await coreClientMethods.post(`Customer/Address`, obj);
        setData(response);
    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false)
    }
}
async function editAddressSave(setLoader, setData, setError, urlParams) { //using
    setLoader(true); setError(null);
    const {obj} = urlParams
    try {
        const response = await coreClientMethods.put(`Customer/Address`, obj);
        setData(response);
    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false)
    }
}
export const fetchAddressDetails=async ({setData,setError,addressId})=>{ //using
    try {
        setData(await coreClientMethods.get(`Customer/Address/${addressId}`))
    } catch (error) {
        setError(error.message);
    }
}
async function getCardStatus(setLoader, setData, setError, urlParams) { // using
    setLoader(true); setError(null);
    const {cardId} = urlParams
    try {
        const response = await appClientMethods.get(`cards/cardstatus/${cardId}`)
        setData(response);
    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false)
    }
}
async function fetchDepositDetails(localDispatch, setData, urlParams) { // using
    localDispatch({ type: 'setLoader', payload: true });
    localDispatch({ type: 'setErrorMsg', payload: null });
    const {cardId} = urlParams
    try {
        const response = await cardClientMethods.get(`cards/${cardId}/topup`)
        setData(response);
    } catch (error) {
        localDispatch({ type: 'setErrorMsg', payload: error.message });
    }
    finally {
        localDispatch({ type: 'setLoader', payload: false });
    }
}
async function getKycSampleUrls(setData, setError) { // using
     setError(null);
    try {
        const response = await coreClientMethods.get(`/customer/kycinfo`)
        setData(response);
    } catch (error) {
        setError(error.message)
    }
}
async function updateApplyCardKycrequirement(setLoader, setData, setError, urlParams) { // using
    setLoader(true); setError(null);
    const {obj} = urlParams
    try {
        const response = await appClientMethods.put(`${cardsWallet}kycUpdate`,obj)
        setData(response);
    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false)
    }
}
async function getVerificationFields(setLoader, setData, setError) { // not using
    setLoader(true); setError(null);
    try {
        const response = await appClientMethods.get(`${security}/Verificationfields`);
        setData(response);
    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false)
    }
}
async function getAddresses(setLoader, setData, setError) { // not using
    setLoader(true); setError(null)
    try {
        const response = await coreClientMethods.get(`Customer/Address`)
        setData(response);
    } catch (error) {
        setError(error.message);
    }
    finally {
        setLoader(false)
    }
}

// -----------------------Over View ------------------------------
async function carddetails(localDispatch, setData, urlParams) { // using
    localDispatch({ type: 'setLoader', payload: true });
    try {
        const { cardid } = urlParams
        const response = await cardClientMethods.get(`cards/${cardid}` )
        setData(response);
    } catch (error) {
        localDispatch({ type: 'setErrorMsg', payload: error.message });
        localDispatch({ type: 'setLoader', payload: false });
    }
}
 const getAddCardDetails = async (localDispatch,urlParams) => { // using
    localDispatch({ type: 'setLoader', payload: true });
    localDispatch({ type: 'setError', payload: null });
    try {
        const { search } = urlParams
        const response = await coreClientMethods.get(`cards/employees?search=${search||null}`)
        localDispatch({ type: 'setData', payload: response });
    } catch (error) {
        localDispatch({ type: 'setError', payload: error.message });
    } finally {
        localDispatch({ type: 'setLoader', payload: false });
    }
}

 const addCardToMember = async (localDispatch,setData,values) => {  //using
    localDispatch({ type: 'setSaveBtnLoader', payload: true });
    localDispatch({ type: 'setError', payload: false });
    try {
        const { reqObj } = values
        const data = await cardClientMethods.post(`cards/assign`, reqObj)
        setData(data);
    } catch (error) {
        localDispatch({ type: 'setError', payload: error.message });
    } finally {
        localDispatch({ type: 'setSaveBtnLoader', payload: false });
    }
}
async function fetchBeneficiaryTypeLu( setData, setError) { //using
    setError(null);
   try {
       const response = await coreClientMethods.get(`cards/lookup`); // Changed according to the new changes in the lookups
       setData(response?.BeneficiaryTypes);
   } catch (error) {
       setError(error.message)
   }
}
async function fetchBeneficiariesLu( setData, setError, urlParams) { //using
     setError(null);
    const {type} = urlParams
    try {
        const response = await cardClientMethods.get(`beneficiaries?beneficiaryType=${type}`);
        setData(response);
    } catch (error) {
        setError(error.message)
    }
}
async function fetchUboDetailsInfo(setLoader, setData, setError, urlParams) { // using
    setLoader(true); setError(null);
    const { id } = urlParams
    try {
        const response = await cardClientMethods.get(`UboDetails?id=${id}`);
        setData(response);
    } catch (error) {
        setError(error.message)
    } finally {
        setLoader(false);
    }
}
async function getCardViewData(localDispatch, setData, urlParams) { // using
    localDispatch({ type: 'setLoader', payload: false });
    try {
        const { cardid } = urlParams
        const response = await cardClientMethods.get(`cards/${cardid}/reveal`)
        setData(response);
    } catch (error) {
        localDispatch({ type: 'setErrorMsg', payload: error.message });
    } finally {
        localDispatch({ type: 'setLoader', payload: false });
    }
}
export const getMyCardsTransactions= async (cardId,setLoader, setData, setError)=>{
    try {
        setLoader(true);
        const response = await cardClientMethods.get(`cards/${cardId}/transactions?page=1&pageSize=7`);
        setData(response?.data || []);
        setLoader(false);
    } catch (error) {
        setError(error.message);
        setLoader(false);
    }
 
}
// ================================================================
export { getAllCardDetails,
     getCountryTownLu,
      getAllAddressesDetails,
      getPhysicalCardDetails,
      getMyCardsDetails,
      carddetails,
      getShowPin,
      freezeunfreezeCard,
      saveTopupDetails,
      saveCreateCard,
      setpin,getTopUpCommissions,
      getNewCardDetails,
      fetchFaqs,
      getApplicationInfo,
      fetchFeeInfo,
      saveApplyCard,
      myCardsCoinLu,
      getMyCradsAvailableBalance,
      getAssetInCards,
      getNetworkLuCrads,
      quickLinkpost,
      getQuickLinkApplicationInfo,
      getQuickLinkKYCInfo,
      getQuickLinkKYCSave,
      KyckybUpdateDetails,
      saveNewAddressDetails,
      editAddressSave,
      getCardStatus,
      fetchDepositDetails,
      getKycSampleUrls,
      updateApplyCardKycrequirement,
      getVerificationFields,
      getAddresses,
      getAllMyCardDetails,
      fetchPhysicalCards,
      getAdvertisementDetails,
      getDashboardAllCardDetails,
      getAddCardDetails,
      addCardToMember,
      fetchBeneficiariesLu,
      fetchBeneficiaryTypeLu,
      fetchUboDetailsInfo,
      getAssignCardsData,
      getAddressLU,
      getCardViewData
    }
