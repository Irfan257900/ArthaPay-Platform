# --- STAGING (STG) CONFIGURATION ---
# Location: Southeast Asia
# SKU: Premium V2 (P1v2)

locals {
  common_tags = {
    "Business-owners"     = "Project Manager"
    "Environment"         = var.environment_name
    "Client"              = var.client_name
    "Technical-owner"     = "DevOps Team"
    "Criticality"         = "2"
  }
  
  _name_prefix = "${var.client_name}-${var.environment_name}"
  
  # Resource Groups
  network_rg_name          = "rg-${local._name_prefix}-network"
  app_rg_name              = "rg-${local._name_prefix}-app"
  vm_rg_name               = "rg-${local._name_prefix}-vm"
  security_rg_name         = "rg-${local._name_prefix}-security"
  
  # Resources
  vnet_name                = "${local._name_prefix}-vnet"
  sql_vm_name              = "${local._name_prefix}-sqlvm"
  integ_vm_name            = "${local._name_prefix}-integvm"
  
  key_vault_name           = "${local._name_prefix}-kv-${substr(md5(timestamp()), 0, 5)}"
  storage_account_name     = "st${lower(var.client_name)}${lower(var.environment_name)}${substr(md5(timestamp()), 0, 3)}"
  service_bus_namespace_name = "${local._name_prefix}-bus"
  
  # Plans
  plan_linux_name          = "${local._name_prefix}-plan-linux"
  plan_windows_name        = "${local._name_prefix}-plan-windows"

  # Web App Names
  ui_app_name              = "${local._name_prefix}-App"
  ui_admin_name            = "${local._name_prefix}-Admin"
  func_market_name         = "${local._name_prefix}-Marketdata"
  func_subscriber_name     = "${local._name_prefix}-Subscriber"
  func_publisher_name      = "${local._name_prefix}-Publisher"

  # STG Network Config
  vnet_address_space       = ["10.10.0.0/16"]
  subnets = {
    "sqlVmSubnet"         = { address_prefixes = ["10.10.1.0/24"] }
    "IntegrationvmSubnet" = { address_prefixes = ["10.10.2.0/24"] }
    "PrivateEndpoints"    = { address_prefixes = ["10.10.3.0/24"] }
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
  size                = "Standard_B2ms"
  admin_username      = var.vm_admin_username
  admin_password      = var.vm_admin_password
  network_interface_ids = [azurerm_network_interface.nic_sql.id]
  tags                = local.common_tags
  
  # Enable Identity for Key Vault
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
  protected_settings = <<SETTINGS
    {
        "commandToExecute": "powershell.exe -ExecutionPolicy Unrestricted -Command \"$ErrorActionPreference = 'Stop'; $adminUser = '${var.vm_admin_username}'; $adminPass = '${var.vm_admin_password}'; $password = '${var.app_sql_password}'; $dbName = '${var.client_name}DB'; $dbUser = '${var.client_name}_app_user'; sqlcmd -S localhost -U $adminUser -P $adminPass -Q \\\"IF NOT EXISTS(SELECT * FROM sys.databases WHERE name='$dbName') BEGIN CREATE DATABASE [$dbName]; END\\\"; sqlcmd -S localhost -U $adminUser -P $adminPass -Q \\\"IF NOT EXISTS(SELECT * FROM sys.server_principals WHERE name='$dbUser') BEGIN CREATE LOGIN [$dbUser] WITH PASSWORD='$password'; END\\\"; sqlcmd -S localhost -U $adminUser -P $adminPass -Q \\\"USE [$dbName]; IF NOT EXISTS(SELECT * FROM sys.database_principals WHERE name='$dbUser') BEGIN CREATE USER [$dbUser] FOR LOGIN [$dbUser]; ALTER ROLE db_owner ADD MEMBER [$dbUser]; END;\\\"\""
    }
SETTINGS
  depends_on = [azurerm_mssql_virtual_machine.sqlvm]
}

# --- INTEGRATION VM ---
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
  size                = "Standard_B2s"
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

# --- APP PLANS ---
resource "azurerm_service_plan" "linux_plan" {
  name                = local.plan_linux_name
  location            = azurerm_resource_group.rg_apps.location
  resource_group_name = azurerm_resource_group.rg_apps.name
  os_type             = "Linux"
  sku_name            = "P1v2"
  tags                = local.common_tags
}

resource "azurerm_service_plan" "windows_plan" {
  name                = local.plan_windows_name
  location            = azurerm_resource_group.rg_apps.location
  resource_group_name = azurerm_resource_group.rg_apps.name
  os_type             = "Windows"
  sku_name            = "P1v2"
  tags                = local.common_tags
}

# --- WEB APPS ---
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

resource "azurerm_windows_web_app" "backend_apps" {
  for_each            = toset(var.backend_modules)
  name                = "${local._name_prefix}-${each.key}"
  location            = azurerm_resource_group.rg_apps.location
  resource_group_name = azurerm_resource_group.rg_apps.name
  service_plan_id     = azurerm_service_plan.windows_plan.id
  tags                = local.common_tags
  site_config {
    application_stack {
      dotnet_version = "v8.0"
    }
  }
}

# --- FUNCTION APPS (FIXED FORMATTING) ---
resource "azurerm_windows_function_app" "func_market" {
  name                = local.func_market_name
  location            = azurerm_resource_group.rg_apps.location
  resource_group_name = azurerm_resource_group.rg_apps.name
  service_plan_id     = azurerm_service_plan.windows_plan.id
  storage_account_name       = module.storage_account.name
  storage_account_access_key = module.storage_account.primary_access_key
  tags                = local.common_tags
  
  # FIX: Expanded multi-line block
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
  
  # FIX: Expanded multi-line block
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
  
  # FIX: Expanded multi-line block
  site_config {
    application_stack {
        dotnet_version = "v8.0"
    }
  }
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
}

data "azurerm_servicebus_namespace" "sb_lookup" {
  name                = local.service_bus_namespace_name
  resource_group_name = azurerm_resource_group.rg_apps.name
  depends_on          = [module.service_bus]
}

resource "azurerm_servicebus_queue" "q_processing" {
  name         = "processing-queue"
  namespace_id = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning = true
}

resource "azurerm_servicebus_topic" "t_market" {
  name         = "market-data-events"
  namespace_id = data.azurerm_servicebus_namespace.sb_lookup.id
  enable_partitioning = true
}

resource "azurerm_servicebus_subscription" "sub_subscriber" {
  name               = "subscriber-service"
  topic_id           = azurerm_servicebus_topic.t_market.id
  max_delivery_count = 10
}

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
resource "azurerm_key_vault_secret" "sql_password" {
  name         = "SQL-App-Password"
  value        = var.app_sql_password
  key_vault_id = module.key_vault.id
  depends_on   = [azurerm_role_assignment.kv_admin_rbac]
}