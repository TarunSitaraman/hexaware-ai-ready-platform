# Hexaware AI-Ready Platform
This repository contains a complete end-to-end AI-Ready Data implementation using Azure Databricks. It demonstrates the journey of raw data through the Medallion Architecture (Bronze, Silver, Gold), governed by Unity Catalog, and culminating in Machine Learning and BI Reporting.

## Architecture Overview
The project follows Microsoft's AI-ready data architecture:
1. **Data Sources**: Simulated CSV files representing retail sales.
2. **Ingestion**: Loading data into Databricks.
3. **Bronze Layer**: Raw Delta tables, append-only, preserving history.
4. **Silver Layer**: Cleaned, filtered, and deduplicated Delta tables with MERGE upserts.
5. **Gold Layer**: Business-level aggregations and KPIs ready for consumption.
6. **Data Quality**: Assertions and validation checks.
7. **Feature Engineering**: Creating ML features and storing them for model training.
8. **Machine Learning**: Training a predictive model (Random Forest) and tracking with MLflow.
9. **Reporting**: SQL queries to power dashboards.

## Project Structure
```
hexaware-ai-ready-platform/
├── data/                       # Sample datasets (synthetic retail sales)
│   └── sample_retail_sales.csv
├── notebooks/                  # Databricks Notebooks (Python)
│   ├── 01_Data_Ingestion.py
│   ├── 02_Bronze_Layer.py
│   ├── 03_Silver_Layer.py
│   ├── 04_Gold_Layer.py
│   ├── 05_Data_Quality_Validation.py
│   ├── 06_Feature_Engineering.py
│   ├── 07_Machine_Learning.py
│   └── 08_Reporting.py
├── docs/                       # Documentation, architecture diagrams, demo scripts
│   ├── architecture.md
│   ├── demo_script.md
│   └── speaker_notes.md
└── README.md
```

## Setup Instructions

### Prerequisites
1. An Azure Databricks workspace.
2. Unity Catalog enabled (recommended, though `hive_metastore` is used as a fallback).

### Steps
1. **Clone the Repository**:
   Import this repository into Databricks Repos.
2. **Upload Data**:
   Upload `data/sample_retail_sales.csv` to DBFS or a Unity Catalog Volume. Update the `raw_file_path` in `01_Data_Ingestion.py` accordingly.
3. **Run Notebooks**:
   Run the notebooks sequentially from `01` to `08`. Each notebook relies on the tables created in the previous steps.
4. **Explore the Data**:
   Navigate to the Data Explorer (Catalog) in Databricks to view the schemas and tables created under `hive_metastore.retail_demo`.

## Demo
Please refer to `docs/demo_script.md` for a complete 15-minute presentation guide.
