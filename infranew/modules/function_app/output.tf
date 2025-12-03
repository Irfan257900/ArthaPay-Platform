output "name" {
  value = azurerm_windows_function_app.func.name
}

output "id" {
  value = azurerm_windows_function_app.func.id
}

output "principal_id" {
  value = azurerm_windows_function_app.func.identity[0].principal_id
}