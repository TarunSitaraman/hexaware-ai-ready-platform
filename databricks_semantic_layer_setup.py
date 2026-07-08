# Databricks notebook source
# MAGIC %md
# MAGIC # Hexaware Resource Utilization - Semantic Layer Data Generator
# MAGIC This notebook creates the foundational Delta tables for the Semantic Layer POC and populates them with realistic mock data.

# COMMAND ----------

import random
from datetime import datetime, timedelta
import pandas as pd

# Define catalog and schema
# NOTE TO USER: Change 'main' to your catalog name if different
catalog_name = "main"
schema_name = "hexaware_poc"

spark.sql(f"CREATE SCHEMA IF NOT EXISTS {catalog_name}.{schema_name}")
spark.sql(f"USE {catalog_name}.{schema_name}")

# COMMAND ----------
# MAGIC %md
# MAGIC ### 1. Define Table Schemas & Constraints (The Semantic Metadata)
# MAGIC We declare Primary and Foreign keys here. Unity Catalog doesn't strictly enforce these during inserts, but the AI Semantic Engine relies on them heavily to understand joins.

# COMMAND ----------

# Create Consultants Dimension
spark.sql(f"""
CREATE OR REPLACE TABLE dim_consultant (
  consultant_id INT NOT NULL,
  full_name STRING,
  role_level STRING COMMENT 'e.g., L1-Associate, L3-Senior Consultant, L5-Architect',
  practice_area STRING COMMENT 'e.g., Data & AI, Cloud Migration, ServiceNow',
  hourly_cost DECIMAL(10,2) COMMENT 'Internal cost to Hexaware per hour of this employee',
  CONSTRAINT consultant_pk PRIMARY KEY (consultant_id)
) COMMENT 'Dimension table storing all Hexaware staff.'
""")

# Create Projects Dimension
spark.sql(f"""
CREATE OR REPLACE TABLE dim_project (
  project_id INT NOT NULL,
  client_name STRING,
  project_type STRING COMMENT 'Time & Materials (T&M) or Fixed Price',
  hourly_bill_rate DECIMAL(10,2) COMMENT 'The rate charged to the client per hour',
  CONSTRAINT project_pk PRIMARY KEY (project_id)
) COMMENT 'Dimension table storing active client engagements.'
""")

# Create Timesheets Fact
spark.sql(f"""
CREATE OR REPLACE TABLE fact_timesheet (
  timesheet_id INT NOT NULL,
  consultant_id INT,
  project_id INT,
  work_date DATE,
  hours_logged DECIMAL(5,2),
  is_billable BOOLEAN COMMENT 'True if these hours are billed to the client, False if internal/bench',
  CONSTRAINT timesheet_pk PRIMARY KEY (timesheet_id),
  CONSTRAINT timesheet_consultant_fk FOREIGN KEY (consultant_id) REFERENCES dim_consultant(consultant_id),
  CONSTRAINT timesheet_project_fk FOREIGN KEY (project_id) REFERENCES dim_project(project_id)
) COMMENT 'Fact table recording daily hours logged.'
""")

# COMMAND ----------
# MAGIC %md
# MAGIC ### 2. Generate Realistic Mock Data

# COMMAND ----------

# 1. Generate Consultants
roles = [("L1-Associate", 25.00), ("L2-Consultant", 40.00), ("L3-Senior Consultant", 60.00), ("L4-Manager", 90.00), ("L5-Architect", 120.00)]
practices = ["Data & AI", "Cloud Migration", "ServiceNow", "Quality Assurance", "Digital Engineering"]

consultants = []
for i in range(1, 101): # 100 consultants
    role = random.choice(roles)
    consultants.append({
        "consultant_id": i,
        "full_name": f"Consultant_{i}",
        "role_level": role[0],
        "practice_area": random.choice(practices),
        "hourly_cost": role[1]
    })

df_consultants = spark.createDataFrame(pd.DataFrame(consultants))
df_consultants.write.mode("append").saveAsTable("dim_consultant")

# 2. Generate Projects
clients = ["FinTech Corp", "Global Health", "Retail Giant", "AutoMakers Inc", "GovTech", "EduGlobal"]
projects = []
for i in range(1, 21): # 20 active projects
    projects.append({
        "project_id": i,
        "client_name": random.choice(clients),
        "project_type": random.choices(["Time & Materials", "Fixed Price"], weights=[0.8, 0.2])[0],
        "hourly_bill_rate": float(random.uniform(80.00, 250.00))
    })

df_projects = spark.createDataFrame(pd.DataFrame(projects))
df_projects.write.mode("append").saveAsTable("dim_project")

# 3. Generate Timesheets (last 60 days)
start_date = datetime.now() - timedelta(days=60)
timesheets = []
ts_id = 1

for c in consultants:
    # Assign consultant to 1 or 2 projects
    assigned_projects = random.sample(projects, k=random.randint(1, 2))
    
    for day_offset in range(60):
        current_date = start_date + timedelta(days=day_offset)
        # Skip weekends mostly
        if current_date.weekday() >= 5 and random.random() > 0.1:
            continue
            
        # 85% chance they worked
        if random.random() < 0.85:
            proj = random.choice(assigned_projects)
            # 90% chance billable if on project
            is_bill = True if random.random() < 0.9 else False
            
            timesheets.append({
                "timesheet_id": ts_id,
                "consultant_id": c["consultant_id"],
                "project_id": proj["project_id"] if is_bill else random.choice(projects)["project_id"],
                "work_date": current_date.date(),
                "hours_logged": float(random.choice([4.0, 8.0, 8.0, 8.0, 9.0])),
                "is_billable": is_bill
            })
            ts_id += 1

df_timesheets = spark.createDataFrame(pd.DataFrame(timesheets))
df_timesheets.write.mode("append").saveAsTable("fact_timesheet")

print(f"Data generation complete! Inserted {len(consultants)} consultants, {len(projects)} projects, and {len(timesheets)} timesheet records.")
