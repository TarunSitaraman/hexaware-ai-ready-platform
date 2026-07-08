import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend 
} from 'recharts';
import { 
  ArrowUpRight, ArrowDownRight, Users, DollarSign, Briefcase, Activity, 
  LayoutDashboard, PieChart, Calendar, Settings, Download, Search, Hexagon 
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

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDatabricksSemanticLayer().then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Querying Databricks Unity Catalog...</p>
      </div>
    );
  }

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  
  const getMarginBadge = (margin) => {
    if (margin > 30) return <span className="badge success">Healthy</span>;
    if (margin > 15) return <span className="badge warning">Moderate</span>;
    return <span className="badge danger">At Risk</span>;
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Hexagon size={28} color="#8b5cf6" />
          <span className="brand">HexaAI</span>
        </div>
        
        <nav className="nav-menu">
          <div className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </div>
          <div className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            <PieChart size={20} />
            <span>Analytics</span>
          </div>
          <div className={`nav-item ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>
            <Briefcase size={20} />
            <span>Projects</span>
          </div>
          <div className={`nav-item ${activeTab === 'planning' ? 'active' : ''}`} onClick={() => setActiveTab('planning')}>
            <Calendar size={20} />
            <span>Capacity Planning</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <Settings size={20} color="var(--text-muted)" />
          <span style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Settings</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="header">
          <div className="header-title">
            <h1>Command Center</h1>
            <div className="live-indicator">
              <span className="dot"></span>
              Live: Databricks Serverless
            </div>
          </div>
          <div className="header-actions">
            <button style={{background: 'transparent', border: 'none'}}><Search size={20}/></button>
            <button><Download size={18} /> Export PDF</button>
          </div>
        </header>

        {/* KPI Cards */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-header">
              <span>Gross Revenue</span>
              <div className="kpi-icon"><DollarSign size={20} color="#6366f1" /></div>
            </div>
            <div className="kpi-value">{formatCurrency(data.kpis.grossRevenue)}</div>
            <div className="kpi-trend trend-up">
              <ArrowUpRight size={16} /> <span>+8.4% vs last month</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span>Overall Gross Margin</span>
              <div className="kpi-icon"><Activity size={20} color="#8b5cf6" /></div>
            </div>
            <div className="kpi-value">{data.kpis.grossMargin.toFixed(1)}%</div>
            <div className="kpi-trend trend-up">
              <ArrowUpRight size={16} /> <span>+2.1% vs last month</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span>Total Billable Hours</span>
              <div className="kpi-icon"><Briefcase size={20} color="#10b981" /></div>
            </div>
            <div className="kpi-value">{data.kpis.billableHours.toLocaleString()}</div>
            <div className="kpi-trend trend-up">
              <ArrowUpRight size={16} /> <span>+4.2% vs last month</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span>Bench / Training Hours</span>
              <div className="kpi-icon"><Users size={20} color="#f59e0b" /></div>
            </div>
            <div className="kpi-value">{data.kpis.benchHours.toLocaleString()}</div>
            <div className="kpi-trend trend-down">
              <ArrowDownRight size={16} /> <span>-12.5% vs last month</span>
            </div>
          </div>
        </div>

        {/* Charts & Tables Section */}
        <div className="dashboard-layout">
          {/* Main Chart */}
          <div className="card">
            <div className="card-title">Revenue vs Cost Trend (YTD)</div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" stroke="#a1a1aa" tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#a1a1aa" tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} dx={-10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(24,24,27,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ color: '#fff', fontWeight: 500 }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Area type="monotone" dataKey="revenue" name="Gross Revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="cost" name="Resource Cost" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Secondary Chart */}
          <div className="card">
            <div className="card-title">Margin by Practice</div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.practiceMargins} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
                  <XAxis type="number" domain={[0, 100]} stroke="#a1a1aa" tickFormatter={(val) => `${val}%`} tickLine={false} axisLine={false} />
                  <YAxis dataKey="practice" type="category" stroke="#a1a1aa" tickLine={false} axisLine={false} width={100} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.02)'}}
                    contentStyle={{ backgroundColor: 'rgba(24,24,27,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                  <Bar dataKey="margin" name="Gross Margin %" radius={[0, 4, 4, 0]} barSize={24}>
                    {data.practiceMargins.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Data Grid Section */}
        <div className="card" style={{ padding: '0' }}>
          <div className="card-title" style={{ padding: '1.5rem 1.5rem 0 1.5rem' }}>Top Projects Overview</div>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>CLIENT NAME</th>
                  <th>ENGAGEMENT TYPE</th>
                  <th>REVENUE</th>
                  <th>COST</th>
                  <th>TOTAL HOURS</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {data.topProjects && data.topProjects.map((proj, idx) => {
                  const projMargin = ((proj.projectRevenue - proj.projectCost) / proj.projectRevenue) * 100;
                  return (
                    <tr key={idx}>
                      <td style={{fontWeight: 500}}>{proj.client_name}</td>
                      <td><span className="badge neutral">{proj.project_type}</span></td>
                      <td style={{color: 'var(--text-main)'}}>{formatCurrency(proj.projectRevenue)}</td>
                      <td style={{color: 'var(--text-muted)'}}>{formatCurrency(proj.projectCost)}</td>
                      <td>{proj.totalHours.toLocaleString()} hrs</td>
                      <td>{getMarginBadge(projMargin)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
