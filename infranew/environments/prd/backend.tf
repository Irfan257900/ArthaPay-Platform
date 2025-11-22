terraform {
  # Empty block: The Resource Group, Storage Account, and Key 
  # are injected dynamically by the GitHub Workflow.
  backend "azurerm" {}
}