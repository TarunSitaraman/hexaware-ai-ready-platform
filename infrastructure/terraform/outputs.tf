output "resource_group_name" {
  value = module.resource_group.name
}

output "storage_account_name" {
  value = module.storage.account_name
}

output "databricks_workspace_url" {
  value = module.databricks.workspace_url
}

output "openai_endpoint" {
  value = module.openai.endpoint
}

output "key_vault_uri" {
  value = module.keyvault.vault_uri
}

output "env_file_instructions" {
  value = <<EOT
======================================================
Deployment Successful! 
Copy these values into your backend/.env file:

AZURE_STORAGE_CONNECTION_STRING=<Fetch from Portal or Azure CLI>
DATABRICKS_WORKSPACE_URL=https://${module.databricks.workspace_url}
AZURE_OPENAI_ENDPOINT=${module.openai.endpoint}
======================================================
EOT
}
