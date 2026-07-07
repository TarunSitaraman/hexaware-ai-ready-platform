# Databricks notebook source
# MAGIC %md
# MAGIC # 04 - Gold Layer (Business-Ready Data)
# MAGIC The Gold layer contains highly refined and aggregated data ready for BI dashboards and machine learning.

# COMMAND ----------
from pyspark.sql.functions import sum, count, round

catalog_name = spark.sql("SELECT current_catalog()").collect()[0][0] 
schema_name = "retail_demo"
silver_table = f"{catalog_name}.{schema_name}.silver_sales"

# COMMAND ----------
# MAGIC %md
# MAGIC ## 1. Read Silver Data

# COMMAND ----------
silver_df = spark.table(silver_table)

# COMMAND ----------
# MAGIC %md
# MAGIC ## 2. Calculate Business Aggregations
# MAGIC E.g., Daily Sales by Product Category.

# COMMAND ----------

daily_sales_df = (silver_df.groupBy("date", "product_category", "region")
  .agg(
      sum("total_revenue").alias("total_revenue"),
      count("transaction_id").alias("transaction_count")
  )
  .withColumn("total_revenue", round("total_revenue", 2))
)

# COMMAND ----------
# MAGIC %md
# MAGIC ## 3. Write to Gold Table
# MAGIC Overwrite is common for aggregated tables, though MERGE can be used for incremental aggregations.

# COMMAND ----------
gold_table = f"{catalog_name}.{schema_name}.gold_daily_sales"

(daily_sales_df.write
  .format("delta")
  .mode("overwrite")
  .saveAsTable(gold_table)
)

print(f"Gold table {gold_table} successfully created/updated.")

# COMMAND ----------
display(spark.table(gold_table).orderBy("date", "product_category"))
