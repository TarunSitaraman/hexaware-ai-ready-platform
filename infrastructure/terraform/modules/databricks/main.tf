variable "prefix" {}
variable "location" {}
variable "resource_group_name" {}

resource "azurerm_databricks_workspace" "workspace" {
  name                = "${var.prefix}-workspace"
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = "premium"
}

output "workspace_url" {
  value = azurerm_databricks_workspace.workspace.workspace_url
}
