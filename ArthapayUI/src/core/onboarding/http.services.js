import moment from "moment";
import { ipStackClientMethods } from "../httpClients"
import { appClientMethods as coreClientMethods } from "../http.clients"
import AppDefaults from "../../utils/app.config";
import { encryptAES, secureData } from "../shared/encrypt.decrypt";
const ipstackAccessKey = window.runtimeConfig.VITE_IPSTACK_ACCESS_KEY
// ---------------------- Account Type -------------------------
 
// Function to get IP info
const getIPInfo = async () => {
    try {
        const response = await ipStackClientMethods.get(`check?access_key=${ipstackAccessKey}`);
        return { status: 'fulfilled', value: response };
    } catch (error) {
        return { status: 'rejected', reason: error };
    }
};
 
// Function to get core registration info
const getRegistrationLookup = async () => {
    try {
        const response = await coreClientMethods.get(`registration/lookup`);
        return { status: 'fulfilled', value: response };
    } catch (error) {
        return { status: 'rejected', reason: error };
    }
};
 
// Main function that returns array result
export const getAccountSectionData = async (onSuccess, onError) => {
    try {
        const [ipResponse, coreResponse] = await Promise.all([
            getIPInfo(),
            getRegistrationLookup()
        ]);
 
        const resultArray = [
            ipResponse.status === 'fulfilled' ? ipResponse.value : null,
            coreResponse.status === 'fulfilled' ? coreResponse.value : null,
            ipResponse.status === 'rejected' ? ipResponse.reason : null,
            coreResponse.status === 'rejected' ? coreResponse.reason : null,
        ];
 
        onSuccess(resultArray);
    } catch (error) {
        onError(error.message);
    }
};
 
 
export const saveCustomerAccountType = async (onSuccess, setError, params) => {
    try {
        const { values, userProfile, accountType, referralData: { id: referralId } } = params
        setError('')
        const { phoneNo, phoneCode, country, isAccepted, ...otherInfo } = values
        const userDetails = accountType === 'Business' ? {
            businessName: otherInfo?.businessName,
            incorporationDate: moment(otherInfo.incorporationDate).startOf('day').format(AppDefaults.formats.apiDateFormat)
        } : {
            firstName: otherInfo?.firstName || userProfile?.firstName || null,
            lastName: otherInfo?.lastName || userProfile?.lastName || null,
            gender: otherInfo?.gender || null
        }
        const encryptedFields = secureData({
            data: { phoneCode, phoneNo },
            keysToSecure: ['phoneCode', 'phoneNo']
        })
        const requestPayload = { ...userDetails, country, isAccepted, referralId, ...encryptedFields }
        const url = accountType === 'Business' ? `customers/register/business` : `customers/register/personal`
        const response = await coreClientMethods.post(url, requestPayload);
        onSuccess(response)
    } catch (error) {
        setError(error.message)
    }
}
 
export const validateReferral = async (onSuccess, onError, { referralCode }) => {
    try {
        const response = await coreClientMethods.post(`referrals/verify`, { code: encryptAES(referralCode) })
        return onSuccess(response)
    } catch (error) {
        return onError(error.message)
    }
}
 
 
export async function uploadDataListPoints(setUploadDataList, setLoader, setError) {
    setLoader(true)
    try {
        const response = [
            { id: "1", list: "Document confirming the company's legal existence (e.g.,the certificate of incorporation or a recent excerpt from a state company registry)" },
            { id: "2", list: " Document identifying the company's beneficial owners." }
        ]
        // const response= await appClientMethods.get()
        setUploadDataList(response)
    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false)
    }
}
// ------------------ Phone Verification ------------------
 
export const sendPhoneOTP = async (onSuccess, onError, type, loader) => {
    try {
        const response = await coreClientMethods.post(`confirmations/phone/${type}`)
        onSuccess(response)
    } catch (error) {
        onError(error.message, error)
    } finally {
        loader(false)
    }
}
 
export const verifyPhoneOTP = async (onSuccess, onError, code) => {
    try {
        const response = await coreClientMethods.post(`confirmations/phone/verify`, { code })
        onSuccess(response)
    } catch (error) {
        onError(error.message)
    }
}
// ------------------ Email Verification ------------------
 
export const resendVerificationMail = async (onSuccess, onError) => {
    try {
        const response = await coreClientMethods.post(`verifications/email/resend`)
        onSuccess(response)
    } catch (error) {
        onError(error.message)
    }
}
//address
export const getCountry = async (setLoader, setErrorMessage, setCountryLu) => {
    setLoader(true);
    try {
        const response = await coreClientMethods.get(`addresses/lookup`);
        setCountryLu(response?.countryWithTowns);
    } catch (error) {
        setErrorMessage(error.message);
    } finally {
        setLoader(false);
    }
}
 
