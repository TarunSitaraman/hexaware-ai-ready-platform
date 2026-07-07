/**
 * Databricks REST API Client Simulator / Wrapper
 * 
 * In a real deployment, this would use process.env.DATABRICKS_HOST and DATABRICKS_TOKEN
 * to make fetch() calls to the actual Databricks workspace.
 */

const DBX_HOST = process.env.DATABRICKS_HOST;
const DBX_TOKEN = process.env.DATABRICKS_TOKEN;

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
    return "Based on the Gold table `hive_metastore.retail_demo.gold_daily_sales`, here is the SQL query to find the total revenue for Electronics:\n\n```sql\nSELECT SUM(total_revenue) as electronics_revenue \nFROM hive_metastore.retail_demo.gold_daily_sales \nWHERE product_category = 'Electronics';\n```\n\nIf you execute this query, you will see the total accumulated revenue across all days.";
  }
  
  if (lowerPrompt.includes("schema") || lowerPrompt.includes("tables")) {
    return "The Medallion architecture contains the following tables:\n- **Bronze**: `bronze_sales` (raw transaction data)\n- **Silver**: `silver_sales` (cleaned, deduplicated)\n- **Gold**: `gold_daily_sales` (aggregated KPIs)\n- **Feature Store**: `customer_features` (LTV and frequency metrics)";
  }

  return "I am the Retail Copilot connected to the Databricks Foundation Model endpoint. I can help you query the Medallion architecture. Try asking me about total revenue or table schemas!";
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
