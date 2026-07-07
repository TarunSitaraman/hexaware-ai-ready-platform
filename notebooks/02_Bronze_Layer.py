# Databricks notebook source
# MAGIC %md
# MAGIC # 02 - Bronze Layer (Raw Delta)
# MAGIC In this layer, we save the raw ingested data into Delta format to enable ACID transactions, schema enforcement, and time travel.

# COMMAND ----------
catalog_name = spark.sql("SELECT current_catalog()").collect()[0][0] 
schema_name = "retail_demo"

# COMMAND ----------
# MAGIC %md
# MAGIC ## 1. Read from Ingestion View
# MAGIC Retrieve the data prepared during ingestion.

# COMMAND ----------
raw_df = spark.table("raw_retail_sales")

# COMMAND ----------
# MAGIC %md
# MAGIC ## 2. Write to Bronze Delta Table
# MAGIC Write the data in Delta format. We'll append data to simulate a continuous pipeline.

# COMMAND ----------
bronze_table_name = f"{catalog_name}.{schema_name}.bronze_sales"

# Write to Delta table
(raw_df.write
  .format("delta")
  .mode("append")
  .option("mergeSchema", "true") # Enable schema evolution if source schema changes
  .saveAsTable(bronze_table_name)
)

print(f"Data successfully written to {bronze_table_name}")

# COMMAND ----------
# MAGIC %md
# MAGIC ## 3. Query the Bronze Table
# MAGIC Verify the data in the Bronze layer.

# COMMAND ----------
display(spark.sql(f"SELECT * FROM {bronze_table_name} LIMIT 10"))
