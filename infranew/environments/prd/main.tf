# --- PRODUCTION (PRD) CONFIGURATION ---
# Architecture: Linux Container Apps (Docker) + ACR
# Region: Southeast Asia

locals {
  common_tags = {
    "Business-owners"     = "Project Manager"
    "Environment"         = var.environment_name
    "Client"              = var.client_name
    "Technical-owner"     = "DevOps Team"
    "Criticality"         = "1"
  }
  
  _name_prefix = "${var.client_name}-${var.environment_name}"
  _container_prefix = "${var.client_name}${var.environment_name}" # e.g. PaybasePrd
  
  # Resource Groups
  network_rg_name          = "rg-${local._name_prefix}-network"
  app_rg_name              = "rg-${local._name_prefix}-app"
  vm_rg_name               = "rg-${local._name_prefix}-vm"
  security_rg_name         = "rg-${local._name_prefix}-security"
  
  # Resources
  vnet_name                = "${local._name_prefix}-vnet"
  sql_vm_name              = "${local._name_prefix}-sqlvm"
  
  key_vault_name           = "${local._name_prefix}-kv-${substr(md5(timestamp()), 0, 5)}"
  storage_account_name     = "st${lower(var.client_name)}${lower(var.environment_name)}${substr(md5(timestamp()), 0, 3)}"
  service_bus_namespace_name = "${local._name_prefix}-bus"
  
  acr_name                 = "acr${lower(var.client_name)}${lower(var.environment_name)}${substr(md5(timestamp()), 0, 3)}"
  
  # Plans
  plan_linux_name          = "${local._name_prefix}-plan-linux"
  plan_windows_name        = "${local._name_prefix}-plan-windows"

  # Function Names
  func_market_name         = "${local._name_prefix}-Marketdata"
  func_subscriber_name     = "${local._name_prefix}-Subscriber"
  func_sweep_name          = "${local._name_prefix}-Sweepfunction"
  function_config_keys     = ["marketdata", "subscriber", "sweep"]

  # Network Config
  vnet_address_space       = ["10.10.0.0/16"]
  subnets = {
    "IntegrationvmSubnet"    = { address_prefixes = ["10.10.10.0/24"] }
    "PrivateEndpointsSubnet" = { address_prefixes = ["10.10.11.0/24"] }
    "sqlVmSubnet"            = { address_prefixes = ["10.10.12.0/24"] }
  }

  # --- CONTAINER APPS LIST ---
  prd_container_services = {
    "coreapi"     = "coreapi-app"
    "cardsapi"    = "cardsapi-app"
    "banksapi"    = "banksapi-app"
    "paymentsapi" = "paymentsapi-app"
    "paylinks"    = "paylinks-app"
    "signalR"     = "signal-app"
    "exchangeapi" = "exchange-app"
    "integration" = "integ-app"
    "admin"       = "admin-app"
    "user"        = "user-app"
  }
}

data "azurerm_client_config" "current" {}

# --- RESOURCE GROUPS ---
resource "azurerm_resource_group" "rg_network" {
  name     = local.network_rg_name
  location = var.location
  tags     = local.common_tags
}
resource "azurerm_resource_group" "rg_apps" {
  name     = local.app_rg_name
  location = var.location
  tags     = local.common_tags
}
resource "azurerm_resource_group" "rg_vm" {
  name     = local.vm_rg_name
  location = var.location
  tags     = local.common_tags
}
resource "azurerm_resource_group" "rg_security" {
  name     = local.security_rg_name
  location = var.location
  tags     = local.common_tags
}

# --- NETWORKING ---
module "networking" {
  source                        = "../../modules/networking"
  vnet_name                     = local.vnet_name
  location                      = azurerm_resource_group.rg_network.location
  resource_group_name           = azurerm_resource_group.rg_network.name
  tags                          = local.common_tags
  vnet_address_space            = local.vnet_address_space
  subnets                       = local.subnets
  private_endpoints_subnet_name = "PrivateEndpointsSubnet"
  depends_on                    = [azurerm_resource_group.rg_network]
}

# --- SQL VM ---
resource "azurerm_public_ip" "pip_sql" {
  name                = "pip-${local.sql_vm_name}"
  location            = azurerm_resource_group.rg_vm.location
  resource_group_name = azurerm_resource_group.rg_vm.name
  allocation_method   = "Static"
  sku                 = "Standard"
  tags                = local.common_tags
}

resource "azurerm_network_interface" "nic_sql" {
  name                = "nic-${local.sql_vm_name}"
  location            = azurerm_resource_group.rg_vm.location
  resource_group_name = azurerm_resource_group.rg_vm.name
  tags                = local.common_tags
  ip_configuration {
    name                          = "internal"
    subnet_id                     = module.networking.subnet_ids["sqlVmSubnet"]
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.pip_sql.id
  }
}

