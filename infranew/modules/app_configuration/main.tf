locals {
  # Load the specific settings based on the input 'app_name'.
  # Now, each setting map MUST be complete on its own.
  specific_settings_map = {
    # Web Apps
    "banksapi"    = try(local.banksapi_settings, {})
    "coreapi"     = try(local.coreapi_settings, {})
    "cardsapi"    = try(local.cardsapi_settings, {})
    "paymentsapi" = try(local.paymentsapi_settings, {})
    "paylinks"    = try(local.paylinks_settings, {})
    "signalr"     = try(local.signalr_settings, {})
    "api"         = try(local.api_settings, {})
    "exchangeapi" = try(local.exchangeapi_settings, {})
    "integration" = try(local.integration_settings, {})

    # Function Apps
    "marketdata"  = try(local.marketdata_settings, {})
    "subscriber"  = try(local.subscriber_settings, {})
    "publisher"   = try(local.publisher_settings, {})
  }

  # Directly use the specific settings. No merging with common defaults.
  final_app_settings = lookup(local.specific_settings_map, var.app_name, {})
}