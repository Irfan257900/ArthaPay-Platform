variable "app_name" {
  description = "The specific backend module name (e.g., coreapi, banksapi)"
  type        = string
}

variable "environment" { type = string }
variable "client_name" { type = string }

# --- Key Vault Secret URIs (Passed from main.tf) ---
# We pass the IDs/URIs here, not the values, to keep the module lightweight
variable "secret_uris" {
  description = "Map of Secret URIs from Key Vault"
  type        = map(string)
}

# --- Dynamic URLs (Passed from main.tf) ---
variable "service_urls" {
  description = "Map of other App Service URLs"
  type        = map(string)
}

# --- Service Bus Connection Strings ---
variable "sb_connection_string" { type = string }

# --- Auth0 & Third Party ---
variable "auth0_domain" { type = string }
variable "auth0_client_id" { type = string }
variable "auth0_client_secret" { type = string }

# --- CORE API SPECIFIC INPUTS ---
variable "core_main_account_id" {
  description = "The Main Account ID GUID for Core API"
  type        = string
  default     = "" # Optional, so other apps don't break
}

variable "core_external_base_url" {
  description = "The external provider URL (e.g. Stylopay) for Core API"
  type        = string
  default     = ""
}

variable "sendgrid_config" {
  description = "SendGrid configuration object"
  type = object({
    template_id = string
    from_email  = string
    from_name   = string
  })
  default = {
    template_id = ""
    from_email  = ""
    from_name   = ""
  }
}

variable "auth0_mobile_client_id" {
  description = "Auth0 Client ID for Mobile Apps"
  type        = string
  default     = ""
}
# ... (existing variables) ...

variable "aml_access_id" {
  description = "The Access ID for the AML Provider"
  type        = string
}
# ... existing variables ...

variable "company_name" {
  description = "Client Company Name"
  type        = string
  default     = ""
}

variable "company_logo_url" {
  description = "URL for Company Logo"
  type        = string
  default     = ""
}

variable "collection_vault_id" { 
  type    = string
  default = ""  # <--- Add this
}

variable "polygon_wallet_address" { 
  type    = string
  default = ""  # <--- Add this
}

variable "tron_wallet_address" { 
  type    = string
  default = ""  # <--- Add this
}

# --- NEW: Raw App Insights Connection String ---
variable "app_insights_connection_string" {
  description = "The actual Connection String value (not Key Vault URI)"
  type        = string
}
variable "app_insights_instrumentation_key" { type = string }

# --- MarketData Inputs ---

variable "admin_transaction_mail" {
  type    = string
  default = ""
}

variable "bcc_address_mails" {
  type    = string
  default = ""
}

variable "exchange_url" {
  type    = string
  default = ""
}

variable "login_url" {
  type    = string
  default = ""
}

# --- Payments API Inputs (Fixed Format) ---

variable "ayolinx_base_url" {
  type    = string
  default = ""
}

variable "pyrros_client_id" {
  type    = string
  default = ""
}

variable "pyrros_url" {
  type    = string
  default = ""
}

variable "web3_api_key" {
  type    = string
  default = ""
}

variable "web3_exchange_id" {
  type    = string
  default = ""
}

variable "web3_payments_id" {
  type    = string
  default = ""
}

variable "web3_payment_link_url" {
  type    = string
  default = ""
}

variable "coingecko_base_url" {
  type    = string
  default = ""
}

variable "hyperpay_url" {
  type    = string
  default = ""
}

variable "sendgrid_account_sid" {
  type    = string
  default = ""
}

variable "sendgrid_service_id" {
  type    = string
  default = ""
}