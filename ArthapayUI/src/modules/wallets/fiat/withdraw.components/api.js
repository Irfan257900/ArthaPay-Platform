import { apiClient } from '../../httpClients';
import { appClientMethods } from '../../../../core/http.clients';
import { ApiControllers } from './config';
const environment = process.env.REACT_APP_WALLET_TYPE;
const appName = process.env.REACT_APP_NAME;

const getWithdrawCustomerBanks=(walletcode)=>{
    return apiClient.get(ApiControllers.exchangewallet+`Exchange/WithdrawFiat/CustomerBanks/${walletcode}`);
}
const getPayeeLu = (currency,customerId) => {
    return apiClient.get(
        ApiControllers.exchangewallet + `Exchange/PayeeLu/${currency}`
    );
};

const confirmTransaction = (obj) => {
    return apiClient.post(ApiControllers.exchangewallet + `Exchange/Withdraw/Fiat/Summary`, obj);
}

const confirmCryptoTransaction = (obj) => {
    return apiClient.post(ApiControllers.exchangewallet + `Crypto/Confirm`, obj);
}

const getFiatSummarySave = (obj) =>{
    return appClientMethods.post(`withdraw/fiat`,obj)
}
const getCode = (isResendOTP) => {
	return apiClient.get(
		ApiControllers.security +`SendOTP/${isResendOTP}`
	);
};
const getVerification = (code) => {
	return apiClient.get(
		ApiControllers.security + `/OTPVerification/${code}`
	);
};

 
const getPayeeCryptoLu = (currency,network) => {
    let url=`PayeeCryptoLU/${currency}/${network}`
    url= environment !== 'non_custodial' ? `${url}/${appName}`:`${url}`
    if (environment === 'non_custodial') {
        return web3Client.get(ApiControllers.common + url)
    } else {
        return apiClient.get(ApiControllers.common + url)
    }
};
const saveCryptoWithdraw = (obj) => {
    return apiClient.post(`ExchangeTransaction/ExchangeWithdraw/Crypto`, obj);
}

const getWithdrawmemberCrypto = (customerId) => {
    let url=`Exchange/WithdrawCryptoWallets/${customerId}`
    url= environment !== 'non_custodial' ? `${url}/${appName}`:`${url}`
    if (environment === 'non_custodial') {
        return web3Client.get(ApiControllers.exchangewallet + url)
    } else {
        return apiClient.get(ApiControllers.exchangewallet + url)
    }
}
const getNetworkLu = (walletcode,customerId) => {
    return apiClient.get(ApiControllers.common + `Wallets/NetWorkLU/${walletcode}/${customerId}`);
}
const amtVerification=(currency,amount,bankId)=>{
    return apiClient.get(ApiControllers.exchangeTransaction + `Verifications/${bankId}/${currency}/${amount}`)
}
const cryptoAmtVerification=(currency,amount,networkId,network)=>{
    return apiClient.get(ApiControllers.exchangeTransaction + `Verifications/${currency}/${amount}/${networkId}/${network}`)
}
const getVerificationFields = () => {
	return apiClient.get(
		ApiControllers.security + `Verificationfields`
	);
};
const getFiatCoins = (id) => {
	let url=`Exchange/FiatWallets/${id}`
    return apiClient.get(ApiControllers.exchangewallet + url);
}
//ExchangeTransaction/Verifications/50410c93-82c4-4455-b828-eec7faee4b3f/73110080-6363-46bd-9c9b-812e23c2f91d/CHF/34
const faitAmtVerification=(bankId,currency,amount)=>{
    return apiClient.get(ApiControllers.exchangeTransaction + `Verifications/${bankId}/${currency}/${amount}`)
}
const requestTwoFactorAuthUrl=(reqObj)=>{
    return appClientMethods.post(`TwoFactorAuthenticationURL`,reqObj,'api/');
}

const handleTwoFactorAuthCallback=(code, state)=>{
    // Ensure proper authorization headers are included
    const payload = {code, state};
    return appClientMethods.post(`TwoFactorAuthenticationCodeState`, payload, 'api/');
}
export { getPayeeLu, confirmTransaction,getFiatSummarySave,
          getCode,getVerification,getWithdrawmemberCrypto,getPayeeCryptoLu,confirmCryptoTransaction,saveCryptoWithdraw,getWithdrawCustomerBanks,getNetworkLu,
          amtVerification,cryptoAmtVerification,getVerificationFields,getFiatCoins,faitAmtVerification,requestTwoFactorAuthUrl,handleTwoFactorAuthCallback};