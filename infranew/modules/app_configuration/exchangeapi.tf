locals {
  exchangeapi_settings = {
    # ---------------------------------------------------------
    # 1. CORE CONFIGURATION
    # ---------------------------------------------------------
    "Env"                               = upper(var.environment)
    "BaseCurrency"                      = "USD"
    "ClientId"                          = var.auth0_client_id
    "ClientSecret"                      = var.secret_values.client_secret_val
    "SecretKey__ClientId"               = var.auth0_client_id
    "SecretKey__ClientSecret"           = var.secret_values.client_secret_val
    "SecretKey__Url"                    = var.secret_values.app_secret
    
    # --- EXCHANGE SPECIFIC (HARDCODED) ---
    "BuySpreadValue"                    = "1"
    "SellSpreadValue"                   = "1"
    "ExchangeProvider"                  = "StillManDigital"
    "IsCommonFiatWallets"               = "false"
    "IsInlcudeBankAssets"               = "false"

    # ---------------------------------------------------------
    # 2. DYNAMIC URLs
    # ---------------------------------------------------------
    "CardProviderBaseUrl"               = var.service_urls.cardsapi
    "DocApprovedURL"                    = "${var.service_urls.signalr}/api/notification/DocApproved"
    "DocRequestedURL"                   = "${var.service_urls.signalr}/api/notification/DocRequested"
    "IntegrationURL"                    = "${var.service_urls.integration}/"
    "MestaProviderBaseUrl"              = "${var.service_urls.paymentsapi}/"
    "NotificationURL"                   = "${var.service_urls.signalr}/api/notification/SndMultipleUsers"
    "ProviderBaseUrl"                   = var.service_urls.coreapi

    # ---------------------------------------------------------
    # 3. SECRETS (Key Vault Values)
    # ---------------------------------------------------------
    "AccountSid"                        = var.secret_values.twilio_sid
    "AuthToken"                         = var.secret_values.twilio_auth
    "Redis__ConnectionString"           = var.secret_values.redis_conn
    "RestSharpApiConfig__AccessToken"   = var.secret_values.restsharp_token
    "StorageAccount__AccountKey"        = var.secret_values.storage_key
    "StorageAccount__ConnectionStrings" = var.secret_values.db_conn
    "SUMSUB_APP_TOKEN"                  = var.secret_values.sumsub_token
    "SUMSUB_SECRET_KEY"                 = var.secret_values.sumsub_key
    "TokenEncryptkey"                   = var.secret_values.token_key
    "Vault__ClientSecret"               = var.secret_values.client_secret_val
    "Vault__Url"                        = var.secret_values.vault_db_conn

    # ---------------------------------------------------------
    # 4. SERVICE BUS
    # ---------------------------------------------------------
    "AuditlogPublisher__ServiceBusPublisher"       = var.sb_connection_string
    "auditlogs__ServiceBusPublisher"               = var.sb_connection_string
    "BatchPayOutTransactions__ServiceBusPublisher" = var.sb_connection_string
    "buyandsellqueue__ServiceBusPublisher"         = var.sb_connection_string
    "EmailNotifications__ServiceBusPublisher"      = var.sb_connection_string
    "fillgasfee__ServiceBusPublisher"              = var.sb_connection_string
    "KycVerification__ServiceBusPublisher"         = var.sb_connection_string
    "LoyaltyAzureQueue__ServiceBusConnectionString"= var.sb_connection_string
    "merchantwalletsVerification__ServiceBusPublisher" = var.sb_connection_string
    "MestaSenderCreation__ServiceBusPublisher"     = var.sb_connection_string
    "mobilenotifications__ServiceBusPublisher"     = var.sb_connection_string

    "AuditlogPublisher__ServiceBusTopic"           = "auditlogs"
    "auditlogs__ServiceBusTopic"                   = "auditlogs"
    "BatchPayOutTransactions__ServiceBusTopic"     = "BatchPayOutTransactions"
    "EmailNotifications__ServiceBusTopic"          = "emailnotifications"
    "fillgasfee__ServiceBusTopic"                  = "fillgasfee"
    "KycVerification__ServiceBusTopic"             = "kycverification"
    "merchantwalletsVerification__ServiceBusTopic" = "merchantwalletsVerification"
    "MestaSenderCreation__ServiceBusTopic"         = "mestasendercreation"
    "mobilenotifications__ServiceBusTopic"         = "mobilenotifications"

    "buyandsellqueue__ServiceBusQueue"             = "buyandsellqueue"
    "LoyaltyAzureQueue__LoyaltyQueueName"          = "loyaltyprogram"

    # ---------------------------------------------------------
    # 5. AUTH0 & PLATFORM
    # ---------------------------------------------------------
    "Authority"                         = "https://${var.auth0_domain}/"
    "Aut0_audience"                     = "https://${var.client_name}${var.environment}Api.net/"
    "Aut0_Client_id"                    = var.auth0_client_id
    "Aut0_client_secret"                = var.auth0_client_secret
    "Aut0_Connection"                   = "${var.client_name}-${var.environment}"
    "Aut0_grant_type"                   = "client_credentials"
    "Aut0_token_audience"               = "https://yellowblockllp.us.auth0.com/api/v2/"
    "Aut0_token_Client_id"              = var.auth0_client_id
    "Aut0_token_client_secret"          = var.auth0_client_secret
    
    "APPLICATIONINSIGHTS_CONNECTION_STRING"   = var.app_insights_connection_string
    "ApplicationInsights__InstrumentationKey" = var.app_insights_instrumentation_key
    "APPINSIGHTS_INSTRUMENTATIONKEY"          = var.app_insights_instrumentation_key
    
    "ApplicationInsightsAgent_EXTENSION_VERSION"    = "~3"
    "DiagnosticServices_EXTENSION_VERSION"          = "~3"
    "InstrumentationEngine_EXTENSION_VERSION"       = "disabled"
    "SnapshotDebugger_EXTENSION_VERSION"            = "disabled"
    "XDT_MicrosoftApplicationInsights_BaseExtensions" = "disabled"
    "XDT_MicrosoftApplicationInsights_Mode"           = "recommended"
    "XDT_MicrosoftApplicationInsights_PreemptSdk"     = "disabled"
    "Serilog__MinimumLevel__Default"                = "Information"
  }
}