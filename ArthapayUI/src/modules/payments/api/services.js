import { appClientMethods } from "../../../api/clients"
import { deriveErrorMessage } from "../../../core/shared/deriveErrorMessage";
import debounce from "../../../utils/debounce";
import { dashboard, common, payouts, payins, batchPayouts } from "./endpoints";
const appName = window.runtimeConfig.VITE_NAME;
export const toolbar = [
    { key: 'add', tooltipTitle: 'Add', tooltipPlacement: 'top', icon: 'add-links', shouldSelect: false },
    { key: 'exportExcel', tooltipTitle: 'Export Excel', tooltipPlacement: 'top', icon: 'excel', shouldSelect: false },
]

export const WARNINGS = {
    'SELECT_RECORD': 'Plese select one record.',
    'VALIDATIONS_WARNING': 'Please ensure that all required fields are filled out correctly before proceeding'
}
export const TOASTER_MESSAGE = 'Payout request has been submitted successfully.'

export const ALLOWED_DECIMALS = {
    requestedAmount: 4,
    Fiat: 2,
    Crypto: 4,
}
export const getMinFieldValue = (type) => {
    return 1 / (10 ** ALLOWED_DECIMALS[type])
}
export const TOOLTIP_TITLES = {
    'currency': 'Select vault to display coins',
    'network': 'Select coin to display networks',
    'requestedAmount': 'To enter amount, please fill in the previous fields.',
    'finalAmount': 'Click for Fee Breakdown',
    'payeeId': 'To select payee, please fill in the previous fields.'
}
export const currencyTypes = [
    { id: 'Fiat', name: 'Fiat' },
    { id: 'Crypto', name: 'Crypto' },
]
export const currencyFields = {
    'Fiat': 'fiatCurrency',
    'Crypto': 'currency',
}

// ----------------------- Common ------------------------------


async function getVaults(setState, urlParams) {
    try {
        const { id, currency } = urlParams;
        if (currency === 'fiat') {
            const [vaults, fiatCurrencies] = await Promise.all([appClientMethods.get(`${common.valuts}/${id}`), appClientMethods.get(`${common.fiatCurrencies}/${id}/${appName}`)]);
            setState({ type: 'setLookups', payload: { vaults, fiatCurrencies } });
        } else {
            const [vaults] = await Promise.all([appClientMethods.get(`${common.valuts}/${id}`)]);
            setState({ type: 'setLookups', payload: { vaults } })
        }
    } catch (error) {
        setState({ type: 'setError', payload: error.message })
    } finally {
        setState({ type: 'setLoading', payload: '' })
    }
}

async function GetAdvertisements(setData, urlParams) {
    const { screenName } = urlParams
    try {
        const response = await appClientMethods.get(`${common.advertisment}/${screenName}`)
        setData(response)
    } catch (error) {
    }
}


async function getCountries(setState, urlParams) {
    setState({ type: 'setLoading', payload: 'gettingDetails' })
    const { id } = urlParams
    try {
        const response = await appClientMethods.get(`${common.countryLu}/${id}`)
        return response
    } catch (error) {
        setState({ type: 'setError', payload: error.message })
    }
    finally {
        setState({ type: 'setLoading', payload: 'gettingDetails' })

    }

}

async function getStatesOfCountry(setState, urlParams) {
    setState({ type: 'setLoading', payload: 'gettingDetails' })
    const { country } = urlParams
    try {
        const response = await appClientMethods.get(`${common.statesLu}/${country}`);
        return response
    } catch (error) {
        setState({ type: 'setError', payload: error.message })
    } finally {
        setState({ type: 'setLoading', payload: 'gettingDetails' })
    }
}

async function fetchNetworks(setState, urlParams) {
    setState({ type: 'setLoading', payload: 'gettingDetails' })
    const { coin, customerId } = urlParams
    try {
        const response = await appClientMethods.get(`${common.networkLu}/${coin}/${customerId}`)
        return response
    } catch (error) {
        setState({ type: 'setError', payload: error.message })
    } finally {
        setState({ type: 'setLoading', payload: 'gettingDetails' })
    }
}



// ----------------------- Dashboard ------------------------------

async function paymetsDashoardKpis(setData, setErrorMessage) {
    try {
        const response = await appClientMethods.get(`${dashboard.kpiData}/Payments/kpis`)
        setData(response);
    } catch (error) {
        setErrorMessage(error?.message);
    }
}


// ----------------------- Pay-Ins ------------------------------

async function getPayinsVaults(setState, userId) {
    setState({ type: 'setLoading', payload: 'gettingDetails' });
    try {
        const vaults = await appClientMethods.get(`${common.valuts}/${userId}`);
        setState({ type: 'setLookups', payload: { vaults: [{ id: 'All', merchantName: 'All' }, ...vaults] } });
    } catch (error) {
        setErrorMessage(deriveErrorMessage(error));
    } finally {
        setState({ type: 'setLoading', payload: '' });
    }
}

