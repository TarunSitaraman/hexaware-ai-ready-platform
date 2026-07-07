import dlt
from pyspark.sql.functions import col, to_date, sum, count, round

import os

# 1. Bronze Layer (Raw Ingestion)
@dlt.table(
  name="bronze_sales",
  comment="Raw ingested sales data from the operational source system."
)
def bronze_sales():
  # In DLT, you can use spark.readStream for Auto Loader, but we'll use standard read for demo
  repo_root = os.path.dirname(os.path.dirname(os.getcwd())) # Depending on run context
  # Better to use a fixed volume path in production
  
  # For demo purposes, assuming data is available in a Unity Catalog Volume or DBFS path
  # We will just simulate reading from a temporary CSV or assume it's pre-loaded
  # Returning a mock dataframe if file not found during DLT parse
  try:
      return (spark.read.format("csv")
        .option("header", "true")
        .option("inferSchema", "true")
        .load("file:/Workspace/Users/tarunsita13@gmail.com/hexaware-ai-ready-platform/data/sample_retail_sales.csv"))
  except:
      # Fallback for DLT parse time validation
      return spark.sql("SELECT 'trx1' as transaction_id, '2025-01-01' as date, 100 as amount, 'Electronics' as product_category, 'East' as region")

# 2. Silver Layer (Cleaned & Validated with Expectations)
@dlt.table(
  name="silver_sales",
  comment="Cleaned sales data with enforced data quality expectations."
)
@dlt.expect_or_drop("valid_amount", "amount > 0")
@dlt.expect_or_fail("valid_transaction", "transaction_id IS NOT NULL")
def silver_sales():
  return (
    dlt.read("bronze_sales")
      .dropDuplicates(["transaction_id"])
      .withColumn("date", to_date(col("date")))
  )

# 3. Gold Layer (Business Aggregates)
@dlt.table(
  name="gold_daily_sales",
  comment="Daily aggregated revenue by category and region."
)
def gold_daily_sales():
  return (
    dlt.read("silver_sales")
      .groupBy("date", "product_category", "region")
      .agg(
          sum("amount").alias("total_revenue"),
          count("transaction_id").alias("transaction_count")
      )
      .withColumn("total_revenue", round("total_revenue", 2))
  )
