# --- Virtual Machine Outputs ---
output "vm_name" {
  description = "The name of the SQL Virtual Machine"
  value       = azurerm_windows_virtual_machine.vm.name
}

output "vm_rg_name" {
  description = "The resource group of the VM"
  value       = azurerm_resource_group.rg_infra.name
}

# --- Web App (Container) Outputs ---
output "webapp_name" {
  description = "The name of the Linux Web App for the UI"
  value       = azurerm_linux_web_app.ui_webapp.name
}

output "webapp_rg_name" {
  description = "The resource group of the Web App"
  value       = azurerm_resource_group.rg_apps.name
}

# --- ACR Outputs (Make sure these are here!) ---
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