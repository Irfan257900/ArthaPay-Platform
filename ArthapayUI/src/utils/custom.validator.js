
import { addressRegex } from "./addressRegexAndFormats";
import AppDefaults from "./app.config";
import { alphaNumWithSpace } from "./validations";
export const validateContentRule = (_, value) => {
    if(!value || value.trim() === ""){
        return Promise.resolve();
    }
    if (!alphaNumWithSpace.test(value)) {
        return Promise.reject("Please enter valid content");
    }
    return Promise.resolve();
}

export const sixteenMaxAllowedDecimals = (values) => {
    if (!values.value) return true;
    const { floatValue } = values;
    return floatValue <= AppDefaults.SIXTEEN_DECIMAL_ALLOWED;
}
export const cryptoMaxAllowedDecimals = (values) => {
    if (!values.value) return true;
    const { floatValue } = values;
    return floatValue <= AppDefaults.CRYPTO_DECIMALS;
}
export const fiatMaxAllowedDecimals = (values) => {
    if (!values.value) return true;
    const { floatValue } = values;
    return floatValue <= AppDefaults.FIAT_DECIMALS;
}

export const validateAddressType = (value, network) => {
    if (!value || !network) {
      return Promise.resolve();
    }
    const address = value.trim();
    const isValidAddress = addressRegex[network?.toLowerCase()]?.test(address)
    if (!isValidAddress) {
      return Promise.reject("Address is not valid, Please enter a valid address according to the network selected")
    }
    return Promise.resolve();

  };