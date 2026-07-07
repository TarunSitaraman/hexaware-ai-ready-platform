# Databricks notebook source
# MAGIC %md
# MAGIC # 01 - Data Ingestion
# MAGIC This notebook demonstrates reading raw data from a source (e.g., ADLS Gen2, simulated local volume for demo) into Databricks.

# COMMAND ----------
# MAGIC %md
# MAGIC ## 1. Setup Environment
# MAGIC Define paths and configuration for Unity Catalog and external locations.

# COMMAND ----------
# Configuration
catalog_name = spark.sql("SELECT current_catalog()").collect()[0][0] # Or use your specific Unity Catalog name like 'main'
schema_name = "retail_demo"
volume_path = "/Volumes/main/retail_demo/raw_data" # Simulated path
import os
repo_root = os.path.dirname(os.getcwd())
raw_file_path = f"file:{repo_root}/data/sample_retail_sales.csv"
spark.sql(f"CREATE DATABASE IF NOT EXISTS {catalog_name}.{schema_name}")
spark.sql(f"USE CATALOG {catalog_name}")
spark.sql(f"USE SCHEMA {schema_name}")

# COMMAND ----------
# MAGIC %md
# MAGIC ## 2. Read Raw Data
# MAGIC Read the CSV data using Auto Loader or standard DataFrame reader.

# COMMAND ----------
# Read the CSV data with inferred schema
raw_df = (spark.read.format("csv")
  .option("header", "true")
  .option("inferSchema", "true")
  .load(raw_file_path)
)

display(raw_df)

# COMMAND ----------
# MAGIC %md
# MAGIC ## 3. Add Ingestion Metadata
# MAGIC Add ingestion timestamp and source file name.

# COMMAND ----------
from pyspark.sql.functions import current_timestamp, col

ingested_df = raw_df.withColumn("ingested_at", current_timestamp()) \
                    .withColumn("source_file", col("_metadata.file_path"))

display(ingested_df)

# COMMAND ----------
# MAGIC %md
# MAGIC ## 4. Save to a temporary view or proceed to Bronze Layer
# MAGIC In a real streaming scenario, this would be an Auto Loader stream writing directly to Bronze.

# COMMAND ----------
ingested_df.write.format("delta").mode("overwrite").saveAsTable(f"{catalog_name}.{schema_name}.raw_retail_sales")
print("Ingestion complete. Data is saved to Unity Catalog and ready for Bronze layer.")
