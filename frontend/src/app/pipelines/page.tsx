"use client";

import { useEffect, useState } from "react";
import styles from "./pipelines.module.css";
import { Database, Play, CheckCircle, Clock } from "lucide-react";

interface Node {
  id: string;
  label: string;
  status: string;
  type: string;
  metrics?: string;
}

interface PipelineStatus {
  pipeline_name: string;
  state: string;
  nodes: Node[];
}

export default function PipelinesPage() {
  const [status, setStatus] = useState<PipelineStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/pipelines");
        const data = await res.json();
        setStatus(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle size={16} color="var(--success)" />;
      case 'RUNNING': return <Play size={16} color="var(--accent-primary)" />;
      case 'WAITING': return <Clock size={16} color="var(--text-secondary)" />;
      default: return null;
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Delta Live Tables</h1>
        <p className="page-subtitle">Declarative Data Engineering Graph connected to Databricks</p>
      </header>

      {loading && !status ? (
        <div className="glass-panel"><p>Loading pipeline topology from Databricks API...</p></div>
      ) : status ? (
        <div className={`glass-panel ${styles.pipelineContainer}`}>
          <div className={styles.pipelineHeader}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 600 }}>{status.pipeline_name}</h3>
              <p className="page-subtitle">Medallion Architecture Flow</p>
            </div>
            <div className="status-badge running" style={{ fontSize: '14px', padding: '6px 16px' }}>State: {status.state}</div>
          </div>

          <div className={styles.dagContainer}>
            {/* Ingestion Layer */}
            <div className={styles.layer}>
              <div style={{ color: "var(--text-secondary)", fontSize: "12px", textAlign: "center", textTransform: "uppercase" }}>Ingestion</div>
              {status.nodes.filter(n => n.id === 'ingestion').map(node => (
                <div key={node.id} className={`${styles.node} ${node.status === 'COMPLETED' ? styles.completed : ''}`}>
                  {getStatusIcon(node.status)}
                  <div className={styles.nodeTitle}>{node.label}</div>
                  {node.metrics && <div className={styles.nodeMetrics}>{node.metrics}</div>}
                </div>
              ))}
            </div>

            {/* Bronze Layer */}
            <div className={styles.layer}>
              <div style={{ color: "var(--text-secondary)", fontSize: "12px", textAlign: "center", textTransform: "uppercase" }}>Bronze Layer</div>
              {status.nodes.filter(n => n.id === 'bronze_sales').map(node => (
                <div key={node.id} className={`${styles.node} ${node.status === 'COMPLETED' ? styles.completed : ''}`}>
                  <Database size={16} color="#cd7f32" />
                  <div className={styles.nodeTitle}>{node.label}</div>
                  {getStatusIcon(node.status)}
                </div>
              ))}
            </div>

            {/* Silver Layer */}
            <div className={styles.layer}>
              <div style={{ color: "var(--text-secondary)", fontSize: "12px", textAlign: "center", textTransform: "uppercase" }}>Silver Layer</div>
              {status.nodes.filter(n => n.id === 'silver_sales').map(node => (
                <div key={node.id} className={`${styles.node} ${node.status === 'COMPLETED' ? styles.completed : ''}`}>
                  <Database size={16} color="#c0c0c0" />
                  <div className={styles.nodeTitle}>{node.label}</div>
                  {node.metrics && <div className={styles.nodeMetrics}>{node.metrics}</div>}
                  {getStatusIcon(node.status)}
                </div>
              ))}
            </div>

            {/* Gold / Feature Layers */}
            <div className={styles.layer}>
              <div style={{ color: "var(--text-secondary)", fontSize: "12px", textAlign: "center", textTransform: "uppercase" }}>Gold & Feature Layers</div>
              {status.nodes.filter(n => ['gold_daily_sales', 'customer_features'].includes(n.id)).map(node => (
                <div key={node.id} className={`${styles.node} ${node.status === 'RUNNING' ? styles.running : ''}`}>
                  <Database size={16} color="#ffd700" />
                  <div className={styles.nodeTitle}>{node.label}</div>
                  {node.metrics && <div className={styles.nodeMetrics}>{node.metrics}</div>}
                  {getStatusIcon(node.status)}
                </div>
              ))}
            </div>

          </div>
        </div>
      ) : null}
    </div>
  );
}
