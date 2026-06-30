terraform {
  required_version = ">= 1.5.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.100.0"
    }
  }
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy    = true
      recover_soft_deleted_key_vaults = true
    }
  }
}

# 1. Resource Group
module "resource_group" {
  source   = "./modules/resource_group"
  name     = "${var.project_prefix}-rg"
  location = var.location
  tags     = var.tags
}

# 2. ADLS Gen2 Storage (Bronze/Silver/Gold/Raw)
module "storage" {
  source              = "./modules/storage"
  name                = "${replace(var.project_prefix, "-", "")}storage"
  resource_group_name = module.resource_group.name
  location            = module.resource_group.location
  tags                = var.tags
}

# 3. Databricks Workspace (Premium for Unity Catalog)
module "databricks" {
  source              = "./modules/databricks"
  name                = "${var.project_prefix}-dbx"
  resource_group_name = module.resource_group.name
  location            = module.resource_group.location
  tags                = var.tags
}

# 4. Azure OpenAI (GPT-4o & Text Embedding)
module "openai" {
  source              = "./modules/openai"
  name                = "${var.project_prefix}-openai"
  resource_group_name = module.resource_group.name
  location            = var.location
  tags                = var.tags
}

# 5. Key Vault (Secrets Management)
module "keyvault" {
  source              = "./modules/keyvault"
  name                = "${var.project_prefix}-kv"
  resource_group_name = module.resource_group.name
  location            = module.resource_group.location
  tenant_id           = var.tenant_id
  object_id           = var.object_id
  tags                = var.tags
}
