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
  func_publisher_name      = "${local._name_prefix}-Publisher"

  # Network Config
  vnet_address_space       = ["10.0.0.0/16"]
  subnets = {
    "vm-subnet" = { address_prefixes = ["10.0.1.0/24"] }
    "pep-subnet" = { address_prefixes = ["10.0.2.0/24"] }
  }
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
  
  # Note: TST uses 'rg_infra', STG/PRD use 'rg_vm'
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
  
  # Note: TST resource name is 'vm'
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

# --- DYNAMIC BACKEND APPS (.NET) ---
resource "azurerm_windows_web_app" "backend_apps" {
  for_each            = toset(var.backend_modules)
  name                = "${local._name_prefix}-${each.key}"
  location            = azurerm_resource_group.rg_apps.location
  resource_group_name = azurerm_resource_group.rg_apps.name
  service_plan_id     = azurerm_service_plan.windows_plan.id
  tags                = local.common_tags
  # --- 1. ENABLE IDENTITY (Required for Key Vault Access) ---
  identity { 
    type = "SystemAssigned" 
  }

  # --- 2. INJECT SECRETS AS ENV VARS ---
  app_settings = {
    # ---------------------------------------------------------
    # 1. KEY VAULT SECRETS (Existing + New)
    # ---------------------------------------------------------
    "AccountSid"                      = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.twilio_sid.id})"
    "AuthToken"                       = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.twilio_auth.id})"
    "ServiceId"                       = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.twilio_service.id})"
    "SUMSUB_APP_TOKEN"                = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.sumsub_token.id})"
    "SUMSUB_SECRET_KEY"               = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.sumsub_key.id})"
    "TokenEncryptkey"                 = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.token_key.id})"
    "SecretKey__Url"                  = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.app_secret.id})"
    "powerbi__pbiPassword"            = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.powerbi_pass.id})"
    "StorageAccount__AccountKey"      = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.storage_key.id})"
    "ConnectionStrings__DefaultConnection" = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.db_conn.id})"
    "ConnectionString"                     = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.db_conn.id})"
    "StorageAccount__ConnectionStrings"    = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.db_conn.id})" # Assuming same DB conn for logic
    
    "Redis__ConnectionString"         = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.redis_conn.id})"
    "Vault__Url"                      = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.vault_db_conn.id})"
    "ApiKey"                          = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.general_api_key.id})"
    "APISecretKey"                    = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.general_api_secret.id})"
    "ClientSecret"                    = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.client_secret_val.id})"
    "Vault__ClientSecret"             = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.client_secret_val.id})"
    "SecretKey__ClientSecret"         = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.client_secret_val.id})"
    "EasyLink_AppKey"                 = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.easylink_key.id})"
    "EasyLink_AppSecret"              = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.easylink_secret.id})"

    # --- NEW SECRETS ADDED IN STEP A ---
    "AML__AccessKey"                  = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.aml_key.id})"
    "Password"                        = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.app_password.id})"
    "PasswordHash"                    = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.app_password_hash.id})"
    "Private_Key"                     = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.private_key.id})"
    "public_Key"                      = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.public_key.id})"
    "RestSharpApiConfig__AccessToken" = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.restsharp_token.id})"
    "X_Api_Key"                       = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.x_api_key.id})"

    # ---------------------------------------------------------
    # 2. DYNAMIC URLs (Constructed from Terraform Locals)
    # ---------------------------------------------------------
    "ActivityLog__LogUrl"  = "https://${local._name_prefix}-banksapi.azurewebsites.net/api/"
    "BaseUrl"              = "https://${local._name_prefix}-coreapi.azurewebsites.net" # Assuming Core is Base
    "CardProviderBaseUrl"  = "https://${local._name_prefix}-cardsapi.azurewebsites.net"
    "ExchangaAPIURL"       = "https://${local._name_prefix}-exchangeapi.azurewebsites.net"
    "ExchangaPayAPIURL"    = "https://${local._name_prefix}-exchangeapi.azurewebsites.net" # Verify if diff
    "IntegrationURL"       = "https://${local._name_prefix}-integration.azurewebsites.net/"
    "PaymentUrl"           = "https://${local._name_prefix}-paymentsapi.azurewebsites.net"
    "MestaProviderBaseUrl" = "https://${local._name_prefix}-paymentsapi.azurewebsites.net/" # Assuming Payments
    "ProviderBaseUrl"      = "https://${local._name_prefix}-coreapi.azurewebsites.net" # Assuming Core
    "DocApprovedURL"       = "https://${local._name_prefix}-signalR.azurewebsites.net/api/notification/DocApproved"
    "DocRequestedURL"      = "https://${local._name_prefix}-signalR.azurewebsites.net/api/notification/DocRequested"
    "NotificationURL"      = "https://${local._name_prefix}-signalR.azurewebsites.net/api/notification/SndMultipleUsers"
    
    # ---------------------------------------------------------
    # 3. STATIC CONFIGURATION (From Sample JSON)
    # ---------------------------------------------------------
    "Env"                   = "TST"
    "BaseCurrency"          = "USD"
    "ClientHashId"          = "Burgo Blan"
    "ClientId"              = "d0b22a54-7347-4518-9482-32404981ca0f" # Non-secret ID
    "CustomerToken"         = "bc36ea33c7397da280c4cabb91840ef7c28239d0c83d2b97f7a828a457c43797"
    "FromEmailAddress"      = "nkrajukumar734@yopmail.com"
    "ToEmailAddress"        = "nkrajukumar734@yopmail.com"
    "IdentityType"          = "auth0"
    "Provider"              = "Fireblocks"
    "RiskScore"             = "80"
    "RetryCount"            = "4"
    "SubUrl"                = ""
    "TimeOutinMilliseconds" = "50400"
    "X_Client_Name"         = "Musala Ravikiran"
    "X_Request_Id"          = "03cc727c-ffb8-4440-86c0-c875d1fda254"
    "TronScanExplorer"      = "https://shasta.tronscan.org/#/transaction/"
    "EasyLink_AppId"        = "ERShFBl3REdW5HFB"
    "EasyLink_BaseUrl"      = "http://sandbox.easylink.id:9080"
    "AML__AccessId"         = "B8D4A-264E4-18AD636"
    "AML__ServerUrl"        = "https://extrnlapiendpoint.silencatech.com"
    "SUMSUB_TEST_BASE_URL"  = "https://api.sumsub.com"
    "RestSharpApiConfig__BaseUrl" = "https://superhedpi.com/api/"
    
    # Booleans
    "AzureStorageEnabled"                 = "false"
    "IsAMLEnabled"                        = "true"
    "IsAuthorize"                         = "true"
    "IsCardProvider"                      = "true"
    "IsCommissionAllowed"                 = "true"
    "IsPhoneNumberUnique"                 = "true"
    "IsSandbox"                           = "false"
    "Redis__IsEnable"                     = "true"
    "UseCustomizationData"                = "false"
    "UseVault"                            = "false"
    "WEBSITE_HEALTHCHECK_MAXPINGFAILURES" = "0"
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
    "RateLimit__Enabled"                  = "true"
    "RateLimit__PermitLimit"              = "1000"
    "RateLimit__TimeWindow"               = "1"

    # ---------------------------------------------------------
    # 4. AUTH0 CONFIGURATION
    # ---------------------------------------------------------
    "Authority"                = "https://${var.auth0_domain}/"
    "Aut0_audience"            = "https://${var.client_name}${var.environment_name}.net/"
    "Aut0_Client_id"           = var.auth0_client_id
    "Aut0_client_secret"       = var.auth0_client_secret
    "Aut0_Connection"          = "${var.client_name}-${var.environment_name}" # e.g. Rapidz-stg
    "Aut0_grant_type"          = "client_credentials"
    "Aut0_scope"               = "openid profile email"
    "Aut0_token_audience"      = "https://yellowblockllp.us.auth0.com/api/v2/" # Keep static if fixed
    "Aut0_token_Client_id"     = var.auth0_client_id
    "Aut0_token_client_secret" = var.auth0_client_secret
    "SecretKey__ClientId"      = var.auth0_client_id
    "Vault__ClientId"          = var.auth0_client_id
    "Vault__Name"              = "DevKeyvaultSb" # Static name

    # ---------------------------------------------------------
    # 5. POWER BI & STORAGE
    # ---------------------------------------------------------
    "powerbi__apiUrl"               = "https://api.powerbi.com"
    "powerbi__applicationId"        = "c56403f5-32ee-45cf-a45e-d0e44e34f6b1"
    "powerbi__applicationSecret"    = ""
    "powerbi__AuthenticationType"   = "MasterUser"
    "powerbi__authorityUrl"         = "https://login.windows.net/common/oauth2/token/"
    "powerbi__pbiUsername"          = "${var.environment_name}${var.client_name}@yellowblock.net"
    "powerbi__resourceUrl"          = "https://analysis.windows.net/powerbi/api"
    "powerbi__tenant"               = ""
    "StorageAccount__AccountName"   = module.storage_account.name
    "StorageAccount__ContainerName" = "rapidz${lower(var.environment_name)}"

    # ---------------------------------------------------------
    # 6. LOGGING (SERILOG)
    # ---------------------------------------------------------
    "Serilog__MinimumLevel__Default"                       = "Warning"
    "Serilog__MinimumLevel__Override__Cards.API"           = "Warning"
    "Serilog__MinimumLevel__Override__System"              = "Warning"
    "Serilog__MinimumLevel__WriteTo__0__Args__formatter"   = "Serilog.Formatting.Json.JsonFormatter, Serilog"
    "Serilog__MinimumLevel__WriteTo__0__Args__path"        = "D:\\Logs\\structuredLog.json"
    "Serilog__MinimumLevel__WriteTo__0__Name"              = "Console"
    "Serilog__MinimumLevel__WriteTo__1__Args__instrumentationKey" = "" # Or var.app_insights_key if you have one
    "Serilog__MinimumLevel__WriteTo__1__Args__outputTemplate" = "[{Component}|{MachineName}|{ThreadId}] {Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] <{SourceContext}> {Message:lj}{NewLine}{Exception}"
    "Serilog__MinimumLevel__WriteTo__1__Args__telemetryConverter" = "Serilog.Sinks.ApplicationInsights.Sinks.ApplicationInsights.TelemetryConverters.TraceTelemetryConverter, Serilog.Sinks.ApplicationInsights"
    "Serilog__MinimumLevel__WriteTo__1__Name"              = "ApplicationInsights"
    "Serilog__SeqServerUrl"                                = "http://localhost:5341"
    "Serilog__Using__0"                                    = "Serilog.Sinks.Console"
    "Serilog__Using__1"                                    = "Serilog.Sinks.File"
    "Serilog__Using__2"                                    = "Serilog.Sinks.ApplicationInsights"

    # ---------------------------------------------------------
    # 7. SERVICE BUS (Keep your existing working block here)
    # ---------------------------------------------------------
    "aMLRiskScoreExchangaPay__ServiceBusPublisher"     = data.azurerm_servicebus_namespace.sb_lookup.default_primary_connection_string
    "auditlogs__ServiceBusPublisher"                   = data.azurerm_servicebus_namespace.sb_lookup.default_primary_connection_string
    "cardsactionqueue__ServiceBusPublisher"            = data.azurerm_servicebus_namespace.sb_lookup.default_primary_connection_string
    "depositandwithdrawqueue__ServiceBusPublisher"     = data.azurerm_servicebus_namespace.sb_lookup.default_primary_connection_string
    "EmailNotifications__ServiceBusPublisher"          = data.azurerm_servicebus_namespace.sb_lookup.default_primary_connection_string
    "fillgasfee__ServiceBusPublisher"                  = data.azurerm_servicebus_namespace.sb_lookup.default_primary_connection_string
    "KycVerification__ServiceBusPublisher"             = data.azurerm_servicebus_namespace.sb_lookup.default_primary_connection_string
    "LoyaltyAzureQueue__ServiceBusConnectionString"    = data.azurerm_servicebus_namespace.sb_lookup.default_primary_connection_string
    "merchantwalletsVerification__ServiceBusPublisher" = data.azurerm_servicebus_namespace.sb_lookup.default_primary_connection_string
    "mestaAzureQueue__ServiceBusPublisher"             = data.azurerm_servicebus_namespace.sb_lookup.default_primary_connection_string
    "MestaSenderCreation__ServiceBusPublisher"         = data.azurerm_servicebus_namespace.sb_lookup.default_primary_connection_string
    "mobilenotifications__ServiceBusPublisher"         = data.azurerm_servicebus_namespace.sb_lookup.default_primary_connection_string

    "aMLRiskScoreExchangaPay__ServiceBusTopic"     = azurerm_servicebus_topic.t_aml.name
    "auditlogs__ServiceBusTopic"                   = azurerm_servicebus_topic.t_audit.name
    "EmailNotifications__ServiceBusTopic"          = azurerm_servicebus_topic.t_email.name
    "fillgasfee__ServiceBusTopic"                  = azurerm_servicebus_topic.t_gas.name
    "KycVerification__ServiceBusTopic"             = azurerm_servicebus_topic.t_kyc.name
    "merchantwalletsVerification__ServiceBusTopic" = azurerm_servicebus_topic.t_merchant.name
    "MestaSenderCreation__ServiceBusTopic"         = azurerm_servicebus_topic.t_mesta.name
    "mobilenotifications__ServiceBusTopic"         = azurerm_servicebus_topic.t_mobile.name

    "cardsactionqueue__ServiceBusQueue"        = azurerm_servicebus_queue.q_cards.name
    "depositandwithdrawqueue__ServiceBusQueue" = azurerm_servicebus_queue.q_deposit.name
    "LoyaltyAzureQueue__LoyaltyQueueName"      = azurerm_servicebus_queue.q_loyalty.name
    "mestaAzureQueue__ServiceBusQueue"         = azurerm_servicebus_queue.q_order.name
  }


  # Expanded to multi-line to avoid syntax errors
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
  
  site_config {
    application_stack {
        dotnet_version = "v8.0"
    }
  }
}

