# Databricks notebook source
# MAGIC %md
# MAGIC # 06 - Feature Engineering
# MAGIC Preparing the dataset for Machine Learning. We will create features at the customer level to predict customer lifetime value (LTV) or churn.

# COMMAND ----------
from pyspark.sql.functions import sum, max, datediff, current_date, count, expr

catalog_name = spark.sql("SELECT current_catalog()").collect()[0][0] 
schema_name = "retail_demo"
silver_table = f"{catalog_name}.{schema_name}.silver_sales"

# COMMAND ----------
# MAGIC %md
# MAGIC ## 1. Build Customer Features
# MAGIC Aggregate transaction data to the customer level.

# COMMAND ----------
sales_df = spark.table(silver_table)

customer_features_df = (sales_df.groupBy("customer_id")
  .agg(
      sum("total_revenue").alias("total_spend"),
      count("transaction_id").alias("purchase_count"),
      max("date").alias("last_purchase_date")
  )
  .withColumn("days_since_last_purchase", datediff(current_date(), "last_purchase_date"))
)

# COMMAND ----------
# MAGIC %md
# MAGIC ## 2. Save Features to Feature Store / Delta Table
# MAGIC In Databricks, Unity Catalog can act as the Feature Store (Feature Engineering in UC).

# COMMAND ----------
feature_table = f"{catalog_name}.{schema_name}.customer_features"

(customer_features_df.write
  .format("delta")
  .mode("overwrite")
  .saveAsTable(feature_table)
)

display(customer_features_df)