async function fetchPayins(setLoader, setData, setError, urlParams, selectPayin, setPage, isCancel) {
    setLoader(true);
    const { searchValue, pageNo, pageSize, currentData, cusName } = urlParams
    try {
        const response = await appClientMethods.get(`${payins.payinsGridData}/all/${searchValue}?page=${pageNo}&pageSize=${pageSize}`);
        pageNo !== 1 && setData([...currentData, ...response.data]);
        pageNo === 1 && setData(response.data);
        if (cusName !== 'new' || isCancel === 'isCancel') {
            pageNo === 1 && selectPayin(response?.data?.[0]);
        }
        setPage(pageNo);
    } catch (error) {
        setError(error.message)
    } finally {
        setLoader(false);
    }
}


async function payinsFormLu(setState) {
    setState({ type: 'setLoading', payload: 'gettingFormDetails' })
    try {
        const formLu = await appClientMethods.get(`${payins.payinsFormTypeL}paymentlookup`);
        setState({ type: 'setFormLu', payload: formLu?.paymentlookup })
    } catch (error) {
        setState({ type: 'setError', payload: error.message })
    }
    finally {
        setState({ type: 'setLoading', payload: '' })
    }
}

async function templateCall(setState, id) {
    setState({ type: 'setLoading', payload: 'gettingFormDetails' })
    try {
        const response = appClientMethods.get(`${payins.staticDetails}/${id}`)
        setState({ type: 'setTemplateData', payload: response })
    } catch (error) {
        setState({ type: 'setError', payload: error })
    } finally {
        setState({ type: 'setLoading', payload: 'gettingFormDetails' })
    }
}

async function payinInvoiceDwd(setLoader, setData, setState, urlParams) {
    const { id, type } = urlParams
    setLoader(true);
    setState({ type: 'setError', payload: null })
    try {
        const response = await appClientMethods.get(`${payins.staticInvoiceDwd}${type}/${id}`);
        setData(response);
    } catch (error) {
        setState({ type: 'setError', payload: error.message })
    }
    finally {
        setLoader(false);
    }
}

async function getStatusChangeLookup(setState, urlParams) {
    setState({ type: 'setLoading', payload: 'gettingDetails' })
    const { fromStatus } = urlParams
    try {
        const response = await appClientMethods.get(`${payins.payinStatusChange}/${fromStatus}`)
        return response
    } catch (error) {
        setState({ type: 'setError', payload: error.message })
    } finally {
        setState({ type: 'setLoading', payload: 'gettingDetails' })
    }

}
// ----------------------- Batch Payouts ------------------------


async function fetchBatchPayouts(setLoader, setData, setError, urlParams, selectPayout, setPage) {
    setLoader(true);
    const { searchValue, pageNo, pageSize, currentData } = urlParams
    try {
        const response = await appClientMethods.get(`${batchPayouts.CryptoBatchPayments}/${searchValue}?page=${pageNo}&pageSize=${pageSize}`);
        setData([...currentData, ...response.data]);
        pageNo === 1 && selectPayout(response?.data?.[0]);
        setPage(pageNo);
    } catch (error) {
        setError(error.message)
    } finally {
        setLoader(false);
    }

}

async function getPaymentDetails(urlParams) {
    const { localDispatch, fetchBatchPayoutDetail, marchantsDetails, setBatchPaymentDetails, setErrorMessages, id, form, reducerDispatch } = urlParams;
    try {
        localDispatch({ type: 'setIsLoading', payload: 'initialLoading' });
        const response = await fetchBatchPayoutDetail(id);
        if (response) {
            const selectedMerchant = marchantsDetails?.data?.find(item => item.id === response?.merchantId);
            form.setFieldsValue(response);
            const coinInfo = selectedMerchant?.merchantsDetails?.find(item => item.code === response?.currency);
            reducerDispatch(setBatchPaymentDetails(response));
            const selectedNetworkInfo = coinInfo?.networks.find(item => item.name === response?.network);
            localDispatch({ type: 'setTotalPaymentAmount', payload: response?.amount });
            localDispatch({
                type: "setFormDetails",
                payload: {
                    selectedVaultDetails: selectedMerchant,
                    selectedCoinInfo: coinInfo,
                    selectedNetworkInfo: selectedNetworkInfo,
                    payeesGridData: response?.merchantPayees
                }
            });
        } else {
            setErrorMessages(response);
        }
    } catch (error) {
        window.scrollTo(0, 0);
        setErrorMessages(error);
    }
    finally {
        localDispatch({ type: 'setIsLoading', payload: '' });
    }
}

async function saveBatch(url, obj) {
    return appClientMethods.post(`${url}`, obj);
}
async function updatebatchpayment(url, obj) {
    return appClientMethods.put(`${url}`, obj);
}

