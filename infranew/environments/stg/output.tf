# --- Virtual Machine Outputs ---
output "vm_sql_name" {
  description = "Name of the SQL Database VM"
  value       = azurerm_windows_virtual_machine.vm_sql.name
}

output "vm_integ_name" {
  description = "Name of the Integration VM"
  value       = azurerm_windows_virtual_machine.vm_integ.name
}

output "vm_rg_name" {
  description = "Resource Group for VMs"
  value       = azurerm_resource_group.rg_vm.name
}

# --- ACR Outputs (CRITICAL for Docker) ---
output "acr_login_server" {
  description = "ACR Login URL"
  value       = azurerm_container_registry.acr.login_server
}

output "acr_admin_username" {
  description = "ACR Admin Username"
  value       = azurerm_container_registry.acr.admin_username
  sensitive   = true
}

output "acr_admin_password" {
  description = "ACR Admin Password"
  value       = azurerm_container_registry.acr.admin_password
  sensitive   = true
}

# --- Container Web Apps (The 9 Linux Apps) ---
# Returns a list of all app names created (admin-app, api-app, etc.)
output "container_app_names" {
  description = "List of all Container Web App names"
  value       = [for app in azurerm_linux_web_app.container_apps : app.name]
}

output "webapp_rg_name" {
  description = "Resource Group for Web Apps"
  value       = azurerm_resource_group.rg_apps.name
}

# --- Function App Outputs ---
output "func_market_name" {
  value = azurerm_windows_function_app.func_market.name
}

output "func_subscriber_name" {
  value = azurerm_windows_function_app.func_subscriber.name
}

output "func_publisher_name" {
  value = azurerm_windows_function_app.func_publisher.name
}