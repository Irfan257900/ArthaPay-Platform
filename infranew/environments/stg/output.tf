# --- Virtual Machine Outputs ---
output "vm_name" {
  description = "Name of the SQL Database VM"
  value       = module.sql_infrastructure.vm_name
}

output "vm_integ_name" {
  description = "Name of the Integration VM"
  value       = azurerm_windows_virtual_machine.vm_integ.name
}

output "vm_rg_name" {
  description = "Resource Group for VMs"
  value       = azurerm_resource_group.rg_vm.name
}

# --- Web App Outputs ---
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

# --- Function App Outputs (From Module) ---
# Since we used for_each in the module, we access outputs via map key ["key"]
output "func_market_name" {
  value = module.function_apps["marketdata"].name
}

output "func_subscriber_name" {
  value = module.function_apps["subscriber"].name
}

output "func_sweep_name" {
  value = module.function_apps["sweep"].name
}