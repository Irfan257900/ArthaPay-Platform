# This file exposes outputs from our modules to the root,
# so the GitHub workflow can read them.

output "static_web_app_api_key" {
  description = "The deployment token for the Static Web App"
  value       = module.static_web_app.api_key
  sensitive   = true
}

output "static_web_app_url" {
  description = "The URL of the Static Web App"
  value       = module.static_web_app.url
}

output "vm_name" {
  description = "The name of the SQL VM"
  value       = local.vm_name
}

output "vm_rg_name" {
  description = "The name of the VM's resource group"
  value       = local.vm_rg_name
}