resource "azurerm_windows_function_app" "func_publisher" {
  name                = local.func_publisher_name
  location            = azurerm_resource_group.rg_apps.location
  resource_group_name = azurerm_resource_group.rg_apps.name
  service_plan_id     = azurerm_service_plan.windows_plan.id
  storage_account_name       = module.storage_account.name
  storage_account_access_key = module.storage_account.primary_access_key
  tags                = local.common_tags
  
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
}

# --- SERVICE BUS LOOKUP ---
data "azurerm_servicebus_namespace" "sb_lookup" {
  name                = local.service_bus_namespace_name
  resource_group_name = azurerm_resource_group.rg_apps.name
  depends_on          = [module.service_bus]
}

# ==============================================================================
# 1. QUEUES (All Sessions Enabled)
# ==============================================================================

resource "azurerm_servicebus_queue" "q_processing" {
  name                = "processing-queue"
  namespace_id        = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning = true
  requires_session    = true 
}

resource "azurerm_servicebus_queue" "q_cards" {
  name                = "cardsqueue"
  namespace_id        = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning = true
  requires_session    = true # Added
}

resource "azurerm_servicebus_queue" "q_deposit" {
  name                = "depositandwithdrawqueue"
  namespace_id        = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning = true
  requires_session    = true # Added
}

