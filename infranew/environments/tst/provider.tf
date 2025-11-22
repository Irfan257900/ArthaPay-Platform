terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.0"
    }
  }
}

provider "azurerm" {
  # --- THE FINAL FIX ---
  # This block tells Terraform it's OK to delete a resource group
  # even if it has resources inside it. This fixes the error.
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}