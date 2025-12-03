# --- TEST (TST) CONFIGURATION ---
# Type: Native Code (App Service)
# Region: Southeast Asia (Default)
# SKU: Basic (B1)

locals {
  common_tags = {
    "Business-owners"     = "Project Manager"
    "Environment"         = var.environment_name
    "Client"              = var.client_name
    "Technical-owner"     = "DevOps Team"
  }
  
  _name_prefix = "${var.client_name}-${var.environment_name}"
  
  # Resource Groups
  app_rg_name              = "rg-${local._name_prefix}-apps"
  vm_rg_name               = "rg-${local._name_prefix}-vm"
  
  # VM & Network
  vnet_name                = "${local._name_prefix}-vnet"
  vm_name                  = "${local._name_prefix}-sqlvm"
  
  # Shared Resources
  key_vault_name           = "${local._name_prefix}-kv-${substr(md5(timestamp()), 0, 5)}"
  storage_account_name     = "st${lower(var.client_name)}${lower(var.environment_name)}${substr(md5(timestamp()), 0, 3)}"
  service_bus_namespace_name = "${local._name_prefix}-bus"
  
  # App Service Plans
  plan_linux_name          = "${local._name_prefix}-plan-linux"   # For Node UI
  plan_windows_name        = "${local._name_prefix}-plan-windows" # For .NET Backend & Functions

  # --- FIXED UI NAMES (Node) ---
  ui_app_name              = "${local._name_prefix}-App"
  ui_admin_name            = "${local._name_prefix}-Admin"

  # --- FIXED FUNCTION NAMES (.NET) ---
  func_market_name         = "${local._name_prefix}-Marketdata"
  func_subscriber_name     = "${local._name_prefix}-Subscriber"
  func_sweep_name      = "${local._name_prefix}-Sweep"

  # Network Config
  vnet_address_space       = ["10.0.0.0/16"]
  subnets = {
    "vm-subnet" = { address_prefixes = ["10.0.1.0/24"] }
    "pep-subnet" = { address_prefixes = ["10.0.2.0/24"] }
  }
  function_config_keys = ["marketdata", "subscriber", "sweep"]
  # --- SQL DATA DISKS CONFIGURATION ---
  sql_data_disks = {
    "disk1" = {
      name                 = "sql-data"
      disk_size_gb         = 32
      lun                  = 0
      caching              = "ReadWrite" 
      storage_account_type = "Standard_LRS"
    },
    "disk2" = {
      name                 = "sql-logs"
      disk_size_gb         = 32
      lun                  = 1
      caching              = "ReadWrite" 
      storage_account_type = "Standard_LRS"
    }
  }
}

data "azurerm_client_config" "current" {}

# --- Resource Groups ---
resource "azurerm_resource_group" "rg_apps" {
  name     = local.app_rg_name
  location = var.location
  tags     = local.common_tags
}

resource "azurerm_resource_group" "rg_infra" {
  name     = local.vm_rg_name
  location = var.location
  tags     = local.common_tags
}

# --- Networking ---
module "networking" {
  source                        = "../../modules/networking"
  vnet_name                     = local.vnet_name
  location                      = azurerm_resource_group.rg_infra.location
  resource_group_name           = azurerm_resource_group.rg_infra.name
  tags                          = local.common_tags
  vnet_address_space            = local.vnet_address_space
  subnets                       = local.subnets
  private_endpoints_subnet_name = "pep-subnet"
  depends_on                    = [azurerm_resource_group.rg_infra]
}

# --- Public IP & NIC ---
resource "azurerm_public_ip" "pip" {
  name                = "pip-${local.vm_name}"
  location            = azurerm_resource_group.rg_infra.location
  resource_group_name = azurerm_resource_group.rg_infra.name
  allocation_method   = "Static"
  sku                 = "Standard"
  tags                = local.common_tags
}

resource "azurerm_network_interface" "nic" {
  name                = "nic-${local.vm_name}"
  location            = azurerm_resource_group.rg_infra.location
  resource_group_name = azurerm_resource_group.rg_infra.name
  tags                = local.common_tags
  ip_configuration {
    name                          = "internal"
    subnet_id                     = module.networking.subnet_ids["vm-subnet"]
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.pip.id
  }
}

