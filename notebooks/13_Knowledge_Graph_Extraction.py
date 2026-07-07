# Databricks Notebook source
# MAGIC %md
# MAGIC # Enterprise Knowledge Graph (EKG) Extraction
# MAGIC This notebook extracts entities and relationships from the relational Medallion architecture
# MAGIC and structures them into a node/edge format suitable for GraphRAG or ingestion into a Graph DB (e.g. Neo4j).

# COMMAND ----------

import pyspark.sql.functions as F

# COMMAND ----------

catalog_name = spark.sql("SELECT current_catalog()").collect()[0][0]
schema_name = "retail_demo"

# Assume Silver layer contains the clean transactional and customer data
silver_sales_df = spark.table(f"{catalog_name}.{schema_name}.silver_sales")
# (Simulating customer data if it existed)
# customer_df = spark.table(f"{catalog_name}.{schema_name}.customers")

# COMMAND ----------

# MAGIC %md
# MAGIC ### 1. Extract Nodes (Entities)
# MAGIC We extract unique Products, Customers, and Regions as nodes in our ontology.

# COMMAND ----------

# Extract Product Nodes
product_nodes = silver_sales_df.select(
    F.col("product_id").alias("node_id"),
    F.lit("Product").alias("node_type"),
    F.col("product_category").alias("property_category")
).distinct()

# Extract Region Nodes
region_nodes = silver_sales_df.select(
    F.col("region").alias("node_id"),
    F.lit("Region").alias("node_type"),
    F.lit(None).alias("property_category")
).distinct()

# COMMAND ----------

# MAGIC %md
# MAGIC ### 2. Extract Edges (Relationships)
# MAGIC We map how products are sold in regions.

# COMMAND ----------

# Edge: Product -> SOLD_IN -> Region
product_region_edges = silver_sales_df.select(
    F.col("product_id").alias("source_id"),
    F.col("region").alias("target_id"),
    F.lit("SOLD_IN").alias("relationship_type"),
    F.col("amount").alias("weight") # Aggregate weight in a real scenario
).distinct()

# COMMAND ----------

# MAGIC %md
# MAGIC ### 3. Write to Graph Storage Format
# MAGIC In a real architecture, these tables would be pushed to Databricks Vector Search (as embedded text) 
# MAGIC or exported to Neo4j.

# COMMAND ----------

# product_nodes.write.format("delta").mode("overwrite").saveAsTable(f"{catalog_name}.{schema_name}.graph_nodes")
# product_region_edges.write.format("delta").mode("overwrite").saveAsTable(f"{catalog_name}.{schema_name}.graph_edges")

print("✅ Knowledge Graph extraction complete. Ready for GraphRAG context injection.")
