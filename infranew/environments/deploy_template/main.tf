# --- Standardized Tagging Definition & Data ---
locals {
  common_tags = {
    "Business-owners"     = "Project Manager"
    "Environment"         = var.environment_name
    "Client"              = var.client_name
    "Technical-owner"     = "DevOps Team"
  }
  
  # Dynamic Naming
  _name_prefix = "${var.client_name}-${var.environment_name}"
  
  # Resource Names
  app_rg_name              = "rg-${local._name_prefix}-apps"
  vm_rg_name               = "rg-${local._name_prefix}-vm"
  vnet_name                = "${local._name_prefix}-vnet"
  vm_name                  = "${local._name_prefix}-sqlvm"
  key_vault_name           = "${local._name_prefix}-kv-${substr(md5(timestamp()), 0, 5)}"
  storage_account_name     = "st${lower(var.client_name)}${lower(var.environment_name)}${substr(md5(timestamp()), 0, 3)}"
  app_service_plan_name    = "${local._name_prefix}-asp"
  service_bus_namespace_name = "${local._name_prefix}-sb-namespace"
  
  # NEW: Container Resources
  acr_name                 = "acr${lower(var.client_name)}${lower(var.environment_name)}${substr(md5(timestamp()), 0, 3)}"
  ui_web_app_name          = "${local._name_prefix}-ui-app"

  # Network Config
  vnet_address_space       = ["10.0.0.0/16"]
  subnets = {
    "vm-subnet" = { address_prefixes = ["10.0.1.0/24"] }
    "pep-subnet" = { address_prefixes = ["10.0.2.0/24"] }
  }
  private_endpoints_subnet_name = "pep-subnet"
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

# --- Networking Module ---
module "networking" {
  source                        = "../../modules/networking"
  vnet_name                     = local.vnet_name
  location                      = azurerm_resource_group.rg_infra.location
  resource_group_name           = azurerm_resource_group.rg_infra.name
  tags                          = local.common_tags
  vnet_address_space            = local.vnet_address_space
  subnets                       = local.subnets
  private_endpoints_subnet_name = local.private_endpoints_subnet_name
  depends_on                    = [azurerm_resource_group.rg_infra]
}

# --- Public IP for VM ---
resource "azurerm_public_ip" "pip" {
  name                = "pip-${local.vm_name}"
  location            = azurerm_resource_group.rg_infra.location
  resource_group_name = azurerm_resource_group.rg_infra.name
  allocation_method   = "Static"
  sku                 = "Standard"
  tags                = local.common_tags
}

# --- Network Interface ---
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

# --- Windows Virtual Machine (SQL Server Image) ---
resource "azurerm_windows_virtual_machine" "vm" {
  name                = local.vm_name
  computer_name       = substr(local.vm_name, 0, 15) # Max 15 chars for NetBIOS
  resource_group_name = azurerm_resource_group.rg_infra.name
  location            = azurerm_resource_group.rg_infra.location
  size                = "Standard_B2ms"
  admin_username      = var.vm_admin_username
  admin_password      = var.vm_admin_password
  network_interface_ids = [azurerm_network_interface.nic.id]
  tags                = local.common_tags

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

# --- Managed Data Disks ---
resource "azurerm_managed_disk" "data_disk_1" {
  name                 = "${local.vm_name}-datadisk1"
  location             = azurerm_resource_group.rg_infra.location
  resource_group_name  = azurerm_resource_group.rg_infra.name
  storage_account_type = "Standard_LRS"
  create_option        = "Empty"
  disk_size_gb         = 32
  tags                 = local.common_tags
}

resource "azurerm_virtual_machine_data_disk_attachment" "attachment_1" {
  managed_disk_id    = azurerm_managed_disk.data_disk_1.id
  virtual_machine_id = azurerm_windows_virtual_machine.vm.id
  lun                = 0
  caching            = "ReadWrite"
}

resource "azurerm_managed_disk" "data_disk_2" {
  name                 = "${local.vm_name}-datadisk2"
  location             = azurerm_resource_group.rg_infra.location
  resource_group_name  = azurerm_resource_group.rg_infra.name
  storage_account_type = "Standard_LRS"
  create_option        = "Empty"
  disk_size_gb         = 32
  tags                 = local.common_tags
}

resource "azurerm_virtual_machine_data_disk_attachment" "attachment_2" {
  managed_disk_id    = azurerm_managed_disk.data_disk_2.id
  virtual_machine_id = azurerm_windows_virtual_machine.vm.id
  lun                = 1
  caching            = "ReadWrite"
}

# --- SQL IaaS Extension ---
resource "azurerm_mssql_virtual_machine" "sqlvm" {
  virtual_machine_id               = azurerm_windows_virtual_machine.vm.id
  sql_license_type                 = "PAYG"
  r_services_enabled               = true
  sql_connectivity_port            = 1433
  sql_connectivity_type            = "PRIVATE"
  sql_connectivity_update_password = var.vm_admin_password
  sql_connectivity_update_username = var.vm_admin_username

  auto_patching {
    day_of_week                            = "Sunday"
    maintenance_window_duration_in_minutes = 60
    maintenance_window_starting_hour       = 2
  }
}

# --- Custom Script Extension (Creates DB and User) ---
resource "azurerm_virtual_machine_extension" "sql_db_setup" {
  name                 = "sql-db-setup"
  virtual_machine_id   = azurerm_windows_virtual_machine.vm.id
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

# --- NEW: Azure Container Registry (ACR) ---
resource "azurerm_container_registry" "acr" {
  name                = local.acr_name
  resource_group_name = azurerm_resource_group.rg_apps.name
  location            = azurerm_resource_group.rg_apps.location
  sku                 = "Basic"
  admin_enabled       = true
  tags                = local.common_tags
}

# --- NEW: App Service Plan (Linux for Containers) ---
resource "azurerm_service_plan" "ui_plan" {
  name                = "${local.app_service_plan_name}-linux"
  location            = azurerm_resource_group.rg_apps.location
  resource_group_name = azurerm_resource_group.rg_apps.name
  os_type             = "Linux"
  sku_name            = "B1"
  tags                = local.common_tags
}

# --- NEW: Web App for Containers ---
resource "azurerm_linux_web_app" "ui_webapp" {
  name                = local.ui_web_app_name
  location            = azurerm_resource_group.rg_apps.location
  resource_group_name = azurerm_resource_group.rg_apps.name
  service_plan_id     = azurerm_service_plan.ui_plan.id
  tags                = local.common_tags

  # System Identity needed to pull from ACR
  identity {
    type = "SystemAssigned"
  }

  site_config {
    # Points to a default image initially. 
    # Job 2 will update this to your real image.
    application_stack {
      docker_image_name = "mcr.microsoft.com/appsvc/staticsite:latest"
      docker_registry_url = "https://mcr.microsoft.com"
    }
  }
  
  app_settings = {
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
    "DOCKER_REGISTRY_SERVER_URL"          = "https://${azurerm_container_registry.acr.login_server}"
    "DOCKER_REGISTRY_SERVER_USERNAME"     = azurerm_container_registry.acr.admin_username
    "DOCKER_REGISTRY_SERVER_PASSWORD"     = azurerm_container_registry.acr.admin_password
  }
}

# --- NEW: Grant Web App permission to pull from ACR ---
resource "azurerm_role_assignment" "webapp_acr_pull" {
  scope                = azurerm_container_registry.acr.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_linux_web_app.ui_webapp.identity[0].principal_id
}

# --- Storage Account ---
module "storage_account" {
  source               = "../../modules/storage_account"
  storage_account_name = local.storage_account_name
  location             = azurerm_resource_group.rg_apps.location
  resource_group_name  = azurerm_resource_group.rg_apps.name
  tags                 = local.common_tags
}

# --- Service Bus ---
module "service_bus" {
  source                     = "../../modules/service_bus"
  service_bus_namespace_name = local.service_bus_namespace_name
  location                   = azurerm_resource_group.rg_apps.location
  resource_group_name        = azurerm_resource_group.rg_apps.name
  sku                        = "Standard"
  tags                       = local.common_tags
}

# --- Key Vault ---
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

# --- Secrets Creation ---
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

# --- Backend Function Apps ---
module "function_apps" {
  for_each = toset(var.function_app_names)
  source   = "../../modules/function_app"

  location                       = azurerm_resource_group.rg_apps.location
  resource_group_name            = azurerm_resource_group.rg_apps.name
  tags                           = local.common_tags
  function_app_name              = "${local._name_prefix}-${each.key}-func"
  dotnet_version                 = var.dotnet_version
  app_service_plan_id            = azurerm_service_plan.ui_plan.id # Share the Linux plan? Or create separate Windows plan?
  # NOTE: If your functions are .NET (Windows), they CANNOT share the Linux UI plan.
  # Assuming functions are Windows for now. If they need Windows, uncomment module app_service_plan below.
  app_insights_instrumentation_key = "dummy-key"
  storage_account_name           = module.storage_account.name
  storage_account_access_key     = module.storage_account.primary_access_key
}

# --- Restore Windows Plan for Functions (if needed) ---
module "app_service_plan" {
  source                = "../../modules/app_service_plan"
  app_service_plan_name = local.app_service_plan_name
  location              = azurerm_resource_group.rg_apps.location
  resource_group_name   = azurerm_resource_group.rg_apps.name
  sku_name              = "B1"
  os_type               = "Windows"
  tags                  = local.common_tags
}

# --- OUTPUTS ---
output "webapp_name" {
  value = azurerm_linux_web_app.ui_webapp.name
}
output "webapp_rg_name" {
  value = azurerm_resource_group.rg_apps.name
}
output "acr_login_server" {
  value = azurerm_container_registry.acr.login_server
}
output "acr_admin_username" {
  value = azurerm_container_registry.acr.admin_username
  sensitive = true
}
output "acr_admin_password" {
  value = azurerm_container_registry.acr.admin_password
  sensitive = true
}