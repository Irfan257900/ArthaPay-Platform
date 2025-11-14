# This file configures the Terraform provider for Azure

terraform {
  # This block tells Terraform to use a MODERN version
  # of the Azure provider (version 3.0 or newer),
  # which is required for Static Web Apps.
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.0"
    }
  }
}

provider "azurerm" {
  features {}
}