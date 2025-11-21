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

variable "auth0_domain" {
  type = string
}

variable "mailgun_key" {
  type      = string
  sensitive = true
}

variable "twilio_sid" {
  type      = string
  sensitive = true
}

# --- CHANGED: This now defines which Backend WEB APPS to create ---
variable "backend_modules" {
  description = "List of backend modules (e.g. core, cards) to create Web Apps for"
  type        = list(string)
  default     = ["core", "cards", "banks", "payments", "exchange", "wallets", "payees"]
}

variable "dotnet_version" {
  type    = string
  default = "v8.0"
}