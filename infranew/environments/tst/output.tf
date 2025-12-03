output "vm_name" {
  value = module.sql_infrastructure.vm_name
}
output "vm_rg_name" {
  value = azurerm_resource_group.rg_infra.name
}

output "ui_app_name" {
  value = azurerm_linux_web_app.ui_app.name
}
output "ui_admin_name" {
  value = azurerm_linux_web_app.ui_admin.name
}
output "webapp_rg_name" {
  value = azurerm_resource_group.rg_apps.name
}