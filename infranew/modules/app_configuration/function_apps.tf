locals { 
  marketdata_settings = {} 
  subscriber_settings = {
    # ---------------------------------------------------------
    # 1. CORE CONFIGURATION
    # ---------------------------------------------------------
    "Env"                               = upper(var.environment)
    "AppName"                           = var.company_name
    "CompanyName"                       = var.company_name
    "CompanyLogo"                       = var.company_logo_url
    "BaseCurrency"                      = "USD"
    "EmployeeDefaultPassword"           = "Welcome${var.client_name}@123"
    "GasMultiplier"                     = "1.2"
    "IdentityType"                      = "auth0"
    "CustodianAccount"                  = "Fireblocks"

    # ---------------------------------------------------------
    # 2. DYNAMIC URLs (Inter-Service Config)
    # ---------------------------------------------------------
    "ApiUrl"                            = "${var.service_urls.coreapi}/"
    "RestAPIURL"                        = var.service_urls.coreapi
    "ProviderBaseUrl"                   = "${var.service_urls.paymentsapi}/"
    "CallbackUrl"                       = "https://${lower(var.environment)}.${lower(var.client_name)}.money" # e.g. tst.artha.money
    "DocApprovedURL"                    = "${var.service_urls.signalr}/api/notification/DocApproved"
    "IntegrationURL"                    = var.service_urls.integration # or specific external URL if needed

    # ---------------------------------------------------------
    # 3. AUTH0
    # ---------------------------------------------------------
    "Authority"                         = "https://${var.auth0_domain}/"
    "Aut0_audience"                     = "https://${var.client_name}${var.environment}.net/"
    "Aut0_Client_id"                    = var.auth0_client_id
    "Aut0_client_secret"                = var.auth0_client_secret
    "Aut0_Connection"                   = "${var.client_name}-${var.environment}"
    "Aut0_grant_type"                   = "client_credentials"
    
    # ---------------------------------------------------------
    # 4. SECRETS (Key Vault)
    # ---------------------------------------------------------
    # "Url" in your sample pointed to a DB connection string secret
    "Url"                               = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.db_conn})"
    "ClientSecret"                      = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.client_secret_val})"
    "TokenEncryptkey"                   = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.token_key})"
    "firebaseserverKey"                 = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.firebase_key})"

    # ---------------------------------------------------------
    # 5. SERVICE BUS (Listeners & Topics)
    # ---------------------------------------------------------
    # All Listeners share the main connection string
    "AMLRiskScoreServiceBusListener"                      = var.sb_connection_string
    "AuditlogsServiceBusListner"                          = var.sb_connection_string
    "AveniaSubAccountCreationListener"                    = var.sb_connection_string
    "CardsActionsQueueServiceBusListener"                 = var.sb_connection_string
    "DepositandWithdrawQueueServiceBusListener"           = var.sb_connection_string
    "EmailnotificationsServiceBusListener"                = var.sb_connection_string
    "FillGasFeeServiceBusListener"                        = var.sb_connection_string
    "KycandKybVerificationActionsQueueServiceBusListener" = var.sb_connection_string
    "KycServiceBusListener"                               = var.sb_connection_string
    "MerchantsServiceBusListner"                          = var.sb_connection_string
    "MestaSenderCreationListener"                         = var.sb_connection_string
    "MobileNotificationServiceBusListener"                = var.sb_connection_string
    "RegisterPayeesOnBankAccountServiceBusListener"       = var.sb_connection_string

    # Topic Names
    "AMLRiskScoreServiceBusTopic"                         = "amlriskscore"
    "AuditlogsServiceBusTopic"                            = "auditlogs"
    "AveniaSubAccountCreation"                            = "aveniasubaccountcreation"
    "CardsActionsQueueServiceBusTopic"                    = "cardsqueue" # Note: Mapped to Queue name as per sample
    "DepositandWithdrawQueueServiceBusTopic"              = "depositandwithdrawqueue"
    "EmailnotificationsServiceBusTopic"                   = "emailnotifications"
    "FillGasFeeServiceBusTopic"                           = "fillgasfee"
    "KycandKybVerificationActionsQueueServiceBusTopic"    = "kycandkybverification"
    "KycServiceBusTopic"                                  = "kycverification"
    "MerchantsServiceBusTopic"                            = "merchantwalletsVerification"
    "MestaSenderCreation"                                 = "mestasendercreation"
    "MobileNotificationServiceBusTopic"                   = "mobilenotifications"
    "RegisterPayeesOnBankAccountServiceBusTopic"          = "payeesonbankaccount"

    # Subscription Names
    "AMLRiskScoreServiceBusSubscription"                  = "amlriskscoreSubscriber"
    "AuditlogsServiceBusSubscription"                     = "AuditlogsSubscriber"
    "AveniaSubAccountCreationSubscription"                = "AveniaSubAccountCreationSubscription"
    "EmailnotificationsServiceBusSubscription"            = "EmailNotificationsSubscription"
    "FillGasFeeServiceBusSubscription"                    = "fillgasSubscriber-subscription"
    "KycServiceBusSubscription"                           = "kycverification-subscription"
    "MerchantsServiceBusSubscription"                     = "merchantwalletsVerification-subscription"
    "MestaSenderCreationSubscription"                     = "MestaSenderCreationSubscription"
    "MobileNotificationServiceBusSubscription"            = "mobilenotificationsSubscriber"
    "RegisterPayeesOnBankAccountServiceBusSubscription"   = "PayeesOnBankAccountSubscription"

    # ---------------------------------------------------------
    # 6. WEBJOBS / TRIGGER TOGGLES (0=Enabled, 1=Disabled)
    # ---------------------------------------------------------
    "AzureWebJobs.AMLRiskScore.Disabled"                  = "0"
    "AzureWebJobs.AuditlogsInsertion.Disabled"            = "0"
    "AzureWebJobs.BatchPayOutTransaction.Disabled"        = "1"
    "AzureWebJobs.BinaryMembersNetwork.Disabled"          = "1"
    "AzureWebJobs.BuySell.Disabled"                       = "1"
    "AzureWebJobs.CardConsumeBonus.Disabled"              = "1"
    "AzureWebJobs.ConsumerBonusCalculation.Disabled"      = "1"
    "AzureWebJobs.ConsumerBonusDistribution.Disabled"     = "1"
    "AzureWebJobs.CouponExpirationUpdate.Disabled"        = "1"
    "AzureWebJobs.CustomerBonusCalculation.Disabled"      = "1"
    "AzureWebJobs.CustomerKycQueue.Disabled"              = "1"
    "AzureWebJobs.DepositandWithdrawQueue.Disabled"       = "0"
    "AzureWebJobs.DocuSign.Disabled"                      = "1"
    "AzureWebJobs.ImportTransaction.Disabled"             = "1"
    "AzureWebJobs.MemberKycVerification.Disabled"         = "0"
    "AzureWebJobs.MemberNetworks.Disabled"                = "1"
    "AzureWebJobs.MLMDividendBonusJob.Disabled"           = "1"
    "AzureWebJobs.SaveCustomerBonus.Disabled"             = "1"
    "AzureWebJobs.WalletTransfer.Disabled"                = "1"

    # ---------------------------------------------------------
    # 7. PLATFORM SETTINGS
    # ---------------------------------------------------------
    "FUNCTIONS_EXTENSION_VERSION"       = "~4"
    "FUNCTIONS_WORKER_RUNTIME"          = "dotnet"
    "WEBSITE_RUN_FROM_PACKAGE"          = "1"
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "true" # Sample explicitly says true here
    "WEBSITE_ENABLE_SYNC_UPDATE_SITE"   = "true"
  } 
  sweep_settings  = {
    # ---------------------------------------------------------
    # 1. CORE CONFIGURATION
    # ---------------------------------------------------------
    "Provider"                          = "Fireblocks"
    "ClientId"                          = var.auth0_client_id
    "ClientSecret"                      = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.client_secret_val})"
    
    # --- SWEEP SPECIFIC LOGIC ---
    "CollectionVaultId"                 = var.collection_vault_id
    "CollectionWalletPolyGonAddress"    = var.polygon_wallet_address
    "CollectionWalletTRONAddress"       = var.tron_wallet_address
    "FloatAmount"                       = "10000"
    "TriggerAmount"                     = "5000"
    "IsEncrypted"                       = "false"
    "IsTronEngerySweep"                 = "true"

    # ---------------------------------------------------------
    # 2. DYNAMIC URLs
    # ---------------------------------------------------------
    "CardsCoreURL"                      = "${var.service_urls.coreapi}/"
    "RestAPIBankURL"                    = var.service_urls.banksapi
    "RestAPICoreURL"                    = var.service_urls.coreapi
    "RestAPIURL"                        = "${var.service_urls.coreapi}/"
    "IntegrationURL"                    = "${var.service_urls.integration}/"
    "SubUrl"                            = ""

    # ---------------------------------------------------------
    # 3. DATABASE CONNECTION
    # ---------------------------------------------------------
    # Note: Sample uses 'dBConnection' (camelCase), not standard connection string name
    "dBConnection"                      = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.db_conn})"

    # ---------------------------------------------------------
    # 4. SERVICE BUS
    # ---------------------------------------------------------
    # Publishers
    "fillgasfee.ServiceBusPublisher"                  = var.sb_connection_string
    "UpdateCustomerAddressAndStatusServiceBusListener"= var.sb_connection_string

    # Topics
    "fillgasfee.ServiceBusTopic"                      = "fillgasfee"
    "UpdateCustomerAddressAndStatusServiceBusTopic"   = "updatecustomeraddressandstatus"

    # Subscriptions
    "UpdateCustomerAddressAndStatusServiceBusSubscription" = "updatecustomeraddressandstatussubscriber"

    # ---------------------------------------------------------
    # 5. WEBJOBS / TRIGGER TOGGLES
    # ---------------------------------------------------------
    "AzureWebJobs.Activity.Disabled"                  = "1"
    "AzureWebJobs.BanksActivity.Disabled"             = "1"
    "AzureWebJobs.BatchPayOutTransaction.Disabled"    = "1" # From sample list
    # ... (Add other WebJobs disabled flags if strictly needed, otherwise defaults usually 0) ...

    # ---------------------------------------------------------
    # 6. PLATFORM SETTINGS
    # ---------------------------------------------------------
    "FUNCTIONS_EXTENSION_VERSION"       = "~4"
    "FUNCTIONS_WORKER_RUNTIME"          = "dotnet"
    "WEBSITE_RUN_FROM_PACKAGE"          = "1"
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "true"
    "WEBSITE_ENABLE_SYNC_UPDATE_SITE"   = "true"
    
    # App Insights (Modern Connection String)
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = "@Microsoft.KeyVault(SecretUri=${var.secret_uris.app_insights_connection_string})" 
    # Note: Ensure app_insights_connection_string is passed in secret_uris map if you want to use KV, 
    # OR just let the module handle it naturally if you added it to common settings previously.
    # For now, assuming we rely on the standard injection or if you want to force it:
    # "APPLICATIONINSIGHTS_CONNECTION_STRING" = "..." 
    # (Usually handled by the resource block in main.tf, but can be overridden here)
  } 
}
