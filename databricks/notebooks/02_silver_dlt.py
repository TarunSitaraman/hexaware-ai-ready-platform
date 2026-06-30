# Databricks notebook source
import dlt
from pyspark.sql.functions import col, to_date

# Define data quality expectations for the Silver layer
rules = {
    "valid_date": "date IS NOT NULL",
    "valid_gdp": "us_real_gdp IS NULL OR us_real_gdp > 0"
}

@dlt.table(
  name="silver_macro_data",
  comment="Cleaned and typed macroeconomic data. Drops invalid dates.",
  table_properties={"quality": "silver"}
)
@dlt.expect_all_or_drop(rules)
def silver_macro_data():
    # Read from the Bronze table stream
    df = dlt.read_stream("bronze_macro_data")
    
    # Cast types and deduplicate
    clean_df = (df
        .withColumn("date", to_date(col("date"), "yyyy-MM-dd"))
        .dropDuplicates(["date"])
    )
    
    return clean_df
