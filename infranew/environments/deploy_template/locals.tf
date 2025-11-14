# This file dynamically generates all resource names
# based on the client and environment inputs.

locals {
  # 1. Base Naming
  # Example: "Voltica-tst"
  _name_prefix = "${var.client_name}-${var.environment_name}"
  
  # 2. Resource Group Names
  # Example: "rg-Voltica-tst-apps"
  app_rg_name = "rg-${local._name_prefix}-apps"
  vm_rg_name  = "rg-${local._name_prefix}-vm"

  # 3. Resource Names
  # Example: "Voltica-tst-vnet"
  vnet_name                  = "${local._name_prefix}-vnet"
  nsg_name                   = "${local._name_prefix}-nsg"
  vm_name                    = "${local._name_prefix}-sql-vm"
  storage_account_name       = "st${replace(lower(var.client_name), "-", "")}${var.environment_name}771" # Must be globally unique
  app_service_plan_name      = "${local._name_prefix}-asp"
  service_bus_namespace_name = "${local._name_prefix}-sb-namespace"
  key_vault_name             = "${local._name_prefix}-kv-${random_string.kv_suffix.result}"
  static_web_app_name        = "${local._name_prefix}-ui" # For your React App
}

# Suffix for globally unique names
resource "random_string" "kv_suffix" {
  length  = 5
  special = false
  upper   = false
}