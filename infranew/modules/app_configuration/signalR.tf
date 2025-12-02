locals {
  signalr_settings = {
    # ---------------------------------------------------------
    # 1. FROM SAMPLE ONLY
    # ---------------------------------------------------------
    
    # App Insights (Mapped to variables)
    "APPINSIGHTS_INSTRUMENTATIONKEY"        = var.app_insights_instrumentation_key
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = var.app_insights_connection_string
    
    # Platform Settings (Hardcoded from sample)
    "ApplicationInsightsAgent_EXTENSION_VERSION" = "~2"
    "WEBSITE_ENABLE_SYNC_UPDATE_SITE"            = "true"
    "WEBSITE_RUN_FROM_PACKAGE"                   = "1"
    "XDT_MicrosoftApplicationInsights_Mode"      = "default"
  }
}