async function saveBatchPayment(url, values, customerId, id, mode, setErrorMessages) {
    try {
        let obj = {
            ...values,
            id: id,
            customerId: customerId,
        }
        let _url = (mode === 'create' || !mode) ? url : 'Merchant/updatebatchpayments'
        let _methods = mode === 'create' ? saveBatch : updatebatchpayment;
        const response = await _methods(_url, obj);
        return response;
    }
    catch (error) {
        setErrorMessages(error.message)
    }

}

async function fetchBatchPayoutDetail(batchid) {
    return appClientMethods.get(batchPayouts.merchantBatchPayOut + `batchpaymentview/${batchid}`)
}

async function batchPayOutMerchatDetails(url) {
    return appClientMethods.get(`${url}/batchpayout`)
}


// ----------------------- Pay-Outs ------------------------------

async function processPayout(values, userProfile, selectedType, setState, onSuccess) {
    const { feeCommission, merchantId, customerWalletId, requestedAmount, finalAmount, payeeId, fiatCurrency, quoteId } = values
    const requestObject = {
        createdby: userProfile?.name,
        feeComission: feeCommission,
        merchantId: merchantId,
        customerId: userProfile?.id,
        customerWalletId: customerWalletId,
        requestedAmount: requestedAmount,
        finalAmount: finalAmount,
        payeeId: payeeId,
    }
    if (selectedType === 'Fiat') {
        requestObject.fiatCurrency = fiatCurrency
        requestObject.quoteId = quoteId
    }
    setState({ type: 'setLoading', payload: 'save' })
    setState({ type: 'setError', payload: '' })
    try {
        await appClientMethods.post(`${payouts.savePayout}`, requestObject);
        onSuccess();
    } catch (error) {
        setState({ type: 'setError', payload: error.message })
    } finally {
        setState({ type: 'setLoading', payload: '' })
    }
}
async function transactionDetailsDwd(setLoader, setData, setError, urlParams) {
    const { id, type } = urlParams
    setLoader(true);
    setError(null)
    try {
        const response = await appClientMethods.get(`${payouts.transactionDetailsDwd}/${id}/${type}`);
        setData(response);
    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false);
    }
}
async function fetchPayouts(setLoader, setData, setError, urlParams, selectPayout, setPage) {
    setLoader(true);
    const { searchValue, pageNo, pageSize, currentData } = urlParams
    try {
        const response = await appClientMethods.get(`${payouts.payoutTransactions}/all/${searchValue}?page=${pageNo}&pageSize=${pageSize}`);
        setData([...currentData, ...response.data]);
        pageNo === 1 && selectPayout(response?.data?.[0]);
        setPage(pageNo);
    } catch (error) {
        setError(error.message)
    } finally {
        setLoader(false);
    }
}

async function fetchTranscationDetails(setData, setError, setLoader, urlParams) {
    const { id } = urlParams
    setLoader(true);
    setError(null)
    try {
        const response = await appClientMethods.get(`${payouts.transactionDetails}transaction/${id}`);
        setData(response);
    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false);
    }
}

async function getPayees({ value, customerId, currency, fiatCurrency, network, selectedType, onSuccess, onError }) {
    const type = selectedType === 'Fiat' ? fiatCurrency : currency
    try {
        const response = await appClientMethods.get(`${payouts.fetchPayeesLu}/${customerId}/${type}/${currency}/${network}/${value}/${appName}`);
        if (response) {
            const formattedOptions = (response).map((option) => ({
                value: option.id,
                label: option.name,
            }))
            onSuccess(formattedOptions)
            return
        }
        throw new Error(deriveErrorMessage(response))

    } catch (error) {
        onError(error.message)
    }
}
export const debouncedPayees = debounce(getPayees)

async function getPayoutSummary({ userProfile, customerWalletId, value, fiatCurrency, selectedType, onSummary, onError }) {
    const requestObject = {
        "customerId": userProfile?.id,
        "customerWalletId": customerWalletId,
        "amount": value
    }
    const methods = {
        'Fiat': 'PayOutFiat/Summary',
        'Crypto': 'PayOutCrypto/Summary'
    }
    if (selectedType === 'Fiat') {
        requestObject.fiatCurrency = fiatCurrency
    }
    try {
        const response = await appClientMethods.post(`${payouts.payoutSummary}${methods[selectedType]}`, requestObject);
        onSummary(response)
        return
    } catch (error) {
        onError(error.message)
    }
}
export const debouncedSummary = debounce(getPayoutSummary)

export {
    fetchPayouts, transactionDetailsDwd, getVaults, processPayout, getPayees, getPayoutSummary,
    fetchBatchPayouts, fetchPayins, payinsFormLu, getPayinsVaults, getPaymentDetails, fetchBatchPayoutDetail, batchPayOutMerchatDetails, saveBatchPayment, paymetsDashoardKpis, templateCall,
    fetchTranscationDetails, payinInvoiceDwd, GetAdvertisements, getStatusChangeLookup
}
