output "id" {
  description = "The ID of the Service Bus Namespace."
  value       = azurerm_servicebus_namespace.sb_namespace.id
}

output "name" {
  description = "The Name of the Service Bus Namespace."
  value       = azurerm_servicebus_namespace.sb_namespace.name
}

# --- NEW: Required for App Configuration Module ---
output "default_primary_connection_string" {
  description = "The Primary Connection String for the Namespace."
  value       = azurerm_servicebus_namespace.sb_namespace.default_primary_connection_string
  sensitive   = true
}