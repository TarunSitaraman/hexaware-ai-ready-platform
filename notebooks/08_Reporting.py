# Databricks notebook source
# MAGIC %md
# MAGIC # 08 - Reporting
# MAGIC Serve Gold layer data for analytical dashboards and queries.

# COMMAND ----------
catalog_name = spark.sql("SELECT current_catalog()").collect()[0][0]
spark.sql(f"USE CATALOG {catalog_name}")
spark.sql("USE SCHEMA retail_demo")

# COMMAND ----------
# MAGIC %md
# MAGIC ## Key Performance Indicator: Total Revenue Over Time

# COMMAND ----------
display(spark.sql("""
SELECT date, SUM(total_revenue) as daily_revenue
FROM gold_daily_sales
GROUP BY date
ORDER BY date
"""))

# COMMAND ----------
# MAGIC %md
# MAGIC ## Revenue Breakdown by Category

# COMMAND ----------
display(spark.sql("""
SELECT product_category, SUM(total_revenue) as category_revenue
FROM gold_daily_sales
GROUP BY product_category
ORDER BY category_revenue DESC
"""))
