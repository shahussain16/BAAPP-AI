import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ShieldCheck, RefreshCw, AlertTriangle, ArrowRight, Cpu } from 'lucide-react';

export default function CleaningSummary({ analysis, onApplyCleanOptions, isCleaning }) {
  const [options, setOptions] = useState({
    remove_duplicates: true,
    fix_dates: true,
    fix_currency: true,
    fix_text_casing: true,
    fill_missing: true,
    cap_outliers: false
  });

  const handleToggle = (key) => {
    const updated = { ...options, [key]: !options[key] };
    setOptions(updated);
  };

  const handleApply = () => {
    onApplyCleanOptions(options);
  };

  const issues = analysis?.issues || [];
  const summaries = analysis?.plain_english_summary || [];

  return (
    <div className="card-box">
      <div className="cleaning-header">
        <div>
          <h3 className="cleaning-title">
            <Sparkles color="#2563eb" size={24} />
            Auto-Cleaning Health Report
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
            Our smart engine scanned <strong>{analysis?.total_rows || 0} rows</strong> and <strong>{analysis?.total_cols || 0} columns</strong>.
          </p>
        </div>

        <button className="btn-primary" onClick={handleApply} disabled={isCleaning}>
          <ShieldCheck size={18} />
          {isCleaning ? 'Cleaning Data...' : 'Apply Smart Fixes'}
        </button>
      </div>

      <div className="summary-banner">
        <div className="summary-banner-title">
          <CheckCircle2 size={20} />
          <span>Plain-English Summary for Your Business</span>
        </div>
        <ul className="summary-list">
          {summaries.map((text, idx) => (
            <li key={idx}>
              <span>•</span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Stage 1 & Stage 2: Automatic Data Profiling & AI Column Mapping Confirmation */}
      {analysis?.column_profiles && analysis.column_profiles.length > 0 && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
            <Cpu size={18} color="#4f46e5" />
            <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Stage 1 & 2: Data Profiling & AI Semantic Role Mapping
            </h4>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>
            Our engine scanned your data values dynamically (never assuming hardcoded headers). Verify how each column was profiled:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {analysis.column_profiles.map((prof, idx) => (
              <div key={idx} style={{ background: 'white', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.85rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{prof.column}</span>
                  <span className="badge-tag" style={{ background: '#ecfdf5', color: '#059669', fontSize: '0.7rem' }}>Confirmed ✓</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#4f46e5', fontWeight: 600 }}>
                  Role: {prof.semantic_guess}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Type: {prof.statistical_type} • Sample: <em>"{prof.sample_value}"</em>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
        Recommended Fix Toggles (Select what to clean):
      </h4>

      <div className="issues-grid">
        <div className="issue-card">
          <div className="issue-card-header">
            <span className="issue-card-title">Remove Duplicate Rows</span>
            <input
              type="checkbox"
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              checked={options.remove_duplicates}
              onChange={() => handleToggle('remove_duplicates')}
            />
          </div>
          <p className="issue-card-desc">
            Deletes exact duplicate entries so sales figures aren't double-counted.
          </p>
          <span className="badge-tag" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
            Recommended
          </span>
        </div>

        <div className="issue-card">
          <div className="issue-card-header">
            <span className="issue-card-title">Standardize Date Formats</span>
            <input
              type="checkbox"
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              checked={options.fix_dates}
              onChange={() => handleToggle('fix_dates')}
            />
          </div>
          <p className="issue-card-desc">
            Converts mixed date styles (08/01/26, 1-Aug-2026) into clean YYYY-MM-DD format.
          </p>
          <span className="badge-tag" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
            Recommended
          </span>
        </div>

        <div className="issue-card">
          <div className="issue-card-header">
            <span className="issue-card-title">Clean Currency & Symbols</span>
            <input
              type="checkbox"
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              checked={options.fix_currency}
              onChange={() => handleToggle('fix_currency')}
            />
          </div>
          <p className="issue-card-desc">
            Strips dollar signs ($) and commas so numbers can be calculated automatically.
          </p>
          <span className="badge-tag" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
            Recommended
          </span>
        </div>

        <div className="issue-card">
          <div className="issue-card-header">
            <span className="issue-card-title">Standardize Product Names</span>
            <input
              type="checkbox"
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              checked={options.fix_text_casing}
              onChange={() => handleToggle('fix_text_casing')}
            />
          </div>
          <p className="issue-card-desc">
            Fixes inconsistent capitalization & extra spaces (e.g. 'coffee' → 'Coffee').
          </p>
          <span className="badge-tag" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
            Recommended
          </span>
        </div>

        <div className="issue-card">
          <div className="issue-card-header">
            <span className="issue-card-title">Fill Missing Numbers</span>
            <input
              type="checkbox"
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              checked={options.fill_missing}
              onChange={() => handleToggle('fill_missing')}
            />
          </div>
          <p className="issue-card-desc">
            Fills empty sales quantities or costs with 0 so reporting remains accurate.
          </p>
          <span className="badge-tag" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
            Recommended
          </span>
        </div>
      </div>
    </div>
  );
}
