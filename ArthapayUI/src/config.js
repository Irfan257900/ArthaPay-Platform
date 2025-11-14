// This config supports both Docker-injected runtime config and Vite build-time env variables.

const env = typeof window !== "undefined" && window.runtimeConfig
    ? window.runtimeConfig
    : import.meta.env;
    
// Always assign to window.runtimeConfig for global access
if (typeof window !== "undefined") {
    window.runtimeConfig = {
        "PORT": env.PORT,

        // Client Name For CSS and Images
        "VITE_CLIENT": env.VITE_CLIENT,

        // API Endpoints (Core/Primary)
        "VITE_API_END_POINT": env.VITE_API_END_POINT,
        "VITE_BANK_API_END_POINT": env.VITE_BANK_API_END_POINT,
        "VITE_API_END_POINT_CARD": env.VITE_API_END_POINT_CARD,
        
        // Credentials
        "PRIVATE_KEY": env.PRIVATE_KEY,
        
        // IP GeoLocation
        "VITE_IPREGISTERY_KEY": env.VITE_IPREGISTERY_KEY,
        "VITE_IPSTACK_KEY": env.VITE_IPSTACK_KEY, // Old Key
        "VITE_IPSTACK_ACCESS_KEY": env.VITE_IPSTACK_ACCESS_KEY, // New Key
        "VITE_IPSTACK_API": env.VITE_IPSTACK_API,
        
        // Misc/Legacy Endpoints
        "VITE_GRID_API": env.VITE_GRID_API,
        "VITE_BANK": env.VITE_BANK,
        
        // App Details
        "VITE_APP_ID": env.VITE_APP_ID,
        "VITE_UPLOAD_API": env.VITE_UPLOAD_API, // Old Upload API
        "VITE_UPLOAD_API_END_POINT": env.VITE_UPLOAD_API_END_POINT, // New Upload API
        "VITE_CARD_BG_IMG": env.VITE_CARD_BG_IMG,
        "IS_SETTINGS": env.IS_SETTINGS,
        "VITE_DATETIME_FORMAT": env.VITE_DATETIME_FORMAT,
        "VITE_DATE_FORMAT": env.VITE_DATE_FORMAT,
        "VITE_DECIMALS_ENABLED": env.VITE_DECIMALS_ENABLED,

        // App/Client URLs
        "VITE_APP_URL": env.VITE_APP_URL,
        "VITE_ADMIN_URL": env.VITE_ADMIN_URL,
        "VITE_PROFILE_URL": env.VITE_PROFILE_URL, // Added from 2nd file

        // Auth details (VITE_AUTH0_ keys are often required by the library)
        "VITE_AUTH0_AUTHORITY": env.VITE_AUTH0_AUTHORITY,
        "VITE_AUTH0_CLIENT_ID": env.VITE_AUTH0_CLIENT_ID,
        "VITE_AUTH0_AUDIENCE": env.VITE_AUTH0_AUDIENCE,
        
        // Auth details (Simplified Keys)
        "VITE_AUTHORITY": env.VITE_AUTHORITY,
        "VITE_CLIENT_ID": env.VITE_CLIENT_ID,
        "VITE_AUDIENCE": env.VITE_AUDIENCE,

        "VITE_IS4_AUTHORITY": env.VITE_IS4_AUTHORITY,
        "VITE_IS4_CLIENT_ID": env.VITE_IS4_CLIENT_ID,
        "VITE_REDIRECT_URI": env.VITE_REDIRECT_URI,
        "VITE_SILENT_REDIRECT_URI": env.VITE_SILENT_REDIRECT_URI,
        "VITE_IDENTITY_SERVICE": env.VITE_IDENTITY_SERVICE,
        "VITE_AFFILIATE_TENET": env.VITE_AFFILIATE_TENET,
        "VITE_IS_MLM": env.VITE_IS_MLM,

        // Web3 Settings
        "VITE_WALLET_TYPE": env.VITE_WALLET_TYPE,
        "VITE_ARCANA_CLIENT_ID": env.VITE_ARCANA_CLIENT_ID,
        "VITE_ARCANA_ID": env.VITE_ARCANA_ID,
        "VITE_OWNER_ACCOUNT_WALLET_ADDRESS": env.VITE_OWNER_ACCOUNT_WALLET_ADDRESS,
        "VITE_WEB3_WALLET_ID": env.VITE_WEB3_WALLET_ID,
        "VITE_TREZOR_EMAIL": env.VITE_TREZOR_EMAIL,
        "VITE_WEB3_API_END_POINT": env.VITE_WEB3_API_END_POINT,
        "VITE_WEB3_API_EXCHANGE_END_POINT": env.VITE_WEB3_API_EXCHANGE_END_POINT,
        "VITE_WEB3_API_BANKS_END_POINT": env.VITE_WEB3_API_BANKS_END_POINT,

        // Core Endpoints
        "VITE_CORE_API_END_POINT": env.VITE_CORE_API_END_POINT,
        "VITE_API_PAYMENTS_END_POINT": env.VITE_API_PAYMENTS_END_POINT,
        "VITE_API_EXCHANGE_END_POINT": env.VITE_API_EXCHANGE_END_POINT,
        "VITE_API_BANKS_END_POINT": env.VITE_API_BANKS_END_POINT,
        "VITE_API_CARDS_END_POINT": env.VITE_API_CARDS_END_POINT,

        // Notifications & Loyalty
        "VITE_NOTIFICATION_HUB": env.VITE_NOTIFICATION_HUB,
        "VITE_API_NOTIFICATIONS_END_POINT": env.VITE_API_NOTIFICATIONS_END_POINT,
        "VITE_API_LOYALTY_END_POINT": env.VITE_API_LOYALTY_END_POINT, // Old Key
        "VITE_API_LOYALITY_END_POINT": env.VITE_API_LOYALITY_END_POINT, // New Key
        
        // Client/Branding Details
        "VITE_CLIENT_NAME": env.VITE_CLIENT_NAME,
        "VITE_FAV_ICON": env.VITE_FAV_ICON, // Old Favicon Key
        "VITE_CLIENT_FAVICON": env.VITE_CLIENT_FAVICON, // New Favicon Key
        "VITE_LOGO_URL_LIGHT": env.VITE_LOGO_URL_LIGHT,
        "VITE_LOGO_URL_DARK": env.VITE_LOGO_URL_DARK,
        "VITE_CLIENT_META_DESCRIPTION": env.VITE_CLIENT_META_DESCRIPTION,
        
        // Miscellaneous Flags
        "VITE_NAME": env.VITE_NAME,
        "VITE_SEND_VERIFICATION_HIDE": env.VITE_SEND_VERIFICATION_HIDE,
        "VITE_APP_KYC_KYB_PROVIDER": env.VITE_APP_KYC_KYB_PROVIDER,
        "VITE_APP_SUMSUB_KYB_FLOW": env.VITE_APP_SUMSUB_KYB_FLOW,
        "VITE_APP_SUMSUB_KYC_FLOW": env.VITE_APP_SUMSUB_KYC_FLOW,
        "VITE_APP_PAYEE_ON_THE_GO_MODE": env.VITE_APP_PAYEE_ON_THE_GO_MODE,
        "VITE_NODE_ENV": env.VITE_NODE_ENV,
        "VITE_APP_EXCHANGE_ON_THE_GO_MODE": env.VITE_APP_EXCHANGE_ON_THE_GO_MODE,
        "VITE_APP_SMALL_DECIMALS_ENABLED": env.VITE_APP_SMALL_DECIMALS_ENABLED,
        "VITE_APP_IS_SHOW_PAYIN_FIAT": env.VITE_APP_IS_SHOW_PAYIN_FIAT,
        "VITE_APP_IS_QUICKLICKS_ENABLED": env.VITE_APP_IS_QUICKLICKS_ENABLED
    };
}