const getFileNameFromUrl = (url) => {
    const parsedUrl = new URL(url);
    return parsedUrl?.pathname?.split("/").pop();
};
const createFileList = (doc) => {
    return doc?.url
        ? [
            {
                name: getFileNameFromUrl(doc.url),
                status: "done",
                id: doc.id,
                url: doc.url,
                docType: doc.docType,
                recorder: doc.recorder,
            },
        ]
        : [];
};
export const getFormattedDate = (date) => {
    return date && moment(date).isValid() ? moment(date) : null;
};
export const extractDocuments = (kybDocs = []) => {
    const firstDoc = kybDocs?.find((doc) => doc.recorder === 1);
    const secondDoc = kybDocs?.find((doc) => doc.recorder === 2);
    const thirdDoc = kybDocs?.find((doc) => doc.recorder === 3);
    const fourthDoc=kybDocs?.find((doc) => doc.recorder === 4);
    const fifthDoc=kybDocs?.find((doc) => doc.recorder === 5);
 
 
    return {
        fileLists: {
            firstDocument: createFileList(firstDoc),
            secondDocument: createFileList(secondDoc),
            thirdDocument: createFileList(thirdDoc),
            fourthDocument: createFileList(fourthDoc),
            fifthDocument: createFileList(fifthDoc),
 
        },
        previewImages: {
            firstDocument: firstDoc?.url || null,
            secondDocument: secondDoc?.url || null,
            thirdDocument: thirdDoc?.url || null,
            fourthDocument: fourthDoc?.url || null,
            fifthDocument: fifthDoc?.url || null,
        },
    };
};
 
export const documentTypeLabels = {
  DIRECTORS_REGISTRY: 'Directors Registry',
  SHAREHOLDER_REGISTRY: 'Shareholder Registry',
  INCUMBENCY_CERT: 'Incumbency Certificate',
  INCORPORATION_ARTICLES: 'Incorporation Articles',
  STATE_REGISTRY: 'State Registry',
};
 
export const formatDate = (date) => {
    return date ? moment(date).format("DD/MM/YYYY") : "--";
};
export const renderField = (label, value, formatter, className) => {
    if (!value) return null;
    return (
        <div>
            <label className="mb-0 text-paraColor text-sm font-medium">{label}</label>
            <p className={`mb-0 text-subTextColor text-sm font-semibold ${className}`}>
                {formatter ? formatter(value) : value || "--"}
            </p>
        </div>
    );
};
 
// ----------------------------------- KYC ---------------------------------------
 
export const fetchExemptFields = async (setExemtedFields) => {
    try {
        const response = await coreClientMethods.get(`kyc/kycexempt`);
        setExemtedFields(response)
    } catch (error) {
        console.log(error.message);
    }
}
 
export async function fetchKycBasicInformation(setLoader, onSuccess, setError) {
    setLoader(true); setError(null);
    try {
        const { addressDetails, ...details } = await coreClientMethods.get(`kyc`);
        const address = secureData({
            type: 'decrypt',
            data: addressDetails,
            keysToSecure: ['phoneCode', 'email', 'phoneNumber', 'postalCode']
        })
        onSuccess({ ...details, docNumber: secureData({ type: 'decrypt', data: details.docNumber }), addressDetails: address })
    } catch (error) {
        setError(error.message);
    } finally {
        setLoader(false);
    }
 
}
 
export async function sendKYCInformation(setLoader, onSuccess, setError, { values, userProfileInfo, method, details }) {
    setError(null); setLoader(true);
    const dob = values.dob ? moment(values.dob).format("YYYY-MM-DD") : null;
    const documentExpiryDate = values.docExpireDate ? moment(values.docExpireDate).format("YYYY-MM-DD") : null
    try {
        const addressDetails = secureData({
            keysToSecure: ['postalCode', 'phoneNumber', 'phoneCode', 'email'],
            data: {
                "id": details?.id || "00000000-0000-0000-0000-000000000000",
                "state": values?.state,
                "firstName": values?.addressFirstName,
                "lastName": values?.addressLastName,
                "city": values?.city,
                "line1": values?.line1,
                "line2": values?.line2,
                "postalCode": values?.postalCode,
                "phoneNumber": values?.phoneNumber,
                "phoneCode": values?.phoneCode,
                "email": values?.email,
                "town": values?.town,
                "createdBy": userProfileInfo?.name,
                "country": values?.country,
                "createdDate": new Date()
            }
        })
        const obj = {
            "firstName": values?.firstName,
            "lastName": values?.lastName,
            "gender": values?.gender,
            "dob": dob,
            "docExpireDate": documentExpiryDate,
            "docNumber": secureData({
                data: values?.docNumber
            }),
            "idIssuingCountry": values?.idIssuingCountry,
            "id": details?.id || "00000000-0000-0000-0000-000000000000",
            // addressDetails
        }
        const response = !method ? await coreClientMethods.post(`kyc`, obj) : await coreClientMethods.put(`kyc`, obj);
        onSuccess(response);
    } catch (error) {
        setError(error.message)
    } finally {
        setLoader(false);
    }
 
}
 
 
 
