# Databricks notebook source
import dlt
from pyspark.sql.functions import current_timestamp, input_file_name

@dlt.table(
  name="bronze_macro_data",
  comment="Raw macroeconomic data ingested from ADLS Gen2 landing zone.",
  table_properties={"quality": "bronze"}
)
def bronze_macro_data():
    raw_path = spark.conf.get("pipeline.raw_path", "abfss://raw-zone@adls_account.dfs.core.windows.net/")
    
    # Read raw CSV data
    df = (spark.readStream
          .format("cloudFiles")
          .option("cloudFiles.format", "csv")
          .option("header", "true")
          .option("cloudFiles.inferColumnTypes", "true")
          .load(raw_path))
    
    # Add Bronze audit metadata
    return df.withColumn("_ingested_at", current_timestamp()) \
             .withColumn("_source_file", input_file_name())
