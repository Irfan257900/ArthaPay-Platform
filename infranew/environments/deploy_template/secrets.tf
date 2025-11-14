# This file takes the secret variables and saves them
# securely in the new Key Vault.

resource "azurerm_key_vault_secret" "auth0_domain" {
  name         = "Auth0-Domain"
  value        = var.auth0_domain
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}

resource "azurerm_key_vault_secret" "mailgun_key" {
  name         = "Mailgun-ApiKey"
  value        = var.mailgun_key
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}

resource "azurerm_key_vault_secret" "twilio_sid" {
  name         = "Twilio-SID"
  value        = var.twilio_sid
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}