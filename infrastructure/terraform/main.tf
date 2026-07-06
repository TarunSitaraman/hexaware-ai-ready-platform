terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    databricks = {
      source  = "databricks/databricks"
      version = "~> 1.0"
    }
  }
}

provider "azurerm" {
  features {}
}

module "resource_group" {
  source   = "./modules/resource_group"
  location = var.location
  prefix   = var.prefix
}

module "storage" {
  source              = "./modules/storage"
  resource_group_name = module.resource_group.name
  location            = module.resource_group.location
  prefix              = var.prefix
}

module "databricks" {
  source              = "./modules/databricks"
  resource_group_name = module.resource_group.name
  location            = module.resource_group.location
  prefix              = var.prefix
}
