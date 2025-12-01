locals {
  # 1. Load the specific settings based on the input 'app_name'
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

    # --- FUNCTION APPS REMOVED FOR NOW ---
    # "marketdata"  = try(local.marketdata_settings, {})
    # "subscriber"  = try(local.subscriber_settings, {})
    # "publisher"   = try(local.publisher_settings, {})
  }

  current_specific_settings = lookup(local.specific_settings_map, var.app_name, {})

  # 2. MERGE
  final_app_settings = merge(local.common_app_settings, local.current_specific_settings)
}