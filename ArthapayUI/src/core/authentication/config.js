const auth0Config = {
    domain: window.runtimeConfig.VITE_AUTHORITY,
    clientId: window.runtimeConfig.VITE_CLIENT_ID,
    authorizationParams: {
        redirect_uri: `${window.runtimeConfig.VITE_REDIRECT_URI}#login`,
        audience: window.runtimeConfig.VITE_AUDIENCE,
    }
}
export default auth0Config