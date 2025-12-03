# --- STAGING (STG) CONFIGURATION ---
# Architecture: Linux Container Apps (Docker) + ACR
# Region: Southeast Asia

locals {
  common_tags = {
    "Business-owners"     = "Project Manager"
    "Environment"         = var.environment_name
    "Client"              = var.client_name
    "Technical-owner"     = "DevOps Team"
    "Criticality"         = "2"
  }
  
  _name_prefix = "${var.client_name}-${var.environment_name}"
  _container_prefix = "${var.client_name}${var.environment_name}" # e.g. ArthaStg
  
  # Resource Groups
  network_rg_name          = "rg-${local._name_prefix}-network"
  app_rg_name              = "rg-${local._name_prefix}-app"
  vm_rg_name               = "rg-${local._name_prefix}-vm"
  security_rg_name         = "rg-${local._name_prefix}-security"
  
  # Resources
  vnet_name                = "${local._name_prefix}-vnet"
  sql_vm_name              = "${local._name_prefix}-sqlvm"
  integ_vm_name            = "${local._name_prefix}-integvm"
  acr_name                 = "acr${lower(var.client_name)}${lower(var.environment_name)}${substr(md5(timestamp()), 0, 3)}"
  
  key_vault_name           = "${local._name_prefix}-kv-${substr(md5(timestamp()), 0, 5)}"
  storage_account_name     = "st${lower(var.client_name)}${lower(var.environment_name)}${substr(md5(timestamp()), 0, 3)}"
  service_bus_namespace_name = "${local._name_prefix}-bus"
  
  # Plans
  plan_linux_name          = "${local._name_prefix}-plan-linux"
  plan_windows_name        = "${local._name_prefix}-plan-windows" # Needed for Functions

  # Function Names
  func_market_name         = "${local._name_prefix}-Marketdata"
  func_subscriber_name     = "${local._name_prefix}-Subscriber"
  func_sweep_name          = "${local._name_prefix}-Sweep"
  function_config_keys     = ["marketdata", "subscriber", "sweep"]

  # STG Network Config
  vnet_address_space       = ["10.10.0.0/16"]
  subnets = {
    "sqlVmSubnet"         = { address_prefixes = ["10.10.1.0/24"] }
    "IntegrationvmSubnet" = { address_prefixes = ["10.10.2.0/24"] }
    "PrivateEndpoints"    = { address_prefixes = ["10.10.3.0/24"] }
  }

  # --- CONTAINER MAPPING ---
  # Maps the module name (e.g. 'coreapi') to the Docker Image name suffix (e.g. 'coreapi-app')
  # Image: Rapidz/coreapi-app
  stg_container_services = {
    "coreapi"     = "coreapi-app"
    "cardsapi"    = "cardsapi-app"
    "banksapi"    = "banksapi-app"
    "paymentsapi" = "paymentsapi-app"
    "paylinks"    = "paylinks-app"
    "signalR"     = "signal-app"
    "api"         = "api-app"
    "exchangeapi" = "exchange-app"
    "integration" = "integ-app"
    "admin"       = "admin-app"
    "user"        = "user-app"
  }
  # --- SQL DATA DISKS CONFIGURATION ---
  sql_data_disks = {
    "disk1" = {
      name                 = "sql-data"
      disk_size_gb         = 32
      lun                  = 0
      caching              = "ReadWrite" 
      storage_account_type = "Standard_LRS"
      create_option        = "Empty"  # <--- ADD THIS LINE
    },
    "disk2" = {
      name                 = "sql-logs"
      disk_size_gb         = 32
      lun                  = 1
      caching              = "ReadWrite" 
      storage_account_type = "Standard_LRS"
      create_option        = "Empty"  # <--- ADD THIS LINE
    }
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
  private_endpoints_subnet_name = "PrivateEndpoints"
  depends_on                    = [azurerm_resource_group.rg_network]
}

# ==============================================================================
#  SQL INFRASTRUCTURE MODULE
# ==============================================================================
module "sql_infrastructure" {
  source              = "../../modules/sql_infrastructure"
  
  vm_name             = local.vm_name
  location            = azurerm_resource_group.rg_infra.location
  resource_group_name = azurerm_resource_group.rg_infra.name
  tags                = local.common_tags
  subnet_id           = module.networking.subnet_ids["vm-subnet"]
  
  # Size & Creds
  vm_size             = "Standard_B2ms"
  admin_username      = var.vm_admin_username
  admin_password      = var.vm_admin_password
  
  # DB Setup Inputs
  client_name         = var.client_name
  app_sql_password    = var.app_sql_password

  # Disk Config (Passed from locals)
  data_disks          = local.sql_data_disks
}


# --- INTEGRATION VM ---
# (Kept as is from STG original)
resource "azurerm_public_ip" "pip_integ" {
  name                = "pip-${local.integ_vm_name}"
  location            = azurerm_resource_group.rg_vm.location
  resource_group_name = azurerm_resource_group.rg_vm.name
  allocation_method   = "Static"
  sku                 = "Standard"
  tags                = local.common_tags
}
resource "azurerm_network_interface" "nic_integ" {
  name                = "nic-${local.integ_vm_name}"
  location            = azurerm_resource_group.rg_vm.location
  resource_group_name = azurerm_resource_group.rg_vm.name
  tags                = local.common_tags
  ip_configuration {
    name                          = "internal"
    subnet_id                     = module.networking.subnet_ids["IntegrationvmSubnet"]
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.pip_integ.id
  }
}
resource "azurerm_windows_virtual_machine" "vm_integ" {
  name                = local.integ_vm_name
  computer_name       = substr(local.integ_vm_name, 0, 15)
  resource_group_name = azurerm_resource_group.rg_vm.name
  location            = azurerm_resource_group.rg_vm.location
  size                = "Standard_B1ms" 
  admin_username      = var.vm_admin_username
  admin_password      = var.vm_admin_password
  network_interface_ids = [azurerm_network_interface.nic_integ.id]
  tags                = local.common_tags
  source_image_reference {
    publisher = "MicrosoftWindowsServer"
    offer     = "WindowsServer"
    sku       = "2022-Datacenter"
    version   = "latest"
  }
  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }
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

# Needed for Functions (Code)
resource "azurerm_service_plan" "windows_plan" {
  name                = local.plan_windows_name
  location            = azurerm_resource_group.rg_apps.location
  resource_group_name = azurerm_resource_group.rg_apps.name
  os_type             = "Windows"
  sku_name            = "B1"
  tags                = local.common_tags
}

# ==============================================================================
#  FUNCTION APPS (Modularized)
# ==============================================================================

# Map internal keys (marketdata) to Display Name Suffixes (Marketdata)
locals {
  # Defines the suffix for each function: 
  # "marketdata" -> "Artha-tst-Marketdata"
  # "subscriber" -> "Artha-tst-Subscriber"
  # "sweep"      -> "Artha-tst-Sweep"
  func_name_suffixes = {
    "marketdata" = "Marketdata"
    "subscriber" = "Subscriber"
    "sweep"      = "Sweep"
  }
}

module "function_apps" {
  source   = "../../modules/function_app"
  for_each = toset(local.function_config_keys) # ["marketdata", "subscriber", "sweep"]

  # 1. Dynamic Naming: Prefix + Suffix from map
  function_app_name          = "${local._name_prefix}-${local.func_name_suffixes[each.key]}"
  
  location                   = azurerm_resource_group.rg_apps.location
  resource_group_name        = azurerm_resource_group.rg_apps.name
  service_plan_id            = azurerm_service_plan.windows_plan.id
  storage_account_name       = module.storage_account.name
  storage_account_access_key = module.storage_account.primary_access_key
  key_vault_id               = module.key_vault.id # Auto-grants access
  tags                       = local.common_tags

  # 2. Dynamic Configuration: Pulls from the config module
  app_settings               = module.function_app_configuration[each.key].app_settings
  
  dotnet_version             = "v8.0"
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
  source                     = "../../modules/service_bus"
  service_bus_namespace_name = local.service_bus_namespace_name
  location                   = azurerm_resource_group.rg_apps.location
  resource_group_name        = azurerm_resource_group.rg_apps.name
  sku                        = "Standard"
  tags                       = local.common_tags

  # --- 1. QUEUES ---
  queues = {
    "processing-queue"        = { partitioning_enabled = true, requires_session = true }
    "cardsqueue"              = { partitioning_enabled = true, requires_session = true }
    "depositandwithdrawqueue" = { partitioning_enabled = true, requires_session = true }
    "loyaltyprogram"          = { partitioning_enabled = true, requires_session = true }
    "orderqueue"              = { partitioning_enabled = true, requires_session = true }
    "buyandsellqueue"         = { partitioning_enabled = true, requires_session = true }
  }

  # --- 2. TOPICS ---
  topics = {
    "market-data-events"             = { partitioning_enabled = true }
    "amlriskscore"                   = { partitioning_enabled = true }
    "auditlogs"                      = { partitioning_enabled = true }
    "emailnotifications"             = { partitioning_enabled = true }
    "fillgasfee"                     = { partitioning_enabled = true }
    "kycverification"                = { partitioning_enabled = true }
    "merchantwalletsVerification"    = { partitioning_enabled = true }
    "mestasendercreation"            = { partitioning_enabled = true }
    "mobilenotifications"            = { partitioning_enabled = true }
    "aveniasubaccountcreation"       = { partitioning_enabled = true }
    "kycandkybverification"          = { partitioning_enabled = true }
    "payeesonbankaccount"            = { partitioning_enabled = true }
    "updatecustomeraddressandstatus" = { partitioning_enabled = true }
    "BatchPayOutTransactions"        = { partitioning_enabled = true }
  }

  # --- 3. SUBSCRIPTIONS ---
  # Format: "SubscriptionName" = { topic_name = "TopicName", ... }
  subscriptions = {
    "subscriber-service"                       = { topic_name = "market-data-events",             max_delivery_count = 10, requires_session = true }
    "sub-processor-aml"                        = { topic_name = "amlriskscore",                   max_delivery_count = 10, requires_session = true }
    "sub-processor-audit"                      = { topic_name = "auditlogs",                      max_delivery_count = 10, requires_session = true }
    "sub-processor-email"                      = { topic_name = "emailnotifications",             max_delivery_count = 10, requires_session = true }
    "sub-processor-gas"                        = { topic_name = "fillgasfee",                     max_delivery_count = 10, requires_session = true }
    "sub-processor-kyc"                        = { topic_name = "kycverification",                max_delivery_count = 10, requires_session = true }
    "sub-processor-merchant"                   = { topic_name = "merchantwalletsVerification",    max_delivery_count = 10, requires_session = true }
    "sub-processor-mesta"                      = { topic_name = "mestasendercreation",            max_delivery_count = 10, requires_session = true }
    "sub-processor-mobile"                     = { topic_name = "mobilenotifications",            max_delivery_count = 10, requires_session = true }
    "AveniaSubAccountCreationSubscription"     = { topic_name = "aveniasubaccountcreation",       max_delivery_count = 10, requires_session = true }
    "PayeesOnBankAccountSubscription"          = { topic_name = "payeesonbankaccount",            max_delivery_count = 10, requires_session = true }
    "updatecustomeraddressandstatussubscriber" = { topic_name = "updatecustomeraddressandstatus", max_delivery_count = 10, requires_session = true }
  }
}

data "azurerm_servicebus_namespace" "sb_lookup" {
  name                = local.service_bus_namespace_name
  resource_group_name = azurerm_resource_group.rg_apps.name
  depends_on          = [module.service_bus]
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
#  KEY VAULT & SECRETS (Mirrored from TST)
# ==============================================================================
module "key_vault" {
  source              = "../../modules/key_vault"
  key_vault_name      = local.key_vault_name
  location            = azurerm_resource_group.rg_security.location
  resource_group_name = azurerm_resource_group.rg_security.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  tags                = local.common_tags

  # --- CREATE ALL SECRETS HERE ---
  secrets = {
    # Legacy / existing secrets
    "Auth0-Domain"            = var.auth0_domain
    "Mailgun-ApiKey"          = var.mailgun_key
    "Twilio-SID"              = var.twilio_sid # Keeping old name if needed, or use AccountSid
    "SQL-App-Password"        = var.app_sql_password

    # Standard App Secrets
    "AccountSid"              = var.twilio_account_sid
    "AuthToken"               = var.twilio_auth_token
    "ServiceId"               = var.twilio_service_id
    "SUMSUB-APP-TOKEN"        = var.sumsub_app_token
    "SUMSUB-SECRET-KEY"       = var.sumsub_secret_key
    "pbiPassword"             = var.powerbi_password
    "TokenEncryptkey"         = var.token_encrypt_key
    "SecretKey"               = var.app_secret_key
    "RedisConnection"         = var.redis_connection_string
    "Vault-DbConnection"      = var.vault_db_connection_string
    "General-ApiKey"          = var.general_api_key
    "General-ApiSecretKey"    = var.general_api_secret_key
    "ClientSecret-Value"      = var.client_secret_value
    "EasyLink-AppKey"         = var.easylink_app_key
    "EasyLink-AppSecret"      = var.easylink_app_secret
    "AML-AccessKey"           = var.aml_access_key
    "App-Password"            = var.app_password_clear
    "App-PasswordHash"        = var.app_password_hash
    "App-PrivateKey"          = var.app_private_key
    "App-PublicKey"           = var.app_public_key
    "RestSharp-AccessToken"   = var.restsharp_access_token
    "X-Api-Key"               = var.x_api_key
    "Firebase-ServerKey"      = var.firebase_server_key

    # Payments & Cards
    "AyolinxprivateKeyPem"    = var.ayolinx_private_key
    "AyolinxCustomerToken"    = var.ayolinx_customer_token
    "pyrrosclientsecret"      = var.pyrros_client_secret
    "SendGrid-AuthToken"      = var.sendgrid_auth_token
    "CardsPrivateKey"         = var.cards_private_key
    "CardsCustomerToken"      = var.cards_customer_token

    # Infrastructure Computed Secrets
    "StorageAccount-AccountKey"         = module.storage_account.primary_access_key
    "AppInsights-ConnectionString"      = azurerm_application_insights.appinsights.connection_string
    "ConnectionStrings-DefaultConnection" = "Data Source=tcp:${azurerm_windows_virtual_machine.vm_sql.private_ip_address},1433;Initial Catalog=${var.client_name}DB;User Id=${var.client_name}_app_user;Password=${var.app_sql_password};MultipleActiveResultSets=True;TrustServerCertificate=True;"
  }
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

# --- SECRETS (Copy of TST list) ---
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
  name         = "Twilio-SID" # Kept old name if critical, or standardize to "AccountSid"
  value        = var.twilio_account_sid
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}
resource "azurerm_key_vault_secret" "sql_password" {
  name         = "SQL-App-Password"
  value        = var.app_sql_password
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}
# ... (Add all the other 20+ secrets here using the exact same resource blocks as TST/main.tf)
# NOTE: I recommend copying the entire Secrets block from TST/main.tf here to ensure the module has everything.

# ==============================================================================
#  APP CONFIGURATION MODULE (STAGING)
# ==============================================================================
module "app_configuration" {
  source   = "../../modules/app_configuration"
  for_each = toset(var.backend_modules)

  app_name    = each.key
  client_name = var.client_name
  environment = var.environment_name

  # --- 1. SECRET URIs (Direct mapping to Key Vault IDs) ---
  secret_uris = {
    twilio_sid         = module.key_vault.secret_ids["AccountSid"]
    twilio_auth        = module.key_vault.secret_ids["AuthToken"]
    twilio_service     = module.key_vault.secret_ids["ServiceId"]
    sumsub_token       = module.key_vault.secret_ids["SUMSUB-APP-TOKEN"]
    sumsub_key         = module.key_vault.secret_ids["SUMSUB-SECRET-KEY"]
    token_key          = module.key_vault.secret_ids["TokenEncryptkey"]
    app_secret         = module.key_vault.secret_ids["SecretKey"]
    powerbi_pass       = module.key_vault.secret_ids["pbiPassword"]
    storage_key        = module.key_vault.secret_ids["StorageAccount-AccountKey"]
    db_conn            = module.key_vault.secret_ids["ConnectionStrings-DefaultConnection"]
    redis_conn         = module.key_vault.secret_ids["RedisConnection"]
    vault_db_conn      = module.key_vault.secret_ids["Vault-DbConnection"]
    general_api_key    = module.key_vault.secret_ids["General-ApiKey"]
    general_api_secret = module.key_vault.secret_ids["General-ApiSecretKey"]
    client_secret_val  = module.key_vault.secret_ids["ClientSecret-Value"]
    easylink_key       = module.key_vault.secret_ids["EasyLink-AppKey"]
    easylink_secret    = module.key_vault.secret_ids["EasyLink-AppSecret"]
    aml_key            = module.key_vault.secret_ids["AML-AccessKey"]
    app_password       = module.key_vault.secret_ids["App-Password"]
    app_password_hash  = module.key_vault.secret_ids["App-PasswordHash"]
    private_key        = module.key_vault.secret_ids["App-PrivateKey"]
    public_key         = module.key_vault.secret_ids["App-PublicKey"]
    restsharp_token    = module.key_vault.secret_ids["RestSharp-AccessToken"]
    x_api_key          = module.key_vault.secret_ids["X-Api-Key"]
    
    # App Insights
    app_insights_connection_string = module.key_vault.secret_ids["AppInsights-ConnectionString"]
    
    # Payments/Cards
    ayolinx_key          = module.key_vault.secret_ids["AyolinxprivateKeyPem"]
    ayolinx_token        = module.key_vault.secret_ids["AyolinxCustomerToken"]
    pyrros_secret        = module.key_vault.secret_ids["pyrrosclientsecret"]
    sendgrid_token       = module.key_vault.secret_ids["SendGrid-AuthToken"]
    cards_private_key    = module.key_vault.secret_ids["CardsPrivateKey"]
    cards_customer_token = module.key_vault.secret_ids["CardsCustomerToken"]

    firebase_key         = ""
  }

  # --- 2. SERVICE URLs (Staging Specific Naming) ---
  # Staging uses: https://ArthaStg-coreapi-app.azurewebsites.net
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

  # --- 3. STANDARD CONFIGURATIONS ---
  sb_connection_string = module.service_bus.default_primary_connection_string
  auth0_domain         = var.auth0_domain
  auth0_client_id      = var.auth0_client_id
  auth0_client_secret  = var.auth0_client_secret

  # --- 4. RAW APP INSIGHTS VALUES ---
  app_insights_connection_string   = azurerm_application_insights.appinsights.connection_string
  app_insights_instrumentation_key = azurerm_application_insights.appinsights.instrumentation_key

  # --- 5. SPECIFIC INPUTS (Passed from Variables) ---
  
  # Core API
  core_main_account_id    = var.core_main_account_id
  core_external_base_url  = var.core_external_base_url
  auth0_mobile_client_id  = var.auth0_mobile_client_id
  
  # SendGrid
  sendgrid_config = {
    template_id = var.sendgrid_template_id
    from_email  = "contact@${lower(var.client_name)}.money"
    from_name   = "${var.client_name} Money"
  }
  sendgrid_account_sid    = var.sendgrid_account_sid
  sendgrid_service_id     = var.sendgrid_service_id

  # Payments API
  ayolinx_base_url        = var.ayolinx_base_url
  pyrros_client_id        = var.pyrros_client_id
  pyrros_url              = var.pyrros_url
  coingecko_base_url      = var.coingecko_base_url
  hyperpay_url            = var.hyperpay_url

  # Web3 (Cards/Payments)
  web3_api_key            = var.web3_api_key
  web3_exchange_id        = var.web3_exchange_id
  web3_payments_id        = var.web3_payments_id
  web3_payment_link_url   = var.web3_payment_link_url

  # General
  aml_access_id           = var.aml_access_id
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

  # Same secret list as above, but include Firebase
  secret_uris = {
    twilio_sid         = module.key_vault.secret_ids["AccountSid"]
    twilio_auth        = module.key_vault.secret_ids["AuthToken"]
    twilio_service     = module.key_vault.secret_ids["ServiceId"]
    sumsub_token       = module.key_vault.secret_ids["SUMSUB-APP-TOKEN"]
    sumsub_key         = module.key_vault.secret_ids["SUMSUB-SECRET-KEY"]
    token_key          = module.key_vault.secret_ids["TokenEncryptkey"]
    app_secret         = module.key_vault.secret_ids["SecretKey"]
    powerbi_pass       = module.key_vault.secret_ids["pbiPassword"]
    storage_key        = module.key_vault.secret_ids["StorageAccount-AccountKey"]
    db_conn            = module.key_vault.secret_ids["ConnectionStrings-DefaultConnection"]
    redis_conn         = module.key_vault.secret_ids["RedisConnection"]
    vault_db_conn      = module.key_vault.secret_ids["Vault-DbConnection"]
    general_api_key    = module.key_vault.secret_ids["General-ApiKey"]
    general_api_secret = module.key_vault.secret_ids["General-ApiSecretKey"]
    client_secret_val  = module.key_vault.secret_ids["ClientSecret-Value"]
    easylink_key       = module.key_vault.secret_ids["EasyLink-AppKey"]
    easylink_secret    = module.key_vault.secret_ids["EasyLink-AppSecret"]
    aml_key            = module.key_vault.secret_ids["AML-AccessKey"]
    app_password       = module.key_vault.secret_ids["App-Password"]
    app_password_hash  = module.key_vault.secret_ids["App-PasswordHash"]
    private_key        = module.key_vault.secret_ids["App-PrivateKey"]
    public_key         = module.key_vault.secret_ids["App-PublicKey"]
    restsharp_token    = module.key_vault.secret_ids["RestSharp-AccessToken"]
    x_api_key          = module.key_vault.secret_ids["X-Api-Key"]
    
    # App Insights
    app_insights_connection_string = module.key_vault.secret_ids["AppInsights-ConnectionString"]
    
    # Payments/Cards
    ayolinx_key          = module.key_vault.secret_ids["AyolinxprivateKeyPem"]
    ayolinx_token        = module.key_vault.secret_ids["AyolinxCustomerToken"]
    pyrros_secret        = module.key_vault.secret_ids["pyrrosclientsecret"]
    sendgrid_token       = module.key_vault.secret_ids["SendGrid-AuthToken"]
    cards_private_key    = module.key_vault.secret_ids["CardsPrivateKey"]
    cards_customer_token = module.key_vault.secret_ids["CardsCustomerToken"]

    firebase_key = module.key_vault.secret_ids["Firebase-ServerKey"]
  }

  # --- Service URLs ---
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

  # --- Inputs ---
  sb_connection_string   = data.azurerm_servicebus_namespace.sb_lookup.default_primary_connection_string
  auth0_domain           = var.auth0_domain
  auth0_client_id        = var.auth0_client_id
  auth0_client_secret    = var.auth0_client_secret
  
  core_main_account_id   = var.core_main_account_id
  core_external_base_url = var.core_external_base_url
  auth0_mobile_client_id = var.auth0_mobile_client_id
  sendgrid_config = {
    template_id = var.sendgrid_template_id
    from_email  = "contact@${lower(var.client_name)}.money"
    from_name   = "${var.client_name} Money"
  }
  
  # App Insights Raw
  app_insights_connection_string   = azurerm_application_insights.appinsights.connection_string
  app_insights_instrumentation_key = azurerm_application_insights.appinsights.instrumentation_key

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
#  CONTAINER WEB APPS (LINUX)
# ==============================================================================
resource "azurerm_linux_web_app" "container_apps" {
  for_each = { 
    for key, val in local.stg_container_services : key => val 
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
        docker_image_name        = "mcr.microsoft.com/appsvc/staticsite:latest" # Placeholder
        docker_registry_url      = "https://${azurerm_container_registry.acr.login_server}"
        docker_registry_username = azurerm_container_registry.acr.admin_username
        docker_registry_password = azurerm_container_registry.acr.admin_password
    }
  }
  
  # --- MERGE MODULE SETTINGS WITH DOCKER SETTINGS ---
  # 1. Try to get module settings (if it's a backend app)
  # 2. Add Docker credentials (required for all)
  # 3. Add any other static overrides
  
  app_settings = merge(
    contains(var.backend_modules, each.key) ? module.app_configuration[each.key].app_settings : {}, 
    {
      "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
      "DOCKER_REGISTRY_SERVER_URL"      = "https://${azurerm_container_registry.acr.login_server}"
      "DOCKER_REGISTRY_SERVER_USERNAME" = azurerm_container_registry.acr.admin_username
      "DOCKER_REGISTRY_SERVER_PASSWORD" = azurerm_container_registry.acr.admin_password
      
      # Legacy specific overrides for STG can go here if needed
    }
  )
}

# ==============================================================================
#  FUNCTION APPS (Modularized)
# ==============================================================================

# Map internal keys (marketdata) to Display Name Suffixes (Marketdata)
locals {
  # Defines the suffix for each function: 
  # "marketdata" -> "Artha-tst-Marketdata"
  # "subscriber" -> "Artha-tst-Subscriber"
  # "sweep"      -> "Artha-tst-Sweep"
  func_name_suffixes = {
    "marketdata" = "Marketdata"
    "subscriber" = "Subscriber"
    "sweep"      = "Sweep"
  }
}

module "function_apps" {
  source   = "../../modules/function_app"
  for_each = toset(local.function_config_keys)

  function_app_name          = "${local._name_prefix}-${local.func_name_suffixes[each.key]}"
  
  location                   = azurerm_resource_group.rg_apps.location
  resource_group_name        = azurerm_resource_group.rg_apps.name
  
  #  CORRECT ARGUMENT NAME:
  service_plan_id            = azurerm_service_plan.windows_plan.id
  
  storage_account_name       = module.storage_account.name
  storage_account_access_key = module.storage_account.primary_access_key
  key_vault_id               = module.key_vault.id
  tags                       = local.common_tags

  app_settings               = module.function_app_configuration[each.key].app_settings
  dotnet_version             = "v8.0"
}