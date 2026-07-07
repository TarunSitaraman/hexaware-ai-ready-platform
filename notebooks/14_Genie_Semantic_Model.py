# Databricks Notebook source
# MAGIC %md
# MAGIC # AI/BI Genie Semantic Modeling
# MAGIC Databricks AI/BI Genie allows us to define strict semantic rules (metrics, dimensions, foreign keys)
# MAGIC so that the LLM does not have to guess how to write SQL. 
# MAGIC 
# MAGIC *Note: Genie Rooms are currently configured via the UI or REST API. This script acts as the codified YAML/JSON definition for the Genie API payload.*

# COMMAND ----------

import json
import requests
import os

# COMMAND ----------

# Define the Semantic Model
genie_semantic_model = {
    "name": "Retail_Sales_Ontology",
    "description": "Semantic model for AI Copilot queries regarding retail sales.",
    "tables": [
        {
            "name": "gold_daily_sales",
            "catalog": "hive_metastore",
            "schema": "retail_demo",
            "description": "Daily aggregated sales. Use this for performance metrics.",
            "dimensions": [
                {"name": "date", "column": "date", "type": "TIMESTAMP"},
                {"name": "region", "column": "region", "type": "STRING"},
                {"name": "category", "column": "product_category", "type": "STRING"}
            ],
            "metrics": [
                {
                    "name": "total_revenue",
                    "description": "Total revenue generated. Always use this instead of summing raw amounts.",
                    "expression": "SUM(total_revenue)"
                },
                {
                    "name": "total_transactions",
                    "description": "Count of daily transactions.",
                    "expression": "SUM(transaction_count)"
                }
            ]
        }
    ],
    "relationships": [
        # Define foreign keys here if using a star schema
    ],
    "trusted_assets": [
        # Link to verified dashboards or queries
    ]
}

# COMMAND ----------

# MAGIC %md
# MAGIC ### Deploy to Databricks AI/BI API
# MAGIC 
# MAGIC ```python
# MAGIC DBX_HOST = os.environ.get("DATABRICKS_HOST")
# MAGIC DBX_TOKEN = os.environ.get("DATABRICKS_TOKEN")
# MAGIC 
# MAGIC response = requests.post(
# MAGIC     f"{DBX_HOST}/api/2.0/genie/spaces",
# MAGIC     headers={"Authorization": f"Bearer {DBX_TOKEN}"},
# MAGIC     json=genie_semantic_model
# MAGIC )
# MAGIC 
# MAGIC print("✅ Genie Semantic Space Created.")
# MAGIC ```
