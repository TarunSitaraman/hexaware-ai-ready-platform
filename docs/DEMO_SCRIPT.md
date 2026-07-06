# Demo Script: Hexaware AI-Ready Platform (15 Minutes)

**0:00 - 2:00: Introduction & Architecture Overview**
- Introduce the goal: Moving from raw, ungoverned data to an AI-ready state using the Medallion Architecture on Databricks.
- Show the architecture diagram (`docs/architecture.md`). Explain Bronze, Silver, Gold, Unity Catalog, and MLflow.
- Emphasize that all of this happens in one unified platform.

**2:00 - 4:00: Ingestion and Bronze Layer (Raw Data)**
- Open `01_Data_Ingestion.py`. Show how we read standard CSV data into a DataFrame. Mention that in production, this could be a continuous Auto Loader stream from ADLS.
- Open `02_Bronze_Layer.py`. Show the writing of the Bronze Delta table.
- Emphasize *Schema Evolution* (`mergeSchema="true"`) and the benefits of Delta format over raw CSV.

**4:00 - 7:00: Silver Layer and Data Quality**
- Open `03_Silver_Layer.py`.
- Show the data cleaning steps: removing duplicates, casting types, handling nulls.
- Highlight the `MERGE` operation. Explain that this is how we efficiently apply upserts (inserts and updates) without rewriting the whole table.
- Open `05_Data_Quality_Validation.py`. Show how we enforce data expectations. Mention Delta Live Tables as the native Databricks extension for this.
- Briefly demonstrate Time Travel (e.g., `DESCRIBE HISTORY`).

**7:00 - 9:00: Gold Layer (Business Analytics)**
- Open `04_Gold_Layer.py`.
- Explain how Silver data is aggregated for BI reporting.
- Show the creation of `gold_daily_sales`.

**9:00 - 12:00: Feature Engineering & Machine Learning**
- The platform isn't just for BI; it's AI-ready.
- Open `06_Feature_Engineering.py`. Show how we create customer-level features (LTV, frequency) from the Silver data. Mention Unity Catalog Feature Store.
- Open `07_Machine_Learning.py`. 
- Run the ML code. Show how MLflow automatically logs the Random Forest model, metrics (RMSE), and parameters without writing complex tracking code.
- Show the predictions DataFrame.

**12:00 - 14:00: Reporting and BI**
- Open `08_Reporting.py`.
- Run the SQL queries. Mention that these exact queries can power a Power BI dashboard via Databricks SQL endpoints, leveraging the Photon engine for fast BI.

**14:00 - 15:00: Q&A and Conclusion**
- Summarize the value: unified governance (Unity Catalog), unified processing (Delta), unified analytics and AI (MLflow, Databricks SQL).
- Ask for questions.