export async function fetchKycDocDetails(setLoader, onSuccess, setError) {
    setLoader(true);
    setError(null);
    try {
        const response = await coreClientMethods.get(`kyc/documents`);
        if (response) {
            onSuccess(response);
        } else {
            onSuccess(response);
        }
    } catch (error) {
        setError(error.message || "Failed to fetch KYC documents");
    } finally {
        setLoader(false);
    }
}
 
 
export async function sendKYCDocumentInformation(setLoader, onSuccess, setError, { values, method, docData }) {
    setError(null);
    setLoader(true);
    try {
        const response = !method
            ? await coreClientMethods.post(`kyc/documents`, values.documents)
            : await coreClientMethods.put(`kyc/documents`, values.documents);
        onSuccess(response);
 
    } catch (error) {
        setError(error.message)
    } finally {
        setLoader(false);
    }
}
 
export async function fetchKycReviewInfo(setLoader, setData, setError) {
    setLoader(true); setError(null);
    try {
        const response = await coreClientMethods.get(`kyc/details`);
        const address = response.customerKycDetails?.addressDetails
        const addressDetails = secureData({
            keysToSecure: ['phoneCode', 'email', 'phoneNumber', 'postalCode'],
            data: address,
            type: 'decrypt'
        })
        const kycDocInfo = secureData({
            keysToSecure: ['documentType'],
            data: response,
            type: 'decrypt'
        })
 
        setData({ customerKycDetails: { ...response.customerKycDetails, docNumber: secureData({ data: response.customerKycDetails?.docNumber, type: 'decrypt' }), addressDetails }, kycDocInfo })
    } catch (error) {
        setError(error.message);
    } finally {
        setLoader(false);
    }
}
 
export async function submitKycDetails(setLoader, onSuccess, setError, { userProfileInfo }) {
    setError(null); setLoader(true);
    const obj = {
        "customerId": userProfileInfo?.id,
        "isKycComplete": true
    }
    try {
        const response = await coreClientMethods.put(`kyc/state`, obj);
        onSuccess(response);
    } catch (error) {
        setError(error.message)
    } finally {
        setLoader(false);
    }
 
}
 
 
// ----------------------------------- KYB ---------------------------------------
export async function sendUBODetails(setLoader, onSuccess, setError, { details, method }) {
    setError(null); setLoader(true);
    try {
        if (!method) {
            const response = await coreClientMethods.post(`kyb/ubos`, details);
            onSuccess(response);
        }
        else {
            const response = await coreClientMethods.put(`kyb/ubos`, details);
            onSuccess(response);
        }
 
    } catch (error) {
        setError(error.message)
    } finally {
        setLoader(false);
    }
}

export async function sendShareHolderDetails(setLoader, onSuccess, setError, { details, method }) {
    setError(null); setLoader(true);
    try {
        if (!method) {
            const response = await coreClientMethods.post(`kyb/shareholder`, details);
            onSuccess(response);
        }
        else {
            const response = await coreClientMethods.put(`kyb/shareholder`, details);
            onSuccess(response);
        }
 
    } catch (error) {
        setError(error.message)
    } finally {
        setLoader(false);
    }
}

