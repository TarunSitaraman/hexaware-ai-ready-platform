"use client";

import { useEffect, useState } from "react";
import styles from "./ontology.module.css";
import { Network, Database, Hash, MapPin, Tag } from "lucide-react";

interface GraphNode {
  id: string;
  label: string;
  type: string;
  tags: string[];
}

interface GraphEdge {
  source: string;
  target: string;
  label: string;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export default function OntologyPage() {
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ontology")
      .then(res => res.json())
      .then(data => {
        setGraph(data);
        setLoading(false);
      });
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'table': return <Database size={16} />;
      case 'metric': return <Hash size={16} />;
      case 'dimension': return <MapPin size={16} />;
      default: return <Tag size={16} />;
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Semantic Ontology</h1>
        <p className="page-subtitle">Enterprise Knowledge Graph & Databricks Unity Catalog Tags</p>
      </header>

      {loading ? (
        <div className="glass-panel"><p>Extracting semantic graph from Unity Catalog...</p></div>
      ) : graph ? (
        <div className={`glass-panel ${styles.ontologyContainer}`}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Semantic Data Model</h3>
            <p className="page-subtitle" style={{ fontSize: '14px', marginTop: '4px' }}>
              Provides deterministic business context to the Retail Copilot via Databricks Genie and Vector Search.
            </p>
          </div>

          <div className={styles.graphArea}>
            <svg className={styles.svgLines}>
              {/* Hardcoded SVG lines for visual effect connecting the absolute positioned nodes */}
              <line x1="50%" y1="50%" x2="30%" y2="20%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="5,5" />
              <line x1="50%" y1="50%" x2="70%" y2="20%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
              <line x1="50%" y1="50%" x2="50%" y2="80%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
              <line x1="70%" y1="20%" x2="85%" y2="50%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="5,5" />
            </svg>

            <div className={styles.edge_label} style={{ top: '35%', left: '40%', transform: 'translate(-50%, -50%)' }}>CONTAINS</div>
            <div className={styles.edge_label} style={{ top: '35%', left: '60%', transform: 'translate(-50%, -50%)' }}>CONTAINS</div>
            <div className={styles.edge_label} style={{ top: '65%', left: '50%', transform: 'translate(-50%, -50%)' }}>MEASURES</div>
            <div className={styles.edge_label} style={{ top: '35%', left: '77%', transform: 'translate(-50%, -50%)' }}>INFLUENCES</div>

            {graph.nodes.map(node => (
              <div 
                key={node.id} 
                // @ts-ignore
                className={`${styles.node} ${styles[node.type]} ${styles['pos_' + node.id]}`}
              >
                {getIcon(node.type)}
                <div className={styles.nodeTitle}>{node.label}</div>
                <div className={styles.nodeType}>{node.type}</div>
                <div className={styles.tags}>
                  {node.tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
