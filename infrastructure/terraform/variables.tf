variable "project_prefix" {
  description = "Prefix for all resources (e.g., aiready, hexaware-macro)"
  type        = string
  default     = "aiready"
}

variable "location" {
  description = "Azure region to deploy resources"
  type        = string
  default     = "eastus"
}

variable "tenant_id" {
  description = "Azure AD Tenant ID for Key Vault access"
  type        = string
}

variable "object_id" {
  description = "Azure AD Object ID (User or Service Principal) for Key Vault admin access"
  type        = string
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default = {
    Environment = "Dev"
    Project     = "AI-Ready-Platform"
    ManagedBy   = "Terraform"
  }
}
