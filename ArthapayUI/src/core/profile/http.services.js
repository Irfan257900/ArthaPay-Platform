
import { appClientMethods, apiClient, currentApiVersion, loyaltyAppClientMethods } from "../http.clients";
import { ApiControllers } from "../../api/config";
import { notification } from "antd";
import AppDefaults from "../../utils/app.config";
const WalletType = window.runtimeConfig.VITE_WALLET_TYPE
const baseURL = WalletType === 'non_custodial' ? window.runtimeConfig.VITE_WEB3_API_END_POINT:window.runtimeConfig.VITE_CORE_API_END_POINT

export const UploadProfileSave = async (formData, setUploadProfile, setState) => {
    setState((prevState) => ({ ...prevState, Loader: true, errorMessage: null }));
    try {
        const res = await apiClient.post(
            `/${currentApiVersion}uploadprofile`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        setUploadProfile(res);
    } catch (error) {
        setState((prevState) => ({
            ...prevState,
            Loader: false,
            errorMessage: error.message,
        }));
    } finally {
        setState((prevState) => ({ ...prevState, Loader: false }));
    }
};










export const verificationsFields = async (setLoader, setErrorMsg, setVerificationFields) => {
    setLoader(true);
    try {
        const res = await appClientMethods.get(`security/settings`);
        setVerificationFields(res);
    } catch (error) {
        setErrorMsg(error.message);
    } finally {
        setLoader(false);
    }
};

export const resetPasswordSave = async (setIsResetPassword, setResetPassword, setErrorMsg) => {
    setIsResetPassword(true);
    try {
         await appClientMethods.post(`${ApiControllers.security}/password/reset`);
        setResetPassword(true);
    } catch (error) {
        setErrorMsg(error.message);
        setResetPassword(false);
    } finally {
        setIsResetPassword(false);
    }
};
export const saveVerification = async (saveObject, setBtnLoader, setSaveDetails, setErrorMsg) => {
    setBtnLoader(true);
    try {
        const response = await appClientMethods.put(`security/settings`, saveObject);
        setSaveDetails(response, saveObject);
    } catch (error) {
        setErrorMsg(error.message);
    } finally {
        setBtnLoader(false);
    }
}


export const getTwoFactor = async (setTwoFactor, setErrorMsg, setLoader) => {
    setLoader(true);
    try {
        const response = await appClientMethods.put(
            `settings/2fa/google/enable`, {} );
        setTwoFactor(response);
    } catch (error) {
        setErrorMsg(error.message);
    } finally {
        setLoader(false);
    }
}

export const getCountry = async (setErrorMessage, setCountryLu) => {

    try {
        const response = await appClientMethods.get(`addresses/lookup`);
        setCountryLu(response);
    } catch (error) {
        setErrorMessage(error.message);
    }
}

export const getAddressType = async (setErrorMessage, setTypeLu) => {
    try {
        const response = await appClientMethods.get(`addresstypes`);
        setTypeLu(response);
    } catch (error) {
        setErrorMessage(error.message);
    }
}



export const fetchAddressDetails = async ({ setData, setError, addressId }) => {
    try {
        setData(await appClientMethods.get(`${ApiControllers.common}Customer/Address/${addressId}`))
    } catch (error) {
        setError(error.message);
    }
}

export const saveAddress = async (setButtonLoader, setErrorMessage, saveObj, getSaveAddress) => {
    setButtonLoader(true);
    try {
        const response = await appClientMethods.post(`customer/address`, saveObj)
        getSaveAddress(response);
    } catch (error) {
        setErrorMessage(error.message);
    } finally {
        setButtonLoader(false);
    }
}

export const editAddress = async (setButtonLoader, setErrorMessage, saveObj, getSaveAddress) => {
    setButtonLoader(true);
    try {
        const response = await appClientMethods.put(`customer/address`, saveObj)
        getSaveAddress(response);
    } catch (error) {
        setErrorMessage(error.message);
    } finally {
        setButtonLoader(false);
    }
}
export const verifyAuthenticator = async (setButtonLoader, setErrorMessage, userId, code, setVerify2FA) => {
    setButtonLoader(true);
    try {
        const response = await appClientMethods.put(`${ApiControllers.security}VerifyGoogleAuthenticator/${userId}/${code}`);

        setVerify2FA(response);
    } catch (error) {
        setErrorMessage(error.message);
    } finally {
        setButtonLoader(false);
    }
}



// ---------------------------- Membership -----------------------------------------------



export const memberActiveInactive = async ({ setLoader, onError, onSuccess, membership }) => {
    setLoader(true);
    try {
        const endUrl = membership?.status?.toLowerCase() === 'active' ? '/disable' : '/enable'
        const response = await appClientMethods.put(`membership/${membership?.id}/state${endUrl}`,{});
        onSuccess(response);
    } catch (error) {
        onError(error.message);
    } finally {
        setLoader(false);
    }
}


export const membershipDefault = async ({ setLoader, onSuccess, onError, membership }) => {
    try {
        setLoader(true);
        const response = await appClientMethods.put(`memberships/${membership?.id}/default`,{});
        onSuccess(response)
    } catch (error) {
        onError(error.message);
    } finally {
        setLoader(false);
    }
}




export const fetchMembershipScreenDetails = async (setState, onSuccess, { membershipId }) => {
    setState((prev) => ({ ...prev, loading: 'data' }))
    try {
        const requests = membershipId !== AppDefaults.GUID_ID ? [appClientMethods.get(`membership/${membershipId}`), appClientMethods.get(`memberships/lookup`)] : [null, appClientMethods.get(`memberships/lookup`)];
        const [formData, accountTypes] = await Promise.all(requests)
        setState((prev) => ({ ...prev, loading: '', data: formData, lookups: { ...prev.lookups, accountTypes: accountTypes.AccountTypes } }))
        onSuccess?.(formData);
    } catch (error) {
        setState((prev) => ({ ...prev, loading: '', error: { message: error.message, type: 'error' } }))
    }
}
export const saveMembership = async (setState, onSuccess, { values,userProfile, mode, id }) => {
    setState(prev => ({ ...prev, loading: 'save' }));
    try {
        const reqPayload = {
            ...values,
            id: id,
        }
        const response = mode === 'Add' ? await appClientMethods.post("membership", reqPayload) : await appClientMethods.put("membership", reqPayload);
        onSuccess(response);
    } catch (error) {
        setState(prev => ({ ...prev, error: { message: error.message, type: 'error' } }));
    } finally {
        setState(prev => ({ ...prev, loading: '' }));
    }
}

export const getDataForFeeSetup = async ({ setLoader, setData, setError, membershipId }) => {
    setLoader(true);
    try {
        setData(await appClientMethods.get(`membership/${membershipId}`))
    } catch (error) {
        setError(error.message);
    } finally {
        setLoader(false)
    }
}

export const fetchVaultsForUpgradeMembership = async ({ setLoader, setData, setError }) => {
    setLoader(true);
    try {
        setData(await appClientMethods.get(`memberships/upgrade/vaults`))
    } catch (error) {
        setError(error.message)
    } finally {
        setLoader(false)
    }
}
export const getConversionAmount = async ({ fromCoin, toCoin, membershipPrice, setLoader, onError, onSuccess }) => {
    setLoader(true)
    try {
        onSuccess(await appClientMethods.get(`exchangeRate?fromAsset=${fromCoin}&toAsset=${toCoin}&amount=${membershipPrice}`))
    } catch (error) {
        onError(error.message)
    } finally {
        setLoader(false)
    }
}
export const getMembershipUpgradeSummary = async ({ setLoader, onError, onSuccess, wallet, membership, fields }) => {
    setLoader(true)
    const requestPayload = {
        "membershipId": membership?.[fields.id],
        "cryptoWalletId": wallet?.id,
    }
    try {
        onSuccess(await appClientMethods.post(`memberships/upgrade/fee`, requestPayload))
    }
    catch (error) {
        onError(error.message)
    } finally {
        setLoader(false)
    }
};

export const upgradeMembership = async ({ setLoader, onSuccess, onError, wallet, membership, fields }) => {
    setLoader(true)
    const requestPayload = {
        "membershipId": membership?.[fields.id],
        "cryptoWalletId": wallet?.id,
    }
    try {
        onSuccess(await appClientMethods.post(`memberships/upgrade/payment`, requestPayload))
    }
    catch (error) {
        onError(error.message)
    } finally {
        setLoader(false)
    }

}
export function openNotification(message) {
    const args = {
        description: message,
        duration: 3,
    };
    notification.open(args);
}
export const fetchFeeDetails = async ({ membershipId, setLoader, setData, setError }) => {
    setLoader(true)
    try {
        const url = membershipId === AppDefaults?.GUID_ID ? `fees` : `upgrade/fees/${membershipId}`
        setData(await appClientMethods.get(url))
    } catch (error) {
        setError(error.message)
    } finally {
        setLoader(false)
    }
}
export const fetchMemberships = async ({ setLoader, setData, setError }) => {
    setLoader(true)
    try {
        setData(await appClientMethods.get(`memberships/upgrade`))
    } catch (error) {
        setError(error.message)
    } finally {
        setLoader(false)
    }
}

export const saveFeesDetails = async ({setLoader, setError,onSuccess,  membershipId, formValues, moduleName}) => {
    setLoader(true)

    const reqPayload = {
        membershipId: membershipId,
        comissions: formValues.actions,
    };
    try {
        await appClientMethods.post(`membership/fees?appName=${moduleName}`, reqPayload);
        onSuccess?.()
    } catch (error) {
        setError(error.message);
    } finally {
        setLoader(false);
    }
}


export const getFeeDetails = async ({ setLoader, setErrorMessage, setFees, membershipId, module, isUpgradeMembershipView }) => {
    setLoader(true);
    try {
        module = module?.toLowerCase()
        const url =membershipId===AppDefaults?.GUID_ID ? `charges?module=${module}` : `upgrade/fees/${membershipId}/details?module=${module}`
        const response = await appClientMethods.get(url)
        setFees(response);
    } catch (error) {
        setErrorMessage(error.message);
    } finally {
        setLoader(false);
    }
}

export const getFeeSetupDetails = async ({ setLoader, setErrorMessage, setFees, membershipId, module, isUpgradeMembershipView }) => {
    
    setLoader(true);
    try {
        module = module?.toLowerCase()
        const url = `membership/fee/${membershipId}/${module}`
        const response = await appClientMethods.get(url)
        setFees(response);
    } catch (error) {
        setErrorMessage(error.message);
    } finally {
        setLoader(false);
    }
}


//----------------------- Close Account -----------------------------

export const closeAccount = async (onSuccess, onError, { userProfile }) => {
    try {
        const data = await appClientMethods.put(`customers/accounts/close`,
            {
                customerId: userProfile?.id,
                state: 'Closed',
            }
        )
        onSuccess(data)
    } catch (error) {
        onError(error.message)
    }
}

//---------------------------- Business Logo ----------------------------------

export const uploadBusinessLogo = async (onSuccess, onError, { userProfile, logo }) => {
  try {
    const response = await apiClient.put(`/api/business/logo`, {logo:logo}, {
      headers: {
        // Remove Content-Type if logo is raw, or set as needed like 'image/png' or 'application/octet-stream'
      }
    });
    onSuccess(response);
  } catch (error) {
    onError(error.message);
  }
};




//-------------------------------------Profile Details-------------------------------------------------------

export const FetchProfileDetails = async (setIsLoader, setErrorMessage, setProfileDetails, AccountTypes) => {
    setIsLoader(true);
    try {
        const response = await appClientMethods.get(`customers/profile/${AccountTypes.toLowerCase()}`);
        setProfileDetails(response);
    } catch (error) {
        setErrorMessage(error.message);
    } finally {
        setIsLoader(false);
    }
}


export const getRewardRules= async (customerId,setLoader, setData, setError)=>{
    try {
        setLoader(true);
        const response = await loyaltyAppClientMethods.get(`loyalty//reward-rules/${customerId}`,'');
        setData(response);
        setLoader(false);
    } catch (error) {
        setError(error.message);
        setLoader(false);
    }
 
}