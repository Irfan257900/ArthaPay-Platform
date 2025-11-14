# --- Standardized Tagging Definition & Data ---
locals {
  common_tags = {
    "Business-owners"     = "Project Manager"
    "Environment"         = var.environment_name
    "Client"              = var.client_name
    "Technical-owner"     = "DevOps Team"
  }
}
data "azurerm_client_config" "current" {}

# --- Resource Group Definitions ---
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

# --- Infrastructure Resources (in rg_infra) ---
module "networking" {
  source              = "../../modules/networking" # Use the generic module
  vnet_name           = local.vnet_name
  location            = azurerm_resource_group.rg_infra.location
  resource_group_name = azurerm_resource_group.rg_infra.name
  tags                = local.common_tags

  # --- FIX: Passing required networking arguments ---
  vnet_address_space          = local.vnet_address_space
  subnets                     = local.subnets
  private_endpoints_subnet_name = local.private_endpoints_subnet_name
}

module "windows_vm_sql" {
  source              = "../../modules/windows_vm_sql" # Use the generic module
  vm_name             = local.vm_name
  location            = azurerm_resource_group.rg_infra.location
  resource_group_name = azurerm_resource_group.rg_infra.name
  
  # --- FIX #1: Use the 'subnet_ids' output map ---
  # (This assumes your networking module outputs a map called 'subnet_ids')
  subnet_id           = module.networking.subnet_ids["vm-subnet"] 
  
  admin_username      = var.vm_admin_username
  admin_password      = var.vm_admin_password
  tags                = local.common_tags
  
  # Ensure networking is created before the VM
  depends_on = [module.networking] 
}

# --- Application Resources (in rg_apps) ---
module "storage_account" {
  source               = "../../modules/storage_account"
  storage_account_name = local.storage_account_name
  location             = azurerm_resource_group.rg_apps.location
  resource_group_name  = azurerm_resource_group.rg_apps.name
  tags                 = local.common_tags
}
module "app_service_plan" {
  source                = "../../modules/app_service_plan"
  app_service_plan_name = local.app_service_plan_name
  location              = azurerm_resource_group.rg_apps.location
  resource_group_name   = azurerm_resource_group.rg_apps.name
  sku_name              = "B1"
  os_type               = "Windows"
  tags                  = local.common_tags
}
module "service_bus" {
  source                     = "../../modules/service_bus"
  service_bus_namespace_name = local.service_bus_namespace_name
  location                   = azurerm_resource_group.rg_apps.location
  resource_group_name        = azurerm_resource_group.rg_apps.name
  sku                        = "Standard"
  tags                       = local.common_tags
}
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
module "function_apps" {
  for_each = toset(var.function_app_names)
  source   = "../../modules/function_app"

  location                       = azurerm_resource_group.rg_apps.location
  resource_group_name            = azurerm_resource_group.rg_apps.name
  tags                           = local.common_tags
  function_app_name              = "${local._name_prefix}-${each.key}-func" # Dynamic name
  dotnet_version                 = var.dotnet_version
  app_service_plan_id            = module.app_service_plan.id
  app_insights_instrumentation_key = "dummy-key" # We should fix this later
  
  # --- FIX #2: Corrected typo 'storage_to_account' -> 'storage_account' ---
  storage_account_name           = module.storage_account.name
  storage_account_access_key     = module.storage_account.primary_access_key
}

# --- NEW MODULE FOR YOUR REACT UI ---
module "static_web_app" {
  source                = "../../modules/static_web_app"
  name                  = local.static_web_app_name
  location              = azurerm_resource_group.rg_apps.location
  resource_group_name   = azurerm_resource_group.rg_apps.name
  tags                  = local.common_tags
}