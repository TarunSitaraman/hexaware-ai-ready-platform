# Databricks notebook source
# MAGIC %md
# MAGIC # 11 - Advanced Governance (RLS & Masking)
# MAGIC Unity Catalog provides fine-grained governance. This notebook demonstrates Row-Level Security (RLS) and Dynamic Data Masking.

# COMMAND ----------
catalog_name = spark.sql("SELECT current_catalog()").collect()[0][0]
spark.sql(f"USE CATALOG {catalog_name}")
spark.sql("USE SCHEMA retail_demo")

# COMMAND ----------
# MAGIC %md
# MAGIC ## 1. Dynamic Data Masking
# MAGIC Mask sensitive columns (e.g., an email address or identifying ID) so that only members of a specific group can see the real data.

# COMMAND ----------
spark.sql("""
CREATE OR REPLACE TABLE customer_profiles (
  customer_id STRING,
  customer_name STRING,
  email STRING,
  region STRING
)
""")

spark.sql("""
INSERT INTO customer_profiles VALUES 
('CUST-101', 'Alice Smith', 'alice@example.com', 'Asia Pacific'),
('CUST-102', 'Bob Jones', 'bob@example.com', 'North America')
""")

# COMMAND ----------
spark.sql("""
CREATE OR REPLACE FUNCTION mask_email(email STRING)
RETURNS STRING
RETURN CASE 
  WHEN is_account_group_member('data_scientists') THEN email
  ELSE CONCAT(LEFT(email, 2), '***@***.com')
END
""")

# COMMAND ----------
# MAGIC %md
# MAGIC Apply the mask (Note: requires Unity Catalog)

# COMMAND ----------
# spark.sql("ALTER TABLE customer_profiles ALTER COLUMN email SET MASK mask_email")

# COMMAND ----------
display(spark.sql("SELECT * FROM customer_profiles"))

# COMMAND ----------
# MAGIC %md
# MAGIC ## 2. Row-Level Security (RLS)
# MAGIC Restrict access to rows based on the user's group. For example, Asia Pacific region managers can only see Asia Pacific data.

# COMMAND ----------
spark.sql("""
CREATE OR REPLACE FUNCTION region_filter(region STRING)
RETURNS BOOLEAN
RETURN CASE 
  WHEN is_account_group_member('admin') THEN TRUE
  WHEN is_account_group_member('apac_region_managers') AND region = 'Asia Pacific' THEN TRUE
  WHEN is_account_group_member('na_region_managers') AND region = 'North America' THEN TRUE
  ELSE FALSE
END
""")

# COMMAND ----------
# MAGIC %md
# MAGIC Apply the row filter (Note: requires Unity Catalog)

# COMMAND ----------
# spark.sql("ALTER TABLE customer_profiles SET ROW FILTER region_filter ON (region)")
