# Databricks notebook source
# MAGIC %md
# MAGIC # 03 - Silver Layer (Cleaned & Validated Delta)
# MAGIC The Silver layer represents filtered, cleaned, and augmented data. We handle nulls, deduplicate records, and cast data types.

# COMMAND ----------
from pyspark.sql.functions import col, when, to_date

catalog_name = spark.sql("SELECT current_catalog()").collect()[0][0] 
schema_name = "retail_demo"
bronze_table = f"{catalog_name}.{schema_name}.bronze_sales"
silver_table = f"{catalog_name}.{schema_name}.silver_sales"

# COMMAND ----------
# MAGIC %md
# MAGIC ## 1. Read Bronze Data

# COMMAND ----------
bronze_df = spark.table(bronze_table)

# COMMAND ----------
# MAGIC %md
# MAGIC ## 2. Clean and Transform
# MAGIC - Deduplicate by transaction_id
# MAGIC - Handle null discounts (set to 0.0)
# MAGIC - Cast transaction_date to a proper Date type
# MAGIC - Filter out invalid records (e.g., negative prices or quantities)

# COMMAND ----------
silver_df = (bronze_df
             .dropDuplicates(["transaction_id"])
             .withColumn("discount", when(col("discount").isNull(), 0.0).otherwise(col("discount")))
             .withColumn("transaction_date", to_date(col("transaction_date")))
             .filter((col("price") > 0) & (col("quantity") > 0))
            )

# COMMAND ----------
# MAGIC %md
# MAGIC ## 3. Upsert using MERGE (Simulated)
# MAGIC Use Delta Lake MERGE to apply upserts (updates/inserts).

# COMMAND ----------
from delta.tables import DeltaTable

# If the Silver table doesn't exist, create it
if not spark.catalog.tableExists(silver_table):
    silver_df.write.format("delta").mode("overwrite").saveAsTable(silver_table)
    print(f"Created {silver_table}")
else:
    # Perform MERGE for incremental loads
    silver_delta_table = DeltaTable.forName(spark, silver_table)
    
    (silver_delta_table.alias("target")
      .merge(
        silver_df.alias("source"),
        "target.transaction_id = source.transaction_id"
      )
      .whenMatchedUpdateAll()
      .whenNotMatchedInsertAll()
      .execute()
    )
    print(f"Merged data into {silver_table}")

# COMMAND ----------
# MAGIC %md
# MAGIC ## 4. Schema Evolution Example
# MAGIC Demonstrating adding a new column dynamically.

# COMMAND ----------
# MAGIC %sql
# MAGIC -- We can alter the table to add new columns if needed, or rely on mergeSchema
# MAGIC -- ALTER TABLE hive_metastore.retail_demo.silver_sales ADD COLUMN total_amount DOUBLE;

# COMMAND ----------
display(spark.table(silver_table).limit(10))
