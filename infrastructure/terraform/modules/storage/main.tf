variable "name" { type = string }
variable "resource_group_name" { type = string }
variable "location" { type = string }
variable "tags" { type = map(string) }

resource "azurerm_storage_account" "storage" {
  name                     = var.name
  resource_group_name      = var.resource_group_name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  is_hns_enabled           = true # Critical for ADLS Gen2

  tags = var.tags
}

resource "azurerm_storage_data_lake_gen2_filesystem" "raw_zone" {
  name               = "raw-zone"
  storage_account_id = azurerm_storage_account.storage.id
}

resource "azurerm_storage_data_lake_gen2_filesystem" "landing_zone" {
  name               = "landing-zone"
  storage_account_id = azurerm_storage_account.storage.id
}

resource "azurerm_storage_data_lake_gen2_filesystem" "databricks" {
  name               = "databricks"
  storage_account_id = azurerm_storage_account.storage.id
}

output "account_name" { value = azurerm_storage_account.storage.name }
output "primary_dfs_endpoint" { value = azurerm_storage_account.storage.primary_dfs_endpoint }