resource "azurerm_windows_virtual_machine" "vm_sql" {
  name                = local.sql_vm_name
  computer_name       = substr(local.sql_vm_name, 0, 15)
  resource_group_name = azurerm_resource_group.rg_vm.name
  location            = azurerm_resource_group.rg_vm.location
  
  # PRD Size (Ensure this is correct for your budget/needs)
  size                = "Standard_B2ms" 
  
  admin_username      = var.vm_admin_username
  admin_password      = var.vm_admin_password
  network_interface_ids = [azurerm_network_interface.nic_sql.id]
  tags                = local.common_tags
  
  identity { type = "SystemAssigned" }

  source_image_reference {
    publisher = "MicrosoftSQLServer"
    offer     = "sql2022-ws2022"
    sku       = "sqldev-gen2"
    version   = "latest"
  }
  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "StandardSSD_LRS"
  }
}

resource "azurerm_mssql_virtual_machine" "sqlvm" {
  virtual_machine_id               = azurerm_windows_virtual_machine.vm_sql.id
  sql_license_type                 = "PAYG"
  r_services_enabled               = true
  sql_connectivity_port            = 1433
  sql_connectivity_type            = "PRIVATE"
  sql_connectivity_update_password = var.vm_admin_password
  sql_connectivity_update_username = var.vm_admin_username
}

resource "azurerm_virtual_machine_extension" "sql_db_setup" {
  name                 = "sql-db-setup"
  virtual_machine_id   = azurerm_windows_virtual_machine.vm_sql.id
  publisher            = "Microsoft.Compute"
  type                 = "CustomScriptExtension"
  type_handler_version = "1.10"
  depends_on           = [azurerm_mssql_virtual_machine.sqlvm]

  protected_settings = <<SETTINGS
    {
        "commandToExecute": "powershell.exe -ExecutionPolicy Unrestricted -Command \"$ErrorActionPreference = 'Stop'; $adminUser = '${var.vm_admin_username}'; $adminPass = '${var.vm_admin_password}'; $password = '${var.app_sql_password}'; $dbName = '${var.client_name}DB'; $dbUser = '${var.client_name}_app_user'; $retryCount = 0; while ($true) { try { sqlcmd -S localhost -U $adminUser -P $adminPass -b -Q \\\"SELECT 1\\\" -ConnectionTimeout 5; break } catch { if ($retryCount -ge 20) { throw 'SQL Server not ready after 20 retries' }; Write-Output 'Waiting for SQL...'; Start-Sleep -Seconds 10; $retryCount++ } }; sqlcmd -S localhost -U $adminUser -P $adminPass -b -Q \\\"IF NOT EXISTS(SELECT * FROM sys.databases WHERE name='$dbName') BEGIN CREATE DATABASE [$dbName]; END\\\"; sqlcmd -S localhost -U $adminUser -P $adminPass -b -Q \\\"IF NOT EXISTS(SELECT * FROM sys.server_principals WHERE name='$dbUser') BEGIN CREATE LOGIN [$dbUser] WITH PASSWORD='$password'; END\\\"; sqlcmd -S localhost -U $adminUser -P $adminPass -b -Q \\\"USE [$dbName]; IF NOT EXISTS(SELECT * FROM sys.database_principals WHERE name='$dbUser') BEGIN CREATE USER [$dbUser] FOR LOGIN [$dbUser]; ALTER ROLE db_owner ADD MEMBER [$dbUser]; END;\\\"\""
    }
SETTINGS
}

# --- ACR ---
resource "azurerm_container_registry" "acr" {
  name                = local.acr_name
  resource_group_name = azurerm_resource_group.rg_apps.name
  location            = azurerm_resource_group.rg_apps.location
  sku                 = "Basic"
  admin_enabled       = true
  tags                = local.common_tags
}

# --- APP PLANS ---
resource "azurerm_service_plan" "linux_plan" {
  name                = local.plan_linux_name
  location            = azurerm_resource_group.rg_apps.location
  resource_group_name = azurerm_resource_group.rg_apps.name
  os_type             = "Linux"
  sku_name            = "B1"
  tags                = local.common_tags
}

resource "azurerm_service_plan" "windows_plan" {
  name                = local.plan_windows_name
  location            = azurerm_resource_group.rg_apps.location
  resource_group_name = azurerm_resource_group.rg_apps.name
  os_type             = "Windows"
  sku_name            = "B1"
  tags                = local.common_tags
}