# --- NETWORK SECURITY GROUP (NSG) ---
resource "azurerm_network_security_group" "nsg" {
  name                = "${local._name_prefix}-nsg"
  location            = azurerm_resource_group.rg_infra.location
  resource_group_name = azurerm_resource_group.rg_infra.name
  tags                = local.common_tags

  # Rule 1: Allow SQL (1433)
  security_rule {
    name                       = "AllowSQL"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "1433"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  # Rule 2: Allow RDP (3389)
  security_rule {
    name                       = "AllowRDP"
    priority                   = 110
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "3389"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

# --- ATTACH NSG TO NIC ---
resource "azurerm_network_interface_security_group_association" "nsg_assoc" {
  network_interface_id      = azurerm_network_interface.nic.id
  network_security_group_id = azurerm_network_security_group.nsg.id
}

# --- SQL Virtual Machine ---
resource "azurerm_windows_virtual_machine" "vm" {
  name                = local.vm_name
  computer_name       = substr(local.vm_name, 0, 15)
  resource_group_name = azurerm_resource_group.rg_infra.name
  location            = azurerm_resource_group.rg_infra.location
  size                = "Standard_B2ms"
  admin_username      = var.vm_admin_username
  admin_password      = var.vm_admin_password
  network_interface_ids = [azurerm_network_interface.nic.id]
  tags                = local.common_tags

  # Enable Managed Identity for Key Vault Access
  identity {
    type = "SystemAssigned"
  }

  source_image_reference {
    publisher = "MicrosoftSQLServer"
    offer     = "sql2022-ws2022"
    sku       = "sqldev-gen2" # Free License
    version   = "latest"
  }
  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "StandardSSD_LRS"
  }
}
# --- MANAGED DISKS (Data & Logs) ---
resource "azurerm_managed_disk" "sql_disks" {
  for_each             = local.sql_data_disks
  name                 = "${local.vm_name}-${each.value.name}"
  
  # Note: TST uses 'rg_infra'
  location             = azurerm_resource_group.rg_infra.location 
  resource_group_name  = azurerm_resource_group.rg_infra.name      
  
  storage_account_type = each.value.storage_account_type
  create_option        = "Empty"
  disk_size_gb         = each.value.disk_size_gb
  tags                 = local.common_tags
}

# --- ATTACH DISKS TO VM ---
resource "azurerm_virtual_machine_data_disk_attachment" "sql_disk_attach" {
  for_each           = local.sql_data_disks
  managed_disk_id    = azurerm_managed_disk.sql_disks[each.key].id
  virtual_machine_id = azurerm_windows_virtual_machine.vm.id 
  
  lun                = each.value.lun
  caching            = each.value.caching
}

# --- SQL IaaS Agent ---
resource "azurerm_mssql_virtual_machine" "sqlvm" {
  virtual_machine_id               = azurerm_windows_virtual_machine.vm.id
  sql_license_type                 = "PAYG"
  r_services_enabled               = true
  sql_connectivity_port            = 1433
  sql_connectivity_type            = "PRIVATE"
  sql_connectivity_update_password = var.vm_admin_password
  sql_connectivity_update_username = var.vm_admin_username
}

# --- DB Auto-Creation Script ---
resource "azurerm_virtual_machine_extension" "sql_db_setup" {
  name                 = "sql-db-setup"
  virtual_machine_id   = azurerm_windows_virtual_machine.vm.id
  publisher            = "Microsoft.Compute"
  type                 = "CustomScriptExtension"
  type_handler_version = "1.10"

  # Wait for SQL IaaS Agent to finish before trying to connect
  depends_on           = [azurerm_mssql_virtual_machine.sqlvm]

  protected_settings = <<SETTINGS
    {
        "commandToExecute": "powershell.exe -ExecutionPolicy Unrestricted -Command \"$ErrorActionPreference = 'Stop'; $adminUser = '${var.vm_admin_username}'; $adminPass = '${var.vm_admin_password}'; $password = '${var.app_sql_password}'; $dbName = '${var.client_name}DB'; $dbUser = '${var.client_name}_app_user'; $retryCount = 0; while ($true) { try { sqlcmd -S localhost -U $adminUser -P $adminPass -b -Q \\\"SELECT 1\\\" -ConnectionTimeout 5; break } catch { if ($retryCount -ge 20) { throw 'SQL Server not ready after 20 retries' }; Write-Output 'Waiting for SQL...'; Start-Sleep -Seconds 10; $retryCount++ } }; sqlcmd -S localhost -U $adminUser -P $adminPass -b -Q \\\"IF NOT EXISTS(SELECT * FROM sys.databases WHERE name='$dbName') BEGIN CREATE DATABASE [$dbName]; END\\\"; sqlcmd -S localhost -U $adminUser -P $adminPass -b -Q \\\"IF NOT EXISTS(SELECT * FROM sys.server_principals WHERE name='$dbUser') BEGIN CREATE LOGIN [$dbUser] WITH PASSWORD='$password'; END\\\"; sqlcmd -S localhost -U $adminUser -P $adminPass -b -Q \\\"USE [$dbName]; IF NOT EXISTS(SELECT * FROM sys.database_principals WHERE name='$dbUser') BEGIN CREATE USER [$dbUser] FOR LOGIN [$dbUser]; ALTER ROLE db_owner ADD MEMBER [$dbUser]; END;\\\"\""
    }
SETTINGS
}

# --- APP SERVICE PLANS ---
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

# --- FIXED UI APPS (Node.js) ---
resource "azurerm_linux_web_app" "ui_app" {
  name                = local.ui_app_name
  location            = azurerm_resource_group.rg_apps.location
  resource_group_name = azurerm_resource_group.rg_apps.name
  service_plan_id     = azurerm_service_plan.linux_plan.id
  tags                = local.common_tags
  site_config {
    application_stack {
      node_version = "18-lts"
    }
    app_command_line = "pm2 serve /home/site/wwwroot --no-daemon --spa"
  }
}

resource "azurerm_linux_web_app" "ui_admin" {
  name                = local.ui_admin_name
  location            = azurerm_resource_group.rg_apps.location
  resource_group_name = azurerm_resource_group.rg_apps.name
  service_plan_id     = azurerm_service_plan.linux_plan.id
  tags                = local.common_tags
  site_config {
    application_stack {
      node_version = "18-lts"
    }
    app_command_line = "pm2 serve /home/site/wwwroot --no-daemon --spa"
  }
}

# --- APPLICATION INSIGHTS & LOGS (Missing Resources) ---
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
#  APP CONFIGURATION MODULE (REPLACES MONOLITHIC BLOCK)
# ==============================================================================
module "app_configuration" {
  source   = "../../modules/app_configuration"
  for_each = toset(var.backend_modules)

  app_name    = each.key
  client_name = var.client_name
  environment = var.environment_name
  app_insights_connection_string   = azurerm_application_insights.appinsights.connection_string
  app_insights_instrumentation_key = azurerm_application_insights.appinsights.instrumentation_key

  


  # 2. Pass New Variables (Add to module inputs)
  ayolinx_base_url     = var.ayolinx_base_url
  pyrros_client_id     = var.pyrros_client_id
  pyrros_url           = var.pyrros_url
  web3_api_key         = var.web3_api_key
  web3_exchange_id     = var.web3_exchange_id
  web3_payments_id     = var.web3_payments_id
  web3_payment_link_url= var.web3_payment_link_url
  coingecko_base_url   = var.coingecko_base_url
  hyperpay_url         = var.hyperpay_url
  
  # SendGrid Specifics
  sendgrid_account_sid = var.sendgrid_account_sid
  sendgrid_service_id  = var.sendgrid_service_id


  # --- Secret URIs (Mapping created resources to Module) ---
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
    app_insights_connection_string = module.key_vault.secret_ids["AppInsights-ConnectionString"]
    
    ayolinx_key        = module.key_vault.secret_ids["AyolinxprivateKeyPem"]
    ayolinx_token      = module.key_vault.secret_ids["AyolinxCustomerToken"]
    pyrros_secret      = module.key_vault.secret_ids["pyrrosclientsecret"]
    sendgrid_token     = module.key_vault.secret_ids["SendGrid-AuthToken"]
    cards_private_key  = module.key_vault.secret_ids["CardsPrivateKey"]
    cards_customer_token = module.key_vault.secret_ids["CardsCustomerToken"]

    firebase_key       = ""
  }

  # --- Service URLs (For Inter-App Communication) ---
  service_urls = {
    coreapi       = "https://${local._name_prefix}-coreapi.azurewebsites.net"
    banksapi      = "https://${local._name_prefix}-banksapi.azurewebsites.net"
    cardsapi      = "https://${local._name_prefix}-cardsapi.azurewebsites.net"
    exchangeapi   = "https://${local._name_prefix}-exchangeapi.azurewebsites.net"
    paymentsapi   = "https://${local._name_prefix}-paymentsapi.azurewebsites.net"
    paylinks      = "https://${local._name_prefix}-paylinks.azurewebsites.net"
    signalr       = "https://${local._name_prefix}-signalr.azurewebsites.net"
    integration   = "https://${local._name_prefix}-integration.azurewebsites.net"
  }

  # --- Configs ---
  sb_connection_string = module.service_bus.default_primary_connection_string
  auth0_domain         = var.auth0_domain
  auth0_client_id      = var.auth0_client_id
  auth0_client_secret  = var.auth0_client_secret
  

  # --- Core API Specific Inputs ---
  core_main_account_id    = var.core_main_account_id
  core_external_base_url  = var.core_external_base_url
  auth0_mobile_client_id  = var.auth0_mobile_client_id

  # --- Dynamic SendGrid Configuration ---
  sendgrid_config = {
    template_id = var.sendgrid_template_id
    # Automatically generate email based on client name (e.g. contact@artha.money)
    from_email  = "contact@${lower(var.client_name)}.money" 
    from_name   = "${var.client_name} Money"
  }
  aml_access_id = var.aml_access_id

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

  app_insights_connection_string   = azurerm_application_insights.appinsights.connection_string
  app_insights_instrumentation_key = azurerm_application_insights.appinsights.instrumentation_key

  # --- NEW: SWEEP SPECIFIC INPUTS ---
  collection_vault_id    = var.collection_vault_id
  polygon_wallet_address = var.polygon_wallet_address
  tron_wallet_address    = var.tron_wallet_address

  # --- NEW: MARKETDATA SPECIFIC INPUTS ---
  admin_transaction_mail = var.admin_transaction_mail
  bcc_address_mails      = var.bcc_address_mails
  exchange_url           = var.exchange_url
  login_url              = var.login_url

  # --- Secret URIs ---
  # (Must match the Web App module list, plus the NEW Firebase Key)
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
    app_insights_connection_string = module.key_vault.secret_ids["AppInsights-ConnectionString"]
    
    ayolinx_key        = module.key_vault.secret_ids["AyolinxprivateKeyPem"]
    ayolinx_token      = module.key_vault.secret_ids["AyolinxCustomerToken"]
    pyrros_secret      = module.key_vault.secret_ids["pyrrosclientsecret"]
    sendgrid_token     = module.key_vault.secret_ids["SendGrid-AuthToken"]
    cards_private_key  = module.key_vault.secret_ids["CardsPrivateKey"]
    cards_customer_token = module.key_vault.secret_ids["CardsCustomerToken"]

    firebase_key = module.key_vault.secret_ids["Firebase-ServerKey"]
  }

  # --- Service URLs ---
  service_urls = {
    coreapi       = "https://${local._name_prefix}-coreapi.azurewebsites.net"
    banksapi      = "https://${local._name_prefix}-banksapi.azurewebsites.net"
    cardsapi      = "https://${local._name_prefix}-cardsapi.azurewebsites.net"
    exchangeapi   = "https://${local._name_prefix}-exchangeapi.azurewebsites.net"
    paymentsapi   = "https://${local._name_prefix}-paymentsapi.azurewebsites.net"
    paylinks      = "https://${local._name_prefix}-paylinks.azurewebsites.net"
    signalr       = "https://${local._name_prefix}-signalr.azurewebsites.net"
    integration   = "https://${local._name_prefix}-integration.azurewebsites.net"
  }

  # --- Standard Configs ---
  sb_connection_string = data.azurerm_servicebus_namespace.sb_lookup.default_primary_connection_string
  auth0_domain         = var.auth0_domain
  auth0_client_id      = var.auth0_client_id
  auth0_client_secret  = var.auth0_client_secret
  
  # --- Pass Core API Vars (Required by module structure, even if unused by subscriber) ---
  core_main_account_id   = var.core_main_account_id
  core_external_base_url = var.core_external_base_url
  auth0_mobile_client_id = var.auth0_mobile_client_id
  sendgrid_config = {
    template_id = var.sendgrid_template_id
    from_email  = "contact@${lower(var.client_name)}.money"
    from_name   = "${var.client_name} Money"
  }

  # --- NEW: SUBSCRIBER SPECIFIC INPUTS ---
  company_name     = var.company_name
  company_logo_url = var.company_logo_url
  aml_access_id    = var.aml_access_id
}

