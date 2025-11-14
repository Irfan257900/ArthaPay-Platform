
import { appClientMethods } from "../http.clients";
import { encryptAES } from "../shared/encrypt.decrypt";
const getCode = async(isResendOTP) => {
	try {
        const response = await appClientMethods.post(`confirmations/phone/send`)
        return {data :response,error:null}
    }
    catch (error) {
        return {error:error.message,data:null}
    }
};

const getVerification = (encryptedCode) => {
    const code = encryptAES(encryptedCode)
	return appClientMethods.post(`confirmations/phone/verify`,{ code });
};
const sendEmail = async(isResendOTP) => {
	try {
        const response = await appClientMethods.post(`confirmations/email/send`);
        return {data :response,error:null}
    }
    catch (error) {
        return {error:error.message,data:null}
    }
};

const verifyEmailCode = async (encryptedCode) => {
    try {
        const code = encryptAES(encryptedCode);
        const response = await appClientMethods.post(`confirmations/email/verify`, { code });
        return { data: response, error: null };
    } catch (error) {
        return { error: error.message, data: null };
    }
};

const getAuthenticator = async (Code, sk) => {
    try {        
        const encryptedCode = encryptAES(Code);
        const response = await appClientMethods.put(`VerifyGoogleAuthenticator`,{code:encryptedCode});
        return { data: response, error: null }
    }
    catch (error) {
        return { error: error.message, data: null }
    }
};
const getVerificationFields = async() => {
	try {
        const response = await appClientMethods.get(`security/settings`)
        return {data :response,error:null}
    }
    catch (error) {
        return {error:error.message,data:null}
    }
};

export {getCode,getVerification,sendEmail,verifyEmailCode,getAuthenticator,getVerificationFields}
