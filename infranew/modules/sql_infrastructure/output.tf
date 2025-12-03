output "private_ip_address" {
  value = azurerm_network_interface.nic.private_ip_address
}

output "public_ip_address" {
  value = azurerm_public_ip.pip.ip_address
}

output "vm_name" {
  value = azurerm_windows_virtual_machine.vm.name
}

output "identity_principal_id" {
  value = azurerm_windows_virtual_machine.vm.identity[0].principal_id
}