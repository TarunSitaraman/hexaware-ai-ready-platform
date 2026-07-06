# Databricks notebook source
# MAGIC %md
# MAGIC # 08 - Reporting
# MAGIC Serve Gold layer data for analytical dashboards and queries.

# COMMAND ----------
# MAGIC %sql
# MAGIC USE CATALOG hive_metastore;
# MAGIC USE SCHEMA retail_demo;

# COMMAND ----------
# MAGIC %md
# MAGIC ## Key Performance Indicator: Total Revenue Over Time

# COMMAND ----------
# MAGIC %sql
# MAGIC SELECT transaction_date, SUM(total_revenue) as daily_revenue
# MAGIC FROM gold_daily_sales
# MAGIC GROUP BY transaction_date
# MAGIC ORDER BY transaction_date;

# COMMAND ----------
# MAGIC %md
# MAGIC ## Revenue Breakdown by Category

# COMMAND ----------
# MAGIC %sql
# MAGIC SELECT product_category, SUM(total_revenue) as category_revenue
# MAGIC FROM gold_daily_sales
# MAGIC GROUP BY product_category
# MAGIC ORDER BY category_revenue DESC;
