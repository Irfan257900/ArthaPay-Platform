output "vm_name" {
  value = azurerm_windows_virtual_machine.vm.name
}
output "vm_rg_name" {
  value = azurerm_resource_group.rg_infra.name
}

# UI Web Apps
output "ui_app_name" {
  value = azurerm_linux_web_app.ui_app.name
}
output "ui_admin_name" {
  value = azurerm_linux_web_app.ui_admin.name
}

# Backend Web Apps (Map)
output "backend_app_names" {
  value = [for app in azurerm_windows_web_app.backend_apps : app.name]
}

# Function Apps
output "function_market_name" {
  value = azurerm_windows_function_app.func_market.name
}
output "function_subscriber_name" {
  value = azurerm_windows_function_app.func_subscriber.name
}
output "function_publisher_name" {
  value = azurerm_windows_function_app.func_publisher.name
}