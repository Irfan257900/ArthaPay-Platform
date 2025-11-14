import { ApiControllers } from "../../api/config"
import { appClientMethods } from "../../core/http.clients"
import { encryptAES } from "../../core/shared/encrypt.decrypt";
import { lookupFor } from "./service";
import AppDefaults from "../../utils/app.config";
const {
    dashboard: dashboardController,
    exchangewallet,
    kyc
} = ApiControllers
const appName = window.runtimeConfig.VITE_NAME;
export const Enable = async (objectToSave, addtionalParams, id) => {
    const { successCallback, errorCallback, setLoading } = addtionalParams;
    setLoading(true);
    try {
        await appClientMethods.put(`payees/${id}/enable`, objectToSave);
        successCallback();
    } catch (error) {
        errorCallback(error.message);
    } finally {
        setLoading(false);
    }
};
export const Disable = async (objectToSave, addtionalParams, id) => {
    const { successCallback, errorCallback, setLoading } = addtionalParams;
    setLoading(true);
    try {
        await appClientMethods.put(`payees/${id}/disable`, objectToSave);
        successCallback();
    } catch (error) {
        errorCallback(error.message);
    } finally {
        setLoading(false);
    }
};


export const getPayees = async (type, pageNo, pageSize, search) => {
    return await appClientMethods.get(`payees/wallets/${type}?page=${pageNo}&pageSize=${pageSize}&search=${search}`);
}

export const fetchPayeeInfo = async ({ type, id, mode }) => {
    if (mode === "view" && type === "fiat") {
        return await appClientMethods.get(`payees/${type}/${id}/${mode}`);
    } else {
        return await appClientMethods.get(`payees/${type}/${id}`);
    }
};

export const getFiatCurrencies = async () => {
    try {
        return await appClientMethods.get(`payees/lookup`);
    } catch (error) {
        throw new Error(error.message)
    }
};

export const CurrencyLookup = async () => {
    try {
        const response = await appClientMethods.get(`payee/currencywithcountries`);
        return response || [];
    } catch (error) {
        throw new Error(error.message);
    }
}

export const fetchBankLookup = async (type) => {
    try {
        const response = await appClientMethods.get(`payees/providerbanks?country=${type}`);
        return response || [];
    } catch (error) {
        throw new Error(error.message);
    }
};
export const fetchBranchCodeLookup = async (bankName) => {
    try {
        const response = await appClientMethods.get(`payees/branches?bankname=${bankName}`);
        return response || [];
    } catch (error) {
        throw new Error(error.message);
    }
};




export async function paymetsDashoardKpis(setData, id) {
    try {
        const response = await appClientMethods.get(`payees/Kpis`)
        setData(response)
    } catch (error) {
        setError(error?.message)
    }
}
export async function getKycSampleUrls(setData) {
    try {
        const response = await appClientMethods.get(`payees/customers/kyc`)
        setData(response)
    } catch (error) {
        setError(error?.message)
    }
}
export async function GetAdvertisements(setData, urlParams) {
    const { screenName } = urlParams
    try {
        const response = await appClientMethods.get(`${dashboardController}GetAdvertisements/${screenName}`)
        setData(response)
    } catch (error) {
        setError(error?.message)
    }
}
export async function getIBANAccountDetails(setState, urlParams, setError) {
    const { ibanNo } = urlParams
    setState({ type: 'setBankDetailsLoader', payload: true });
    try {
        const response = await appClientMethods.get(`iban/${ibanNo}/validate`)
        setState({ type: 'setBankDetails', payload: response });
    } catch (error) {
        setError(error?.message)
    } finally {
        setState({ type: 'setBankDetailsLoader', payload: false });
    }
}

export async function getpayeeDashoardKpis(setData) {
    try {
        const response = await appClientMethods.get(`Payees/kpis`)
        setData(response)
    } catch (error) {
    }
}

export const getPaymentFields = async (type) => {
    const response = await appClientMethods.get(`paymenttypes?currency=${type}`);
    return response?.[type?.trim()]
}


