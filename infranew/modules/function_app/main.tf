resource "azurerm_windows_function_app" "func" {
  name                       = var.function_app_name
  location                   = var.location
  resource_group_name        = var.resource_group_name
  service_plan_id            = var.service_plan_id
  storage_account_name       = var.storage_account_name
  storage_account_access_key = var.storage_account_access_key
  tags                       = var.tags

  # Dynamic Settings from the App Configuration Module
  app_settings = var.app_settings

  site_config {
    application_stack {
      dotnet_version = var.dotnet_version
    }
  }

  # Enable Managed Identity
  identity {
    type = "SystemAssigned"
  }
}

# Automatically grant Key Vault access
resource "azurerm_role_assignment" "kv_access" {
  scope                = var.key_vault_id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_windows_function_app.func.identity[0].principal_id
}