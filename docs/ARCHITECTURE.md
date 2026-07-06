# Architecture Diagram

```mermaid
graph TD
    A[Raw Data Sources<br/>(CSV/External)] -->|Ingestion| B[Azure Data Lake Gen2]
    
    subgraph Azure Databricks
        B -->|Auto Loader / Batch| C[(Bronze Layer<br/>Raw Delta)]
        C -->|Clean, Deduplicate, Merge| D[(Silver Layer<br/>Validated Delta)]
        D -->|Aggregate| E[(Gold Layer<br/>Business-Ready)]
        D -->|Data Quality Validation| D
        
        subgraph Unity Catalog
            C
            D
            E
            F[(Feature Store)]
        end
        
        D -->|Feature Engineering| F
        F -->|Train| G((Machine Learning<br/>MLflow))
        G -->|Predictions| H[Serving / Endpoints]
        E -->|SQL Queries| I[BI Dashboard<br/>Power BI / Databricks SQL]
    end
```

*This diagram illustrates the flow of data through the Medallion architecture within Azure Databricks, highlighting the roles of Unity Catalog for governance, MLflow for machine learning lifecycle management, and final outputs for BI and predictions.*
