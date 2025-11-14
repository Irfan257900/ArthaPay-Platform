import emojiRegex from 'emoji-regex';
import moment from 'moment';
import { addressRegexBasedOnAsset } from '../../utils/addressRegexAndFormats';
export const emojiregex = emojiRegex()
export const numberRegex = /^\d+$/;
export const specialCharRegex = /^[!@#$%^&*()_+{}\[\]:;<>,.?~\\/\|=^-]+$/
export const alphaNumRegex = /^[a-zA-Z0-9]+$/
export const alphaNumWithSpace = /^[a-zA-Z0-9\s]+$/;
export const alphaNumWithUnderscoreAndHyphen = /^[a-zA-Z0-9_\-]+$/;
export const alphaNumWithUnderscore = /^\w+$/;
export const alphaNumSpaceWithUnderscoreAndHyphen = /^[a-zA-Z0-9_\- ]+$/;
export const alphaNumWithSpaceUsHyphenAndAt = /^[a-zA-Z0-9_\-\@ ]+$/
export const alphaNumWithUsHyphenAndAt = /^[a-zA-Z0-9_\-\@]+$/
export const alphaNumWithSpecialChars = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.\/?]+$/
export const alphaNumWithSpaceAndSpecialChars = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.\/?\s]+$/
export const alphabetsRegex = /^[a-zA-Z]+$/
export const phoneNoRegex = /^\d{6,15}$/
export const phoneNoRegexOtp=/^\d{1,6}$/
export const alphaNumWithSpaceAndHyphen = /^[a-zA-Z0-9\- ]+$/
export const alphabetsWithSpaceRegex = /^[a-zA-Z\s]+$/
export const base64SignRegex = /^[A-Za-z0-9+/]+={0,2}$/;
export const extraSpacesRegex = /[^\S\n]+/g;
export const cityRegex = /^[a-zA-Z\s'-]+$/
export const ccEmailsRegex = /^[\w\.-]+@[\w\.-]+\.\w{2,}(?:,\s*[\w\.-]+@[\w\.-]+\.\w{2,})*$/
export const emailRegex = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,6}$/;
export const taxIdentificationRegex = /^[a-zA-Z0-9\s-]{8,50}$/
export const businessRegNoRegex = /^[a-zA-Z0-9\-\/\. ]+$/
export const nameRegex = /^[A-Za-zÀ-ÿ]+([-'\s][A-Za-zÀ-ÿ]+)*$/
export const favNameRegex = /^[A-Za-zÀ-ÿ0-9]+([-'\s][A-Za-zÀ-ÿ0-9]+)*$/
export const documentNumberRegex = /^[A-Za-z0-9\s\-\/]*$/
export const businessNameRegex = /^[a-zA-Z0-9\s.,&'()-]{2,80}$/
export const websiteRegex=/^(https?|ftp|smtp):\/\/([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(:\d{1,5})?(\/[^\s]*)?$/
export const streetAddressRegex = /^(?=.*[a-zA-Z0-9]{3,})[\x20-\x7F]+$/
export const AddressLineRegex= /^[a-zA-Z0-9\s,'-./#]{3,100}$/
export const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
export const alphaNumberRegex = /^(?![A-Za-z]+$)[A-Za-z0-9]+$/;
export const ibanRegex = /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/; // IBAN Validation Regex
export const regexMap = {
    onlyEmojis: emojiregex,
    onlyNumbers: numberRegex,
    onlySpecialChars: specialCharRegex,
    onlyAlphaNum: alphaNumRegex,
    email: emailRegex,
    onlyAlpha: alphabetsRegex,
    onlyAlphaWithSpace: alphabetsWithSpaceRegex,
    alphaNumWithSpace: alphaNumWithSpace,
    alphaNumWithSpaceUsAndHyphen: alphaNumSpaceWithUnderscoreAndHyphen,
    alphaNumWithOnlyUsAndHyphen: alphaNumWithUnderscoreAndHyphen,
    alphaNumWithSpaceUsHyphenAndAt: alphaNumWithSpaceUsHyphenAndAt,
    alphaNumWithUsHyphenAndAt: alphaNumWithUsHyphenAndAt,
    alphaNumWithSpecialChars: alphaNumWithSpecialChars,
    alphaNumWithSpaceAndSpecialChars: alphaNumWithSpaceAndSpecialChars,
    alphaNumWithSpaceAndHyphen: alphaNumWithSpaceAndHyphen
}
export const dateValidOn = {
    greaterThan: false,
    lessThan: false,
    greaterThanOrEqual: false,
    lessThanOrEqual: false,
    minDifference: 0,
    maxDifference: 0,
    differUnit: 'years'
}
export const numberValidationHelper = {
    maxLimit: 10000000,
    maxLimitString: '10,000,000',
    minLimit: 0,
    minLimitString: '0'
}
const dontAllowChars = ['onlyEmojis', 'onlyNumbers', 'onlySpecialChars']
export const replaceCommas = (value) => {
    if (typeof value === 'string' && value?.includes(',')) {
        return value?.replaceAll(',', '')
    }
    return value
}
export const replaceExtraSpaces = (value) => {
    if (value && typeof value === 'string') {
        return value.replace(extraSpacesRegex, ' ').trim()
    }
    return value
}
export const normalizeString = (str) => typeof str === 'string' ? str?.toLowerCase() : '';

export const normalizeFormattedNumber = (value) => {
    return Number(replaceCommas(value) || 0)
}

const getValueOf = (val, onlyDate) => {
    if (onlyDate && val) {
        return moment(val).startOf('day').valueOf()
    }
    return val ? moment(val).valueOf() : val
}

function getDateDifference(date1, date2, unit) {
    date1 = new Date(date1)
    date2 = new Date(date2)
    const diffInMs = Math.abs(date2 - date1);

    switch (unit) {
        case "days":
            return Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        case "hours":
            return Math.floor(diffInMs / (1000 * 60 * 60));

        case "years":{
            const yearDiff = date2.getFullYear() - date1.getFullYear();
            if (
                date2.getMonth() < date1.getMonth() ||
                (date2.getMonth() === date1.getMonth() && date2.getDate() < date1.getDate())
            ) {
                return yearDiff - 1;
            }
            return yearDiff;
        }
        case "months":{
            const yearDiffInMonths = (date2.getFullYear() - date1.getFullYear()) * 12;
            const monthDiff = date2.getMonth() - date1.getMonth();
            return yearDiffInMonths + monthDiff;
        }
        default:
            return 0
    }
}

const dateValidationChecks = (fieldName, valueToBeValidated, validateAgainstValue, validateAgainstFieldName, validOn) => {
    const { greaterThan, lessThan, greaterThanOrEqual, lessThanOrEqual, minDifference, maxDifference, differUnit } = validOn
    if (valueToBeValidated <= validateAgainstValue && greaterThan) {
        return `${fieldName} must be greater than ${validateAgainstFieldName}`;
    }
    if (valueToBeValidated >= validateAgainstValue && lessThan) {
        return `${fieldName} must be less than ${validateAgainstFieldName}`;
    }
    if (valueToBeValidated < validateAgainstValue && greaterThanOrEqual) {
        return `${fieldName} must be greater than or equal to ${validateAgainstFieldName}`;
    }
    if (valueToBeValidated > validateAgainstValue && lessThanOrEqual) {
        return `${fieldName} must be less than or equal to ${validateAgainstFieldName}`;
    }
    if (greaterThan && (valueToBeValidated - validateAgainstValue) < minDifference) {
        return `${fieldName} must be less than or equal`
    }
    const dateDifference = getDateDifference(valueToBeValidated, validateAgainstValue, differUnit)
    if (minDifference && dateDifference < minDifference) {
        return `${fieldName} must be greater than ${minDifference} ${differUnit}`
    }
    if (maxDifference && (valueToBeValidated - validateAgainstValue) > maxDifference) {
        return `${fieldName} must be less than ${minDifference} ${differUnit}`
    }
    return null;
};
const validateTin = (value) => {

    return taxIdentificationRegex?.test(value);
}

export const validations = {
    requiredValidator: (required = true, message = 'Is required') => {
        return {
            required: required,
            message: message
        }
    },
    AddresspostalCodeValidator: (fieldName) => {
        return () => ({
          validator(_, value) {
            if (
              value &&
              (!alphaNumberRegex.test(value) || value.length < 4 || value.length > 8)
            ) {
              return Promise.reject(new Error(`Invalid ${fieldName}`));
            }
            return Promise.resolve();
          },
        });
      
    },

 


    whitespaceValidator: (fieldName, whitespace = true) => {
        return {
            whitespace,
            message: `Invalid ${fieldName}`
        }
    },
    numberValidator: (fieldName, validationHelper = numberValidationHelper) => {
        return () => ({
            validator(__, value) {
                let valueToValidate = value;
                if (typeof valueToValidate !== 'number') {
                    valueToValidate = parseFloat(replaceCommas(replaceExtraSpaces(value?.toString())))
                }
                if (value && isNaN(valueToValidate)) {
                    return Promise.reject(new Error(`Invalid ${fieldName || 'number'}`))
                }
                const notGreaterThanMaxLimit = valueToValidate <= validationHelper.maxLimit;
                const notLessThanMinLimit = valueToValidate >= validationHelper.minLimit
                if ((!valueToValidate && valueToValidate !== 0) || (notGreaterThanMaxLimit && notLessThanMinLimit)) {
                    return Promise.resolve();
                }
                let error = '';
                if (!notGreaterThanMaxLimit) error = `Cannot exceed ${validationHelper.maxLimitString}`;
                if (!notLessThanMinLimit) error = `Must be ${validationHelper.minLimitString} or higher`
                return Promise.reject(new Error(error));
            },
        })
    },
    textLengthValidator: (fieldName, minLength=0,maxLength = 80) => {
        return () => ({
            validator(_, value) {
                const valueToValidate = value ? value.trim() : value
                if (valueToValidate?.length > maxLength || valueToValidate?.length<minLength) {
                    return Promise.reject(new Error(`Invalid ${fieldName}`));
                }
                return Promise.resolve();
            }
        })
    },
    textValidator: (fieldName, validOn = 'alphaNumWithSpace', allowOnly = []) => {
        return () => ({
            validator(_, value) {
                const valueToValidate = value ? value.trim() : value
                const invalid = !regexMap[validOn].test(valueToValidate);
                const hasInvalidContent = dontAllowChars.some((constraint) => {
                    if (allowOnly.includes(constraint)) {
                        return false
                    }
                    return regexMap[constraint]?.test(valueToValidate);
                })
                if (valueToValidate && (invalid || hasInvalidContent)) {
                    return Promise.reject(new Error(`Invalid ${fieldName}`));
                }
                return Promise.resolve();
            }
        })
    },
    dateValidator: (fieldNameToValidate, validateFields, validOn = dateValidOn) => {
        return () => ({
            validator(_, value) {
                const { onlyDate } = validOn;
                if (!value || !validateFields || validateFields?.length === 0) {
                    return Promise.resolve()
                }
                const valueToBeValidated = value ? getValueOf(value, onlyDate) : null;
                for (let field of validateFields) {
                    const { validateAgainstCurrent, fieldName, value: validateAgainstValue } = field || {};
                    const valueToValidateAgainst = validateAgainstCurrent ? getValueOf(new Date(), onlyDate) : getValueOf(validateAgainstValue, onlyDate)
                    const errorMessage = valueToBeValidated && valueToValidateAgainst && dateValidationChecks(fieldNameToValidate, valueToBeValidated, valueToValidateAgainst, fieldName, validOn)
                    return errorMessage ? Promise.reject(new Error(errorMessage)) : Promise.resolve()
                }
            }
        })
    },
    ccEmailsValidator: () => {
        return () => ({
            validator(_, value) {
                if (value && !ccEmailsRegex.test(value)) {
                    return Promise.reject(new Error('Invalid format'))
                }
                return Promise.resolve()
            }
        })
    },
    cityValidator: (fieldName) => {
        return () => ({
            validator(_, value) {
                if (value && !cityRegex.test(value)) {
                    return Promise.reject(new Error(`Invalid ${fieldName || 'city name'}`))
                }
                return Promise.resolve()
            }
        })
    },
    zipCodeValidator: (fieldName) => {
        return () => ({
            validator(_, value) {
                if (value && !alphaNumRegex.test(value)) {
                    return Promise.reject(new Error(`Invalid ${fieldName}`))
                }
                return Promise.resolve()
            }
        })
    },
    postalCodeValidator: (fieldName) => {
        return () => ({
            validator(_, value) {
                if (value && (!alphaNumRegex.test(value) || value.length < 4 || value.length > 8)) {
                    return Promise.reject(new Error(`Invalid ${fieldName}`))
                }
                return Promise.resolve()
            }
        })
    },
    taxIdentificationValidator: (fieldName) => {
        return () => ({
            validator(_, value) {
                const isValid = value ? validateTin(value) : true
                if (!isValid) {
                    return Promise.reject(new Error(`Invalid ${fieldName}`))
                }
                return Promise.resolve()
            }
        })
    },
    businessRegNoValidator: (fieldName) => {
        return () => ({
            validator(_, value) {
                const isValid = value ? businessRegNoRegex.test(value) : true
                if (!isValid) {
                    return Promise.reject(new Error(`Invalid ${fieldName}`))
                }
                return Promise.resolve()
            }
        })
    },
    invoiceItemsValidator: () => {
        return () => ({
            validator(_, invoiceItems) {
                if (!invoiceItems || invoiceItems.length < 1) {
                    return Promise.reject(new Error('At least one item is required'));
                }
                return Promise.resolve();
            }
        })
    },
    regexValidator: (field, regex, shouldTrim = true) => {
        return () => ({
            validator(_, value) {
                if (typeof value !== 'string') {
                    return Promise.resolve();
                }
                const valueToBeValidated = shouldTrim ? (value?.trim() || '') : value
                if (valueToBeValidated && !regex.test(valueToBeValidated)) {
                    return Promise.reject(new Error(`Invalid ${field}`));
                }
                return Promise.resolve();
            }
        })
    },
    noteEditorValidator: (charsLimit) => {
        return () => ({
            validator(_, value) {
                if (value && value.length > charsLimit) {
                    return Promise.reject(new Error('Please restrict the content to 4000 characters'));
                }
                return Promise.resolve();
            }
        })
    },
    merchantPayeesValidator: () => {
        return () => ({
            validator(_, payeeItems) {
                if (!payeeItems || payeeItems.length < 1) {
                    return Promise.reject(new Error('At least one item is required'));
                }
                return Promise.resolve();
            }
        })
    },
    addressValidator: (fieldName, asset, addressFormat) => {
        return () => ({
            validator(_, value) {
                if (value && !addressRegexBasedOnAsset(asset)?.[addressFormat || 'default']?.test(value)) {
                    return Promise.reject(new Error(`Please Enter a valid ${asset?.toUpperCase()} ${fieldName}`));
                }
                return Promise.resolve();
            }
        })
    },
    signValidator: (fieldName) => {
        return () => ({
            validator(_, value) {
                if (value && !base64SignRegex?.test(value)) {
                    return Promise.reject(new Error(`Please provide valid ${fieldName}`));
                }
                return Promise.resolve();
            }
        })
    },
    emojiRejectValidator: (fieldName) => {
        return () => ({
            validator(_, value) {
                if (value && emojiregex.test(value)) {
                    return Promise.reject(new Error(`Invalid ${fieldName}`));
                }
                return Promise.resolve();
            }
        })
    },
    numberOnlyValidator: (fieldName) => {
        return () => ({
            validator(_, value) {
                if (!value) {
                    return Promise.resolve();
                }
                if (!numberRegex.test(value)) {
                    return Promise.reject(new Error(`Invalid ${fieldName}`));
                }
                if (value?.length < 4 || value?.length > 8) {
                    return Promise.reject(new Error(`Invalid ${fieldName}`));
                }
                return Promise.resolve();
            }
        })
    }
}
export const validateDOB = (_, value) => {
    const age = moment().diff(value, 'years');
    if (value && age < 18) {
        return Promise.reject(new Error('You must be at least 18 years old'));
    }
    return Promise.resolve();
};
export const validateExpiryDate = (_, value) => {
    if (value && moment(value).isBefore(moment(), 'day')) {
        return Promise.reject(new Error('Document expiry date must be in the future'));
    }
    return Promise.resolve();
};

export const validateRegistration = (_, value) => {
    if (value && moment(value).isAfter(moment(), 'day')) {
        return Promise.reject(new Error('Document registration date cannot be in the future'));
    }
    return Promise.resolve();
};
export const validatePhoneNumber = (_, value) => {
    if (!value) {
        return Promise.reject('Is required');
    }
    if (value.length < 6) {
        return Promise.reject('Invalid phone number');
    }
    return Promise.resolve();
};


export const VERIFICATION_ERROR_MESSAGES = {
    NO_VERIFICATION: "Without Verifications you can't proceed.",
    PHONE_VERIFICATION: "Please verify phone verification code",
    EMAIL_VERIFICATION: "Please verify email verification code",
    VERIFICATIONS_EMPTY: "Without Verifications you can't send. Please select send verifications from the security section",
};

export const VALIDATION_ERROR_MESSAGES = {
    INVALID_PHONE: "Invalid phone number",
    REQUIRED_FIELDS: 'Please fill in all the required fields.',
    ADD_PAYEE_DATA: 'Please add at least one payee data.',
    ENTER_AMOUNT: 'Please enter some amount.',
    INSUFFICIENT_BALANCE: "You don't have sufficient balance in your wallet.",
    CREATE_SUCCESS: 'Batch payout created successfully!',
    UPDATE_SUCCESS: 'Batch payout updated successfully!',
    VALIDATION_ERROR: 'Please ensure all required fields are filled out correctly.',
    PAYEES_UPLOAD_SUCCESS_MESSAGE: "Payees uploaded successfully",
    UPLOAD_EXCEL_FILE_BEFORE_SAVING: "Please upload an Excel file before saving.",
    ONLY_XLSX_XLS_ALLOWED: "Only .xlsx and .xls files are allowed.",
    PLEASE_SELECT_ONE_RECORD: "Please select one record.",
};

export const validateAddressType = (value, network) => {
    if (!value || !network) {
        return Promise.resolve();
    }
    const address = value.trim();
    const isValidAddress = addressRegex[network?.toLowerCase()]?.test(address)
    if (!isValidAddress) {
        return Promise.reject("Address is not valid, Please enter a valid address according to the selected network.")
    }
    return Promise.resolve();

};
export const assets = {
    "btc": 'btc',
    'erc-20': 'eth',
    'arbitrum sepolia': 'eth',
    'base sepolia': 'eth',
    'holesky': 'eth',
    'trc-20': 'trx',
    'algo': 'algo',
    'ada': 'cardano',
    'xlm': 'str',
    'sol': 'sol'
}

export const addressRegex = {
    'btc': /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{39,59}|bc1p[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{58})$/,
    'erc-20': /^0x[a-fA-F0-9]{40}$/,
    'arbitrum sepolia': /^0x[a-fA-F0-9]{40}$/,
    'base sepolia': /^0x[a-fA-F0-9]{40}$/,
    'holesky': /^0x[a-fA-F0-9]{40}$/,
    'trc-20': /^(T[1-9A-HJ-NP-Za-km-z]{33}|41[a-fA-F0-9]{40})$/,
    'algo': /^[A-Z2-7]{58}$/,
    'ada': /^((addr1|DdzFFzC)[0-9a-zA-Z]{58,})$/,
    'xlm': /^G[A-Z2-7]{55}$/,
    'sol': /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
    'bep-20': /^0x[a-fA-F0-9]{40}$/,      // BEP-20 (Binance Smart Chain)
    'polygon': /^0x[a-fA-F0-9]{40}$/,      // Polygon (Matic)
}

export const bitcoinAddressFormats = {
    default: /^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    p2pkh: /^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/,  // Legacy
    p2sh: /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/,   // Pay-to-Script-Hash
    bech32m: /^bc1p[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{58}$/,    // Taproot (Bech32m)
    bech32: /^bc1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{39,59}$/,  // SegWit
};
export const tronAddressFormats = {
    default: /^T[1-9A-HJ-NP-Za-km-z]{33}$/,
    base58: /^T[1-9A-HJ-NP-Za-km-z]{33}$/,  // Base58 (starts with 'T')
    hex: /^41[a-fA-F0-9]{40}$/              // Hexadecimal (starts with '41')
};

export const evmAddressFormats = {
    default: /^0x[a-fA-F0-9]{40}$/,
    hexadecimal: /^0x[a-fA-F0-9]{40}$/              // EVM-compatible (starts with '0x')
};

export const stellarAddressFormats = {
    default: /^G[A-Z2-7]{55}$/,
}
export const cardanoAddressFormats = {
    default: /^addr1[0-9a-z]{58,}$/,
    base58: /^DdzFFzC[0-9a-zA-Z]{58,}$/,
    bech32: /^addr1[0-9a-z]{58,}$/,

}
export const algorandAddressFormats = {
    default: /^[A-Z2-7]{58}$/,
}
export const solanaAddressFormats = {
    default: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
}
export const getaddressFormat = (network, address) => {
    const getExactFormat = (formats) => {
        for (const key in formats) {
            if (formats[key].test(address)) {
                return key;
            }
        }
        return null
    }
    switch (network) {
        case 'ERC-20': return getExactFormat(evmAddressFormats);
        case 'BTC': return getExactFormat(bitcoinAddressFormats);
        case 'TRC-20': return getExactFormat(tronAddressFormats);
        case 'Cardano': return getExactFormat(cardanoAddressFormats);
        case 'ALGO': return getExactFormat(algorandAddressFormats);
        case 'XLM': return getExactFormat(stellarAddressFormats);
        case 'SOL': return getExactFormat(solanaAddressFormats)
        case 'BEP-20': return getExactFormat(evmAddressFormats)
        case 'Polygon': return getExactFormat(evmAddressFormats)
        default: return getExactFormat(evmAddressFormats)
    }
}
export const validateContentRules = (_, value) => {
    if (value && !alphaNumWithSpaceAndSpecialChars.test(value)) {
        return Promise.reject("Please enter valid content");
    }
    return Promise.resolve();
}
export const numberValidateContentRules = (_, value) => {
    if (parseFloat(value) <= 0) {
        return Promise.reject("Value must be greater than 0");
    }
    if (parseFloat(value) > 100) {
        return Promise.reject("Value must not exceed 100");
    }
    return Promise.resolve();
}
export const priceNumberValidateContentRules = (_, value) => {
    if (parseFloat(value) < 0) {
        return Promise.reject("Must be greater than or equal to 0");
    }
    return Promise.resolve();
}
export const validateEmail = (_, value) => {
    if (value && !emailRegex.test(value)) {
        return Promise.reject(new Error('Please enter a valid email address'));
    }
    return Promise.resolve();
};

export const convertUTCToLocalTime = (dateString) => {
    let date = new Date(dateString);
    const milliseconds = Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
    );
    return new Date(milliseconds).toISOString()
};

export function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed()) + ' ' + sizes[i];
};
export const getFileType = (base64String) => {
    if (base64String?.startsWith("iVBOR")) return "image";
    if (base64String?.startsWith("/9j/")) return "image";
    if (base64String?.startsWith("JVBER")) return "pdf";
    return "unknown";
};