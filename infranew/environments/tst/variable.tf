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