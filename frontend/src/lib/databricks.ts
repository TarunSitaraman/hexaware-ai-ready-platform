/**
 * Databricks REST API Client Simulator / Wrapper
 * 
 * In a real deployment, this would use process.env.DATABRICKS_HOST and DATABRICKS_TOKEN
 * to make fetch() calls to the actual Databricks workspace.
 */

import { DBSQLClient } from '@databricks/sql';

const DBX_HOST = process.env.DATABRICKS_HOST;
const DBX_TOKEN = process.env.DATABRICKS_TOKEN;
const DBX_SQL_PATH = process.env.DATABRICKS_SQL_HTTP_PATH;

/**
 * Helper function to execute SQL queries on Databricks Serverless
 */
export async function executeSQL(query: string) {
  if (DBX_HOST && DBX_TOKEN && DBX_SQL_PATH) {
    const client = new DBSQLClient();
    try {
      await client.connect({
        host: DBX_HOST,
        path: DBX_SQL_PATH,
        token: DBX_TOKEN
      });
      const session = await client.openSession();
      const queryOperation = await session.executeStatement(query, { runAsync: true });
      const result = await queryOperation.fetchAll();
      await session.close();
      return result;
    } catch (error) {
      console.error("Databricks SQL Error:", error);
      throw error;
    } finally {
      await client.close();
    }
  }
  return null; // Fallback handled by individual API routes
}

export async function queryDatabricksModelServing(prompt: string) {
  if (DBX_HOST && DBX_TOKEN) {
    // Actual API Call to Databricks Model Serving
    const response = await fetch(`${DBX_HOST}/serving-endpoints/databricks-dbrx-instruct/invocations`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DBX_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await response.json();
    return data.choices[0].message.content;
  }

  // Simulated Fallback for Local Dev without Tokens
  await new Promise(resolve => setTimeout(resolve, 1500)); // simulate network delay
  
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes("revenue") && lowerPrompt.includes("electronics")) {
    return "🧠 **Semantic Traversal Complete:**\n`[Node: Category (Electronics)]` ➔ `[Edge: MEASURES]` ➔ `[Node: Metric (Total Revenue)]`\n\nGraph Neural Network embeddings have successfully grounded the query in the business ontology.\n\n**Result:** The total Electronics Revenue is **$4.2M** across all tracked regions.\n\n```sql\n-- Executed via Semantic Layer mapping\nSELECT SUM(total_revenue) as electronics_revenue \nFROM hive_metastore.retail_demo.gold_daily_sales \nWHERE product_category = 'Electronics';\n```";
  }
  
  if (lowerPrompt.includes("schema") || lowerPrompt.includes("tables")) {
    return "I do not just read schemas; I traverse the Enterprise Knowledge Graph. Here are the active semantic domains:\n- **Transactional Domain**: Raw telemetry and `bronze_sales`\n- **Entity Domain**: Cleaned `silver_sales` representing discrete events\n- **Business Domain**: The `gold_daily_sales` ontology mapping Categories to Regions\n- **Predictive Domain**: `customer_features` used by our GNN models for LTV scoring.";
  }

  return "I am the Retail Copilot, powered by a Graph Neural Network (GNN) connected to your Enterprise Knowledge Graph. I understand semantic relationships, not just SQL tables. Ask me about product revenue, regional influence, or customer connections!";
}

export async function getDLTPipelineStatus() {
  if (DBX_HOST && DBX_TOKEN) {
    // Actual API call to list DLT pipelines
    const response = await fetch(`${DBX_HOST}/api/2.0/pipelines`, {
      headers: {
        "Authorization": `Bearer ${DBX_TOKEN}`
      }
    });
    return await response.json();
  }

  // Simulated DAG Data
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    pipeline_name: "Retail DLT Pipeline",
    state: "RUNNING",
    nodes: [
      { id: "ingestion", label: "Auto Loader (ADLS)", status: "COMPLETED", type: "source" },
      { id: "bronze_sales", label: "Bronze Sales", status: "COMPLETED", type: "table" },
      { id: "silver_sales", label: "Silver Sales", status: "COMPLETED", type: "table", metrics: "0 dropped" },
      { id: "gold_daily_sales", label: "Gold Daily Sales", status: "RUNNING", type: "table", metrics: "Processing 500 rows/s" },
      { id: "customer_features", label: "Customer Features", status: "WAITING", type: "table" }
    ],
    edges: [
      { from: "ingestion", to: "bronze_sales" },
      { from: "bronze_sales", to: "silver_sales" },
      { from: "silver_sales", to: "gold_daily_sales" },
      { from: "silver_sales", to: "customer_features" }
    ]
  };
}

export async function getOntologyGraph() {
  // Simulates fetching Graph nodes from Databricks Vector Search / Unity Catalog tags
  await new Promise(resolve => setTimeout(resolve, 600));
  
  return {
    nodes: [
      { id: "gold_daily_sales", label: "Gold Daily Sales", type: "table", tags: ["Domain: Sales", "Sensitivity: Internal"] },
      { id: "product_category", label: "Category", type: "dimension", tags: ["Dimension"] },
      { id: "region", label: "Region", type: "dimension", tags: ["Geography"] },
      { id: "total_revenue", label: "Total Revenue", type: "metric", tags: ["Financial"] },
      { id: "customer_features", label: "Customer Profile", type: "table", tags: ["Domain: ML"] }
    ],
    edges: [
      { source: "gold_daily_sales", target: "product_category", label: "CONTAINS" },
      { source: "gold_daily_sales", target: "region", label: "CONTAINS" },
      { source: "gold_daily_sales", target: "total_revenue", label: "MEASURES" },
      { source: "region", target: "customer_features", label: "INFLUENCES" }
    ]
  };
}
