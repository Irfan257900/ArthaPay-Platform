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

# Kept for compatibility, though STG uses a hardcoded local list for containers
variable "backend_modules" {
  type        = list(string)
  default     = []
}

variable "dotnet_version" {
  type    = string
  default = "v8.0"
}