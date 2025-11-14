
import { appClientMethods } from "./httpClients";
import { appClientMethods as coreappClientMethods } from "../../core/http.clients";
import { ApiControllers } from "../../api/config";
import debounce from "../../utils/debounce";
import moment from "moment";
import AppDefaults from "../../utils/app.config";
import { encryptAES } from "../../core/shared/encrypt.decrypt";
const appName = window.runtimeConfig.VITE_NAME;
const { merchant: merchantController, exchangewallet: exchangeWalletController, common: commonController, dashboard: dashboardController, exchangeTransaction: exchangeTransactionController, payments: paymentsController, registration: registrationController } = ApiControllers

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
}


// ----------------------- Common ------------------------------
async function getVaults(setState, urlParams, selectVault, pageNo = 1) {
    try {
        const { id, currency } = urlParams;
        if (currency === 'fiat') {
            const [vaults, fiatCurrencies] = await Promise.all([appClientMethods.get(`${merchantController}GetMerchantDetails/${id}`), appClientMethods.get(`${exchangeWalletController}Exchange/FiatWallets/${id}/${appName}`)]);
            setState({ type: 'setLookups', payload: { vaults, fiatCurrencies } });
            selectVault(vaults[0])
        } else {
            const [vaults] = await Promise.all([appClientMethods.get(`${merchantController}GetMerchantDetails/${id}`)]);
            setState({ type: 'setLookups', payload: { vaults } })
        }
    } catch (error) {
        setState({ type: 'setError', payload: error.message })
    } finally {
        setState({ type: 'setLoading', payload: '' })
    }
}
// ----------------------- Dashboard ------------------------------




async function getGraphYearLu(setYearLu, setGettingYears) {
    setGettingYears(true)
    try {
        const response = await appClientMethods.get(`${ApiControllers.common}/yearsLookUp`)
        setYearLu(response)
    } catch (error) {
    } finally {
        setGettingYears(false)
    }
}
// ----------------------- Pay-Ins ------------------------------


async function getVaultsPayins() {
    return await appClientMethods.get(`payments/merchants`)
}

async function getCountriesPayins() {
    const response = await coreappClientMethods.get(`countries`)
    return response
}


async function getInvoiceCurrencies() {
    const response = await coreappClientMethods.get(`SupportedCurrencyLu`,)
    return response
}

async function getPaymentLinkDetails(id, type) {
    const urls = {
        Invoice: `payins/invoice/${id}`,
        Static: `payins/static/${id}`
    }
    return await appClientMethods.get(urls[type])
}

async function getNetworkLuPayins(coin, customerId) {
    const response = await appClientMethods.get(`${merchantController}NetWorkLookUp/${coin}/${customerId}`)
    return response
}

const save = (url, obj) => {
    return appClientMethods.post(`${url}`, obj)
}
const update = (url, obj) => {
    return appClientMethods.put(`${url}`, obj)
}

const getInvoiceSaveObj = (values, customer, selectedType, mode, selectedVault) => {
    const currDate = new Date().toLocaleDateString('en-CA');
    return mode === 'generate' ? {
        ...values,
        id: values.id || AppDefaults.GUID_ID,
        merchantId: selectedVault?.id,
        emails: encryptAES(values.emails, customer?.clientSecretKey),
        taxIdentificationNumber: encryptAES(values?.taxIdentificationNumber),
        zipCode: encryptAES(values?.zipCode),
        paymentType: values.paymentType || selectedType || 'Invoice',
        createdDate: values.createdDate || currDate,
        issuedDate: moment(values.issuedDate)?.format(AppDefaults.formats.standredUTCDate),
        dueDate: moment(values.dueDate)?.format(AppDefaults.formats.standredUTCDate),
        invoiceNumber: values.invoiceNumber || '',
        paymentLink: values.paymentLink || '',
        createdBy: values.createdBy || customer?.name || customer?.firstName,
        modifiedBy: customer?.name || customer?.firstName,
        modifiedDate: currDate,
        status: values.status || 'Not Paid',
        clientWillPayCommission: false,
        isCryptoTransfer: values.isCryptoTransfer || false
    } : {
        "id": values.id,
        "dueDate": moment(values.dueDate)?.format(AppDefaults.formats.standredUTCDate),
        "invoiceNumber": values.invoiceNumber,
        "modifiedBy": customer?.name || customer?.firstName,
        "modifiedDate": currDate
    }

}
const getStaticSaveObj = (values, customer, selectedType, mode, selectedPayinWallet) => {
    const currDate = new Date().toLocaleDateString('en-CA');
    return mode === 'generate' ? {
        "merchantId": selectedPayinWallet?.wallet?.id,
        "currency": selectedPayinWallet?.merchant?.code,
        "networkName": selectedPayinWallet?.code,
        "customerWalletId": selectedPayinWallet?.customerWalletId,
        "merchantName": selectedPayinWallet?.wallet?.name,
        "orderId": values?.orderId,
        "amount": values?.amount,
        "dueDate": moment(values.dueDate)?.format(AppDefaults.formats.standredUTCDate),
        "invoiceType": values.paymentType || selectedType || 'Payment Link'
    } : {
        "id": values.id,
        "dueDate": moment(values.dueDate)?.format(AppDefaults.formats.standredUTCDate),
        "invoiceNumber": values.invoiceNumber,
        "modifiedBy": customer?.name || customer?.firstName,
        "modifiedDate": currDate
    }
}


