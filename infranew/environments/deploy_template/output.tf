output "vm_name" {
  value = azurerm_windows_virtual_machine.vm.name
}

output "vm_rg_name" {
  value = azurerm_resource_group.rg_infra.name
}

output "webapp_name" {
  value = azurerm_linux_web_app.ui_webapp.name
}

output "webapp_rg_name" {
  value = azurerm_resource_group.rg_apps.name
}

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