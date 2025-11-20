variable "resource_group_name" { type = string }
variable "location" { type = string }
variable "tags" { type = map(string) }

variable "acr_name" { type = string }
variable "app_service_plan_name" { type = string }
variable "web_app_name" { type = string }
variable "webapp_rg_name" { type = string }