import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { DBSQLClient } from '@databricks/sql';

dotenv.config();

const app = express();
app.use(cors());

// Initialize Databricks SQL Client
const client = new DBSQLClient();

async function getDatabricksConnection() {
  await client.connect({
    host: process.env.DATABRICKS_SERVER_HOSTNAME,
    path: process.env.DATABRICKS_HTTP_PATH,
    token: process.env.DATABRICKS_TOKEN
  });
  return await client.openSession();
}

app.get('/api/dashboard-data', async (req, res) => {
  let session;
  try {
    console.log("Connecting to Databricks SQL...");
    session = await getDatabricksConnection();
    const catalog = process.env.DATABRICKS_CATALOG || 'hive_metastore';
    const schema = 'hexaware_poc';

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

    const data = kpis[0];
    const grossMargin = ((data.grossRevenue - data.resourceCost) / data.grossRevenue) * 100;

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
      practiceMargins: practiceMargins
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
