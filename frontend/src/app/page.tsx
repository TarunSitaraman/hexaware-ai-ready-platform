import { Activity, Database, Cpu } from "lucide-react";

export default function Home() {
  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Databricks Platform Overview</h1>
        <p className="page-subtitle">Real-time telemetry and control center for your AI-Ready data lakehouse.</p>
      </header>

      <div className="dashboard-grid stagger-1 animate-fade-in">
        <div className="glass-panel stat-card">
          <div className="stat-header">
            <Database size={18} color="#6366f1" />
            Bronze / Silver / Gold
          </div>
          <div className="stat-value">3.2 TB</div>
          <div className="status-badge">Healthy</div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-header">
            <Activity size={18} color="#10b981" />
            Active DLT Pipelines
          </div>
          <div className="stat-value">4</div>
          <div className="status-badge running">Running (0 Lag)</div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-header">
            <Cpu size={18} color="#8b5cf6" />
            Model Endpoints
          </div>
          <div className="stat-value">2</div>
          <div className="status-badge">Online</div>
        </div>
      </div>

      <div className="dashboard-grid stagger-2 animate-fade-in">
        <div className="glass-panel" style={{ gridColumn: "span 2" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "18px", fontWeight: 600 }}>Active Pipelines</h3>
          
          <div className="pipeline-list">
            <div className="pipeline-item">
              <div className="pipeline-info">
                <h4>Retail Ingestion (Auto Loader)</h4>
                <p>Streaming from ADLS Gen2 to Bronze</p>
              </div>
              <span className="status-badge running">Processing</span>
            </div>
            
            <div className="pipeline-item">
              <div className="pipeline-info">
                <h4>Medallion Transformation (DLT)</h4>
                <p>Silver cleansing & Gold aggregations</p>
              </div>
              <span className="status-badge">Complete</span>
            </div>

            <div className="pipeline-item">
              <div className="pipeline-info">
                <h4>Feature Store Generation</h4>
                <p>Calculating Customer LTV and Frequency</p>
              </div>
              <span className="status-badge">Complete</span>
            </div>
          </div>
        </div>

        <div className="glass-panel">
          <h3 style={{ marginBottom: "20px", fontSize: "18px", fontWeight: 600 }}>Model Serving Status</h3>
          
          <div className="pipeline-list">
            <div className="pipeline-item">
              <div className="pipeline-info">
                <h4>Customer Spend Predictor</h4>
                <p>Random Forest - v1.2</p>
              </div>
              <span className="status-badge">Ready</span>
            </div>
            
            <div className="pipeline-item">
              <div className="pipeline-info">
                <h4>Retail Copilot (Llama-3)</h4>
                <p>Text-to-SQL RAG Chain</p>
              </div>
              <span className="status-badge running">Warm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