const createOrUpdatePaymentLink = async (values, customer, mode, type, selectedVault, selectedPayinWallet) => {
    const apiEndpoints = {
        generate: {
            PaymentLink: 'payments/payin/staticInvoice',
            Invoice: 'payments/payin/invoice'
        },
        update: `payments/payin/invoice`
    };
    const actions = {
        'generate': save,
        'update': update
    }

    const getSaveObjByType = {
        'PaymentLink': () => getStaticSaveObj(values, customer, type, mode, selectedPayinWallet),
        'Invoice': () => getInvoiceSaveObj(values, customer, type, mode, selectedVault)
    }
    try {
        const endPoint = typeof apiEndpoints[mode] === 'string' ? apiEndpoints[mode] : apiEndpoints[mode][type]
        const method = actions[mode]
        const response = await method(endPoint, getSaveObjByType[type]?.());
        if (response) {
            return {
                data: {
                    ...values,
                    ...response
                }, error: ''
            }
        }
        else {
            return { data: null, error: response }
        }
    }
    catch (error) {
        return { data: null, error: error.message }
    }
};

//arthapayapi.artha.work/api/v1/Merchant/StaticInvoicePreview

async function StaticPreviewPayin(setStaticPerviewDetails, setError, setLoader, mergedData) {
    setLoader(true)
    try {
        const response = await appClientMethods.post(`payins/static/preview`, mergedData)
        setStaticPerviewDetails(response)
    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false)
    }
}


async function invoicePreviewPayin(setInvoicePerviewDetails, setError, setLoader, mergedData) {
    setLoader(true)
    try {
        const response = await appClientMethods.post(`payins/invoice/preview`, mergedData)
        setInvoicePerviewDetails(response)
    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false)
    }
}

const getLinkDetails = async (id, type,) => {
    const urls = {
        Invoice: `payins/invoice/${id}/view`,
        PaymentLink: `payins/static/${id}/view`
    }
    try {
        const response = await appClientMethods.get(urls[type]);
        return response
    } catch (error) {
        return error?.message
    }
}


async function getPayinFiatCoins(setLoader, setData, setError, selectFiatPayin) {
    setLoader(true);
    try {
        const response = await appClientMethods.get('payments/fiatwallets/lookup');
        setData(response);
        selectFiatPayin(response?.assets?.[0])
    } catch (error) {
        setError(error.message)
    } finally {
        setLoader(false);
    }
}

const getStatesOfCountry = async (country) => {
    const response = await coreappClientMethods.get(`States/${country}`);
    const data = JSON.parse(response)
    return data?.States;
}


async function getStatesPains(value, setState, lookups) {
    setState({ type: 'setLoading', payload: 'gettingStates' })
    try {
        const states = await appClientMethods.get(`${commonController}States/${value}`)
        setState({ type: 'setLookups', payload: { ...lookups, states } })
    } catch (errorMessage) {
        setState({ type: 'setError', payload: errorMessage.message })
    } finally {
        setState({ type: 'setLoading', payload: '' })
    }

}

