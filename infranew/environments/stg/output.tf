# --- Virtual Machine Outputs ---
output "vm_name" {
  description = "The name of the SQL Virtual Machine"
  value       = azurerm_windows_virtual_machine.vm_sql.name
}

output "vm_rg_name" {
  description = "The resource group of the VM"
  value       = azurerm_resource_group.rg_vm.name
}

# --- Web App Outputs (Frontend) ---
output "ui_app_name" {
  description = "Name of the Client UI Web App"
  value       = azurerm_linux_web_app.ui_app.name
}

output "ui_admin_name" {
  description = "Name of the Admin UI Web App"
  value       = azurerm_linux_web_app.ui_admin.name
}

output "webapp_rg_name" {
  description = "Resource Group where Web Apps are hosted"
  value       = azurerm_resource_group.rg_apps.name
}

# --- Backend Web Apps (Map of names) ---
output "backend_app_names" {
  description = "List of backend Web App names created"
  value       = [for app in azurerm_windows_web_app.backend_apps : app.name]
}

# --- Function App Outputs ---
output "function_market_name" {
  value = azurerm_windows_function_app.func_market.name
}

output "function_subscriber_name" {
  value = azurerm_windows_function_app.func_subscriber.name
}

output "function_publisher_name" {
  value = azurerm_windows_function_app.func_publisher.name
}