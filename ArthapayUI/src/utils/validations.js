import emojiRegex from 'emoji-regex';
import moment from 'moment';
export const emojiregex = emojiRegex()
export const numberRegex = /^\d+$/;
export const specialCharRegex =  /^[!@#$%^&*()_+{}\[\]:;<>,.?~\\/\|=^-]+$/
export const alphaNumRegex = /^[a-zA-Z0-9]+$/
export const alphaNumWithSpace = /^[a-zA-Z0-9\s]+$/;
export const alphaNumWithUnderscoreAndHyphen = /^[a-zA-Z0-9_\-]+$/;
export const alphaNumSpaceWithUnderscoreAndHyphen = /^[a-zA-Z0-9_\- ]+$/;
export const alphaNumWithSpaceUsHyphenAndAt = /^[a-zA-Z0-9_\-\@ ]+$/
export const alphaNumWithUsHyphenAndAt = /^[a-zA-Z0-9_\-\@]+$/
export const alphaNumWithSpecialChars = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/
export const alphaNumWithSpaceAndSpecialChars = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?\s]+$/
export const alphabetsRegex = /^[a-zA-Z]+$/
export const alphaNumWithSpaceAndHyphen = /^[a-zA-Z0-9\- ]+$/
export const alphabetsWithSpaceRegex = /^[a-zA-Z\s]+$/
export const phoneNoRegex=/^\d{6,12}$/
export const extraSpacesRegex = /[^\S\n]+/g;
export const cityRegex = /^[a-zA-Z\s'-]+$/
export const ccEmailsRegex = /^[\w\.-]+@[\w\.-]+\.\w{2,}(?:,\s*[\w\.-]+@[\w\.-]+\.\w{2,})*$/
export const emailRegex = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,6}$/;
export const taxIdentificationRegex = /^[a-zA-Z0-9\s-]{8,15}$/
export const businessRegNoRegex = /^[a-zA-Z0-9\-\/\. ]+$/
export const nameRegex = /^[A-Za-zÀ-ÿ]+([-'\s][A-Za-zÀ-ÿ]+)*$/
export const favNameRegex = /^[A-Za-zÀ-ÿ0-9]+([-'\s][A-Za-zÀ-ÿ0-9]+)*$/
export const documentNumberRegex = /^[A-Za-z0-9\s\-\/]*$/
export const businessNameRegex=/^[a-zA-Z0-9\s.,&'()-]{2,80}$/
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
    if(value && typeof value==='string'){
        return value.replace(extraSpacesRegex, ' ').trim()
    }
    return  value
}

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

        case "years":
            const yearDiff = date2.getFullYear() - date1.getFullYear();
            if (
                date2.getMonth() < date1.getMonth() ||
                (date2.getMonth() === date1.getMonth() && date2.getDate() < date1.getDate())
            ) {
                return yearDiff - 1;
            }
            return yearDiff;

        case "months":
            const yearDiffInMonths = (date2.getFullYear() - date1.getFullYear()) * 12;
            const monthDiff = date2.getMonth() - date1.getMonth();
            return yearDiffInMonths + monthDiff;

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
    numberValidator: (_, validationHelper = numberValidationHelper) => {
        return () => ({
            validator(__, value) {
                let valueToValidate = value;
                if (typeof value !== 'number') valueToValidate = parseFloat(replaceCommas(value?.toString()))
                const notGreaterThanMaxLimit = valueToValidate <= validationHelper.maxLimit;
                const notLessThanMinLimit = valueToValidate >= validationHelper.minLimit
                if ((!valueToValidate && valueToValidate !== 0) || (notGreaterThanMaxLimit && notLessThanMinLimit)) {
                    return Promise.resolve();
                }
                let error = '';
                if (!notGreaterThanMaxLimit) error = `Cannot exceed ${validationHelper.maxLimitString}`;
                if (!notLessThanMinLimit) error = `Must be greater than ${validationHelper.minLimitString}`
                return Promise.reject(new Error(error));
            },
        })
    },
    textLengthValidator: (fieldName, maxLength = 80) => {
        return () => ({
            validator(_, value) {
                const valueToValidate = value ? value.trim() : value
                if (valueToValidate?.length > maxLength) {
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
                const valueToBeValidated = value ? getValueOf(new Date(value), onlyDate) : null;
                for (let field of validateFields) {
                    const { validateAgainstCurrent, fieldName, value: validateAgainstValue } = field || {};
                    const valueToValidateAgainst = validateAgainstCurrent ? getValueOf(new Date(), onlyDate) : getValueOf(new Date(validateAgainstValue), onlyDate);
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
    regexValidator: (field, regex) => {
        return () => ({
            validator(_, value) {
                if (typeof value !== 'string') {
                    return Promise.resolve();
                }
                const valueToBeValidated = value?.trim() || ''
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
    }
}
export const VERIFICATION_ERROR_MESSAGES = {
    NO_VERIFICATION: "Without Verifications you can't proceed.",
    PHONE_VERIFICATION: "Please verify phone verification code",
    EMAIL_VERIFICATION: "Please verify email verification code",
    VERIFICATIONS_EMPTY: "Without Verifications you can't send. Please select send verifications from the security section",
};

export const VALIDATION_ERROR_MESSAGES = {
    REQUIRED_FIELDS: 'Please fill in all the required fields.',
    ADD_PAYEE_DATA: 'Please add at least one payee data.',
    ENTER_AMOUNT: 'Please enter some amount.',
    INSUFFICIENT_BALANCE: "You don't have sufficient balance in your wallet.",
    CREATE_SUCCESS: 'Batch payout created successfully!',
    UPDATE_SUCCESS: 'Batch payout updated successfully!',
    VALIDATION_ERROR: 'Please ensure all required fields are filled out correctly.',
    PAYEES_UPLOAD_SUCCESS_MESSAGE: "Payees uploaded successfully.",
    UPLOAD_EXCEL_FILE_BEFORE_SAVING: "Please upload an Excel file before saving.",
    ONLY_XLSX_XLS_ALLOWED: "Only .xlsx and .xls files are allowed.",
    PLEASE_SELECT_ONE_RECORD: "Please select one record.",
    FEE_DETAILS_UPDATE_SUCCESS: 'Fee details updated successfully!',
    TEAM_DISABLE_NOT_REGISTERED:'Status cannot be changed for unregistered members.'
};

export const normalizeString = (str) => typeof str==='string' ? str?.toLowerCase() : '';

export const formItemLayoutWithOutLabel = {
    wrapperCol: {
        xs: {
            span: 24,
            offset: 0,
        },
        sm: {
            span: 20,
            offset: 4,
        },
    },
};