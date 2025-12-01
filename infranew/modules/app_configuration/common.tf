locals {
  common_app_settings = {
    # ---------------------------------------------------------
    # 1. CORE & ENVIRONMENT
    # ---------------------------------------------------------
    "Env"                               = upper(var.environment)
    "BaseCurrency"                      = "USD"
    "ClientHashId"                      = "Burgo Blan"
    "ClientId"                          = "d0b2254-7347-4518-9482-32404981ca0f"
    "CustomerToken"                     = "bc36ea33c7397da280c4cabb91840ef7c28239d0c83d2b97f7a828a457c43797"
    "IdentityType"                      = "auth0"
    "Provider"                          = "Fireblocks"
    "RiskScore"                         = "80"
    "RetryCount"                        = "4"
    "SubUrl"                            = ""
    "TimeOutinMilliseconds"             = "50400"
    "X_Client_Name"                     = "Musala Ravikiran"
    "X_Request_Id"                      = "03727c-ffb8-4440-86c0-c875d1fda254"
    "TronScanExplorer"                  = "https://shasta.tscan.org/#/transaction/"
    "EasyLink_AppId"                    = "ERShl3REdW5HFB"
    "EasyLink_BaseUrl"                  = "http://sdbox.easylink.id:9080"
    "AML__AccessId"                     = "B8D4A-264E4-AD636"
    "AML__ServerUrl"                    = "https://extrnlapiendpoint.silencatech.com"
    "SUMSUB_TEST_BASE_URL"              = "https://api.sumsub.com"
    "RestSharpApiConfig__BaseUrl"       = "https://superhedpi.com/api/"
    
    # ---------------------------------------------------------
    # 2. FEATURE FLAGS (Booleans)
    # ---------------------------------------------------------
    "AzureStorageEnabled"               = "false"
    "IsAMLEnabled"                      = "true"
    "IsAuthorize"                       = "true"
    "IsCardProvider"                    = "true"
    "IsCommissionAllowed"               = "true"
    "IsPhoneNumberUnique"               = "true"
    "IsSandbox"                         = "false"
    "Redis__IsEnable"                   = "true"
    "UseCustomizationData"              = "false"
    "UseVault"                          = "false"
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
    "RateLimit__Enabled"                = "true"
    "RateLimit__PermitLimit"            = "1000"
    "RateLimit__TimeWindow"             = "1"

    # ---------------------------------------------------------
    # 3. KEY VAULT REFERENCES (Mapped from var.secret_uris)
    # ---------------------------------------------------------
    "AccountSid"                        = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.twilio_sid})"
    "AuthToken"                         = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.twilio_auth})"
    "ServiceId"                         = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.twilio_service})"
    "SUMSUB_APP_TOKEN"                  = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.sumsub_token})"
    "SUMSUB_SECRET_KEY"                 = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.sumsub_key})"
    "TokenEncryptkey"                   = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.token_key})"
    "SecretKey__Url"                    = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.app_secret})"
    "powerbi__pbiPassword"              = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.powerbi_pass})"
    "StorageAccount__AccountKey"        = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.storage_key})"
    
    # DB Connections
    "ConnectionStrings__DefaultConnection" = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.db_conn})"
    "ConnectionString"                     = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.db_conn})"
    "StorageAccount__ConnectionStrings"    = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.db_conn})"
    
    # Infra & API Keys
    "Redis__ConnectionString"           = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.redis_conn})"
    "Vault__Url"                        = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.vault_db_conn})"
    "ApiKey"                            = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.general_api_key})"
    "APISecretKey"                      = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.general_api_secret})"
    "ClientSecret"                      = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.client_secret_val})"
    "Vault__ClientSecret"               = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.client_secret_val})"
    "SecretKey__ClientSecret"           = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.client_secret_val})"
    "EasyLink_AppKey"                   = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.easylink_key})"
    "EasyLink_AppSecret"                = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.easylink_secret})"
    
    # New Secrets
    "AML__AccessKey"                    = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.aml_key})"
    "Password"                          = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.app_password})"
    "PasswordHash"                      = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.app_password_hash})"
    "Private_Key"                       = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.private_key})"
    "public_Key"                        = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.public_key})"
    "RestSharpApiConfig__AccessToken"   = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.restsharp_token})"
    "X_Api_Key"                         = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.x_api_key})"

    # ---------------------------------------------------------
    # 4. DYNAMIC URLs (Mapped from var.service_urls)
    # ---------------------------------------------------------
    "ActivityLog__LogUrl"               = "${var.service_urls.banksapi}/api/"
    "BaseUrl"                           = var.service_urls.coreapi
    "CardProviderBaseUrl"               = var.service_urls.cardsapi
    "ExchangaAPIURL"                    = var.service_urls.exchangeapi
    "ExchangaPayAPIURL"                 = var.service_urls.exchangeapi
    "IntegrationURL"                    = "${var.service_urls.integration}/"
    "PaymentUrl"                        = var.service_urls.paymentsapi
    "MestaProviderBaseUrl"              = "${var.service_urls.paymentsapi}/"
    "ProviderBaseUrl"                   = var.service_urls.coreapi
    "DocApprovedURL"                    = "${var.service_urls.signalr}/api/notification/DocApproved"
    "DocRequestedURL"                   = "${var.service_urls.signalr}/api/notification/DocRequested"
    "NotificationURL"                   = "${var.service_urls.signalr}/api/notification/SndMultipleUsers"

    # ---------------------------------------------------------
    # 5. AUTH0 & POWER BI
    # ---------------------------------------------------------
    "Authority"                         = "https://${var.auth0_domain}/"
    "Aut0_audience"                     = "https://${var.client_name}${var.environment}.net/"
    "Aut0_Client_id"                    = var.auth0_client_id
    "Aut0_client_secret"                = var.auth0_client_secret
    "Aut0_Connection"                   = "${var.client_name}-${var.environment}"
    "Aut0_grant_type"                   = "client_credentials"
    "Aut0_scope"                        = "openid profile email"
    "Aut0_token_audience"               = "https://yellowblockllp.us.auth0.com/api/v2/"
    "Aut0_token_Client_id"              = var.auth0_client_id
    "Aut0_token_client_secret"          = var.auth0_client_secret
    "SecretKey__ClientId"               = var.auth0_client_id
    "Vault__ClientId"                   = var.auth0_client_id
    "Vault__Name"                       = "DevKeyvaultSb"

    "powerbi__apiUrl"                   = "https://api.powerbi.com"
    "powerbi__applicationId"            = "c56403f5-32ee-45cf-a45e-d0e44e34f6b1"
    "powerbi__AuthenticationType"       = "MasterUser"
    "powerbi__authorityUrl"             = "https://login.windows.net/common/oauth2/token/"
    "powerbi__pbiUsername"              = "${var.environment}${var.client_name}@yellowblock.net"
    "powerbi__resourceUrl"              = "https://analysis.windows.net/powerbi/api"
    
    # ---------------------------------------------------------
    # 6. STORAGE & LOGGING
    # ---------------------------------------------------------
    "StorageAccount__AccountName"       = "st${lower(var.client_name)}${lower(var.environment)}${substr(md5(timestamp()), 0, 3)}" # Approximate, usually passed via var
    "StorageAccount__ContainerName"     = "rapidz${lower(var.environment)}"
    
    "Serilog__MinimumLevel__Default"    = "Warning"
    "Serilog__SeqServerUrl"             = "http://localhost:5341"
    "Serilog__Using__0"                 = "Serilog.Sinks.Console"
    "Serilog__Using__1"                 = "Serilog.Sinks.File"
    "Serilog__Using__2"                 = "Serilog.Sinks.ApplicationInsights"
    "Serilog__MinimumLevel__WriteTo__1__Name" = "ApplicationInsights"
    "Serilog__MinimumLevel__WriteTo__1__Args__telemetryConverter" = "Serilog.Sinks.ApplicationInsights.Sinks.ApplicationInsights.TelemetryConverters.TraceTelemetryConverter, Serilog.Sinks.ApplicationInsights"

    # ---------------------------------------------------------
    # 7. SERVICE BUS (Using var.sb_connection_string)
    # ---------------------------------------------------------
    # Publishers
    "aMLRiskScoreExchangaPay__ServiceBusPublisher"     = var.sb_connection_string
    "auditlogs__ServiceBusPublisher"                   = var.sb_connection_string
    "cardsactionqueue__ServiceBusPublisher"            = var.sb_connection_string
    "depositandwithdrawqueue__ServiceBusPublisher"     = var.sb_connection_string
    "EmailNotifications__ServiceBusPublisher"          = var.sb_connection_string
    "fillgasfee__ServiceBusPublisher"                  = var.sb_connection_string
    "KycVerification__ServiceBusPublisher"             = var.sb_connection_string
    "LoyaltyAzureQueue__ServiceBusConnectionString"    = var.sb_connection_string
    "merchantwalletsVerification__ServiceBusPublisher" = var.sb_connection_string
    "mestaAzureQueue__ServiceBusPublisher"             = var.sb_connection_string
    "MestaSenderCreation__ServiceBusPublisher"         = var.sb_connection_string
    "mobilenotifications__ServiceBusPublisher"         = var.sb_connection_string

    # Topic Names (Static Strings)
    "aMLRiskScoreExchangaPay__ServiceBusTopic"         = "amlriskscore"
    "auditlogs__ServiceBusTopic"                       = "auditlogs"
    "EmailNotifications__ServiceBusTopic"              = "emailnotifications"
    "fillgasfee__ServiceBusTopic"                      = "fillgasfee"
    "KycVerification__ServiceBusTopic"                 = "kycverification"
    "merchantwalletsVerification__ServiceBusTopic"     = "merchantwalletsVerification"
    "MestaSenderCreation__ServiceBusTopic"             = "mestasendercreation"
    "mobilenotifications__ServiceBusTopic"             = "mobilenotifications"

    # Queue Names (Static Strings)
    "cardsactionqueue__ServiceBusQueue"                = "cardsqueue"
    "depositandwithdrawqueue__ServiceBusQueue"         = "depositandwithdrawqueue"
    "LoyaltyAzureQueue__LoyaltyQueueName"              = "loyaltyprogram"
    "mestaAzureQueue__ServiceBusQueue"                 = "orderqueue"
  }
}