async function getPayinsVaults(setState, userId) {
    setState({ type: 'setLoading', payload: 'gettingDetails' });
    try {
        const vaults = await appClientMethods.get(`${merchantController}GetMerchantDetails/${userId}`);
        setState({ type: 'setLookups', payload: { vaults: [{ id: 'All', merchantName: 'All' }, ...vaults] } });
    } catch (error) {
        setErrorMessage(error?.message);
    } finally {
        setState({ type: 'setLoading', payload: '' });
    }
}

async function getPaymentLinks(setLoader, setData, setError, urlParams, selectPayin, setPage) {
    setLoader(true);
    const { searchValue, pageNo, pageSize, currentData } = urlParams;
    try {
        const response = await appClientMethods.get(`payments/payin/fiat?page=${pageNo}&pageSize=${pageSize}&search=${searchValue}`);
        setData([...currentData, ...response.data]);
        pageNo === 1 && selectPayin(response?.data?.[0]);
        setPage(pageNo);
    } catch (error) {
        setError(error.message);
    } finally {
        setLoader(false);
    }
}

async function getPaymentsInvoices(setLoader, urlParams, setError) {
    setLoader(true);
    const { searchValue, pageNo, pageSize } = urlParams;

    try {
        const response = await appClientMethods.get(
            `payments/payin/fiat?page=${pageNo}&pageSize=${pageSize}&search=${searchValue}`
        );

        // return just the data for the component to handle
        return response.data || [];

    } catch (error) {
        setError(error.message);
        return [];
    } finally {
        setLoader(false);
    }
}




