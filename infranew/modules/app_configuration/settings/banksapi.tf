locals {
  # Specific settings JUST for BanksAPI
  banksapi_settings = {
    # Example: Maybe Banks API needs a specific toggle enabled
    "IsCardProvider"            = "false" 
    "IsBankProvider"            = "true"
    
    # Example: Specific Service Bus Queue for Banks
    "ServiceBusQueueName"       = "banks-processing-queue"
  }
}