# --- DYNAMIC BACKEND APPS (.NET) ---
resource "azurerm_windows_web_app" "backend_apps" {
  for_each            = toset(var.backend_modules)
  name                = "${local._name_prefix}-${each.key}"
  location            = azurerm_resource_group.rg_apps.location
  resource_group_name = azurerm_resource_group.rg_apps.name
  service_plan_id     = azurerm_service_plan.windows_plan.id
  tags                = local.common_tags

  identity { 
    type = "SystemAssigned" 
  }

  # --- APP SETTINGS INJECTION (FROM MODULE) ---
  app_settings = module.app_configuration[each.key].app_settings

  site_config {
    application_stack {
      dotnet_version = "v8.0"
    }
  }
}

# --- FIXED FUNCTION APPS (.NET) ---
resource "azurerm_windows_function_app" "func_market" {
  name                = local.func_market_name
  location            = azurerm_resource_group.rg_apps.location
  resource_group_name = azurerm_resource_group.rg_apps.name
  service_plan_id     = azurerm_service_plan.windows_plan.id
  storage_account_name       = module.storage_account.name
  storage_account_access_key = module.storage_account.primary_access_key
  tags                = local.common_tags
  app_settings = module.function_app_configuration["marketdata"].app_settings
  
  site_config {
    application_stack {
        dotnet_version = "v8.0"
    }
  }
}

