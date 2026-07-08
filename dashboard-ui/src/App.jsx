import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Users, DollarSign, Briefcase, Activity } from 'lucide-react';

// Live API Call to Databricks SQL Warehouse via our Node Backend
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

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDatabricksSemanticLayer().then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '1rem' }}>
        <div className="dot" style={{ width: '20px', height: '20px', animation: 'pulse 1.5s infinite' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Querying Databricks Semantic Layer...</p>
      </div>
    );
  }

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="dashboard-container">
      <header className="header">
        <div>
          <h1>Hexaware Command Center</h1>
          <div className="header-subtitle">
            <span className="dot"></span>
            Connected to Databricks Unity Catalog (Live)
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'var(--bg-card)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
            Export Report
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid-cards">
        <div className="card">
          <div className="card-header">
            <span>Gross Revenue</span>
            <DollarSign size={20} color="#3b82f6" />
          </div>
          <div className="card-value">{formatCurrency(data.kpis.grossRevenue)}</div>
          <div className="card-trend trend-up">
            <ArrowUpRight size={16} /> <span>+8.4% vs last month</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span>Overall Gross Margin</span>
            <Activity size={20} color="#8b5cf6" />
          </div>
          <div className="card-value">{data.kpis.grossMargin.toFixed(1)}%</div>
          <div className="card-trend trend-up">
            <ArrowUpRight size={16} /> <span>+2.1% vs last month</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span>Total Billable Hours</span>
            <Briefcase size={20} color="#10b981" />
          </div>
          <div className="card-value">{data.kpis.billableHours.toLocaleString()}</div>
          <div className="card-trend trend-up">
            <ArrowUpRight size={16} /> <span>+4.2% vs last month</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span>Bench / Training Hours</span>
            <Users size={20} color="#f59e0b" />
          </div>
          <div className="card-value">{data.kpis.benchHours.toLocaleString()}</div>
          <div className="card-trend trend-down">
            <ArrowDownRight size={16} /> <span>-12.5% vs last month</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title">Revenue vs Cost Trend (YTD)</div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.revenueTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" name="Gross Revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="cost" name="Resource Cost" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-title">Margin by Practice Area</div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.practiceMargins} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" tickFormatter={(val) => `${val}%`} />
                <YAxis dataKey="practice" type="category" stroke="#94a3b8" />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                />
                <Bar dataKey="margin" name="Gross Margin %" radius={[0, 4, 4, 0]}>
                  {data.practiceMargins.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
