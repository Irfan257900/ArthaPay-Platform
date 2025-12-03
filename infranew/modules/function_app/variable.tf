variable "function_app_name" {
  description = "Name of the Function App"
  type        = string
}

variable "location" {
  description = "Azure Region"
  type        = string
}

variable "resource_group_name" {
  description = "Resource Group Name"
  type        = string
}

# --- CHANGED: Was app_service_plan_id ---
variable "service_plan_id" {
  description = "ID of the App Service Plan"
  type        = string
}

variable "storage_account_name" {
  type = string
}

variable "storage_account_access_key" {
  type      = string
  sensitive = true
}

variable "tags" {
  type = map(string)
}

# --- NEW: Config Map ---
variable "app_settings" {
  description = "Map of application settings (env vars)"
  type        = map(string)
  default     = {}
}

# --- NEW: Key Vault Access ---
variable "key_vault_id" {
  description = "ID of the Key Vault to grant the Function access to"
  type        = string
}

# --- NEW: Dotnet Version ---
variable "dotnet_version" {
  description = "Dotnet Framework version (e.g. v8.0)"
  type        = string
  default     = "v8.0"
}

# ❌ REMOVED: variable "app_insights_instrumentation_key" (Passed via app_settings now)