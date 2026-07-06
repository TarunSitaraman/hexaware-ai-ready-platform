# Databricks notebook source
# MAGIC %md
# MAGIC # 05 - Data Quality Validation
# MAGIC Using Data Quality checks on our Delta tables. In a production pipeline, you might use Delta Live Tables (DLT) expectations, but here we demonstrate manual validation checks.

# COMMAND ----------
catalog_name = "hive_metastore" 
schema_name = "retail_demo"
silver_table = f"{catalog_name}.{schema_name}.silver_sales"
gold_table = f"{catalog_name}.{schema_name}.gold_daily_sales"

# COMMAND ----------
# MAGIC %md
# MAGIC ## 1. Simple Data Quality Checks

# COMMAND ----------
def check_data_quality(df, expectations):
    print("Running Data Quality Checks:")
    for rule_name, rule_expr in expectations.items():
        invalid_count = df.filter(f"NOT ({rule_expr})").count()
        if invalid_count > 0:
            print(f"❌ FAILED: {rule_name} - {invalid_count} records failed the rule '{rule_expr}'")
        else:
            print(f"✅ PASSED: {rule_name}")

# COMMAND ----------
silver_df = spark.table(silver_table)

expectations = {
    "price_is_positive": "price > 0",
    "quantity_is_positive": "quantity > 0",
    "discount_in_range": "discount >= 0 AND discount <= 1",
    "transaction_id_not_null": "transaction_id IS NOT NULL"
}

check_data_quality(silver_df, expectations)

# COMMAND ----------
# MAGIC %md
# MAGIC ## 2. Time Travel Demonstration
# MAGIC Delta Lake allows querying past versions of the data.

# COMMAND ----------
# MAGIC %sql
# MAGIC DESCRIBE HISTORY hive_metastore.retail_demo.silver_sales;

# COMMAND ----------
# You can query a previous version of the table like this:
# df_v0 = spark.read.format("delta").option("versionAsOf", 0).table(silver_table)
# display(df_v0)