resource "azurerm_servicebus_queue" "q_loyalty" {
  name                = "loyaltyprogram"
  namespace_id        = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning = true
  requires_session    = true # Added
}

resource "azurerm_servicebus_queue" "q_order" {
  name                = "orderqueue"
  namespace_id        = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning = true
  requires_session    = true # Added
}

# ==============================================================================
# 2. TOPICS & SUBSCRIPTIONS (All Sessions Enabled)
# ==============================================================================

# --- A. Existing Market Topic ---
resource "azurerm_servicebus_topic" "t_market" {
  name                = "market-data-events"
  namespace_id        = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning = true
}
resource "azurerm_servicebus_subscription" "sub_market" {
  name               = "subscriber-service"
  topic_id           = azurerm_servicebus_topic.t_market.id
  max_delivery_count = 10
  requires_session   = true 
}

# --- B. AML Risk Score ---
resource "azurerm_servicebus_topic" "t_aml" {
  name                = "amlriskscore"
  namespace_id        = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning = true
}
resource "azurerm_servicebus_subscription" "sub_aml" {
  name               = "sub-processor"
  topic_id           = azurerm_servicebus_topic.t_aml.id
  max_delivery_count = 10
  requires_session   = true # Added
}

# --- C. Audit Logs ---
resource "azurerm_servicebus_topic" "t_audit" {
  name                = "auditlogs"
  namespace_id        = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning = true
}
resource "azurerm_servicebus_subscription" "sub_audit" {
  name               = "sub-processor"
  topic_id           = azurerm_servicebus_topic.t_audit.id
  max_delivery_count = 10
  requires_session   = true # Added
}

