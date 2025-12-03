output "id" {
  value = azurerm_key_vault.kv.id
}

output "uri" {
  value = azurerm_key_vault.kv.vault_uri
}

# --- NEW: Map of Secret Names to IDs ---
output "secret_ids" {
  description = "Map of Secret Names to their Key Vault IDs"
  value       = { for k, v in azurerm_key_vault_secret.secrets : k => v.id }
}