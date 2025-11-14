import { WebStorageStateStore } from 'oidc-client';
import { createUserManager } from 'redux-oidc';
const config = {
    authority: window.runtimeConfig.VITE_AUTHORITY,
    client_id: window.runtimeConfig.VITE_CLIENT_ID,
    redirect_uri: window.runtimeConfig.VITE_REDIRECT_URI,
    response_type: "id_token token",
    scope: "openid profile offline_access",
    silent_redirect_uri: window.runtimeConfig.VITE_SILENT_REDIRECT_URI,
    automaticSilentRenew: true,
    userStore: new WebStorageStateStore({ store: window.localStorage }),
    silentRequestTimeout: 30000,
}
const userManager = createUserManager(config);
export { userManager }