resource "azurerm_windows_function_app" "func_subscriber" {
  name                = local.func_subscriber_name
  location            = azurerm_resource_group.rg_apps.location
  resource_group_name = azurerm_resource_group.rg_apps.name
  service_plan_id     = azurerm_service_plan.windows_plan.id
  storage_account_name       = module.storage_account.name
  storage_account_access_key = module.storage_account.primary_access_key
  tags                = local.common_tags
  app_settings = module.function_app_configuration["subscriber"].app_settings
  
  site_config {
    application_stack {
        dotnet_version = "v8.0"
    }
  }
}

resource "azurerm_windows_function_app" "func_sweep" {
  name                = local.func_sweep_name
  location            = azurerm_resource_group.rg_apps.location
  resource_group_name = azurerm_resource_group.rg_apps.name
  service_plan_id     = azurerm_service_plan.windows_plan.id
  storage_account_name       = module.storage_account.name
  storage_account_access_key = module.storage_account.primary_access_key
  tags                = local.common_tags
  app_settings = module.function_app_configuration["sweep"].app_settings
  identity {
    type = "SystemAssigned"
  }
  
  site_config {
    application_stack {
        dotnet_version = "v8.0"
    }
  }
}

# --- Supporting Services ---
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

# --- SERVICE BUS LOOKUP ---
data "azurerm_servicebus_namespace" "sb_lookup" {
  name                = local.service_bus_namespace_name
  resource_group_name = azurerm_resource_group.rg_apps.name
  depends_on          = [module.service_bus]
}


