# Databricks Notebook source
# MAGIC %md
# MAGIC # Unity Catalog Semantic Layer & Tagging
# MAGIC This notebook programmatically applies AI-ready semantic metadata to the Gold layer.
# MAGIC By attaching tags and descriptive comments to tables and columns, we provide the LLM (Copilot)
# MAGIC with the necessary business context to answer questions accurately.

# COMMAND ----------

# 1. Define Catalog and Schema
catalog = "hive_metastore"
schema = "retail_demo"
gold_table = f"{catalog}.{schema}.gold_daily_sales"

# COMMAND ----------

# MAGIC %md
# MAGIC ### Apply Table-Level Descriptions and Tags

# COMMAND ----------

spark.sql(f"""
ALTER TABLE {gold_table} 
SET TBLPROPERTIES (
  'comment' = 'Aggregated daily sales data by product category and region. This is the primary table for business intelligence and financial reporting.',
  'tag.domain' = 'sales',
  'tag.sensitivity' = 'internal'
)
""")

# COMMAND ----------

# MAGIC %md
# MAGIC ### Apply Column-Level Descriptions and Tags
# MAGIC This is crucial for Text-to-SQL GenAI. The LLM needs to know exactly what each column means.

# COMMAND ----------

# Define column semantics
column_semantics = {
    "date": ("The date of the sales transaction.", ["temporal", "dimension"]),
    "product_category": ("The high-level category of the product sold (e.g., Electronics, Clothing).", ["dimension"]),
    "region": ("The geographic region where the sale occurred.", ["dimension", "geography"]),
    "total_revenue": ("The sum of sales amount in USD, post-tax and post-discounts. Use this for all revenue reporting.", ["metric", "financial"]),
    "transaction_count": ("The total number of unique transactions on that day.", ["metric"])
}

# Apply to Unity Catalog
for col, (comment, tags) in column_semantics.items():
    # Set Comment
    spark.sql(f"ALTER TABLE {gold_table} CHANGE COLUMN {col} COMMENT '{comment}'")
    
    # Set Tags (Databricks syntax for column tags)
    for tag in tags:
        try:
            spark.sql(f"ALTER TABLE {gold_table} ALTER COLUMN {col} SET TAGS ('{tag}' = 'true')")
        except Exception as e:
            print(f"Note: Column tagging requires Unity Catalog enabled. {e}")

print("✅ Semantic Layer applied to Gold Tables.")
