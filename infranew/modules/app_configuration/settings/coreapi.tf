locals {
  coreapi_settings = {
    # ---------------------------------------------------------
    # 1. SENDGRID CONFIGURATION (Specific to Core)
    # ---------------------------------------------------------
    "SendGrid_FromEmail"           = "contact@${lower(var.client_name)}.money" # Dynamic based on client? Or fixed.
    "SendGrid_FromUserName"        = "${var.client_name} Money"
    "SendGrid_TemplateId"          = "d-da034c1ee01244259164ddb9a1d9e8fe"

    # ---------------------------------------------------------
    # 2. CORE-SPECIFIC FEATURE FLAGS
    # ---------------------------------------------------------
    "IsCoinwiseExchangeComissions" = "true"
    "IsDepositTravelRuleEnabled"   = "false"
    "IsExchange"                   = "false"
    "IsKycKybDefaultAddress"       = "false"
    "IsOnlyWhitelistAddresses"     = "true"
    "PooledAccount"                = "Enabled"

    # ---------------------------------------------------------
    # 3. SPECIFIC ACCOUNT IDs
    # ---------------------------------------------------------
    # Note: If this GUID changes per environment, it should be a variable/secret. 
    # For now, using the value from the sample.
    "MainAccountId"                = "4ffdf191-2ada-453d-9a66-35841ea1cc5d" 

    # ---------------------------------------------------------
    # 4. URL OVERRIDES
    # ---------------------------------------------------------
    # In common.tf, BaseUrl points to the CoreAPI itself (internal).
    # In your sample, it points to an external provider (Stylopay).
    # If CoreAPI acts as a gateway to Stylopay, uncomment the line below:
    # "BaseUrl"                    = "https://apisandbox.spend.stylopay.com/smmaas"
  }
}