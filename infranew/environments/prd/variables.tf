variable "client_name" {
  description = "The name of the client (e.g., Paybase)"
  type        = string
}

variable "environment_name" {
  description = "The deployment environment (e.g., prd)"
  type        = string
}

variable "location" {
  description = "Azure Region"
  type        = string
  default     = "Switzerland North" # Matches PRD Requirement
}

variable "vm_admin_username" {
  description = "Administrator username for the SQL VM"
  type        = string
}

variable "vm_admin_password" {
  description = "Administrator password for the SQL VM"
  type        = string
  sensitive   = true
}

variable "app_sql_password" {
  description = "Password for the Application User inside SQL"
  type        = string
  sensitive   = true
}

variable "auth0_domain" {
  description = "Auth0 Domain for configuration"
  type        = string
}

variable "mailgun_key" {
  description = "Mailgun API Key"
  type        = string
  sensitive   = true
}

variable "twilio_sid" {
  description = "Twilio Account SID"
  type        = string
  sensitive   = true
}

# --- Backend Modules List ---
variable "backend_modules" {
  description = "List of backend modules to create Web Apps for"
  type        = list(string)
  default     = ["core", "cards", "banks", "payments", "exchange", "wallets", "payees"]
}

variable "dotnet_version" {
  description = "Dotnet version for Web Apps"
  type        = string
  default     = "v8.0"
}