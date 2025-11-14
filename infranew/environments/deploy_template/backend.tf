# This backend configuration is now generic.
# The state file key will be provided by the
# GitHub Actions workflow during the 'init' step.

terraform {
  backend "azurerm" {
    storage_account_name = "volticatfstorage77123"
    container_name       = "tfstate"
    resource_group_name  = "VolticTf-RG"
  }
}