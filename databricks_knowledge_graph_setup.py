from pyspark.sql import SparkSession
from pyspark.sql.functions import col, lit, sum as _sum, concat, expr

# Initialize Spark Session
spark = SparkSession.builder.appName("HexaAI_Knowledge_Graph").getOrCreate()

# ==========================================
# CONFIGURATION - CHANGE CATALOG IF NEEDED
# ==========================================
CATALOG = "workspace" # Change this to your catalog name (e.g. default, sandbox, etc.)
SCHEMA = "hexaware_poc"

print(f"Building Knowledge Graph using Semantic Layer at {CATALOG}.{SCHEMA}...")

# 1. Read existing Semantic Layer tables
dim_consultant = spark.table(f"{CATALOG}.{SCHEMA}.dim_consultant")
dim_project = spark.table(f"{CATALOG}.{SCHEMA}.dim_project")
fact_timesheet = spark.table(f"{CATALOG}.{SCHEMA}.fact_timesheet")

# ==========================================
# 2. BUILD NODES (Entities)
# ==========================================
print("Generating Graph Nodes...")

# A. Consultant Nodes
consultant_nodes = dim_consultant.select(
    concat(lit("CONS_"), col("consultant_id")).alias("id"),
    col("consultant_name").alias("name"),
    lit("Consultant").alias("label"),
    concat(lit("Level: "), col("level"), lit(", Rate: $"), col("hourly_cost")).alias("properties")
)

# B. Project Nodes
project_nodes = dim_project.select(
    concat(lit("PROJ_"), col("project_id")).alias("id"),
    col("client_name").alias("name"), # Using client name as project identifier for simplicity
    lit("Project").alias("label"),
    concat(lit("Type: "), col("project_type")).alias("properties")
)

# C. Practice Area Nodes (Extracted uniquely from consultants)
practice_nodes = dim_consultant.select("practice_area").distinct().select(
    concat(lit("PRAC_"), col("practice_area")).alias("id"),
    col("practice_area").alias("name"),
    lit("Practice").alias("label"),
    lit("Business Unit").alias("properties")
)

# Combine all nodes into a single DataFrame
all_nodes = consultant_nodes.union(project_nodes).union(practice_nodes)


# ==========================================
# 3. BUILD EDGES (Relationships)
# ==========================================
print("Generating Graph Edges...")

# A. Edge: Consultant [WORKS_ON] Project
# We aggregate the timesheet to find how many hours a consultant worked on a project to use as edge 'weight'
works_on_edges = fact_timesheet.groupBy("consultant_id", "project_id").agg(_sum("hours_logged").alias("total_hours")).select(
    concat(lit("CONS_"), col("consultant_id")).alias("src"),
    concat(lit("PROJ_"), col("project_id")).alias("dst"),
    lit("WORKS_ON").alias("relationship"),
    col("total_hours").cast("string").alias("weight")
)

# B. Edge: Consultant [BELONGS_TO] Practice
belongs_to_edges = dim_consultant.select(
    concat(lit("CONS_"), col("consultant_id")).alias("src"),
    concat(lit("PRAC_"), col("practice_area")).alias("dst"),
    lit("BELONGS_TO").alias("relationship"),
    lit("1.0").alias("weight")
)

# Combine all edges
all_edges = works_on_edges.union(belongs_to_edges)


# ==========================================
# 4. SAVE GRAPH TO UNITY CATALOG
# ==========================================
print("Saving Nodes and Edges to Unity Catalog as Delta Tables...")

# Write Nodes Table
all_nodes.write \
    .format("delta") \
    .mode("overwrite") \
    .option("overwriteSchema", "true") \
    .saveAsTable(f"{CATALOG}.{SCHEMA}.kg_nodes")

# Write Edges Table
all_edges.write \
    .format("delta") \
    .mode("overwrite") \
    .option("overwriteSchema", "true") \
    .saveAsTable(f"{CATALOG}.{SCHEMA}.kg_edges")

print("==========================================")
print("✅ Knowledge Graph Successfully Generated!")
print(f"Nodes table: {CATALOG}.{SCHEMA}.kg_nodes")
print(f"Edges table: {CATALOG}.{SCHEMA}.kg_edges")
print("==========================================")

# Display a sample of the graph structure
print("\nSample Nodes:")
display(all_nodes.limit(5))

print("\nSample Edges:")
display(all_edges.limit(5))

# --- OPTIONAL: GRAPH ALGORITHM EXAMPLE (Requires GraphFrames) ---
# To run this in Databricks, install 'graphframes:graphframes:0.8.2-spark3.2-s_2.12' on your cluster
"""
from graphframes import GraphFrame
kg = GraphFrame(all_nodes, all_edges)

# Find top 5 most highly connected projects (In-Degree)
print("Most heavily staffed projects:")
display(kg.inDegrees.orderBy(col("inDegree").desc()).limit(5))

# Motif finding: Find Consultants who work on the same project
motifs = kg.find("(c1)-[e1]->(p); (c2)-[e2]->(p)") \
           .filter("c1.id != c2.id") \
           .filter("e1.relationship = 'WORKS_ON' AND e2.relationship = 'WORKS_ON'")
display(motifs.limit(5))
"""
