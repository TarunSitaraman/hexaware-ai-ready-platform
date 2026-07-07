import dlt
from pyspark.sql.functions import col, when, to_date, sum, count, round, expr

# DLT Pipeline for Medallion Architecture

@dlt.table(
    name="bronze_sales",
    comment="Raw ingested retail sales data."
)
def bronze_sales():
    # In a real DLT pipeline, you would use spark.readStream.format("cloudFiles") for Auto Loader
    # Here we simulate reading the raw data
    return (spark.read.format("csv")
        .option("header", "true")
        .option("inferSchema", "true")
        .load("file:/workspace/data/sample_retail_sales.csv"))

@dlt.table(
    name="silver_sales",
    comment="Cleaned and validated retail sales data."
)
@dlt.expect_or_drop("valid_price", "price > 0")
@dlt.expect_or_drop("valid_quantity", "quantity > 0")
def silver_sales():
    df = dlt.read("bronze_sales")
    return (df.dropDuplicates(["transaction_id"])
             .withColumn("discount", when(col("discount").isNull(), 0.0).otherwise(col("discount")))
             .withColumn("transaction_date", to_date(col("transaction_date"))))

@dlt.table(
    name="gold_daily_sales",
    comment="Business-ready daily sales aggregations."
)
def gold_daily_sales():
    df = dlt.read("silver_sales")
    gold_df = df.withColumn("total_sales_amount", expr("(price * quantity) * (1 - discount)"))
    
    return (gold_df.groupBy("transaction_date", "product_category")
      .agg(
          sum("total_sales_amount").alias("total_revenue"),
          sum("quantity").alias("total_items_sold"),
          count("transaction_id").alias("transaction_count")
      )
      .withColumn("total_revenue", round("total_revenue", 2)))
