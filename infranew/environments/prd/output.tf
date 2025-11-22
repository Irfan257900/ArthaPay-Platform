# --- Virtual Machine Outputs ---
output "vm_name" {
  description = "Name of the SQL Database VM"
  value       = azurerm_windows_virtual_machine.vm_sql.name
}

output "vm_rg_name" {
  description = "Resource Group for VMs"
  value       = azurerm_resource_group.rg_vm.name
}

# --- Web App Outputs (MAPPED FOR WORKFLOW COMPATIBILITY) ---

# The Workflow expects 'ui_app_name'. We map this to the "user" container app.
output "ui_app_name" {
  value = azurerm_linux_web_app.container_apps["user"].name
}

# The Workflow expects 'ui_admin_name'. We map this to the "admin" container app.
output "ui_admin_name" {
  value = azurerm_linux_web_app.container_apps["admin"].name
}

output "webapp_rg_name" {
  description = "Resource Group for Web Apps"
  value       = azurerm_resource_group.rg_apps.name
}

# --- ACR Outputs ---
output "acr_login_server" {
  value = azurerm_container_registry.acr.login_server
}

output "acr_admin_username" {
  value = azurerm_container_registry.acr.admin_username
  sensitive = true
}

output "acr_admin_password" {
  value = azurerm_container_registry.acr.admin_password
  sensitive = true
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