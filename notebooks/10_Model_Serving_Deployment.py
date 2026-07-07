# Databricks notebook source
# MAGIC %md
# MAGIC # 10 - Model Serving Deployment
# MAGIC This notebook demonstrates how to take the Machine Learning model trained in Notebook 07 and deploy it as a Serverless Real-Time Inference Endpoint.

# COMMAND ----------
import mlflow
from databricks.sdk import WorkspaceClient
from databricks.sdk.service.serving import EndpointCoreConfigInput, ServedModelInput

# COMMAND ----------
# MAGIC %md
# MAGIC ## 1. Register the Model to Unity Catalog

# COMMAND ----------
catalog_name = spark.sql("SELECT current_catalog()").collect()[0][0] 
schema_name = "retail_demo"
model_name = f"{catalog_name}.{schema_name}.customer_spend_predictor"

# In a real scenario, we'd retrieve the run_id from our training notebook.
# For demo purposes, we will simulate registering the latest run for "CustomerSpendPredictor".

experiment = mlflow.get_experiment_by_name("/Shared/CustomerSpendPredictor") # Typical path if set
# In this demo, we'll just demonstrate the Databricks SDK mechanism to create an endpoint.

# COMMAND ----------
# MAGIC %md
# MAGIC ## 2. Deploy to Model Serving Endpoint
# MAGIC We use the Databricks SDK to programmatically create or update a serving endpoint.

# COMMAND ----------
w = WorkspaceClient()
endpoint_name = "retail-spend-predictor-endpoint"

# Define the served model (Requires the model to be registered in Model Registry/Unity Catalog)
served_model = ServedModelInput(
    model_name=model_name,
    model_version="1",
    workload_size="Small",
    scale_to_zero_enabled=True
)

try:
    print(f"Creating endpoint: {endpoint_name}...")
    # This will initiate the creation of the endpoint. It typically takes 5-10 minutes to become Ready.
    # w.serving_endpoints.create(
    #     name=endpoint_name,
    #     config=EndpointCoreConfigInput(
    #         served_models=[served_model]
    #     )
    # )
    print("Endpoint creation request submitted successfully. (Commented out for demo safety)")
except Exception as e:
    print(f"Error creating endpoint: {e}")

# COMMAND ----------
# MAGIC %md
# MAGIC ## 3. Test the Endpoint via REST API
# MAGIC Once the endpoint is ready, external applications can call it using standard HTTP requests.

# COMMAND ----------
import requests
import json

# Replace with your actual workspace URL and a valid PAT token
# databricks_url = "https://<workspace-id>.cloud.databricks.com"
# token = "dapi..."

# url = f"{databricks_url}/serving-endpoints/{endpoint_name}/invocations"
# headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
# data = {
#     "dataframe_records": [
#         {"purchase_count": 5, "days_since_last_purchase": 10},
#         {"purchase_count": 1, "days_since_last_purchase": 100}
#     ]
# }

# response = requests.post(url, headers=headers, data=json.dumps(data))
# print(response.text)