# --- SERVICES ---
module "storage_account" {
  source               = "../../modules/storage_account"
  storage_account_name = local.storage_account_name
  location             = azurerm_resource_group.rg_apps.location
  resource_group_name  = azurerm_resource_group.rg_apps.name
  tags                 = local.common_tags
}

module "service_bus" {
  source                       = "../../modules/service_bus"
  service_bus_namespace_name = local.service_bus_namespace_name
  location                     = azurerm_resource_group.rg_apps.location
  resource_group_name          = azurerm_resource_group.rg_apps.name
  sku                          = "Standard"
  tags                         = local.common_tags
}

data "azurerm_servicebus_namespace" "sb_lookup" {
  name                = local.service_bus_namespace_name
  resource_group_name = azurerm_resource_group.rg_apps.name
  depends_on          = [module.service_bus]
}

# --- QUEUES & TOPICS ---
# (Using enable_partitioning = true as per your provider version)
resource "azurerm_servicebus_queue" "q_processing" {
  name                 = "processing-queue"
  namespace_id         = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning  = true
  requires_session     = true 
}
resource "azurerm_servicebus_queue" "q_cards" {
  name                 = "cardsqueue"
  namespace_id         = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning  = true
  requires_session     = true
}
resource "azurerm_servicebus_queue" "q_deposit" {
  name                 = "depositandwithdrawqueue"
  namespace_id         = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning  = true
  requires_session     = true
}
resource "azurerm_servicebus_queue" "q_loyalty" {
  name                 = "loyaltyprogram"
  namespace_id         = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning  = true
  requires_session     = true
}
resource "azurerm_servicebus_queue" "q_order" {
  name                 = "orderqueue"
  namespace_id         = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning  = true
  requires_session     = true
}
resource "azurerm_servicebus_queue" "q_buysell" {
  name                 = "buyandsellqueue"
  namespace_id         = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning  = true
  requires_session     = true
}

# --- Topics ---
resource "azurerm_servicebus_topic" "t_market" {
  name                 = "market-data-events"
  namespace_id         = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning  = true
}
resource "azurerm_servicebus_subscription" "sub_market" {
  name               = "subscriber-service"
  topic_id           = azurerm_servicebus_topic.t_market.id
  max_delivery_count = 10
  requires_session   = true 
}
resource "azurerm_servicebus_topic" "t_aml" {
  name                 = "amlriskscore"
  namespace_id         = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning  = true
}
resource "azurerm_servicebus_subscription" "sub_aml" {
  name               = "sub-processor"
  topic_id           = azurerm_servicebus_topic.t_aml.id
  max_delivery_count = 10
  requires_session   = true
}
resource "azurerm_servicebus_topic" "t_audit" {
  name                 = "auditlogs"
  namespace_id         = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning  = true
}
resource "azurerm_servicebus_subscription" "sub_audit" {
  name               = "sub-processor"
  topic_id           = azurerm_servicebus_topic.t_audit.id
  max_delivery_count = 10
  requires_session   = true
}
resource "azurerm_servicebus_topic" "t_email" {
  name                 = "emailnotifications"
  namespace_id         = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning  = true
}
resource "azurerm_servicebus_subscription" "sub_email" {
  name               = "sub-processor"
  topic_id           = azurerm_servicebus_topic.t_email.id
  max_delivery_count = 10
  requires_session   = true
}
resource "azurerm_servicebus_topic" "t_gas" {
  name                 = "fillgasfee"
  namespace_id         = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning  = true
}
resource "azurerm_servicebus_subscription" "sub_gas" {
  name               = "sub-processor"
  topic_id           = azurerm_servicebus_topic.t_gas.id
  max_delivery_count = 10
  requires_session   = true
}
resource "azurerm_servicebus_topic" "t_kyc" {
  name                 = "kycverification"
  namespace_id         = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning  = true
}
resource "azurerm_servicebus_subscription" "sub_kyc" {
  name               = "sub-processor"
  topic_id           = azurerm_servicebus_topic.t_kyc.id
  max_delivery_count = 10
  requires_session   = true
}
resource "azurerm_servicebus_topic" "t_merchant" {
  name                 = "merchantwalletsVerification"
  namespace_id         = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning  = true
}
resource "azurerm_servicebus_subscription" "sub_merchant" {
  name               = "sub-processor"
  topic_id           = azurerm_servicebus_topic.t_merchant.id
  max_delivery_count = 10
  requires_session   = true
}
resource "azurerm_servicebus_topic" "t_mesta" {
  name                 = "mestasendercreation"
  namespace_id         = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning  = true
}
resource "azurerm_servicebus_subscription" "sub_mesta" {
  name               = "sub-processor"
  topic_id           = azurerm_servicebus_topic.t_mesta.id
  max_delivery_count = 10
  requires_session   = true
}
resource "azurerm_servicebus_topic" "t_mobile" {
  name                 = "mobilenotifications"
  namespace_id         = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning  = true
}
resource "azurerm_servicebus_subscription" "sub_mobile" {
  name               = "sub-processor"
  topic_id           = azurerm_servicebus_topic.t_mobile.id
  max_delivery_count = 10
  requires_session   = true
}
resource "azurerm_servicebus_topic" "t_avenia" {
  name                 = "aveniasubaccountcreation"
  namespace_id         = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning  = true
}
resource "azurerm_servicebus_subscription" "sub_avenia" {
  name               = "AveniaSubAccountCreationSubscription"
  topic_id           = azurerm_servicebus_topic.t_avenia.id
  max_delivery_count = 10
  requires_session   = true 
}
resource "azurerm_servicebus_topic" "t_kyc_kyb" {
  name                 = "kycandkybverification"
  namespace_id         = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning  = true
}
resource "azurerm_servicebus_topic" "t_payees" {
  name                 = "payeesonbankaccount"
  namespace_id         = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning  = true
}
resource "azurerm_servicebus_subscription" "sub_payees" {
  name               = "PayeesOnBankAccountSubscription"
  topic_id           = azurerm_servicebus_topic.t_payees.id
  max_delivery_count = 10
  requires_session   = true
}
resource "azurerm_servicebus_topic" "t_cust_update" {
  name                 = "updatecustomeraddressandstatus"
  namespace_id         = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning  = true
}
resource "azurerm_servicebus_subscription" "sub_cust_update" {
  name               = "updatecustomeraddressandstatussubscriber"
  topic_id           = azurerm_servicebus_topic.t_cust_update.id
  max_delivery_count = 10
  requires_session   = true
}
resource "azurerm_servicebus_topic" "t_batch_payout" {
  name                 = "BatchPayOutTransactions"
  namespace_id         = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning  = true
}

