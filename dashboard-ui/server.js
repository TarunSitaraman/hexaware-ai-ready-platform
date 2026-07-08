import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { DBSQLClient } from '@databricks/sql';

dotenv.config();

const app = express();
app.use(cors());

// Initialize Databricks SQL Client
const client = new DBSQLClient();
let isConnected = false;

async function getDatabricksSession() {
  if (!isConnected) {
    console.log("Initializing Databricks connection...");
    await client.connect({
      host: process.env.DATABRICKS_SERVER_HOSTNAME,
      path: process.env.DATABRICKS_HTTP_PATH,
      token: process.env.DATABRICKS_TOKEN
    });
    isConnected = true;
  }
  return await client.openSession();
}

app.get('/api/dashboard-data', async (req, res) => {
  let session;
  try {
    console.log("Opening session to Databricks SQL...");
    session = await getDatabricksSession();
    const catalog = process.env.DATABRICKS_CATALOG || 'hive_metastore';
    const schema = 'hexaware_poc';
    
    // Explicitly set the catalog to avoid Hive Metastore disabled errors
    await session.executeStatement(`USE CATALOG ${catalog}`);
    await session.executeStatement(`USE SCHEMA ${schema}`);

    // Query 1: Top level KPIs calculated by the semantic layer tables
    const kpiQuery = `
      SELECT 
        CAST(SUM(CASE WHEN t.is_billable THEN t.hours_logged * p.hourly_bill_rate ELSE 0 END) AS DOUBLE) as grossRevenue,
        CAST(SUM(t.hours_logged * c.hourly_cost) AS DOUBLE) as resourceCost,
        CAST(SUM(CASE WHEN t.is_billable THEN t.hours_logged ELSE 0 END) AS DOUBLE) as billableHours,
        CAST(SUM(CASE WHEN NOT t.is_billable THEN t.hours_logged ELSE 0 END) AS DOUBLE) as benchHours
      FROM ${catalog}.${schema}.fact_timesheet t
      JOIN ${catalog}.${schema}.dim_consultant c ON t.consultant_id = c.consultant_id
      JOIN ${catalog}.${schema}.dim_project p ON t.project_id = p.project_id
    `;
    const kpiResult = await session.executeStatement(kpiQuery);
    const kpis = await kpiResult.fetchAll();

    // Query 2: Margin by Practice Area
    const practiceQuery = `
      SELECT 
        c.practice_area as practice,
        CAST((SUM(CASE WHEN t.is_billable THEN t.hours_logged * p.hourly_bill_rate ELSE 0 END) - 
         SUM(t.hours_logged * c.hourly_cost)) / 
         SUM(CASE WHEN t.is_billable THEN t.hours_logged * p.hourly_bill_rate ELSE 0 END) * 100 AS DOUBLE) as margin
      FROM ${catalog}.${schema}.fact_timesheet t
      JOIN ${catalog}.${schema}.dim_consultant c ON t.consultant_id = c.consultant_id
      JOIN ${catalog}.${schema}.dim_project p ON t.project_id = p.project_id
      GROUP BY c.practice_area
      ORDER BY margin DESC
    `;
    const practiceResult = await session.executeStatement(practiceQuery);
    const practiceMargins = await practiceResult.fetchAll();

    // Query 3: Top Projects for the Data Grid
    const projectsQuery = `
      SELECT 
        p.client_name,
        p.project_type,
        CAST(SUM(CASE WHEN t.is_billable THEN t.hours_logged * p.hourly_bill_rate ELSE 0 END) AS DOUBLE) as projectRevenue,
        CAST(SUM(t.hours_logged * c.hourly_cost) AS DOUBLE) as projectCost,
        CAST(SUM(t.hours_logged) AS DOUBLE) as totalHours
      FROM ${catalog}.${schema}.fact_timesheet t
      JOIN ${catalog}.${schema}.dim_consultant c ON t.consultant_id = c.consultant_id
      JOIN ${catalog}.${schema}.dim_project p ON t.project_id = p.project_id
      GROUP BY p.client_name, p.project_type
      ORDER BY projectRevenue DESC
      LIMIT 10
    `;
    const projectsResult = await session.executeStatement(projectsQuery);
    const topProjects = await projectsResult.fetchAll();

    const data = kpis[0];
    const grossMargin = ((data.grossRevenue - data.resourceCost) / data.grossRevenue) * 100;

    // Query 4: Consultant Utilization (NEW)
    const consultantsQuery = `
      SELECT 
        c.full_name as consultant_name,
        c.practice_area,
        c.role_level as level,
        CAST(SUM(CASE WHEN t.is_billable THEN t.hours_logged ELSE 0 END) AS DOUBLE) as billable_hours,
        CAST(SUM(CASE WHEN NOT t.is_billable THEN t.hours_logged ELSE 0 END) AS DOUBLE) as bench_hours
      FROM ${catalog}.${schema}.fact_timesheet t
      JOIN ${catalog}.${schema}.dim_consultant c ON t.consultant_id = c.consultant_id
      GROUP BY c.full_name, c.practice_area, c.role_level
      ORDER BY billable_hours DESC
      LIMIT 25
    `;
    const consultantsResult = await session.executeStatement(consultantsQuery);
    const consultantsRaw = await consultantsResult.fetchAll();
    
    const consultantsData = consultantsRaw.map(row => ({
      name: row.consultant_name,
      practice: row.practice_area,
      level: row.level,
      billable: Number(row.billable_hours) || 0,
      bench: Number(row.bench_hours) || 0
    }));

    // Query 5: Knowledge Graph Data (NEW)
    let graphData = { nodes: [], links: [] };
    try {
      const graphNodesQuery = `SELECT id, name, label, properties FROM ${catalog}.${schema}.kg_nodes`;
      const graphNodesResult = await session.executeStatement(graphNodesQuery);
      const graphNodesRaw = await graphNodesResult.fetchAll();
  
      const graphEdgesQuery = `SELECT src as source, dst as target, relationship as label, weight FROM ${catalog}.${schema}.kg_edges`;
      const graphEdgesResult = await session.executeStatement(graphEdgesQuery);
      const graphEdgesRaw = await graphEdgesResult.fetchAll();
      
      graphData = {
        nodes: graphNodesRaw.map(n => ({ id: n.id, name: n.name, group: n.label, properties: n.properties })),
        links: graphEdgesRaw.map(e => ({ source: e.source, target: e.target, label: e.label, weight: e.weight }))
      };
    } catch (e) {
      console.log("Graph tables might not exist yet, skipping graph data.", e.message);
    }

    res.json({
      kpis: {
        grossRevenue: data.grossRevenue,
        resourceCost: data.resourceCost,
        grossMargin: grossMargin || 0,
        billableHours: data.billableHours,
        benchHours: data.benchHours
      },
      // Using static historic trend for the line chart to complement live live data
      revenueTrend: [
        { month: 'May', revenue: 510000, cost: 285000 },
        { month: 'Jun', revenue: 510000, cost: 280000 },
        { month: 'Jul (Live)', revenue: data.grossRevenue, cost: data.resourceCost }
      ],
      practiceMargins: practiceMargins,
      topProjects: topProjects,
      consultantsData: consultantsData,
      graphData: graphData
    });
  } catch (error) {
    console.error("Databricks Error:", error);
    res.status(500).json({ error: error.message });
  } finally {
    if (session) await session.close();
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}. Connected to Databricks.`));