const getFiatSaveObject = (values, customer, isBaas, bankDetails,trackAuditLogData, lookups, customerInfo,IsOnTheGo) => {
    const { paymentFields, email, ...remainingValues } = values;
 
    const loginAccountType = customerInfo?.accountType?.toLowerCase() ==='personal';
    const businessLookup = lookups?.businessLookup;
    const individualLookup = lookups?.individualLookup;
    let relationCode = '';
    if (values?.relation) {
        const targetLookup = loginAccountType ? individualLookup : businessLookup;

        const match = targetLookup?.find(
            item => item?.name?.toLowerCase() === values.relation?.toLowerCase()
        );

        relationCode = match?.code || '';
    }

    return {
        id: values.id || AppDefaults.GUID_ID,
        firstName: encryptAES(values?.firstName, customer?.clientSecretKey),
        lastName: encryptAES(values?.lastName, customer?.clientSecretKey),
        email: encryptAES(email, customer?.clientSecretKey),
        favouriteName: values?.favouriteName,
        phoneCode: encryptAES(values?.phoneCode, customer?.clientSecretKey),
        phoneNumber: encryptAES(values?.phoneNumber, customer?.clientSecretKey),
        currency: values?.currency,
        country: values?.country,
        state: values?.state,
        city: values?.city,
        line1: values?.line1,
        paymentFields: values?.paymentFields || {},
        postalCode: encryptAES(values?.postalCode, customer?.clientSecretKey),
        paymentInfo: values.paymentInfo || {},
        paymentType: values?.paymentType,
        createdBy: values?.createdBy || customer?.name,
        modifiedBy: customer?.name,
        documentNumber: encryptAES(values?.documentNumber, customer?.clientSecretKey),
        birthDate: values?.birthDate?.format('YYYY-MM-DD') || null,
        whiteListState: values.whiteListState || "Submitted",
        whiteListRemarks: values?.whiteListRemarks || null,
        status: "Active",
        accountType: values?.accountTypeDetails || '',
        bankBranch: bankDetails?.branch || "",
        metadata: JSON.stringify(trackAuditLogData),
        IsOnTheGo: IsOnTheGo,
        stableCoinPayout: isBaas,
        ...(isBaas && {
            documentType: values?.documentType,
            frontImage: values?.frontImage,
            backImage: values?.backImage,
        }),
        addressType: values?.addressTypeDetails ||'',
        relation: values?.relation || '',
        businessType: values?.businessType || '',
        businessRegistrationNo: values?.businessRegistrationNo || '',
        relationCode: relationCode||'',
        businessName: values?.businessName,
        ...(values?.paymentInfo),
    }
}
export const handleFiatPayeeSave = async (values, additionalArgs) => {
    const { customer, mode, isBaas, bankDetails,trackAuditLogData, lookups, customerInfo,IsOnTheGo, isadd } = additionalArgs;
    try {
        if (values?.paymentInfo) {
            delete values?.paymentInfo["undefined"];
        }
        const saveObject = getFiatSaveObject(values, customer, isBaas, bankDetails, trackAuditLogData, lookups, customerInfo, IsOnTheGo);
        return (mode === "add" || isadd === "add")
            ? await appClientMethods.post(`Payees/Fiat`, saveObject)
            : await appClientMethods.put(`Payees/Fiat`, saveObject)
    } catch (error) {
        throw new Error(error.message);
    }
};

export const getCountries = async () => {
    try {
        const response = await appClientMethods.get(`States`);
        return response ? JSON.parse(response) : [];
    } catch (error) {
        throw new Error(error.message);
    }
};


export const getFiatPayeesLu = async (type) => {
    const lookupKey = lookupFor[type]
    try {
        const response = await appClientMethods.get(`DashBoard/PayeesLu/${lookupKey}`);
        return response?.data?.[lookupKey] || response?.data;
    } catch (error) {
        throw new Error(error.message);
    }
};


export const getStates = (country, countries) => {
    const selectedCountry = countries.find(item => item.name === country);
    return selectedCountry?.details
};
export const fetchBankInfo = async (value, addtionalParams) => {
    const { successCallback, errorCallback, setLoading } = addtionalParams;
    setLoading(true);
    try {
        const response = await appClientMethods.get(`ExchangeWallet/GetIBANAccountDetails?ibanNumber=${value}`);
        if (response) {
            successCallback(response);
        } else {
            errorCallback(deriveErrorMessage(response));
        }
    } catch (error) {
        errorCallback(error.message);
    } finally {
        setLoading(false);
    }
};

//Crypto payees
export const fetchCryptoCoins = async () => {
    try {
        return await appClientMethods.get(`Common/Coins`);
    } catch (error) {
        throw new Error(error.message)
    }
}

