variable "client_name" {
  type = string
}

variable "environment_name" {
  type = string
}

variable "location" {
  type    = string
  default = "Southeast Asia"
}

# --- AUTH & CORE ---
variable "auth0_domain" {
  type = string
}

variable "auth0_client_id" {
  type = string
}

variable "auth0_client_secret" {
  type = string
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

# --- NEW SECRETS (Parity with TST) ---
variable "twilio_account_sid" {
  type    = string
  default = ""
}

variable "twilio_auth_token" {
  type      = string
  sensitive = true
  default   = ""
}

variable "twilio_service_id" {
  type    = string
  default = ""
}

variable "sumsub_app_token" {
  type      = string
  sensitive = true
  default   = ""
}

variable "sumsub_secret_key" {
  type      = string
  sensitive = true
  default   = ""
}

variable "powerbi_password" {
  type      = string
  sensitive = true
  default   = ""
}

variable "app_secret_key" {
  type      = string
  sensitive = true
  default   = ""
}

variable "token_encrypt_key" {
  type      = string
  sensitive = true
  default   = ""
}

variable "redis_connection_string" {
  type      = string
  sensitive = true
  default   = ""
}

variable "vault_db_connection_string" {
  type      = string
  sensitive = true
  default   = ""
}

variable "general_api_key" {
  type    = string
  default = ""
}

variable "general_api_secret_key" {
  type      = string
  sensitive = true
  default   = ""
}

variable "client_secret_value" {
  type      = string
  sensitive = true
  default   = ""
}

variable "easylink_app_key" {
  type    = string
  default = ""
}

variable "easylink_app_secret" {
  type      = string
  sensitive = true
  default   = ""
}

variable "aml_access_key" {
  type      = string
  sensitive = true
  default   = ""
}

variable "app_password_clear" {
  type      = string
  sensitive = true
  default   = ""
}

variable "app_password_hash" {
  type      = string
  sensitive = true
  default   = ""
}

variable "app_private_key" {
  type      = string
  sensitive = true
  default   = ""
}

variable "app_public_key" {
  type    = string
  default = ""
}

variable "restsharp_access_token" {
  type      = string
  sensitive = true
  default   = ""
}

variable "x_api_key" {
  type      = string
  sensitive = true
  default   = ""
}

variable "firebase_server_key" {
  type      = string
  sensitive = true
  default   = ""
}

# --- PAYMENTS / CARDS / WEB3 SPECIFIC ---
variable "ayolinx_base_url" {
  type    = string
  default = ""
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

variable "cards_private_key" {
  type      = string
  sensitive = true
  default   = ""
}

variable "cards_customer_token" {
  type      = string
  sensitive = true
  default   = ""
}

# --- SENDGRID ---
variable "sendgrid_auth_token" {
  type      = string
  sensitive = true
  default   = ""
}

variable "sendgrid_account_sid" {
  type    = string
  default = ""
}

variable "sendgrid_service_id" {
  type    = string
  default = ""
}

variable "sendgrid_template_id" {
  type    = string
  default = ""
}

# --- CORE SPECIFIC ---
variable "core_main_account_id" {
  type    = string
  default = ""
}

variable "core_external_base_url" {
  type    = string
  default = ""
}

variable "auth0_mobile_client_id" {
  type    = string
  default = ""
}

variable "aml_access_id" {
  type    = string
  default = ""
}

# --- FUNCTIONS SPECIFIC ---
variable "company_name" {
  type    = string
  default = ""
}

variable "company_logo_url" {
  type    = string
  default = ""
}

variable "collection_vault_id" {
  type    = string
  default = ""
}

variable "polygon_wallet_address" {
  type    = string
  default = ""
}

variable "tron_wallet_address" {
  type    = string
  default = ""
}

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

# --- LEGACY (Keep if needed for Staging specifically) ---
variable "mailgun_key" {
  type      = string
  sensitive = true
  default   = ""
}

variable "backend_modules" {
  description = "List of backend modules to create Web Apps for"
  type        = list(string)
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