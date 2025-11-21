# --- Virtual Machine Outputs ---
output "vm_name" {
  value = azurerm_windows_virtual_machine.vm.name
}

output "vm_rg_name" {
  value = azurerm_resource_group.rg_infra.name
}

# --- Web App Outputs (FROM MODULE) ---
output "webapp_name" {
  value = module.container_app.webapp_name
}

output "webapp_rg_name" {
  value = azurerm_resource_group.rg_apps.name
}

# --- ACR Outputs (FROM MODULE) ---
output "acr_login_server" {
  value = module.container_app.acr_login_server
}

output "acr_admin_username" {
  value = module.container_app.acr_admin_username
  sensitive = true
}

output "acr_admin_password" {
  value = module.container_app.acr_admin_password
  sensitive = true
}