locals {
  paylinks_settings = {
    # ---------------------------------------------------------
    # 1. FROM SAMPLE (Filtered)
    # ---------------------------------------------------------
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE"   = "false"
    
    # Use the variable we passed in from main.tf
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = var.app_insights_connection_string

    # ---------------------------------------------------------
    # EXCLUDED ITEMS NOTE:
    # 1. DOCKER_REGISTRY_* -> Removed (This is Windows Code, not Linux Container)
    # 2. WEBSITE_HEALTHCHECK_* -> Removed (Conflict: Managed by site_config block)
    # ---------------------------------------------------------
  }
}