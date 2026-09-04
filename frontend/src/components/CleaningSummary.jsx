import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ShieldCheck, RefreshCw, AlertTriangle, ArrowRight } from 'lucide-react';

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
