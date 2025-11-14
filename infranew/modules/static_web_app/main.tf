resource "azurerm_static_web_app" "swa" {
  name                = var.name
  location            = var.location
  resource_group_name = var.resource_group_name
  tags                = var.tags
  
  # The "Free" tier is generous and perfect for hosting a React app
  sku_tier = "Free"
  sku_size = "Free"
}