# --- D. Email Notifications ---
resource "azurerm_servicebus_topic" "t_email" {
  name                = "emailnotifications"
  namespace_id        = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning = true
}
resource "azurerm_servicebus_subscription" "sub_email" {
  name               = "sub-processor"
  topic_id           = azurerm_servicebus_topic.t_email.id
  max_delivery_count = 10
  requires_session   = true # Added
}

# --- E. Fill Gas Fee ---
resource "azurerm_servicebus_topic" "t_gas" {
  name                = "fillgasfee"
  namespace_id        = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning = true
}
resource "azurerm_servicebus_subscription" "sub_gas" {
  name               = "sub-processor"
  topic_id           = azurerm_servicebus_topic.t_gas.id
  max_delivery_count = 10
  requires_session   = true # Added
}

# --- F. KYC Verification ---
resource "azurerm_servicebus_topic" "t_kyc" {
  name                = "kycverification"
  namespace_id        = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning = true
}
resource "azurerm_servicebus_subscription" "sub_kyc" {
  name               = "sub-processor"
  topic_id           = azurerm_servicebus_topic.t_kyc.id
  max_delivery_count = 10
  requires_session   = true # Added
}

# --- G. Merchant Wallets ---
resource "azurerm_servicebus_topic" "t_merchant" {
  name                = "merchantwalletsVerification"
  namespace_id        = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning = true
}
resource "azurerm_servicebus_subscription" "sub_merchant" {
  name               = "sub-processor"
  topic_id           = azurerm_servicebus_topic.t_merchant.id
  max_delivery_count = 10
  requires_session   = true # Added
}