# --- APP INSIGHTS ---
resource "azurerm_log_analytics_workspace" "law" {
  name                = "${local._name_prefix}-law"
  location            = azurerm_resource_group.rg_apps.location
  resource_group_name = azurerm_resource_group.rg_apps.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
  tags                = local.common_tags
}

resource "azurerm_application_insights" "appinsights" {
  name                = "${local._name_prefix}-insights"
  location            = azurerm_resource_group.rg_apps.location
  resource_group_name = azurerm_resource_group.rg_apps.name
  workspace_id        = azurerm_log_analytics_workspace.law.id
  application_type    = "web"
  tags                = local.common_tags
}

# ==============================================================================
#  KEY VAULT & SECRETS
# ==============================================================================
module "key_vault" {
  source              = "../../modules/key_vault"
  key_vault_name      = local.key_vault_name
  location            = azurerm_resource_group.rg_security.location
  resource_group_name = azurerm_resource_group.rg_security.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  tags                = local.common_tags
}

resource "azurerm_role_assignment" "kv_admin_rbac" {
  scope                = module.key_vault.id
  role_definition_name = "Key Vault Administrator"
  principal_id         = data.azurerm_client_config.current.object_id
}
resource "azurerm_role_assignment" "vm_kv_access" {
  scope                = module.key_vault.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_windows_virtual_machine.vm_sql.identity[0].principal_id
}

