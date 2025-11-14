# --- Core Deployment Inputs (From GitHub Workflow) ---
variable "client_name" {
  description = "The name of the client (e.g., 'Voltica')."
  type        = string
}

variable "environment_name" {
  description = "The name of the environment (e.g., 'tst', 'stg', 'prd')."
  type        = string
}

variable "location" {
  description = "The Azure region for the deployment."
  type        = string
  default     = "East US"
}

# --- Credentials (From GitHub Secrets) ---
variable "vm_admin_username" {
  description = "Administrator username for the SQL VM."
  type        = string
  default     = "Volticatstadmin"
}

variable "vm_admin_password" {
  description = "Administrator password for the SQL VM."
  type        = string
  sensitive   = true
}

# --- Third-Party Secrets (From GitHub Secrets) ---
variable "auth0_domain" {
  description = "Auth0 Domain"
  type        = string
  sensitive   = true
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

# --- Application Settings ---
variable "function_app_names" {
  description = "A list of function app names to deploy (e.g., 'core', 'bank')."
  type        = list(string)
  default     = ["core", "bank", "cards"]
}

variable "dotnet_version" {
  description = "The .NET version for the function apps."
  type        = string
  default     = "v6.0"
}