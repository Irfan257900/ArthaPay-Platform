import { ApiControllers } from "../../../api/config";

// ----------------------- common ------------------------------

export const common = {
    valuts: `${ApiControllers.merchant}GetMerchantDetails`,
    fiatCurrencies: `${ApiControllers.exchangewallet}Exchange/FiatWallets`,
    countryLu: `${ApiControllers.common}CountryLu`,
    statesLu: `${ApiControllers.common}States`,
    networkLu: `${ApiControllers.merchant}NetWorkLookUp`,
    advertisment: `${ApiControllers.dashboard}GetAdvertisements`
}

// ----------------------- Dashboard ------------------------------

export const dashboard = {
    kpiData: `${ApiControllers.dashboard}`,
}
// ----------------------- Pay-Ins ------------------------------
export const payins = {
    invoiceDetails: `${ApiControllers.merchant}InvoiceDetails`,
    staticDetails: `${ApiControllers.merchant}paymentdetail`,
    payinsGridData: `${ApiControllers.merchant}payments`,
    payinStatusChange: `${ApiControllers.common}StateChange/payIn`,
    payinsFormTypeL: `${ApiControllers.merchant}`,
    staticInvoiceDwd: `${ApiControllers.merchant}`
}
// ----------------------- Pay-Outs ------------------------------
export const payouts = {
    savePayout: `${ApiControllers.exchangeTransaction}PaymentWithdraw`,
    transactionDetailsDwd: `${ApiControllers.exchangeTransaction}TemplatesTranction`,
    payoutTransactions: `${ApiControllers.merchant}PayOutTransactions`,
    fetchPayeesLu: `${ApiControllers.exchangewallet}${ApiControllers.payments}Payees`,
    payoutSummary: `${ApiControllers.exchangewallet}`,
    transactionDetails: `${ApiControllers.exchangeTransaction}`
}

// ----------------------- Batch Pay-Outs ------------------------------
export const batchPayouts = {
    CryptoBatchPayments: `${ApiControllers.merchant}CryptoBatchPaymentsK`,
    stateChange: `${ApiControllers.common}`,
    merchantBatchPayOut: `${ApiControllers.merchant}`
}