export async function sendRepresentiveDetails(setLoader, onSuccess, setError, { details, method }) {
    setError(null); setLoader(true);
    try {
        if (!method) {
            const response = await coreClientMethods.post(`kyb/representative`, details);
            onSuccess(response);
        }
        else {
            const response = await coreClientMethods.put(`kyb/representative`, details);
            onSuccess(response);
        }
 
    } catch (error) {
        setError(error.message)
    } finally {
        setLoader(false);
    }
}
export async function sendDirectorDetails(setLoader, onSuccess, setError, { details, method }) {
    setError(null); setLoader(true);
    try {
        if (!method) {
            const response = await coreClientMethods.post(`kyb/directors`, details);
            onSuccess(response);
        }
        else {
            const response = await coreClientMethods.put(`kyb/directors`, details);
            onSuccess(response);
        }
 
    } catch (error) {
        setError(error.message)
    } finally {
        setLoader(false);
    }
}
export async function sendKYBDocumentInformation(setLoader, onSuccess, setError, { values, userProfileInfo, id, documents, method }) {
    setError(null); setLoader(true);
    const dateOfRegistration = moment(values.dateOfRegistration).format("YYYY-MM-DD");
    const details = secureData({
        data: {
            "id": id,
            "companyName": values?.companyName,
            "country": values?.companyCountry,
            "registrationNumber": values?.registrationNumber,
            "documents": documents,
            "dateOfRegistration": dateOfRegistration,
        },
        keysToSecure: ['registrationNumber']
    })
    const addressDetails = secureData({
        data: {
            "firstName": values?.addressFirstName,
            "lastName": values?.addressLastName,
            "state": values?.state,
            "city": values?.city,
            "line1": values?.line1,
            "line2": values?.line2,
            "postalCode": values?.postalCode,
            "phoneNumber": values?.phoneNumber,
            "phoneCode": values?.phoneCode,
            "email": values?.email,
            "town": values?.town,
            "isDefault": true,
            "createdBy": userProfileInfo?.name,
            "country": values?.country,
            "createdDate": new Date()
        }, keysToSecure: ['postalCode', 'email', 'phoneNumber', 'phoneCode']
    })
    try {
        if (!method) {
            const response = await coreClientMethods.post(`kyb`, { ...details });
            onSuccess(response);
        } else {
            const response = await coreClientMethods.put(`kyb/company`, { ...details });
            onSuccess(response);
        }
    } catch (error) {
        setError(error.message)
    } finally {
        setLoader(false);
    }
}
export async function getUboDetails(setLoader, setData, setError, { id }) {
    setLoader(true); setError(null);
    try {
        const response = await coreClientMethods.get(`kyb/ubos/${id}`);
        setData(response)
    } catch (error) {
        setError(error.message);
    } finally {
        setLoader(false);
    }
}
export async function getCompanyUboDetails(setLoader, setData, setError) {
    setLoader(true); setError(null);
    try {
        const response = await coreClientMethods.get(`kyb/ubos`);
        setData(response)
    } catch (error) {
        setError(error.message);
    } finally {
        setLoader(false);
    }
}
export async function getDirectorDetails(setLoader, setData, setError) {
    setLoader(true); setError(null);
    try {
        const response = await coreClientMethods.get(`kyb/directors`);
        setData(response)
    } catch (error) {
        setError(error.message);
    } finally {
        setLoader(false);
    }
}
export async function getKybDetails(setLoader, setData, setError) {
    setLoader(true); setError(null);
    try {
        const response = await coreClientMethods.get(`kyb`);
        const { addressDetails, ...details } = response || {};
        const address = secureData({
            type: 'decrypt',
            data: addressDetails,
            keysToSecure: ['phoneCode', 'email', 'phoneNumber', 'postalCode']
        })
        setData({ ...details, registrationNumber: secureData({ type: 'decrypt', data: details.registrationNumber }), addressDetails: address })
    }
    catch (error) {
        setError(error.message);
    } finally {
        setLoader(false);
    }
}
export async function getCompanyDetails(setLoader, setData, setError) {
    setLoader(true); setError(null);
    try {
        const response = await coreClientMethods.get(`kyb/company`);
        const { businessCustomerDetails, ...otherInfo } = response || {}
        const addressDetails = secureData({
            type: 'decrypt',
            data: businessCustomerDetails?.addressDetails,
            keysToSecure: ['phoneCode', 'email', 'phoneNumber', 'postalCode']
        })
        setData({ ...otherInfo, businessCustomerDetails: { ...businessCustomerDetails, addressDetails, registrationNumber: secureData({ type: 'decrypt', data: businessCustomerDetails?.registrationNumber }) } })
    } catch (error) {
        setError(error.message);
    } finally {
        setLoader(false);
    }
}
 
 
export async function updateKYBInformation(setLoader, onSuccess, setError, { userProfileInfo }) {
    setError(null); setLoader(true);
    const requestPayload = {
        "customerId": userProfileInfo?.id,
        "isKycComplete": true
    }
    try {
        const response = await coreClientMethods.put(`kyc/state`, requestPayload);
        onSuccess(response);
    } catch (error) {
        setError(error.message)
    } finally {
        setLoader(false);
    }
 
}