# --- H. Mesta Sender Creation ---
resource "azurerm_servicebus_topic" "t_mesta" {
  name                = "mestasendercreation"
  namespace_id        = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning = true
}
resource "azurerm_servicebus_subscription" "sub_mesta" {
  name               = "sub-processor"
  topic_id           = azurerm_servicebus_topic.t_mesta.id
  max_delivery_count = 10
  requires_session   = true # Added
}

# --- I. Mobile Notifications ---
resource "azurerm_servicebus_topic" "t_mobile" {
  name                = "mobilenotifications"
  namespace_id        = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning = true
}
resource "azurerm_servicebus_subscription" "sub_mobile" {
  name               = "sub-processor"
  topic_id           = azurerm_servicebus_topic.t_mobile.id
  max_delivery_count = 10
  requires_session   = true # Added
}

#   KEY VAULTS STARTED
module "key_vault" {
  source              = "../../modules/key_vault"
  key_vault_name      = local.key_vault_name
  location            = azurerm_resource_group.rg_apps.location
  resource_group_name = azurerm_resource_group.rg_apps.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  tags                = local.common_tags
}

resource "azurerm_role_assignment" "kv_admin_rbac" {
  scope                = module.key_vault.id
  role_definition_name = "Key Vault Administrator"
  principal_id         = data.azurerm_client_config.current.object_id
}

# Grant SQL VM Access to Key Vault
resource "azurerm_role_assignment" "vm_kv_access" {
  scope                = module.key_vault.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_windows_virtual_machine.vm.identity[0].principal_id
}

# --- THIRD PARTY SECRETS ---

resource "azurerm_key_vault_secret" "twilio_sid" {
  name         = "AccountSid"
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
  name         = "SecretKey" # Used for SecretKey__Url
  value        = var.app_secret_key
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}
# --- MISSING SECRETS (Redis, API Keys, etc.) ---

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
  value        = var.client_secret_value # Shared secret for Vault/SecretKey clients
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

# --- INFRASTRUCTURE SECRETS (Auto-Calculated) ---

# We save the Storage Key to Key Vault so the App can reference it securely
resource "azurerm_key_vault_secret" "storage_key" {
  name         = "StorageAccount-AccountKey"
  value        = module.storage_account.primary_access_key
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}

# We save the DB Connection String to Key Vault
resource "azurerm_key_vault_secret" "db_conn" {
  name         = "ConnectionStrings-DefaultConnection"
  value        = "Data Source=tcp:${azurerm_windows_virtual_machine.vm.private_ip_address},1433;Initial Catalog=${var.client_name}DB;User Id=${var.client_name}_app_user;Password=${var.app_sql_password};MultipleActiveResultSets=True;TrustServerCertificate=True;"
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}

# Store SQL Password
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
  value        = var.app_password_clear # e.g. WelcomeRapidz@123
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

# --- GRANT ACCESS (RBAC METHOD) ---
resource "azurerm_role_assignment" "webapp_kv_access" {
  for_each             = azurerm_windows_web_app.backend_apps
  scope                = module.key_vault.id
  role_definition_name = "Key Vault Secrets User" # This is the specific role needed
  principal_id         = each.value.identity[0].principal_id
}