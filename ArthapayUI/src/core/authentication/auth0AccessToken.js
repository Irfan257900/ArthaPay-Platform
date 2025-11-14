// src/utils/auth0AccessToken.js
let getAccessTokenSilentlyFunction = null;

export const setGetAccessTokenSilently = (func) => {
  getAccessTokenSilentlyFunction = func;
};

export const getAccessTokenSilentlyGlobal = async (...args) => {
  if (!getAccessTokenSilentlyFunction) {
    console.warn("getAccessTokenSilentlyFunction is not set. Ensure Auth0ProviderWrapper is mounted.");
    return null;
  }
  return getAccessTokenSilentlyFunction(...args);
};