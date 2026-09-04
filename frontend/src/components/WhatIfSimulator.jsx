import React, { useState } from 'react';
import { Sliders, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, Zap, Sparkles } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export default function WhatIfSimulator({ metrics }) {
  const totals = metrics?.totals || { total_revenue: 1000, total_expense: 300, net_profit: 700, profit_margin: 70 };
  
  const [priceChange, setPriceChange] = useState(0); // -30 to +30 %
  const [volumeChange, setVolumeChange] = useState(0); // -30 to +30 %
  const [costChange, setCostChange] = useState(0); // -20 to +20 %

  const origRev = totals.total_revenue || 0;
  const origExp = totals.total_expense || 0;
  const origProfit = totals.net_profit || (origRev - origExp);

  // Simulation calculations
  const simRev = Math.max(0, origRev * (1 + priceChange / 100) * (1 + volumeChange / 100));
  const simExp = Math.max(0, origExp * (1 + costChange / 100) * (1 + volumeChange * 0.5 / 100));
  const simProfit = simRev - simExp;
  const simMargin = simRev > 0 ? ((simProfit / simRev) * 100).toFixed(1) : 0;

  const revDiff = simRev - origRev;
  const profitDiff = simProfit - origProfit;

  const comparisonData = [
    { category: 'Total Revenue', Current: origRev, Simulated: parseFloat(simRev.toFixed(2)) },
    { category: 'Total Expense', Current: origExp, Simulated: parseFloat(simExp.toFixed(2)) },
    { category: 'Net Profit', Current: origProfit, Simulated: parseFloat(simProfit.toFixed(2)) }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Title */}
      <div className="card-box" style={{ margin: 0, background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.6rem', borderRadius: '12px' }}>
            <Zap size={26} color="#ffffff" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>AI "What-If" Business Scenario Simulator</h3>
            <p style={{ fontSize: '0.88rem', opacity: 0.9, margin: 0 }}>
              Adjust price, customer volume, and expense sliders below to simulate business decisions before making them in real life!
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Left Column: Interactive Sliders */}
        <div className="card-box" style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={18} color="#2563eb" />
            Adjust Scenario Sliders
          </h4>

          {/* Slider 1: Price Change */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              <span>🏷️ Product Price Change</span>
              <span style={{ color: priceChange >= 0 ? '#059669' : '#e11d48' }}>
                {priceChange >= 0 ? `+${priceChange}%` : `${priceChange}%`}
              </span>
            </div>
            <input
              type="range"
              min="-30"
              max="30"
              step="1"
              value={priceChange}
              onChange={(e) => setPriceChange(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#2563eb' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
              <span>-30% Discount</span>
              <span>Baseline (0%)</span>
              <span>+30% Increase</span>
            </div>
          </div>

          {/* Slider 2: Sales Volume Change */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              <span>📦 Customer Volume / Traffic</span>
              <span style={{ color: volumeChange >= 0 ? '#059669' : '#e11d48' }}>
                {volumeChange >= 0 ? `+${volumeChange}%` : `${volumeChange}%`}
              </span>
            </div>
            <input
              type="range"
              min="-30"
              max="30"
              step="1"
              value={volumeChange}
              onChange={(e) => setVolumeChange(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#059669' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
              <span>-30% Traffic</span>
              <span>Baseline (0%)</span>
              <span>+30% Growth</span>
            </div>
          </div>

          {/* Slider 3: Cost/Expense Change */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              <span>💸 Supplier Cost / Expense Inflation</span>
              <span style={{ color: costChange <= 0 ? '#059669' : '#e11d48' }}>
                {costChange >= 0 ? `+${costChange}%` : `${costChange}%`}
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="20"
              step="1"
              value={costChange}
              onChange={(e) => setCostChange(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#e11d48' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
              <span>-20% Cost Cut</span>
              <span>Baseline (0%)</span>
              <span>+20% Inflation</span>
            </div>
          </div>

          <button
            onClick={() => { setPriceChange(0); setVolumeChange(0); setCostChange(0); }}
            className="btn-sample"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
          >
            Reset All Sliders to Baseline
          </button>
        </div>

        {/* Right Column: Real-Time Impact & Comparison Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Simulated Impact KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="card-box" style={{ margin: 0, padding: '1rem', borderLeft: '4px solid #2563eb' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Simulated Revenue</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>
                ${simRev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: revDiff >= 0 ? '#059669' : '#e11d48', display: 'flex', alignItems: 'center' }}>
                {revDiff >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {revDiff >= 0 ? `+$${revDiff.toFixed(2)}` : `-$${Math.abs(revDiff).toFixed(2)}`}
              </div>
            </div>

            <div className="card-box" style={{ margin: 0, padding: '1rem', borderLeft: '4px solid #059669' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Simulated Net Profit</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: simProfit >= 0 ? '#059669' : '#e11d48', margin: '0.2rem 0' }}>
                ${simProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: profitDiff >= 0 ? '#059669' : '#e11d48', display: 'flex', alignItems: 'center' }}>
                {profitDiff >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {profitDiff >= 0 ? `+$${profitDiff.toFixed(2)}` : `-$${Math.abs(profitDiff).toFixed(2)}`} ({simMargin}% margin)
              </div>
            </div>
          </div>

          {/* Comparison Bar Chart */}
          <div className="card-box" style={{ margin: 0, flex: 1 }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <TrendingUp size={16} color="#2563eb" />
              Current Baseline vs Simulated Outcome
            </h4>
            <div style={{ width: '100%', height: 210 }}>
              <ResponsiveContainer>
                <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `$${val}`} />
                  <Tooltip formatter={(val) => [`$${Number(val).toFixed(2)}`, '']} />
                  <Legend />
                  <Bar dataKey="Current" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Simulated" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
