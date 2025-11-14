import moment from "moment";

const AppDefaults = {
    formats: {
        date: "DD/MM/YYYY",
        datetime: "DD/MM/YYYY HH:mm:ss",
        _date: "DD-MM-YYYY",
        standredUTCDate: "YYYY-MM-DD",
        standredUTCTime: "YYYY-MM-DD HH:MM:SS",
        time: "hh:mm A",
        timeFormat: "HH:mm:ss",
        gridDateFormat: "YYYY-MM-DD",
        gridDateTimeFormat: "YYYY-MM-DDTHH:mm:ss",
        apiDateFormat: "YYYY-MM-DD"
    },
    SIXTEEN_DECIMAL_ALLOWED: 9999999999999999.99,
    CRYPTO_DECIMALS: 9999999999999999.9999,
    FIAT_DECIMALS: 9999999999999999.99,
    GUID_ID: '00000000-0000-0000-0000-000000000000',
    INV_NO: 'INV-XXXX',
    cryptoDecimals: 4,
    fiatDecimals: 2,
    percentageDecimals: 2,
}

export default AppDefaults;

export const coinAddressPatterns = {
    BTC: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/, // Bitcoin addresses start with 1, 3, or bc1
    ETH: /^0x[a-fA-F0-9]{40}$/, // Ethereum addresses start with 0x
    MATIC: /^0x[a-fA-F0-9]{40}$/, // Matic is an Ethereum-based chain
    USDT: /^0x[a-fA-F0-9]{40}$/, // Assuming Ethereum network USDT, this can vary based on network
    USDC: /^0x[a-fA-F0-9]{40}$/, // Assuming Ethereum network USDC
    XLM: /^G[a-zA-Z0-9]{55}$/, // Stellar addresses start with G
    ALGO: /^[A-Z2-7]{58}$/, // Algorand addresses
    ADA: /^addr1[0-9a-zA-Z]{58}$/ // Cardano Shelley addresses start with addr1
};

export const fiatCurrencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CHF: '₣',
    usd: '$',
    eur: '€',
    gbp: '£',
    chf: '₣',
}
const iconMappings = {
    deposit: "notificationdeposit",
    withdraw: "notificationwithdraw",
    topup: "notificationtopup",
    buy: "notificationbuy",
    sell: "notificationsell",
    "apply card": "notificationapplycard",
    "card apply": "notificationapplycard",
    "card activation": "notificationcardactive",
    cases: "notificationcases",
    "membership upgrade": "notificationupgrade",
    "membership purchase": "notificationpurchase",
    "account creation": "notificationaccountcreation",
    "kyc": "notificationkyc",
    "kyb": "notificationkyc",
    "affiliate status activated": "notificationaffiliateactive",
    "affiliate": "notificationaffiliateactive",
    "card recharge": "notificationcardrecharge",
    "recharge": "notificationcardrecharge",
    "payee rejected": "notificationpayeerejected",
    "payee approved": "notificationpayeeApproved",
    "rejected": "notificationpayeerejected",
    "approved": "notificationpayeeApproved",
    "exchange wallet transfer": "exchangewallettransfer",
    "payments": "notificationdeposit",
    "payoutfiat": "notificationwithdraw",
    "payout fiat":"notificationwithdraw",
    "payoutcrypto": "notificationwithdraw",
    "payout crypto":"notificationwithdraw",
    "sumsub": "notificationsumsub",
    "SumSub": "notificationsumsub",
    "Payee Submitted": "notificationpayeesubmitted",
    "payee submitted": "notificationpayeesubmitted",
    "freezed": "notificationfreezed",
    "payee pending": "notificationpayeepending",
    "card apply": "notificationcardapply",
    "cards apply": "notificationcardapply",
    "xyz vip cards activation successful": "notificationcardsactivation",
    "customer": "notificationcustomer",
    "business":"notificationaccountcreation",
    "air-wallex mesh card online payment":"notificationcardOnlinePayments",
};

export const getNotificationIcon = (notification, isToaster = false) => {
    const notificationKey = notification?.toLowerCase();

    for (const [key, value] of Object.entries(iconMappings)) {
        if (notificationKey.includes(key)) {
            return isToaster ? `icon right${value}` : value;
        }
    }
    return "";
};

export const genderLookup = [
    { name: "Male", code: "male" },
    { name: "Female", code: "female" },
    { name: "Others", code: "others" },
];

export const isEmptyObject = (obj) => {
    return typeof obj === 'object' ? Object.keys(obj)?.length === 0 : true
}

export const getCurrentDateIso = () => {
    return new Date().toISOString()
}

export const truncateText = (text, length = 50, displayEllipses = true) => {
    if (text && typeof text === 'string' && text.length > length) {
        return displayEllipses ? `${text.slice(0, length)}...` : text.slice(0, length)
    }
    return text
}

export function isObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export const listDataGenerator = (length, key = "Key") => {
    return Array.from({ length }).map((_, i) => ({
        key: `${key}${i + 1}`,
        id: `${key}${i + 1}`,
    }));
}

export const formatDate = (date, inputFormat, format = AppDefaults.formats.date) => {
    if (!date) return '';

    const momentObj = inputFormat
        ? moment(date, inputFormat)
        : moment(date);

    return momentObj.isValid() ? momentObj.format(format) : '';
};