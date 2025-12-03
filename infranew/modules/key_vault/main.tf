data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "kv" {
  name                        = var.key_vault_name
  location                    = var.location
  resource_group_name         = var.resource_group_name
  enabled_for_disk_encryption = true
  tenant_id                   = var.tenant_id
  soft_delete_retention_days  = 90
  purge_protection_enabled    = false
  sku_name                    = "standard"
  
  # Use RBAC (Best Practice for Azure)
  enable_rbac_authorization   = true
  
  tags                        = var.tags
}

# 1. Grant the Terraform Runner (Current User) Admin Access
# This is required so Terraform has permission to write the secrets below.
resource "azurerm_role_assignment" "kv_admin_terraform" {
  scope                = azurerm_key_vault.kv.id
  role_definition_name = "Key Vault Administrator"
  principal_id         = data.azurerm_client_config.current.object_id
}

# 2. Dynamic Secret Creation
# This loops through the 'secrets' map passed from main.tf
resource "azurerm_key_vault_secret" "secrets" {
  for_each     = var.secrets
  name         = each.key
  value        = each.value
  key_vault_id = azurerm_key_vault.kv.id

  # CRITICAL: Wait for the Role Assignment to propagate before trying to write secrets
  depends_on = [azurerm_role_assignment.kv_admin_terraform]
}