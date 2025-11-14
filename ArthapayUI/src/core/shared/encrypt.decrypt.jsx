import CryptoJS from "crypto-js";
import { store } from "../../store";
import { isObject } from "../../utils/app.config";

export const decryptAES = (cipherText, secretKey) => {
  secretKey = secretKey || store.getState().userConfig.sk
  try {
    const key = CryptoJS.enc.Utf8.parse(secretKey.replace(/ |-/g, ""));
    const iv = CryptoJS.enc.Utf8.parse("\0".repeat(16));

    const bytes = CryptoJS.AES.decrypt(cipherText, key, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
      iv: iv,
    });
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.log("Decryption failed: " + error.message);
    return cipherText
  }
};

export const encryptAES = (plainText, secretKey) => {
  secretKey = secretKey || store.getState().userConfig.sk
  try {
    const key = CryptoJS.enc.Utf8.parse(secretKey.replace(/ |-/g, ""));
    const iv = CryptoJS.enc.Utf8.parse("\0".repeat(16));
    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
      iv: iv,
    });
    return encrypted.toString();
  } catch (error) {
    console.log("Encryption failed: " + error.message);
    return plainText
  }
};
const methods = {
  encrypt: encryptAES,
  decrypt: decryptAES
}
export const secureData = ({ data, keysToSecure, sKey, type = 'encrypt' }) => {
  try {
    const method = methods[type]
    if (!method) {
      throw new Error(`Invalid method type: ${type}`);
    }
  
    if (!data) {
      throw new Error("Invalid data");
    }
    if (data && !isObject(data)) {
      return method(data, sKey)
    }
    if (Array.isArray(keysToSecure) && keysToSecure.length > 0 && isObject(data)) {
      const dataToUpdate = { ...data }
      keysToSecure.forEach(key => {
        if(key in data){
          dataToUpdate[key] = method(data[key], sKey)
        }
      })
      return dataToUpdate
    }
    return data
  } catch (err) {
    console.log(err.message)
    return data
  }
}