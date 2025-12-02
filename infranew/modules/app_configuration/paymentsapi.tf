locals {
  paymentsapi_settings = {
    # ---------------------------------------------------------
    # 1. CORE CONFIGURATION
    # ---------------------------------------------------------
    "Env"                               = upper(var.environment)
    "AppName"                           = "Fast-XE" # Or dynamically "${var.client_name}"
    "BaseCurrency"                      = "USD"
    "ClientId"                          = var.auth0_client_id
    "ClientSecret"                      = var.secret_uris.client_secret_val
    "SecretKey__ClientId"               = var.auth0_client_id
    "SecretKey__ClientSecret"           = var.secret_uris.client_secret_val
    "SecretKey__Url"                    = var.secret_uris.app_secret
    "ProviderName"                      = "Database"

    # ---------------------------------------------------------
    # 2. PAYMENTS SPECIFIC CONFIG
    # ---------------------------------------------------------
    "Ayolinx_Private_Key"               = var.secret_uris.ayolinx_key
    "AyolinxBaseAddress"                = "${var.service_urls.paymentsapi}" # "https://paymentsapi..."
    "AyolinxBaseUrl"                    = var.ayolinx_base_url
    "AyolinxCustomerToken"              = var.secret_uris.ayolinx_token
    
    "BanksWithdrawUrl"                  = "${var.service_urls.banksapi}"
    
    "CoinGeckoBaseUrl"                  = var.coingecko_base_url
    "HyperPayUrl"                       = var.hyperpay_url
    
    "pyrrosclientid"                    = var.pyrros_client_id
    "pyrrosclientsecret"                = var.secret_uris.pyrros_secret
    "pyrrosurl"                         = var.pyrros_url
    
    "Web3ApiKey"                        = var.web3_api_key
    "Web3Exchange"                      = var.web3_exchange_id
    "Web3PaymentLinkUrl"                = var.web3_payment_link_url
    "Web3Payments"                      = var.web3_payments_id

    # ---------------------------------------------------------
    # 3. SENDGRID (Specific Keys)
    # ---------------------------------------------------------
    "SendGrid__AccountSId"              = var.sendgrid_account_sid
    "SendGrid__AuthToken"               = var.secret_uris.sendgrid_token
    "SendGrid__ServiceId"               = var.sendgrid_service_id
    "SendGrid__DynamicTemplateId"       = var.sendgrid_config.template_id
    "SendGrid__FromEmail"               = var.sendgrid_config.from_email
    "SendGrid__FromUserName"            = var.sendgrid_config.from_name

    # ---------------------------------------------------------
    # 4. DYNAMIC URLs
    # ---------------------------------------------------------
    "BaseUrl"                           = "https://apisandbox.spend.stylopay.com/smmaas" # Sample has external, check if intentional
    "CardProviderBaseUrl"               = var.service_urls.cardsapi
    "DocApprovedURL"                    = "${var.service_urls.signalr}/api/notification/DocApproved"
    "DocRequestedURL"                   = "${var.service_urls.signalr}/api/notification/DocRequested"
    "IntegrationURL"                    = "${var.service_urls.integration}/"
    "MestaProviderBaseUrl"              = "${var.service_urls.paymentsapi}/"
    "NotificationURL"                   = "${var.service_urls.signalr}/api/notification/SndMultipleUsers"
    "PaymentLink"                       = "${var.service_urls.paylinks}/"
    "PaymentShortLink"                  = "${var.service_urls.paymentsapi}/api/"
    "ProviderBaseUrl"                   = "${var.service_urls.paymentsapi}/" # Sample points to itself or core?

    # ---------------------------------------------------------
    # 5. SECRETS
    # ---------------------------------------------------------
    "AccountSid"                        = var.secret_uris.twilio_sid
    "AuthToken"                         = var.secret_uris.twilio_auth
    "ConnectionString"                  = var.secret_uris.db_conn
    "ConnectionStrings__DefaultConnection" = "Data Source=localhost;Initial Catalog=MyContactsDB;Integrated Security=True;MultipleActiveResultSets=True" # Sample has LocalDB? Update to var.secret_uris.db_conn if needed.
    "CustomerToken"                     = var.secret_uris.ayolinx_token # Sample mapped CustomerToken to Ayolinx token
    "EasyLink_AppId"                    = var.secret_uris.easylink_key # Double check sample values
    "EasyLink_AppKey"                   = var.secret_uris.easylink_key
    "EasyLink_AppSecret"                = var.secret_uris.easylink_secret
    "EasyLink_BaseUrl"                  = "http://sandbox.easylink.id:9080"
    "Redis__ConnectionString"           = var.secret_uris.redis_conn
    "RestSharpApiConfig__AccessToken"   = var.secret_uris.restsharp_token
    "ServiceId"                         = var.secret_uris.twilio_service
    "StorageAccount__AccountKey"        = var.secret_uris.storage_key
    "StorageAccount__ConnectionStrings" = var.secret_uris.db_conn
    "SUMSUB_APP_TOKEN"                  = var.secret_uris.sumsub_token
    "SUMSUB_SECRET_KEY"                 = var.secret_uris.sumsub_key
    "TokenEncryptkey"                   = var.secret_uris.token_key
    "Vault__ClientSecret"               = var.secret_uris.client_secret_val
    "Vault__Url"                        = var.secret_uris.vault_db_conn

    # ---------------------------------------------------------
    # 6. SERVICE BUS
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
    # 7. FLAGS & PLATFORM
    # ---------------------------------------------------------
    "IsAuthorize"                       = "true"
    "IsCardProvider"                    = "false"
    "IsCommissionAllowed"               = "true"
    "Ismakedummy"                       = "true"
    "IsSandbox"                         = "false"
    "IsCommonFiatWallets"               = "false"
    "IsInlcudeBankAssets"               = "false"
    "RateLimit__Enabled"                = "true"
    "RateLimit__PermitLimit"            = "1000"
    "RateLimit__TimeWindow"             = "1"
    "OperatingSystem"                   = "LINUX"
    
    # App Insights (Raw)
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
    "Serilog__MinimumLevel__Default"                = "Information"
  }
}