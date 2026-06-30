variable "name" { type = string }
variable "resource_group_name" { type = string }
variable "location" { type = string }
variable "tags" { type = map(string) }

resource "azurerm_databricks_workspace" "workspace" {
  name                = var.name
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = "premium" # Required for Unity Catalog

  tags = var.tags
}

output "workspace_url" { value = azurerm_databricks_workspace.workspace.workspace_url }
output "workspace_id" { value = azurerm_databricks_workspace.workspace.workspace_id }
