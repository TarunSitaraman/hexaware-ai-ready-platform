# Hexaware AI-Ready Platform
This repository contains a complete end-to-end AI-Ready Data implementation using Azure Databricks. It demonstrates the journey of raw data through the Medallion Architecture (Bronze, Silver, Gold), governed by Unity Catalog, and culminating in Machine Learning and BI Reporting.

## Architecture Overview
The project follows Microsoft's AI-ready data architecture:
1. **Infrastructure as Code**: Automated provisioning of Azure and Databricks resources using Terraform.
2. **Delta Live Tables (DLT)**: Declarative, automated data pipelines replacing traditional ETL.
3. **Medallion Architecture**: Bronze (raw), Silver (validated), and Gold (aggregated) layers.
4. **Data Quality**: Integrated constraints via DLT expectations.
5. **Feature Engineering**: Creating ML features for model training.
6. **Machine Learning**: Training models (Random Forest) tracked with MLflow.
7. **Real-time Model Serving**: Deploying serverless endpoints for real-time REST API inference.
8. **Generative AI & RAG**: Integrating Databricks Foundation Models (Llama-3/DBRX) for a Text-to-SQL Retail Copilot.
9. **Advanced Governance**: Row-Level Security (RLS) and Dynamic Data Masking via Unity Catalog.
10. **CI/CD Pipeline**: GitHub Actions deploy Databricks Asset Bundles (DABs) and Terraform.

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
