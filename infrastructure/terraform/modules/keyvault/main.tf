variable "name" { type = string }
variable "resource_group_name" { type = string }
variable "location" { type = string }
variable "tenant_id" { type = string }
variable "object_id" { type = string }
variable "tags" { type = map(string) }

resource "azurerm_key_vault" "kv" {
  name                        = var.name
  location                    = var.location
  resource_group_name         = var.resource_group_name
  enabled_for_disk_encryption = true
  tenant_id                   = var.tenant_id
  soft_delete_retention_days  = 7
  purge_protection_enabled    = false

  sku_name = "standard"

  access_policy {
    tenant_id = var.tenant_id
    object_id = var.object_id

    key_permissions = ["Get", "List", "Create", "Delete", "Recover", "Backup", "Restore", "Purge"]
    secret_permissions = ["Get", "List", "Set", "Delete", "Recover", "Backup", "Restore", "Purge"]
    certificate_permissions = ["Get", "List", "Create", "Delete", "Recover", "Backup", "Restore", "Purge"]
  }

  tags = var.tags
}

output "vault_uri" { value = azurerm_key_vault.kv.vault_uri }
output "id" { value = azurerm_key_vault.kv.id }
