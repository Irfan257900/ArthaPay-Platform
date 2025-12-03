# --- Virtual Machine Outputs ---
output "vm_name" {
  description = "Name of the SQL Database VM"
  value = module.sql_infrastructure.vm_name
}

output "vm_rg_name" {
  description = "Resource Group for VMs"
  value       = azurerm_resource_group.rg_vm.name
}

# --- Web App Outputs (MAPPED FOR WORKFLOW) ---
output "ui_app_name" {
  value = azurerm_linux_web_app.container_apps["user"].name
}

output "ui_admin_name" {
  value = azurerm_linux_web_app.container_apps["admin"].name
}

output "webapp_rg_name" {
  value = azurerm_resource_group.rg_apps.name
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

# --- Function Apps ---
output "func_market_name" {
  value = azurerm_windows_function_app.func_market.name
}
output "func_subscriber_name" {
  value = azurerm_windows_function_app.func_subscriber.name
}
output "func_publisher_name" {
  # Note: In PRD main.tf, we named the resource "func_sweep", 
  # but we can output it as publisher if that's what downstream expects, 
  # OR update the variable name. Here I output the Sweep Function name.
  value = azurerm_windows_function_app.func_sweep.name
}