# --- SECRETS (Complete List) ---
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
  name         = "AccountSid" # Standardized
  value        = var.twilio_account_sid
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}
resource "azurerm_key_vault_secret" "twilio_auth" {
  name         = "AuthToken"
  value        = var.twilio_auth_token
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}
resource "azurerm_key_vault_secret" "twilio_service" {
  name         = "ServiceId"
  value        = var.twilio_service_id
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}
resource "azurerm_key_vault_secret" "sumsub_token" {
  name         = "SUMSUB-APP-TOKEN"
  value        = var.sumsub_app_token
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}
resource "azurerm_key_vault_secret" "sumsub_key" {
  name         = "SUMSUB-SECRET-KEY"
  value        = var.sumsub_secret_key
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}
resource "azurerm_key_vault_secret" "powerbi_pass" {
  name         = "pbiPassword"
  value        = var.powerbi_password
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}
resource "azurerm_key_vault_secret" "token_key" {
  name         = "TokenEncryptkey"
  value        = var.token_encrypt_key
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}
resource "azurerm_key_vault_secret" "app_secret" {
  name         = "SecretKey"
  value        = var.app_secret_key
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}
resource "azurerm_key_vault_secret" "redis_conn" {
  name         = "RedisConnection"
  value        = var.redis_connection_string
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}
resource "azurerm_key_vault_secret" "vault_db_conn" {
  name         = "Vault-DbConnection"
  value        = var.vault_db_connection_string
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}
resource "azurerm_key_vault_secret" "general_api_key" {
  name         = "General-ApiKey"
  value        = var.general_api_key
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}
resource "azurerm_key_vault_secret" "general_api_secret" {
  name         = "General-ApiSecretKey"
  value        = var.general_api_secret_key
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}
resource "azurerm_key_vault_secret" "client_secret_val" {
  name         = "ClientSecret-Value"
  value        = var.client_secret_value
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}
resource "azurerm_key_vault_secret" "easylink_key" {
  name         = "EasyLink-AppKey"
  value        = var.easylink_app_key
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}
resource "azurerm_key_vault_secret" "easylink_secret" {
  name         = "EasyLink-AppSecret"
  value        = var.easylink_app_secret
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}
resource "azurerm_key_vault_secret" "storage_key" {
  name         = "StorageAccount-AccountKey"
  value        = module.storage_account.primary_access_key
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}
resource "azurerm_key_vault_secret" "db_conn" {
  name         = "ConnectionStrings-DefaultConnection"
  value        = "Data Source=tcp:${azurerm_windows_virtual_machine.vm_sql.private_ip_address},1433;Initial Catalog=${var.client_name}DB;User Id=${var.client_name}_app_user;Password=${var.app_sql_password};MultipleActiveResultSets=True;TrustServerCertificate=True;"
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}
resource "azurerm_key_vault_secret" "sql_password" {
  name         = "SQL-App-Password"
  value        = var.app_sql_password
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}
resource "azurerm_key_vault_secret" "aml_key" {
  name         = "AML-AccessKey"
  value        = var.aml_access_key
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}
resource "azurerm_key_vault_secret" "app_password" {
  name         = "App-Password"
  value        = var.app_password_clear
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}
resource "azurerm_key_vault_secret" "app_password_hash" {
  name         = "App-PasswordHash"
  value        = var.app_password_hash
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}
resource "azurerm_key_vault_secret" "private_key" {
  name         = "App-PrivateKey"
  value        = var.app_private_key
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}
resource "azurerm_key_vault_secret" "public_key" {
  name         = "App-PublicKey"
  value        = var.app_public_key
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}
resource "azurerm_key_vault_secret" "restsharp_token" {
  name         = "RestSharp-AccessToken"
  value        = var.restsharp_access_token
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}
resource "azurerm_key_vault_secret" "x_api_key" {
  name         = "X-Api-Key"
  value        = var.x_api_key
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}
resource "azurerm_key_vault_secret" "firebase_key" {
  name         = "Firebase-ServerKey"
  value        = var.firebase_server_key
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}
resource "azurerm_key_vault_secret" "app_insights_conn" {
  name         = "AppInsights-ConnectionString"
  value        = azurerm_application_insights.appinsights.connection_string
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}

# --- PAYMENTS / CARDS SPECIFIC SECRETS ---
resource "azurerm_key_vault_secret" "ayolinx_key" {
  name         = "AyolinxprivateKeyPem"
  value        = var.ayolinx_private_key
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}
resource "azurerm_key_vault_secret" "ayolinx_token" {
  name         = "AyolinxCustomerToken"
  value        = var.ayolinx_customer_token
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}
resource "azurerm_key_vault_secret" "pyrros_secret" {
  name         = "pyrrosclientsecret"
  value        = var.pyrros_client_secret
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}
resource "azurerm_key_vault_secret" "sendgrid_token" {
  name         = "SendGrid-AuthToken"
  value        = var.sendgrid_auth_token
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}
resource "azurerm_key_vault_secret" "cards_private_key" {
  name         = "CardsPrivateKey"
  value        = var.cards_private_key
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}
resource "azurerm_key_vault_secret" "cards_customer_token" {
  name         = "CardsCustomerToken"
  value        = var.cards_customer_token
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}

# ==============================================================================
#  APP CONFIGURATION MODULE (WEB APPS)
# ==============================================================================
module "app_configuration" {
  source   = "../../modules/app_configuration"
  for_each = toset(var.backend_modules)

  app_name    = each.key
  client_name = var.client_name
  environment = var.environment_name

