variable "vm_name" {
  type = string
}

variable "location" {
  type = string
}

variable "resource_group_name" {
  type = string
}

variable "subnet_id" {
  type = string
}

variable "tags" {
  type = map(string)
}

# --- VM Configuration ---
variable "vm_size" {
  type    = string
  default = "Standard_B2ms"
}

variable "admin_username" {
  type = string
}

# FIX: Use multi-line format here
variable "admin_password" {
  type      = string
  sensitive = true
}

# --- SQL Specifics ---
variable "client_name" {
  description = "Used for DB Name generation"
  type        = string
}

variable "app_sql_password" {
  description = "Password for the contained DB User"
  type        = string
  sensitive   = true
}

# --- Disks Map ---
variable "data_disks" {
  description = "Map of disks to create"
  type = map(object({
    disk_size_gb         = number
    lun                  = number
    caching              = string
    storage_account_type = string
    create_option        = string
  }))
  default = {}
}