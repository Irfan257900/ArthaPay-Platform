resource "azurerm_servicebus_namespace" "sb_namespace" {
  name                = var.service_bus_namespace_name
  location            = var.location
  resource_group_name = var.resource_group_name
  sku                 = var.sku
  tags                = var.tags
}

resource "azurerm_servicebus_namespace" "sb_namespace" {
  name                = var.service_bus_namespace_name
  location            = var.location
  resource_group_name = var.resource_group_name
  sku                 = var.sku
  tags                = var.tags
}

# --- DYNAMIC QUEUES ---
resource "azurerm_servicebus_queue" "queues" {
  for_each            = var.queues
  name                = each.key
  namespace_id        = azurerm_servicebus_namespace.sb_namespace.id
  
  # Using the version compatible with your provider
  enable_partitioning = each.value.partitioning_enabled
  requires_session    = each.value.requires_session
}

# --- DYNAMIC TOPICS ---
resource "azurerm_servicebus_topic" "topics" {
  for_each            = var.topics
  name                = each.key
  namespace_id        = azurerm_servicebus_namespace.sb_namespace.id
  
  enable_partitioning = each.value.partitioning_enabled
}

# --- DYNAMIC SUBSCRIPTIONS ---
resource "azurerm_servicebus_subscription" "subscriptions" {
  for_each           = var.subscriptions
  name               = each.key
  
  # Reference the Topic ID created within this same module
  topic_id           = azurerm_servicebus_topic.topics[each.value.topic_name].id
  
  max_delivery_count = each.value.max_delivery_count
  requires_session   = each.value.requires_session
}