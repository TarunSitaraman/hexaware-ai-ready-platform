# Databricks notebook source
# MAGIC %md
# MAGIC # 11 - Advanced Governance (RLS & Masking)
# MAGIC Unity Catalog provides fine-grained governance. This notebook demonstrates Row-Level Security (RLS) and Dynamic Data Masking.

# COMMAND ----------
# MAGIC %sql
# MAGIC USE CATALOG hive_metastore;
# MAGIC USE SCHEMA retail_demo;

# COMMAND ----------
# MAGIC %md
# MAGIC ## 1. Dynamic Data Masking
# MAGIC Mask sensitive columns (e.g., an email address or identifying ID) so that only members of a specific group can see the real data.

# COMMAND ----------
# MAGIC %sql
# MAGIC -- Create a simulated user table with PII
# MAGIC CREATE OR REPLACE TABLE customer_profiles (
# MAGIC   customer_id INT,
# MAGIC   customer_name STRING,
# MAGIC   email STRING,
# MAGIC   region STRING
# MAGIC );
# MAGIC 
# MAGIC INSERT INTO customer_profiles VALUES 
# MAGIC (101, 'Alice Smith', 'alice@example.com', 'East'),
# MAGIC (102, 'Bob Jones', 'bob@example.com', 'West');

# COMMAND ----------
# MAGIC %sql
# MAGIC -- Create a masking function
# MAGIC CREATE OR REPLACE FUNCTION mask_email(email STRING)
# MAGIC RETURNS STRING
# MAGIC RETURN CASE 
# MAGIC   WHEN is_account_group_member('data_scientists') THEN email
# MAGIC   ELSE CONCAT(LEFT(email, 2), '***@***.com')
# MAGIC END;

# COMMAND ----------
# MAGIC %sql
# MAGIC -- Apply the mask (Note: requires Unity Catalog)
# MAGIC -- ALTER TABLE customer_profiles ALTER COLUMN email SET MASK mask_email;

# COMMAND ----------
# MAGIC %sql
# MAGIC SELECT * FROM customer_profiles;

# COMMAND ----------
# MAGIC %md
# MAGIC ## 2. Row-Level Security (RLS)
# MAGIC Restrict access to rows based on the user's group. For example, East region managers can only see East data.

# COMMAND ----------
# MAGIC %sql
# MAGIC -- Create a filter function
# MAGIC CREATE OR REPLACE FUNCTION region_filter(region STRING)
# MAGIC RETURNS BOOLEAN
# MAGIC RETURN CASE 
# MAGIC   WHEN is_account_group_member('admin') THEN TRUE
# MAGIC   WHEN is_account_group_member('east_region_managers') AND region = 'East' THEN TRUE
# MAGIC   WHEN is_account_group_member('west_region_managers') AND region = 'West' THEN TRUE
# MAGIC   ELSE FALSE
# MAGIC END;

# COMMAND ----------
# MAGIC %sql
# MAGIC -- Apply the row filter (Note: requires Unity Catalog)
# MAGIC -- ALTER TABLE customer_profiles SET ROW FILTER region_filter ON (region);
