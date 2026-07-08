import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  LayoutDashboard, PieChart, Users, DollarSign, Activity, 
  Search, Download, Settings, ChevronRight, X, Clock, Briefcase, Database
} from 'lucide-react';

const fetchDatabricksSemanticLayer = async () => {
  try {
    const res = await fetch('http://localhost:3001/api/dashboard-data');
    if (!res.ok) throw new Error("Failed to fetch from backend");
    return await res.json();
  } catch (err) {
    console.error("Failed to connect to backend:", err);
    alert("Make sure you started the Node backend server (node server.js) and configured your .env file!");
    return null;
  }
};

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Interaction States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchDatabricksSemanticLayer().then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  // Filter projects based on search
  const filteredProjects = useMemo(() => {
    if (!data?.topProjects) return [];
    return data.topProjects.filter(p => 
      p.client_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.project_type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Connecting to Databricks Unity Catalog...</p>
      </div>
    );
  }

  if (!data || !data.kpis) {
    return (
      <div className="loading-screen" style={{ textAlign: 'center' }}>
        <h2 style={{ color: 'var(--semantic-danger)', marginBottom: '1rem' }}>Connection Error</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
          The backend failed to return the data. Please check your backend terminal for SQL errors. 
          Make sure you have updated DATABRICKS_CATALOG in your .env file and restarted the node server.
        </p>
      </div>
    );
  }

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  
  const getMarginBadge = (margin) => {
    if (margin > 30) return <span className="badge badge-success">Healthy</span>;
    if (margin > 15) return <span className="badge badge-warning">Moderate</span>;
    return <span className="badge badge-danger">At Risk</span>;
  };

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Database size={20} color="var(--brand-primary)" />
          <span>HexaAI Analytics</span>
        </div>
        
        <nav className="nav-menu">
          <div className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <LayoutDashboard size={18} /> Overview
          </div>
          <div className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            <PieChart size={18} /> Analytics
          </div>
          <div className={`nav-item ${activeTab === 'consultants' ? 'active' : ''}`} onClick={() => setActiveTab('consultants')}>
            <Users size={18} /> Consultants
          </div>
          <div className={`nav-item ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>
            <Briefcase size={18} /> Projects Database
          </div>
        </nav>
      </aside>

      {/* Main Area */}
      <main className="main-area">
        {/* Top bar */}
        <header className="topbar">
          <div className="breadcrumbs">
            Dashboards / Enterprise Resource Utilization
          </div>
          <div className="topbar-actions">
            <div className="status-badge">
              <span className="dot"></span>
              Live: DBSQL Serverless
            </div>
            <button className="btn"><Settings size={16}/> Settings</button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="content-scroll">
          <div className="controls-header">
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Overview</h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Real-time metrics aggregated via Databricks Semantic Layer.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn"><Clock size={16}/> Last 30 Days</button>
              <button className="btn btn-primary"><Download size={16}/> Export Report</button>
            </div>
          </div>

          {/* KPIs */}
          <div className="kpi-row">
            <div className="kpi-card">
              <div className="kpi-title">Gross Revenue</div>
              <div className="kpi-value">{formatCurrency(data.kpis.grossRevenue)}</div>
              <div className="kpi-meta trend-up">+8.4% YoY</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Overall Gross Margin</div>
              <div className="kpi-value">{data.kpis.grossMargin.toFixed(1)}%</div>
              <div className="kpi-meta trend-up">+2.1% YoY</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Total Billable Hours</div>
              <div className="kpi-value">{data.kpis.billableHours.toLocaleString()}</div>
              <div className="kpi-meta trend-up">+4.2% MoM</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Bench Hours</div>
              <div className="kpi-value">{data.kpis.benchHours.toLocaleString()}</div>
              <div className="kpi-meta trend-down">-12.5% MoM</div>
            </div>
          </div>

          <div className="dashboard-grid">
            {/* Area Chart Panel */}
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">Revenue & Cost Efficiency</span>
              </div>
              <div className="panel-content" style={{ height: '300px', padding: '1rem 0' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.revenueTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default)" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)'}} tickFormatter={(val) => `$${val/1000}k`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-md)' }}
                    />
                    <Area type="monotone" dataKey="revenue" name="Gross Revenue" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                    <Area type="monotone" dataKey="cost" name="Resource Cost" stroke="#94a3b8" strokeDasharray="5 5" fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart Panel */}
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">Margin by Practice</span>
              </div>
              <div className="panel-content" style={{ height: '300px', padding: '1rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.practiceMargins} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border-default)" />
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="practice" type="category" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12}} width={110} />
                    <Tooltip cursor={{fill: 'var(--bg-surface-hover)'}} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-default)' }} />
                    <Bar dataKey="margin" name="Margin %" radius={[0, 4, 4, 0]} barSize={16}>
                      {data.practiceMargins.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Interactive Data Grid */}
          <div className="panel">
            <div className="panel-header" style={{ padding: '0' }}>
              <div className="table-controls">
                <div className="search-input">
                  <Search size={16} color="var(--text-tertiary)" />
                  <input 
                    type="text" 
                    placeholder="Filter projects by client or type..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <table className="interactive-table">
              <thead>
                <tr>
                  <th>Client Engagement</th>
                  <th>Type</th>
                  <th>Revenue</th>
                  <th>Cost</th>
                  <th>Total Hours</th>
                  <th>Margin Health</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((proj, idx) => {
                  const projMargin = ((proj.projectRevenue - proj.projectCost) / proj.projectRevenue) * 100;
                  return (
                    <tr 
                      key={idx} 
                      className={selectedProject?.client_name === proj.client_name ? 'selected' : ''}
                      onClick={() => setSelectedProject({...proj, margin: projMargin})}
                    >
                      <td style={{fontWeight: 500}}>{proj.client_name}</td>
                      <td><span className="badge badge-neutral">{proj.project_type}</span></td>
                      <td>{formatCurrency(proj.projectRevenue)}</td>
                      <td style={{color: 'var(--text-secondary)'}}>{formatCurrency(proj.projectCost)}</td>
                      <td>{proj.totalHours.toLocaleString()}</td>
                      <td>{getMarginBadge(projMargin)}</td>
                      <td style={{textAlign: 'right'}}><ChevronRight size={16} color="var(--text-tertiary)"/></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Drawer Overlay */}
      <div className={`drawer-overlay ${selectedProject ? 'open' : ''}`} onClick={() => setSelectedProject(null)}></div>
      
      {/* Sliding Drawer */}
      <div className={`drawer ${selectedProject ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2>Project Details</h2>
          <div className="drawer-close" onClick={() => setSelectedProject(null)}><X size={20}/></div>
        </div>
        
        {selectedProject && (
          <div className="drawer-content">
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{selectedProject.client_name}</h3>
              <span className="badge badge-neutral">{selectedProject.project_type}</span>
            </div>

            <div className="detail-group">
              <div className="detail-label">Project Revenue</div>
              <div className="detail-value" style={{ fontSize: '1.5rem' }}>{formatCurrency(selectedProject.projectRevenue)}</div>
            </div>

            <div className="detail-group">
              <div className="detail-label">Resource Cost</div>
              <div className="detail-value" style={{ color: 'var(--text-secondary)' }}>{formatCurrency(selectedProject.projectCost)}</div>
            </div>

            <div className="detail-group">
              <div className="detail-label">Margin Health ({selectedProject.margin.toFixed(1)}%)</div>
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill" 
                  style={{ 
                    width: `${Math.max(0, Math.min(100, selectedProject.margin))}%`,
                    background: selectedProject.margin > 30 ? 'var(--semantic-success)' : selectedProject.margin > 15 ? 'var(--semantic-warning)' : 'var(--semantic-danger)'
                  }}
                ></div>
              </div>
            </div>

            <div className="detail-group" style={{ marginTop: '2rem' }}>
              <div className="detail-label">Total Hours Billed</div>
              <div className="detail-value">{selectedProject.totalHours.toLocaleString()} hrs</div>
            </div>
            
            <div style={{ marginTop: '3rem' }}>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>View Full Timesheet Audit</button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default App;
