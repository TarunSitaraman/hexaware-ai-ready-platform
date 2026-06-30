# Databricks notebook source
import dlt
from pyspark.sql.functions import col, concat_ws, lit

@dlt.table(
  name="gold_macro_features",
  comment="Aggregated macro features and text chunks for AI Search Embeddings.",
  table_properties={"quality": "gold"}
)
def gold_macro_features():
    df = dlt.read("silver_macro_data")
    
    # Create an engineered text chunk for the Vector Database (Hybrid Search)
    # This prepares the data for the embedding model
    gold_df = df.withColumn(
        "text_chunk",
        concat_ws(" ", 
            lit("In"), col("date"),
            lit("the US Real GDP was"), col("us_real_gdp"),
            lit("with an inflation rate of"), col("us_inflation_cpi"),
            lit("and an unemployment rate of"), col("us_unemployment_rate"),
            lit("while the Fed Funds Rate sat at"), col("us_fed_funds_rate")
        )
    )
    
    return gold_df
