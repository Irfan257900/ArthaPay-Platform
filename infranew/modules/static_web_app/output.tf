# This output gives us the randomly-generated URL of the new site.
# We will send this to Zapier.
output "url" {
  description = "The URL of the deployed static web app."
  value       = azurerm_static_web_app.swa.default_host_name
}

# This output gives us the *deployment token*.
# This is the "password" our workflow needs to deploy the React code.
output "api_key" {
  description = "The deployment API key for the static web app."
  value       = azurerm_static_web_app.swa.api_key
  sensitive   = true
}

# This output is the unique ID of the resource
output "id" {
  description = "The ID of the static web app."
  value       = azurerm_static_web_app.swa.id
}