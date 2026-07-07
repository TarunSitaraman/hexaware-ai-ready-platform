# Databricks notebook source
# MAGIC %md
# MAGIC # 07 - Machine Learning
# MAGIC Train a model to predict high-value customers using scikit-learn.
# MAGIC Note: Serverless/Shared compute environments restrict Spark ML (Py4J). Using standard Python ML frameworks like scikit-learn is recommended.

# COMMAND ----------
import mlflow
import mlflow.sklearn
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
import numpy as np

catalog_name = spark.sql("SELECT current_catalog()").collect()[0][0] 
schema_name = "retail_demo"
feature_table = f"{catalog_name}.{schema_name}.customer_features"

# COMMAND ----------
# MAGIC %md
# MAGIC ## 1. Load Feature Data to Pandas

# COMMAND ----------
# Load from Unity Catalog and convert to Pandas for scikit-learn
features_df = spark.table(feature_table).dropna().toPandas()

# For this demo, let's predict total_spend based on purchase_count and days_since_last_purchase
X = features_df[["purchase_count", "days_since_last_purchase"]]
y = features_df["total_spend"]

# COMMAND ----------
# MAGIC %md
# MAGIC ## 2. Prepare Train/Test Split

# COMMAND ----------
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# COMMAND ----------
# MAGIC %md
# MAGIC ## 3. Train Model and Log with MLflow

# COMMAND ----------
# Enable autologging for scikit-learn
mlflow.sklearn.autolog()

with mlflow.start_run(run_name="CustomerSpendPredictor") as run:
    # Train the Random Forest Model
    rf = RandomForestRegressor(n_estimators=10, random_state=42)
    rf.fit(X_train, y_train)
    
    # Make predictions
    predictions = rf.predict(X_test)
    
    # Evaluate
    rmse = np.sqrt(mean_squared_error(y_test, predictions))
    print(f"Root Mean Squared Error (RMSE) on test data = {rmse:.2f}")
    
    # MLflow automatically logs the model, parameters, and metrics
    model_uri = f"runs:/{run.info.run_id}/model"
    print(f"Model logged to MLflow with URI: {model_uri}")

# COMMAND ----------
# MAGIC %md
# MAGIC ## 4. View Predictions

# COMMAND ----------
# Attach predictions back to the test dataset to view them side-by-side
results_df = X_test.copy()
results_df["actual_spend"] = y_test
results_df["predicted_spend"] = predictions

display(results_df)
