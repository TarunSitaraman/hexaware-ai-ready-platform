# Hexaware AI-Ready Platform
This repository contains a complete end-to-end AI-Ready Data implementation using Azure Databricks. It demonstrates the journey of raw data through the Medallion Architecture (Bronze, Silver, Gold), governed by Unity Catalog, culminating in Machine Learning, and presented through a modern React frontend.

## Architecture Overview
The project focuses exclusively on Databricks architecture and its presentation layer:
1. **Delta Live Tables (DLT)**: Declarative, automated data pipelines replacing traditional ETL.
2. **Medallion Architecture**: Bronze (raw), Silver (validated), and Gold (aggregated) layers.
3. **Data Quality**: Integrated constraints via DLT expectations.
4. **Feature Engineering**: Creating ML features for model training.
5. **Machine Learning**: Training models (Random Forest) tracked with MLflow.
6. **Real-time Model Serving**: Deploying serverless endpoints for real-time REST API inference.
7. **Generative AI & RAG**: Integrating Databricks Foundation Models (Llama-3/DBRX) for a Text-to-SQL Retail Copilot.
8. **Advanced Governance**: Row-Level Security (RLS) and Dynamic Data Masking via Unity Catalog.
9. **Control Center UI**: A Next.js web application providing a premium glassmorphic dashboard to monitor pipelines and endpoints.

## Project Structure
```text
hexaware-ai-ready-platform/
├── frontend/                   # Next.js Web Application UI
│   └── src/app/                # React components and vanilla CSS styles
├── data/                       # Sample datasets (synthetic retail sales)
├── notebooks/                  # Databricks Notebooks (Python)
├── dlt_pipelines/              # Delta Live Tables definitions
├── docs/                       # Documentation, architecture diagrams, demo scripts
└── README.md
```

## Deployment & Setup

### 1. Databricks Backend
1. **Clone the Repository**: Import this repository into Databricks Repos.
2. **Upload Data**: Upload `data/sample_retail_sales.csv` to DBFS or a Unity Catalog Volume.
3. **Run Notebooks**: Run the notebooks sequentially to build the Medallion architecture, train the model, and deploy the AI endpoints.
4. **DLT**: Alternatively, configure a Delta Live Tables pipeline in the Databricks UI pointing to `dlt_pipelines/medallion_dlt.py`.

### 2. Frontend Web UI (Next.js)
The frontend provides a real-time visualization dashboard of the Databricks architecture.
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:3000` to view the control center.

## Demo
Please refer to `docs/demo_script.md` for a presentation guide highlighting the core Databricks AI features and the interactive UI.