  secret_uris = {
    twilio_sid         = azurerm_key_vault_secret.twilio_sid.id
    twilio_auth        = azurerm_key_vault_secret.twilio_auth.id
    twilio_service     = azurerm_key_vault_secret.twilio_service.id
    sumsub_token       = azurerm_key_vault_secret.sumsub_token.id
    sumsub_key         = azurerm_key_vault_secret.sumsub_key.id
    token_key          = azurerm_key_vault_secret.token_key.id
    app_secret         = azurerm_key_vault_secret.app_secret.id
    powerbi_pass       = azurerm_key_vault_secret.powerbi_pass.id
    storage_key        = azurerm_key_vault_secret.storage_key.id
    db_conn            = azurerm_key_vault_secret.db_conn.id
    redis_conn         = azurerm_key_vault_secret.redis_conn.id
    vault_db_conn      = azurerm_key_vault_secret.vault_db_conn.id
    general_api_key    = azurerm_key_vault_secret.general_api_key.id
    general_api_secret = azurerm_key_vault_secret.general_api_secret.id
    client_secret_val  = azurerm_key_vault_secret.client_secret_val.id
    easylink_key       = azurerm_key_vault_secret.easylink_key.id
    easylink_secret    = azurerm_key_vault_secret.easylink_secret.id
    aml_key            = azurerm_key_vault_secret.aml_key.id
    app_password       = azurerm_key_vault_secret.app_password.id
    app_password_hash  = azurerm_key_vault_secret.app_password_hash.id
    private_key        = azurerm_key_vault_secret.private_key.id
    public_key         = azurerm_key_vault_secret.public_key.id
    restsharp_token    = azurerm_key_vault_secret.restsharp_token.id
    x_api_key          = azurerm_key_vault_secret.x_api_key.id
    app_insights_connection_string = azurerm_key_vault_secret.app_insights_conn.id
    
    ayolinx_key          = azurerm_key_vault_secret.ayolinx_key.id
    ayolinx_token        = azurerm_key_vault_secret.ayolinx_token.id
    pyrros_secret        = azurerm_key_vault_secret.pyrros_secret.id
    sendgrid_token       = azurerm_key_vault_secret.sendgrid_token.id
    cards_private_key    = azurerm_key_vault_secret.cards_private_key.id
    cards_customer_token = azurerm_key_vault_secret.cards_customer_token.id
    
    # Empty for Web Apps
    firebase_key       = ""
  }

  service_urls = {
    coreapi       = "https://${local._container_prefix}-coreapi-app.azurewebsites.net"
    banksapi      = "https://${local._container_prefix}-banksapi-app.azurewebsites.net"
    cardsapi      = "https://${local._container_prefix}-cardsapi-app.azurewebsites.net"
    exchangeapi   = "https://${local._container_prefix}-exchange-app.azurewebsites.net"
    paymentsapi   = "https://${local._container_prefix}-paymentsapi-app.azurewebsites.net"
    paylinks      = "https://${local._container_prefix}-paylinks-app.azurewebsites.net"
    signalr       = "https://${local._container_prefix}-signal-app.azurewebsites.net"
    integration   = "https://${local._container_prefix}-integ-app.azurewebsites.net"
  }

  sb_connection_string = data.azurerm_servicebus_namespace.sb_lookup.default_primary_connection_string
  auth0_domain         = var.auth0_domain
  auth0_client_id      = var.auth0_client_id
  auth0_client_secret  = var.auth0_client_secret
  
  app_insights_connection_string   = azurerm_application_insights.appinsights.connection_string
  app_insights_instrumentation_key = azurerm_application_insights.appinsights.instrumentation_key

  core_main_account_id    = var.core_main_account_id
  core_external_base_url  = var.core_external_base_url
  auth0_mobile_client_id  = var.auth0_mobile_client_id
  
  sendgrid_config = {
    template_id = var.sendgrid_template_id
    from_email  = "contact@${lower(var.client_name)}.money"
    from_name   = "${var.client_name} Money"
  }
  sendgrid_account_sid    = var.sendgrid_account_sid
  sendgrid_service_id     = var.sendgrid_service_id

  ayolinx_base_url        = var.ayolinx_base_url
  pyrros_client_id        = var.pyrros_client_id
  pyrros_url              = var.pyrros_url
  coingecko_base_url      = var.coingecko_base_url
  hyperpay_url            = var.hyperpay_url

  web3_api_key            = var.web3_api_key
  web3_exchange_id        = var.web3_exchange_id
  web3_payments_id        = var.web3_payments_id
  web3_payment_link_url   = var.web3_payment_link_url
  
  aml_access_id           = var.aml_access_id
}

