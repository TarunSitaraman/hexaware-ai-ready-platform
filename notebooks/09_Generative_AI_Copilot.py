# Databricks notebook source
# MAGIC %md
# MAGIC # 09 - Generative AI Copilot
# MAGIC This notebook demonstrates how to integrate Large Language Models (LLMs) into your Databricks platform using Databricks Foundation Model APIs.
# MAGIC 
# MAGIC We will create a simple copilot that can take a user's natural language question about the retail data, convert it to a SQL query (Text-to-SQL), execute it, and summarize the results.

# COMMAND ----------
# MAGIC %pip install mlflow databricks-sdk langchain langchain-community

# COMMAND ----------
dbutils.library.restartPython()

# COMMAND ----------
import os
from databricks.sdk import WorkspaceClient
from langchain_community.chat_models import ChatDatabricks
from langchain_core.messages import HumanMessage, SystemMessage

# Initialize Workspace Client
w = WorkspaceClient()

# Initialize the Chat Model (assuming a standard Databricks model serving endpoint for Llama-3 or DBRX)
# For this demo, we assume an endpoint named 'databricks-dbrx-instruct' is available in your workspace.
try:
    chat_model = ChatDatabricks(endpoint="databricks-dbrx-instruct")
except Exception as e:
    print(f"Endpoint not found or not ready, simulating response. Error: {e}")
    chat_model = None

# COMMAND ----------
# MAGIC %md
# MAGIC ## 1. Context and Prompt Engineering
# MAGIC Define the schema of our Gold table so the LLM understands what data is available.

# COMMAND ----------
table_schema = """
Table Name: hive_metastore.retail_demo.gold_daily_sales
Columns:
- transaction_date (DATE): The date of the transactions
- product_category (STRING): The category of the products sold (e.g., Electronics, Clothing, Home)
- total_revenue (DOUBLE): The total revenue generated for that category on that day
- total_items_sold (BIGINT): The total number of items sold
- transaction_count (BIGINT): The total number of unique transactions
"""

system_prompt = f"""You are a helpful Retail Data Assistant. 
You have access to a Databricks SQL table with the following schema:
{table_schema}

When a user asks a question, you should formulate a valid Spark SQL query to answer it.
Return ONLY the SQL query, without markdown formatting or explanation.
"""

# COMMAND ----------
# MAGIC %md
# MAGIC ## 2. Natural Language to SQL

# COMMAND ----------
user_question = "What was the total revenue for Electronics across all days?"

if chat_model:
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_question)
    ]
    response = chat_model.invoke(messages)
    generated_sql = response.content.replace("```sql", "").replace("```", "").strip()
else:
    # Simulated fallback response
    generated_sql = "SELECT SUM(total_revenue) FROM hive_metastore.retail_demo.gold_daily_sales WHERE product_category = 'Electronics';"

print(f"Question: {user_question}")
print(f"Generated SQL: \n{generated_sql}")

# COMMAND ----------
# MAGIC %md
# MAGIC ## 3. Execute the Query
# MAGIC Run the generated SQL query against our Gold table.

# COMMAND ----------
try:
    result_df = spark.sql(generated_sql)
    display(result_df)
except Exception as e:
    print(f"Error executing SQL: {e}")
