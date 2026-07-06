# Hexaware AI-Ready Platform
This repository contains a complete end-to-end AI-Ready Data implementation using Azure Databricks. It demonstrates the journey of raw data through the Medallion Architecture (Bronze, Silver, Gold), governed by Unity Catalog, and culminating in Machine Learning and BI Reporting.

## Architecture Overview
The project follows Microsoft's AI-ready data architecture:
1. **Infrastructure as Code**: Automated provisioning of Azure and Databricks resources using Terraform.
2. **Data Sources**: Simulated CSV files representing retail sales.
3. **Ingestion**: Loading data into Databricks.
4. **Bronze Layer**: Raw Delta tables, append-only, preserving history.
5. **Silver Layer**: Cleaned, filtered, and deduplicated Delta tables with MERGE upserts.
6. **Gold Layer**: Business-level aggregations and KPIs ready for consumption.
7. **Data Quality**: Assertions and validation checks.
8. **Feature Engineering**: Creating ML features and storing them for model training.
9. **Machine Learning**: Training a predictive model (Random Forest) and tracking with MLflow.
10. **Reporting**: SQL queries to power dashboards.
11. **CI/CD Pipeline**: GitHub Actions deploy Databricks Asset Bundles and Terraform.

## Project Structure
```text
hexaware-ai-ready-platform/
├── .github/workflows/          # CI/CD pipelines (Terraform & DABs)
├── databricks.yml              # Databricks Asset Bundle definition
├── infrastructure/terraform/   # Terraform IaC modules
├── data/                       # Sample datasets (synthetic retail sales)
├── notebooks/                  # Databricks Notebooks (Python)
├── docs/                       # Documentation, architecture diagrams, demo scripts
└── README.md
```

## Deployment & Setup

### 1. Infrastructure Deployment (Terraform)
Navigate to `infrastructure/terraform/` and apply the infrastructure. This creates the Resource Group, Azure Data Lake Storage Gen2, and Databricks Workspace.
```bash
cd infrastructure/terraform
terraform init
terraform apply
```

### 2. CI/CD and MLOps (Databricks Asset Bundles)
This project uses **Databricks Asset Bundles (DABs)** to define the Data Engineering pipeline as code.
You can deploy the pipeline using the Databricks CLI:
```bash
databricks bundle deploy -t dev
```
Alternatively, **GitHub Actions** are configured in `.github/workflows/deploy.yml` to automatically deploy the bundle upon merging to `main`.

### 3. Running the Pipeline
Once deployed, the `Medallion Data Pipeline` job will be available in your Databricks Workspace. It automatically orchestrates the execution of Notebooks 01 through 08 with all necessary task dependencies.

## Demo
Please refer to `docs/demo_script.md` for a complete 15-minute presentation guide, highlighting both the data engineering and infrastructural components of the platform.
