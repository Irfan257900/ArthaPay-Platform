variable "client_name" {
  type = string
}

variable "environment_name" {
  type = string
}

variable "location" {
  type    = string
  default = "southeastasia"
}

variable "vm_admin_username" {
  type = string
}

variable "vm_admin_password" {
  type      = string
  sensitive = true
}

variable "app_sql_password" {
  type      = string
  sensitive = true
}

variable "auth0_client_id" { type = string }
variable "auth0_client_secret" { type = string }
variable "twilio_account_sid" { type = string }
variable "twilio_auth_token" { type = string }
variable "twilio_service_id" { type = string }
variable "sumsub_app_token" { type = string }
variable "sumsub_secret_key" { type = string }
variable "powerbi_password" { type = string }
variable "app_secret_key" { type = string }
variable "token_encrypt_key" { type = string }
variable "redis_connection_string" { type = string }
variable "vault_db_connection_string" { type = string }
variable "general_api_key" { type = string }
variable "general_api_secret_key" { type = string }
variable "client_secret_value" { type = string }
variable "easylink_app_key" { type = string }
variable "easylink_app_secret" { type = string }
variable "aml_access_key" { type = string }
variable "app_password_clear" { type = string }
variable "app_password_hash" { type = string }
variable "app_private_key" { type = string }
variable "app_public_key" { type = string }
variable "restsharp_access_token" { type = string }
variable "x_api_key" { type = string }

# ... existing variables ...

# --- NEW VARIABLES FOR CORE API ---
variable "core_main_account_id" { type = string }
variable "core_external_base_url" { type = string }
variable "auth0_mobile_client_id" { type = string }
variable "sendgrid_template_id" { type = string }

variable "auth0_domain" {
  type = string
}
variable "aml_access_id" {
  type = string
}

variable "backend_modules" {
  description = "List of backend modules to create Web Apps for"
  type        = list(string)
  
  # UPDATED: Matches the standard list used in STG/PRD and Workflow Input
  default     = [
    "coreapi", 
    "cardsapi", 
    "banksapi", 
    "paymentsapi", 
    "paylinks", 
    "signalR", 
    "api", 
    "exchangeapi", 
    "integration"
  ]
}

variable "dotnet_version" {
  type    = string
  default = "v8.0"
}
# --- SUBSCRIBER FUNCTION SPECIFIC ---
variable "firebase_server_key" {
  description = "Firebase Server Key for Notifications"
  type        = string
  sensitive   = true
}

variable "company_name" {
  type    = string
  default = "Artha Money"
}

variable "company_logo_url" {
  type    = string
  default = "" # You can set a default or pass it
}

# --- SWEEP FUNCTION SPECIFIC ---
variable "collection_vault_id" {
  description = "Fireblocks Vault ID for collection"
  type        = string
  default     = "202"
}

variable "polygon_wallet_address" {
  description = "Polygon Wallet Address"
  type        = string
  default     = ""
}

variable "tron_wallet_address" {
  description = "TRON Wallet Address"
  type        = string
  default     = ""
}
# --- MARKETDATA FUNCTION SPECIFIC ---
variable "admin_transaction_mail" {
  description = "Admin Email for Transactions"
  type        = string
  default     = ""
}

variable "bcc_address_mails" {
  description = "BCC Email Addresses"
  type        = string
  default     = ""
}

variable "exchange_url" {
  description = "Exchange Service URL"
  type        = string
  default     = ""
}

variable "login_url" {
  description = "Login Page URL"
  type        = string
  default     = ""
}

# --- PAYMENTS API SPECIFIC ---
variable "ayolinx_base_url" {
  type    = string
  default = "https://openapi.ayolinx.id/v1.0/access-token/b2b"
}

variable "ayolinx_private_key" {
  type      = string
  sensitive = true
  default   = "" 
}

variable "ayolinx_customer_token" {
  type      = string
  sensitive = true
  default   = ""
}

variable "pyrros_client_id" {
  type    = string
  default = ""
}

variable "pyrros_client_secret" {
  type      = string
  sensitive = true
  default   = ""
}

variable "pyrros_url" {
  type    = string
  default = "https://dev.blaze.financial"
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

# --- CARDS API SPECIFIC SECRETS ---
variable "cards_private_key" {
  description = "Specific Private Key for Cards Service"
  type        = string
  sensitive   = true
  default     = ""
}

variable "cards_customer_token" {
  description = "Specific Customer Token for Cards Service"
  type        = string
  sensitive   = true
  default     = ""
}

variable "sendgrid_auth_token" {
  description = "SendGrid Authentication Token"
  type        = string
  sensitive   = true
  default     = ""
}