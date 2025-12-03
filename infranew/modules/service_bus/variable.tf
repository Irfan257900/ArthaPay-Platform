variable "service_bus_namespace_name" { type = string }
variable "location" { type = string }
variable "resource_group_name" { type = string }
variable "sku" { type = string }
variable "tags" { type = map(string) }

variable "queues" {
  description = "Map of queues to create. Key = Name, Value = Config Object"
  type = map(object({
    partitioning_enabled = bool
    requires_session     = bool
  }))
  default = {}
}

variable "topics" {
  description = "Map of topics to create. Key = Name, Value = Config Object"
  type = map(object({
    partitioning_enabled = bool
  }))
  default = {}
}

variable "subscriptions" {
  description = "Map of subscriptions. Key = SubscriptionName, Value = Config including Topic Name"
  type = map(object({
    topic_name         = string
    max_delivery_count = number
    requires_session   = bool
  }))
  default = {}
}