#   KEY VAULTS STARTED
module "key_vault" {
  source              = "../../modules/key_vault"
  key_vault_name      = local.key_vault_name
  location            = azurerm_resource_group.rg_apps.location
  resource_group_name = azurerm_resource_group.rg_apps.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  tags                = local.common_tags

  # --- PASS ALL SECRETS HERE ---
  secrets = {
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
    
    # Payments/Cards
    "AyolinxprivateKeyPem"    = var.ayolinx_private_key
    "AyolinxCustomerToken"    = var.ayolinx_customer_token
    "pyrrosclientsecret"      = var.pyrros_client_secret
    "SendGrid-AuthToken"      = var.sendgrid_auth_token
    "CardsPrivateKey"         = var.cards_private_key
    "CardsCustomerToken"      = var.cards_customer_token
    
    # Infrastructure Secrets (Constructed)
    "StorageAccount-AccountKey"         = module.storage_account.primary_access_key
    "AppInsights-ConnectionString"      = azurerm_application_insights.appinsights.connection_string
    "ConnectionStrings-DefaultConnection" = "Data Source=tcp:${azurerm_windows_virtual_machine.vm.private_ip_address},1433;Initial Catalog=${var.client_name}DB;User Id=${var.client_name}_app_user;Password=${var.app_sql_password};MultipleActiveResultSets=True;TrustServerCertificate=True;"
    "SQL-App-Password"                  = var.app_sql_password
  }
}


# Grant SQL VM Access to Key Vault
resource "azurerm_role_assignment" "vm_kv_access" {
  scope                = module.key_vault.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_windows_virtual_machine.vm.identity[0].principal_id
}

# --- GRANT ACCESS (RBAC METHOD) ---
resource "azurerm_role_assignment" "webapp_kv_access" {
  for_each             = azurerm_windows_web_app.backend_apps
  scope                = module.key_vault.id
  role_definition_name = "Key Vault Secrets User" # This is the specific role needed
  principal_id         = each.value.identity[0].principal_id
}
resource "azurerm_role_assignment" "func_sweep_kv" { # Was "func_pub_kv"
  scope                = module.key_vault.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_windows_function_app.func_sweep.identity[0].principal_id # Updated reference
  
}