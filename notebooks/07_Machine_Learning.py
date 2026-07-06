# Databricks notebook source
# MAGIC %md
# MAGIC # 07 - Machine Learning
# MAGIC Train a model to predict high-value customers using Spark ML or scikit-learn.

# COMMAND ----------
import mlflow
import mlflow.spark
from pyspark.ml.feature import VectorAssembler
from pyspark.ml.regression import RandomForestRegressor
from pyspark.ml.evaluation import RegressionEvaluator
from pyspark.sql.functions import col, when

catalog_name = "hive_metastore" 
schema_name = "retail_demo"
feature_table = f"{catalog_name}.{schema_name}.customer_features"

# COMMAND ----------
# MAGIC %md
# MAGIC ## 1. Load Feature Data

# COMMAND ----------
features_df = spark.table(feature_table).dropna()
# For this demo, let's predict total_spend based on purchase_count and days_since_last_purchase
# (In a real scenario, you'd predict a future value, but we use this for the mechanics)

# COMMAND ----------
# MAGIC %md
# MAGIC ## 2. Prepare Data for Spark ML

# COMMAND ----------
assembler = VectorAssembler(
    inputCols=["purchase_count", "days_since_last_purchase"],
    outputCol="features"
)
ml_data = assembler.transform(features_df)

train_data, test_data = ml_data.randomSplit([0.8, 0.2], seed=42)

# COMMAND ----------
# MAGIC %md
# MAGIC ## 3. Train Model and Log with MLflow

# COMMAND ----------
# Enable autologging
mlflow.pyspark.ml.autolog()

with mlflow.start_run(run_name="CustomerSpendPredictor") as run:
    rf = RandomForestRegressor(featuresCol="features", labelCol="total_spend", numTrees=10)
    model = rf.fit(train_data)
    
    predictions = model.transform(test_data)
    
    evaluator = RegressionEvaluator(labelCol="total_spend", predictionCol="prediction", metricName="rmse")
    rmse = evaluator.evaluate(predictions)
    
    print(f"Root Mean Squared Error (RMSE) on test data = {rmse}")
    
    # MLflow automatically logs the model, parameters, and metrics
    model_uri = f"runs:/{run.info.run_id}/model"
    print(f"Model logged to MLflow with URI: {model_uri}")

# COMMAND ----------
# MAGIC %md
# MAGIC ## 4. View Predictions

# COMMAND ----------
display(predictions.select("customer_id", "total_spend", "prediction"))
