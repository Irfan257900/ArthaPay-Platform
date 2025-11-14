variable "name" {
  description = "The name of the Static Web App."
  type        = string
}

variable "location" {
  description = "The Azure region where the Static Web App will be deployed."
  type        = string
}

variable "resource_group_name" {
  description = "The name of the resource group."
  type        = string
}

variable "tags" {
  description = "A map of tags to assign to the resource."
  type        = map(string)
  default     = {}
}