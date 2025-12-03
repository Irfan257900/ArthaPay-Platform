resource "azurerm_windows_function_app" "func" {
  name                       = var.function_app_name
  location                   = var.location
  resource_group_name        = var.resource_group_name
  service_plan_id            = var.service_plan_id  # Matches new variable name
  storage_account_name       = var.storage_account_name
  storage_account_access_key = var.storage_account_access_key
  tags                       = var.tags

  # --- DYNAMIC SETTINGS ---
  # This takes the map from the config module and applies it
  app_settings = var.app_settings

  site_config {
    application_stack {
      dotnet_version = var.dotnet_version
    }
  }

  # Enable Identity for Key Vault Access
  identity {
    type = "SystemAssigned"
  }
}

# --- AUTO-GRANT ACCESS ---
# This grants the Function App permission to read secrets immediately
resource "azurerm_role_assignment" "kv_access" {
  scope                = var.key_vault_id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_windows_function_app.func.identity[0].principal_id
}