# ==============================================================================
#  CONTAINER WEB APPS (LINUX)
# ==============================================================================
resource "azurerm_linux_web_app" "container_apps" {
  for_each = { 
    for key, val in local.prd_container_services : key => val 
    if contains(var.backend_modules, key) || key == "admin" || key == "user"
  }
  
  name                = each.key == "user" ? local._container_prefix : "${local._container_prefix}-${each.key}"
  location            = azurerm_resource_group.rg_apps.location
  resource_group_name = azurerm_resource_group.rg_apps.name
  service_plan_id     = azurerm_service_plan.linux_plan.id
  tags                = local.common_tags
  
  identity { type = "SystemAssigned" }

  site_config {
    application_stack {
        docker_image_name        = "mcr.microsoft.com/appsvc/staticsite:latest"
        docker_registry_url      = "https://${azurerm_container_registry.acr.login_server}"
        docker_registry_username = azurerm_container_registry.acr.admin_username
        docker_registry_password = azurerm_container_registry.acr.admin_password
    }
  }
  
  app_settings = merge(
    contains(var.backend_modules, each.key) ? module.app_configuration[each.key].app_settings : {}, 
    {
      "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
      "DOCKER_REGISTRY_SERVER_URL"      = "https://${azurerm_container_registry.acr.login_server}"
      "DOCKER_REGISTRY_SERVER_USERNAME" = azurerm_container_registry.acr.admin_username
      "DOCKER_REGISTRY_SERVER_PASSWORD" = azurerm_container_registry.acr.admin_password
      
      # Secrets that might be needed specifically for Frontend containers (Admin/User) if they aren't in the backend_modules list
      "AUTH0_DOMAIN"       = "${azurerm_key_vault_secret.auth0_domain.id}"
      "MAILGUN_API_KEY"    = "${azurerm_key_vault_secret.mailgun_key.id}"
    }
  )
}

# ==============================================================================
#  FUNCTION CONFIGURATION MODULE
# ==============================================================================
module "function_app_configuration" {
  source   = "../../modules/app_configuration"
  for_each = toset(local.function_config_keys)

  app_name    = each.key
  client_name = var.client_name
  environment = var.environment_name

  # Copy same secrets but include Firebase
  secret_uris = {
    twilio_sid         = azurerm_key_vault_secret.twilio_sid.id
    twilio_auth        = azurerm_key_vault_secret.twilio_auth.id
    twilio_service     = azurerm_key_vault_secret.twilio_service.id
    sumsub_token       = azurerm_key_vault_secret.sumsub_token.id
    sumsub_key         = azurerm_key_vault_secret.sumsub_key.id
    token_key          = azurerm_key_vault_secret.token_key.id
    app_secret         = azurerm_key_vault_secret.app_secret.id
    powerbi_pass       = azurerm_key_vault_secret.powerbi_pass.id
    storage_key        = azurerm_key_vault_secret.storage_key.id
    db_conn            = azurerm_key_vault_secret.db_conn.id
    redis_conn         = azurerm_key_vault_secret.redis_conn.id
    vault_db_conn      = azurerm_key_vault_secret.vault_db_conn.id
    general_api_key    = azurerm_key_vault_secret.general_api_key.id
    general_api_secret = azurerm_key_vault_secret.general_api_secret.id
    client_secret_val  = azurerm_key_vault_secret.client_secret_val.id
    easylink_key       = azurerm_key_vault_secret.easylink_key.id
    easylink_secret    = azurerm_key_vault_secret.easylink_secret.id
    aml_key            = azurerm_key_vault_secret.aml_key.id
    app_password       = azurerm_key_vault_secret.app_password.id
    app_password_hash  = azurerm_key_vault_secret.app_password_hash.id
    private_key        = azurerm_key_vault_secret.private_key.id
    public_key         = azurerm_key_vault_secret.public_key.id
    restsharp_token    = azurerm_key_vault_secret.restsharp_token.id
    x_api_key          = azurerm_key_vault_secret.x_api_key.id
    app_insights_connection_string = azurerm_key_vault_secret.app_insights_conn.id
    
    ayolinx_key          = azurerm_key_vault_secret.ayolinx_key.id
    ayolinx_token        = azurerm_key_vault_secret.ayolinx_token.id
    pyrros_secret        = azurerm_key_vault_secret.pyrros_secret.id
    sendgrid_token       = azurerm_key_vault_secret.sendgrid_token.id
    cards_private_key    = azurerm_key_vault_secret.cards_private_key.id
    cards_customer_token = azurerm_key_vault_secret.cards_customer_token.id

    # Valid for Functions
    firebase_key         = azurerm_key_vault_secret.firebase_key.id
  }

  service_urls = {
    coreapi       = "https://${local._container_prefix}-coreapi-app.azurewebsites.net"
    banksapi      = "https://${local._container_prefix}-banksapi-app.azurewebsites.net"
    cardsapi      = "https://${local._container_prefix}-cardsapi-app.azurewebsites.net"
    exchangeapi   = "https://${local._container_prefix}-exchange-app.azurewebsites.net"
    paymentsapi   = "https://${local._container_prefix}-paymentsapi-app.azurewebsites.net"
    paylinks      = "https://${local._container_prefix}-paylinks-app.azurewebsites.net"
    signalr       = "https://${local._container_prefix}-signal-app.azurewebsites.net"
    integration   = "https://${local._container_prefix}-integ-app.azurewebsites.net"
  }