export const fetchWalletSources = async (addressType) => {
    try {
        const response = await appClientMethods.get(`wallets/sources/${addressType}`);
        return response?.["FirstParty-WalletSources"] || []
    } catch (error) {
        throw new Error(error.message)
    }
}

export const fetchNetworksOf = async (token) => {
    try {
        const response = await appClientMethods.get(`Common/Wallets/NetworkLu/${token}`);
        if (response) {
            return response
        }
        throw new Error(deriveErrorMessage(response))
    } catch (error) {
        throw new Error(error.message)
    }
}

export const getSatoshiDetails = async (network, address) => {
    try {
        return await appClientMethods.get(`payees/deposit/sathositest/` + `${network}/${address}`);
    } catch (error) {
        throw new Error(error.message)
    }
}

export const handleCryptoPayeeSave = async (values, satoshiDetails, customer, mode, trackAuditLogData,IsOnTheGo) => {
    try {
        const requestPayload = {
            "id": values.id || AppDefaults.GUID_ID,
            "favouriteName": values?.favouriteName,
            "currency": values.currency,
            "network": values?.network,
            "createddate": new Date().toISOString(),
            "userCreated": customer?.name,
            "modifiedDate": new Date().toISOString(),
            "modifiedBy": customer?.name,
            "status": 1,
            "adressstate": "fd",
            "currencyType": "Crypto",
            "walletType": values?.selfHosted,
            "walletAddress": values?.walletaddress,
            "addressType": values?.addressType,
            "customerId": customer?.id,
            "walletSource": values.walletSource,
            "otherWallet": values.otherWallet || '',
            "createdBy": customer?.name,
            "AnalyticsId": values?.iframId,
            "proofType": values?.walletSource || '',
            "amount": satoshiDetails?.amount || null,
            "appName": appName,
            "whiteListState": values?.whiteListState || "",
            "metadata": JSON.stringify(trackAuditLogData),
            "IsOnTheGo": IsOnTheGo,

        }
        const method = mode === 'edit' ? 'put' : 'post'
        return await appClientMethods[method](`Payees/Crypto`, requestPayload);
    } catch (error) {
        throw new Error(error.message)
    }
}

export const handleSelfSignatureSubmission = async (values, customer, details) => {
    try {
        const requestPayload = {
            "customerId": customer?.id,
            "walletAddress": values?.walletaddress,
            "network": values?.network,
            "coin": values?.currency,
            "message": values?.iframId,
            'hash': values?.hash,
            "iframId": values?.iframId,
            "proofType": 'Self',
            "payeeId": values?.payeeAccountId,
            "transactionDate": new Date().toISOString().split('.')[0],
            "createdBy": customer?.name,
            "PayeeId": details?.payeeAccountId
        };
        const response = await appClientMethods.post(`payees/deposit/selfsigned`, requestPayload);;
        if (response) {
            return response
        }
        throw new Error(deriveErrorMessage(response))
    } catch (error) {
        throw new Error(error.message)
    }
}
export const handleSatoshiTestSubmission = async (values, customer) => {
    const { formData, satoshiDetails } = values
    try {
        const requestPayload = {
            coin: formData?.currency,
            amount: satoshiDetails?.amount,
            customerId: customer?.id,
            iframId: formData?.iframId,
            network: satoshiDetails?.asset,
            proofType: "Satoshi Test",
            status: "Pending",
            transactionDate: new Date().toISOString(),
            hash: values?.transactionId,
            walletAddress: formData?.walletaddress,
            payeeId: formData?.payeeAccountId,
            createdBy: customer?.name
        }
        return await appClientMethods.post(`payees/deposit/sathositest`, requestPayload);
    } catch (error) {
        throw new Error(error.message)
    }
}


export const payeesFields = async (accountType, setdata) => {
    try {
        const response = await appClientMethods.get(`payees/payments?name=${accountType}`);
        setdata(response?.[accountType])
        return response?.[accountType]
    } catch (error) {
        throw new Error(error.message)
    }
}
export const FetchProfileDetails = async (AccountTypes) => {
    try {
        const response = await appClientMethods.get(`customers/profile/${AccountTypes.toLowerCase()}`);
        return response || [];
    } catch (error) {
        throw new Error(error.message);
    }
}