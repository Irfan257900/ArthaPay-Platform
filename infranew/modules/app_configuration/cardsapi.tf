locals {
  cardsapi_settings = {
    # ---------------------------------------------------------
    # 1. CORE CONFIGURATION
    # ---------------------------------------------------------
    "Env"                               = upper(var.environment)
    "AppName"                           = "${var.client_name} Money"
    "BaseCurrency"                      = "USD"
    "ClientId"                          = var.auth0_client_id
    "ClientSecret"                      = var.secret_uris.client_secret_val
    "SecretKey__ClientId"               = var.auth0_client_id
    "SecretKey__ClientSecret"           = var.secret_uris.client_secret_val
    "SecretKey__Url"                    = var.secret_uris.app_secret
    
    # --- CARDS SPECIFIC ---
    # These use the new variables we are about to add
    "Private_Key"                       = var.secret_uris.cards_private_key 
    "CustomerToken"                     = var.secret_uris.cards_customer_token
    
    "Web3Exchange"                      = var.web3_exchange_id
    "Web3Payments"                      = var.web3_payments_id
    "Web3ApiKey"                        = var.web3_api_key
    
    "IdentityType"                      = "auth0"
    "IsCardProvider"                    = "true"
    "IsCommissionAllowed"               = "true"
    "IsAuthorize"                       = "true"

    # ---------------------------------------------------------
    # 2. DYNAMIC URLs
    # ---------------------------------------------------------
    "CardProviderBaseUrl"               = var.service_urls.cardsapi
    "ExchangaAPIURL"                    = var.service_urls.exchangeapi
    "IntegrationURL"                    = "${var.service_urls.integration}/"
    "ProviderBaseUrl"                   = var.service_urls.coreapi
    "DocApprovedURL"                    = "${var.service_urls.signalr}/api/notification/DocApproved"
    "DocRequestedURL"                   = "${var.service_urls.signalr}/api/notification/DocRequested"
    "NotificationURL"                   = "${var.service_urls.signalr}/api/notification/SndMultipleUsers"

    # ---------------------------------------------------------
    # 3. STANDARD SECRETS (Key Vault Values)
    # ---------------------------------------------------------
    "AccountSid"                        = var.secret_uris.twilio_sid
    "AuthToken"                         = var.secret_uris.twilio_auth
    "RestSharpApiConfig__AccessToken"   = var.secret_uris.restsharp_token
    "StorageAccount__AccountKey"        = var.secret_uris.storage_key
    "StorageAccount__ConnectionStrings" = var.secret_uris.db_conn
    "TokenEncryptkey"                   = var.secret_uris.token_key
    "Vault__ClientSecret"               = var.secret_uris.client_secret_val
    "Vault__Url"                        = var.secret_uris.vault_db_conn
    "ServiceId"                         = var.secret_uris.twilio_service
    "Url"                               = var.secret_uris.db_conn 

    # ---------------------------------------------------------
    # 4. SERVICE BUS
    # ---------------------------------------------------------
    "auditlogs__ServiceBusPublisher"               = var.sb_connection_string
    "cardsazurequeue__ServiceBusPublisher"         = var.sb_connection_string
    "EmailNotifications__ServiceBusPublisher"      = var.sb_connection_string
    "fillgasfee__ServiceBusPublisher"              = var.sb_connection_string
    "LoyaltyAzureQueue__ServiceBusConnectionString"= var.sb_connection_string

    "auditlogs__ServiceBusTopic"                   = "auditlogs"
    "EmailNotifications__ServiceBusTopic"          = "emailnotifications"
    "fillgasfee__ServiceBusTopic"                  = "fillgasfee"

    "cardsazurequeue__ServiceBusQueue"             = "cardsqueue"
    "LoyaltyAzureQueue__LoyaltyQueueName"          = "loyaltyprogram"

    # ---------------------------------------------------------
    # 5. AUTH0 & PLATFORM
    # ---------------------------------------------------------
    "Authority"                         = "https://${var.auth0_domain}/"
    "Aut0_audience"                     = "https://${var.client_name}${var.environment}.net/"
    "Aut0_Client_id"                    = var.auth0_client_id
    "Aut0_client_secret"                = var.auth0_client_secret
    "Aut0_Connection"                   = "${var.client_name}-${var.environment}" 
    "Aut0_grant_type"                   = "client_credentials"
    "Aut0_token_audience"               = "https://yellowblockllp.us.auth0.com/api/v2/"
    "Aut0_token_Client_id"              = var.auth0_client_id
    "Aut0_token_client_secret"          = var.auth0_client_secret
    
    # App Insights
    "APPLICATIONINSIGHTS_CONNECTION_STRING"   = var.app_insights_connection_string
    "ApplicationInsights__InstrumentationKey" = var.app_insights_instrumentation_key
    "APPINSIGHTS_INSTRUMENTATIONKEY"          = var.app_insights_instrumentation_key
    
    # Platform Flags
    "ApplicationInsightsAgent_EXTENSION_VERSION"    = "~3"
    "DiagnosticServices_EXTENSION_VERSION"          = "~3"
    "InstrumentationEngine_EXTENSION_VERSION"       = "disabled"
    "SnapshotDebugger_EXTENSION_VERSION"            = "disabled"
    "XDT_MicrosoftApplicationInsights_BaseExtensions" = "disabled"
    "XDT_MicrosoftApplicationInsights_Mode"           = "recommended"
    "XDT_MicrosoftApplicationInsights_PreemptSdk"     = "disabled"
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE"             = "false"
    "Serilog__MinimumLevel__Default"                  = "Information"
    
    "StorageAccount__AccountName"       = "st${lower(var.client_name)}${lower(var.environment)}..."
    "StorageAccount__ContainerName"     = "rapidz${lower(var.environment)}"
  }
}