from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import SecretStr, Field
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    azure_subscription_id: str = ""
    azure_resource_group: str = "rg-aiready-mvp-dev"
    azure_location: str = "eastus"

    storage_account_name: str = ""
    storage_container_raw: str = "raw-zone"
    storage_container_landing: str = "landing-zone"

    databricks_workspace_url: str = ""
    databricks_token: SecretStr = SecretStr("")
    databricks_catalog: str = "aiready"
    databricks_bronze_job_id: str = ""
    databricks_silver_job_id: str = ""
    databricks_gold_job_id: str = ""
    databricks_embedding_job_id: str = ""
    databricks_cluster_id: str = ""

    search_service_name: str = ""
    search_admin_key: SecretStr = SecretStr("")
    search_index_name: str = "macro-knowledge-index"

    azure_openai_endpoint: str = ""
    azure_openai_key: SecretStr = SecretStr("")
    azure_openai_deployment_gpt: str = "gpt-4o"
    azure_openai_deployment_embed: str = "text-embedding-ada-002"

    api_key: SecretStr = SecretStr("dev-api-key-change-in-production")
    appinsights_connection_string: str = ""
    cors_origins: List[str] = ["http://localhost:3000"]

    database_url: str = "sqlite:///./data/aieady.db"


settings = Settings()