  sb_connection_string = data.azurerm_servicebus_namespace.sb_lookup.default_primary_connection_string
  auth0_domain         = var.auth0_domain
  auth0_client_id      = var.auth0_client_id
  auth0_client_secret  = var.auth0_client_secret
  
  app_insights_connection_string   = azurerm_application_insights.appinsights.connection_string
  app_insights_instrumentation_key = azurerm_application_insights.appinsights.instrumentation_key

  core_main_account_id    = var.core_main_account_id
  core_external_base_url  = var.core_external_base_url
  auth0_mobile_client_id  = var.auth0_mobile_client_id
  
  sendgrid_config = {
    template_id = var.sendgrid_template_id
    from_email  = "contact@${lower(var.client_name)}.money"
    from_name   = "${var.client_name} Money"
  }

  # New Function Inputs
  company_name           = var.company_name
  company_logo_url       = var.company_logo_url
  aml_access_id          = var.aml_access_id
  collection_vault_id    = var.collection_vault_id
  polygon_wallet_address = var.polygon_wallet_address
  tron_wallet_address    = var.tron_wallet_address
  admin_transaction_mail = var.admin_transaction_mail
  bcc_address_mails      = var.bcc_address_mails
  exchange_url           = var.exchange_url
  login_url              = var.login_url
}

# ==============================================================================
#  FUNCTION APP RESOURCES (Windows Code)
# ==============================================================================

resource "azurerm_windows_function_app" "func_market" {
  name                = local.func_market_name
  location            = azurerm_resource_group.rg_apps.location
  resource_group_name = azurerm_resource_group.rg_apps.name
  service_plan_id     = azurerm_service_plan.windows_plan.id
  
  storage_account_name       = module.storage_account.name
  storage_account_access_key = module.storage_account.primary_access_key
  tags                       = local.common_tags
  
  # --- MODULE INTEGRATION ---
  app_settings = module.function_app_configuration["marketdata"].app_settings

  site_config {
    application_stack {
        dotnet_version = "v8.0"
    }
  }
  
  identity { 
    type = "SystemAssigned" 
  }
}

resource "azurerm_windows_function_app" "func_subscriber" {
  name                = local.func_subscriber_name
  location            = azurerm_resource_group.rg_apps.location
  resource_group_name = azurerm_resource_group.rg_apps.name
  service_plan_id     = azurerm_service_plan.windows_plan.id
  
  storage_account_name       = module.storage_account.name
  storage_account_access_key = module.storage_account.primary_access_key
  tags                       = local.common_tags
  
  # --- MODULE INTEGRATION ---
  app_settings = module.function_app_configuration["subscriber"].app_settings

  site_config {
    application_stack {
        dotnet_version = "v8.0"
    }
  }

  identity { 
    type = "SystemAssigned" 
  }
}

resource "azurerm_windows_function_app" "func_sweep" {
  name                = local.func_sweep_name
  location            = azurerm_resource_group.rg_apps.location
  resource_group_name = azurerm_resource_group.rg_apps.name
  service_plan_id     = azurerm_service_plan.windows_plan.id
  
  storage_account_name       = module.storage_account.name
  storage_account_access_key = module.storage_account.primary_access_key
  tags                       = local.common_tags
  
  # --- MODULE INTEGRATION ---
  # Uses the "sweep" key to pull settings from sweep.tf/function_apps.tf
  app_settings = module.function_app_configuration["sweep"].app_settings

  site_config {
    application_stack {
        dotnet_version = "v8.0"
    }
  }

  identity { 
    type = "SystemAssigned" 
  }
}

# ==============================================================================
#  GRANT KEY VAULT ACCESS (Managed Identity)
# ==============================================================================

resource "azurerm_role_assignment" "func_market_kv" {
  scope                = module.key_vault.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_windows_function_app.func_market.identity[0].principal_id
}

resource "azurerm_role_assignment" "func_sub_kv" {
  scope                = module.key_vault.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_windows_function_app.func_subscriber.identity[0].principal_id
}

resource "azurerm_role_assignment" "func_sweep_kv" {
  scope                = module.key_vault.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_windows_function_app.func_sweep.identity[0].principal_id
}

# --- GRANT ACCESS ---
resource "azurerm_role_assignment" "container_app_kv_access" {
  for_each             = azurerm_linux_web_app.container_apps
  scope                = module.key_vault.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = each.value.identity[0].principal_id
}