async function fetchPayins(setLoader, setData, setError, urlParams, selectPayin, setPage, isCancel) {
    setLoader(true);
    const { searchValue, pageNo, pageSize, currentData, cusName } = urlParams
    try {
        const response = await appClientMethods.get(`payments/payins?page=${pageNo}&pageSize=${pageSize}&search=${searchValue}`);
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

async function payinInvoiceDwd(setLoader, setData, setState, urlParams) {
    const { id, type } = urlParams
    const invoiceType = type === "PaymentLink" ? 'static' : 'invoice'
    setLoader(true);
    setState({ type: 'setError', payload: null })
    try {
        const response = await appClientMethods.get(`invoices/${id}/download?type=${invoiceType?.toLowerCase()}`);
        setData(response);
    } catch (error) {
        setState({ type: 'setError', payload: error.message })
    }
    finally {
        setLoader(false);
    }
}


async function payinInvoiceFiatDwd(setLoaderDwnd, setData, setError, urlParams) {
    const { id, type } = urlParams
    const invoiceType = "payment link"
    setLoaderDwnd(true);
    setError(null)
    try {
        const response = await appClientMethods.get(`invoices/${id}/download?type=${invoiceType}`);
        setData(response);
    } catch (error) {
        setError(error?.message)
    }
    finally {
        setLoaderDwnd(false);
    }
}


async function payinslookups() {
    return await coreappClientMethods.get(`payments/lookup`);
}




async function payinsFormLu(setState) {
    setState({ type: 'setLoading', payload: 'gettingFormDetails' })
    try {
        const formLu = await coreappClientMethods.get(`payments/lookup`);
        setState({ type: 'setFormLu', payload: formLu?.paymentlookup });
    } catch (error) {
        setState({ type: 'setError', payload: error?.message })
    }
    finally {
        setState({ type: 'setLoading', payload: '' })
    }
}

async function templateCall(setState, id) {
    setState({ type: 'setLoading', payload: 'gettingFormDetails' })
    try {
        const response = appClientMethods.get(`${merchantController}paymentdetail/${id}`)
        setState({ type: 'setTemplateData', payload: response })
    } catch (error) {
        setState({ type: 'setError', payload: error?.message })
    } finally {
        setState({ type: 'setLoading', payload: 'gettingFormDetails' })
    }
}


async function getStatusChangeLookup(setState, urlParams) {
    setState({ type: 'setLoading', payload: 'gettingDetails' })
    const { fromStatus } = urlParams
    try {
        const response = await appClientMethods.get(`${commonController}StateChange/payIn/${fromStatus}`)
        return response
    } catch (error) {
        setState({ type: 'setError', payload: error.message })
    } finally {
        setState({ type: 'setLoading', payload: 'gettingDetails' })
    }

}



async function fetchTranscationDetails(setData, setError, setLoader, urlParams) {
    const { id } = urlParams
    setLoader(true);
    setError(null)
    try {
        const response = await appClientMethods.get(`payout/${id}`);
        setData(response);
    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false);
    }
}
// ----------------------- Batch Payouts ------------------------


async function fetchBatchPayouts(setLoader, setData, setError, urlParams, selectPayout, setPage) {
    setLoader(true);
    const { searchValue, pageNo, pageSize, currentData } = urlParams
    try {
        const response = await appClientMethods.get(`${merchantController}CryptoBatchPaymentsK/${searchValue}?page=${pageNo}&pageSize=${pageSize}`);
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
    const { localDispatch, fetchBatchPayoutDetails, marchantsDetails, setBatchPaymentDetails, setErrorMessages, id, form, reducerDispatch } = urlParams
    try {
        localDispatch({ type: 'setIsLoading', payload: 'initialLoading' });
        const response = await fetchBatchPayoutDetails(id);
        if (response) {
            const selectedMerchant = marchantsDetails?.data?.find(item => item.id === response?.merchantId);
            form.setFieldsValue(response);
            const coinInfo = selectedMerchant?.merchantsDetails?.find(item => item.coin === response?.currency);
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

async function saveBatchPayment(url, values, customerId, id, mode) {
    try {
        let obj = {
            ...values,
            id: id,
            customerId: customerId,
        }
        let _url = (mode === 'create' || !mode) ? url : 'Merchant/updatebatchpayments'
        let _methods = mode === 'create' ? saveBatch : updatebatchpayment;
        let response = await _methods(_url, obj);
        return response;
    }
    catch (error) {
        return error
    }

}

async function fetchBatchPayoutDetail(batchid) {
    return appClientMethods.get(merchant + `batchpaymentview/${batchid}`)
}

async function batchPayOutMerchatDetails(url, customerId) {
    return appClientMethods.get(`${url}/${customerId}/batchpayout`)
}


// ----------------------- Pay-Outs ------------------------------

async function processPayout(payoutSummary, userProfile, mode, setLoader, setError, purposeCode, sourceCode) {
    setLoader(true)
    const { feeCommission, merchantId, customerWalletId, requestedAmount, finalAmount, selectedPayee, fiatCurrency, summary, uploaddocuments } = payoutSummary
    const type = mode === 'fiat' ? 'payoutfiat' : 'payoutcrypto';
    const requestObject = {
        createdby: userProfile?.name,
        feeComission: feeCommission,
        merchantId: merchantId,
        customerWalletId: customerWalletId,
        requestedAmount: requestedAmount,
        finalAmount: finalAmount,
        payeeId: selectedPayee?.id,
        sourceOfFundsCode: sourceCode?.sourceOfIncomeCode,
        sourceOfFunds: sourceCode?.sourceOfIncome,
        purposeCode: purposeCode?.purposeCode,
        purpose: purposeCode?.purpose,
        moduleType: '',
        NationalIdNumber:payoutSummary?.['NationalId Number']
    }
    if (mode === 'fiat' || mode === 'crypto') {
        requestObject.fiatCurrency = fiatCurrency
        requestObject.quoteId = summary?.quoteId
        requestObject.docRepositories = [{
            fileName: uploaddocuments
        }]

    }
    try {
        const response = await appClientMethods.post(`payments/payout/fiat?type=${type}`, requestObject);
        return response
    } catch (error) {
        setError(error.message)
    } finally {
        setLoader(false)
    }
}
async function transactionDetailsDwd(setLoader, setData, setError, urlParams) {
    const { id } = urlParams
    setLoader(true);
    setError(null)
    try {
        const response = await appClientMethods.get(`payments/tranctionstemplate/${id}/payout`);
        setData(response);
    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false);
    }
}

async function getSummaryDetails(setSummaryDetails, setLoader, setErrorMsg, selectedType) {
    const url = {
        Fiat: 'PayOutFiat',
        Crypto: 'PayOutCrypto'
    }
    const endPoint = url[selectedType]
    setLoader(true)
    try {
        const response = await appClientMethods.post(`${exchangeWalletController}${endPoint}/Summary`)
        setSummaryDetails(response)
    } catch (error) {
        setErrorMsg(error?.message)
    } finally {
        setLoader(false)

    }

}
async function fetchPayouts(setLoader, setData, setError, urlParams, selectPayout, setPage) {
    setLoader(true);
    const { searchValue, pageNo, pageSize, currentData } = urlParams
    try {
        const response = await appClientMethods.get(`payments/payout?page=${pageNo}&pageSize=${pageSize}&search=${searchValue}`);
        setData([...currentData, ...response.data]);
        pageNo === 1 && selectPayout(response?.data?.[0]);
        setPage(pageNo);
    } catch (error) {
        setError(error.message)
    } finally {
        setLoader(false);
    }
}

async function getPayees({ value, customerId, currency, fiatCurrency, network, selectedType, onSuccess, onError }) {
    const type = selectedType === 'Fiat' ? fiatCurrency : currency
    try {
        const response = await appClientMethods.get(`${exchangeWalletController}${paymentsController}Payees/${customerId}/${type}/${currency}/${network}/${value}/${appName}`);
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
async function fiatCurrencys(setState, urlParams) {
    const { coin, network } = urlParams;
    setState({ type: 'setLoading', payload: 'details' })
    try {
        const fiatCurrencies = await appClientMethods.get(`${exchangeWalletController}PayoutFiat/${coin}/${network}/payoutfiat`)
        setState({ type: 'setFiatCurrency', payload: fiatCurrencies })
    } catch (error) {
        setState({ type: 'setError', payload: error.message })
    } finally {
        setState({ type: 'setLoading', payload: '' })
    }

}
async function minMaxFiat(setState) {
    setState({ type: 'setLoading', payload: 'details' })
    try {
        const response = await appClientMethods.get(`${commonController}PayOutLimit`)
        setState({ type: "setMinMaxFiat", payload: response })
    } catch (error) {
        setState({ type: 'setError', payload: error.message })
    } finally {
        setState({ type: 'setLoading', payload: '' })
    }

}

export const fiatCurrencies = async (setState, currencyType, productId) => {
    try {
        const fieldType = currencyType === 'fiat' ? 'payoutfiat' : 'payoutcrypto';
        const response = await coreappClientMethods.get(`currencies/${productId}?type=${fieldType}`);
        setState({ type: 'setFiatCurrency', payload: response })
    } catch (error) {
        throw new Error(error.message);
    }
}

export const fetchData = async (setState, urlParams) => {
    setState({ type: 'setLoading', payload: 'details' });
    try {
        const [fiatCurrencies] = await Promise.all([
            appClientMethods.get(`payout/fiat/${urlParams.coin}/${urlParams.network}`)]);
        setState({ type: 'setStates', payload: fiatCurrencies });
    } catch (error) {
        setState({ type: 'setError', payload: error.message });
    } finally {
        setState({ type: 'setLoading', payload: '' });
    }
};




async function getFiatPayees(setState, urlParamans,currencyType) {
    const { currency } = urlParamans;
    const featureName = currencyType === 'fiat' ? 'payoutfiat' : 'payoutcrypto'
    try {
        const payees = await coreappClientMethods.get(`payees/fiat?currency=${currency}&feature=${featureName}`)
        setState({ type: "setPayess", payload: payees })
        setState({ type: "setFilteredPayee", payload: payees })
    } catch (error) {
        setState({ type: 'setError', payload: error.message })
    }
}


async function getCryptoPayees(urlParams, setPayees, setFilteredPayees, setError, setLoader) {
    const { coin, network } = urlParams;
    setLoader(false)
    try {
        const payees = await coreappClientMethods.get(`payees/crypto?coin=${coin}&network=${network}`);
        setPayees(payees?.data);
        setFilteredPayees(payees?.data)
    } catch (error) {
        setError(error?.message)
    } finally {
        setLoader(false)
    }

}

async function getMember() {
    let url = `App/${appName}`
    const response = await appClientMethods.get(registrationController + url)
    return response
}


async function getRecentTransactions(setData, setLoader, setError, actionType) {
    setLoader(true);
    setError(null);
    const route = {
        fiat: 'payout/fiat/transactions',
        crypto: 'payout/crypto/transactions'
    }
    try {
        const response = await appClientMethods.get(`${route[actionType]}?page=1&pageSize=5`);
        setData(response?.data);
    } catch (error) {
        setError(error.message)
        setData([])
    } finally {
        setLoader(false);
    }
}



async function getPayinFiatTransactions(setData, setLoader, setError) {
    setLoader(true);
    setError(null);
    try {
        const response = await appClientMethods.get(`payments/deposit/fiat/transactions?page=1&pageSize=5`);
        setData(response?.data);
    } catch (error) {
        setError(error.message)
        setData([])
    } finally {
        setLoader(false);
    }
}


async function getFiatCurrencyDetails(setDetails, setBankDetails, setLoader, setError, currency, selectedPayinFiat) {
    setLoader(true)
    try {
        const response = await appClientMethods.get(`payments/payin/fiat/view?currency=${selectedPayinFiat?.code}&type=${selectedPayinFiat?.type}`)
        if (selectedPayinFiat?.type?.toLowerCase() === 'vaults') {
            setDetails(response)
        } else if (selectedPayinFiat?.type?.toLowerCase() === 'banks') {
            setBankDetails(response)
        } else {
            setDetails(response)
        }

    } catch (error) {
        setError(error.message)
    }
    finally {
        setLoader(false)
    }
}





async function getPayoutSummary({ userProfile, customerWalletId, value, fiatCurrency, payee, selectedType, onSummary, onError }) {
    const requestObject = {
        "customerWalletId": customerWalletId,
        "amount": value,
        "payeeId": payee?.id,
    }
    const methods = {
        'fiat': 'payouts/fiat/fee',
        'crypto': 'payout/crypto/fee'
    }
    if (selectedType === 'fiat' || selectedType === 'crypto') {
        requestObject.fiatCurrency = fiatCurrency
    }
    try {
        const response = await appClientMethods.post(`${methods[selectedType]}`, requestObject);
        onSummary(response)
        return
    } catch (error) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        onError(error.message)
    }
}

const getMerchantLU = async (screenName) => {
    const currency = screenName === 'payoutfiat' ? 'fiat' : 'crypto'
    const response = await appClientMethods.get(`payouts/${currency}/merchant`);
    return response
}

async function getwalletsTotalBalance(setLoader, setData, setError, isLoading, getScreenName) {
    setLoader(isLoading);
    try {
        const actionType = getScreenName?.();
        const response = await appClientMethods.get(`payments/balance?type=${actionType}`);
        setData(response);
    } catch (error) {

        setError(error.message);
    } finally {
        setLoader(false);
    }
}

export const debouncedSummary = debounce(getPayoutSummary)


const handleSampleExcel = async (setErrorMessages) => {
    try {
        setErrorMessages(null);
        const response = await appClientMethods.get(`${ApiControllers.merchant}samplepayeesexcel`);
        if (response) {
            downloadFile(response);
        } else {
            window.scrollTo(0, 0);
            setErrorMessages(response.message);
        }
    } catch (fileError) {
        window.scrollTo(0, 0);
        setErrorMessages(fileError.message);
    }
}
const downloadFile = async (fileInfo) => {
    window.open(fileInfo, '_self');
};

export {
    fetchPayouts, transactionDetailsDwd, getVaults, processPayout, getPayees, getPayoutSummary,
    fetchBatchPayouts, fetchPayins, payinsFormLu, getPayinsVaults, getPaymentDetails, fetchBatchPayoutDetail, batchPayOutMerchatDetails, saveBatchPayment, templateCall,
    getVaultsPayins, getCountriesPayins, getInvoiceCurrencies, getPaymentLinkDetails, getNetworkLuPayins, getStatesPains, getMerchantLU, getwalletsTotalBalance, fiatCurrencys, getFiatPayees, getMember,
    minMaxFiat, getSummaryDetails, createOrUpdatePaymentLink, getStatesOfCountry, getLinkDetails, handleSampleExcel, getCryptoPayees, StaticPreviewPayin, invoicePreviewPayin, getGraphYearLu, payinInvoiceDwd,
    fetchTranscationDetails, payinslookups, getRecentTransactions, getPayinFiatCoins, getPayinFiatTransactions, getFiatCurrencyDetails, getPaymentLinks, getPaymentsInvoices, payinInvoiceFiatDwd
}