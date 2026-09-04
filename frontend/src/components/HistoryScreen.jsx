import React from 'react';
import { History, FileSpreadsheet, RotateCcw, ShieldCheck, Sparkles, Download, CheckCircle2 } from 'lucide-react';

export default function HistoryScreen({ historyList, onReloadHistoryItem, currentFilename }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Title */}
      <div className="card-box" style={{ margin: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: '#dbeafe', color: '#2563eb', padding: '0.6rem', borderRadius: '12px' }}>
            <History size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Upload History & Saved Reports</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
              Access past dataset uploads, reload previous clean datasets, and review saved business reports.
            </p>
          </div>
        </div>
      </div>

      {/* History Log List */}
      <div className="card-box" style={{ margin: 0 }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileSpreadsheet size={18} color="#2563eb" />
          Past Datasets ({historyList.length})
        </h4>

        {historyList.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {historyList.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  padding: '1rem 1.25rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  background: item.filename === currentFilename ? '#eff6ff' : 'white',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ background: '#f1f5f9', color: '#334155', padding: '0.5rem', borderRadius: '8px' }}>
                    <FileSpreadsheet size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                      {item.filename}
                      {item.filename === currentFilename && (
                        <span className="badge-tag" style={{ marginLeft: '0.5rem', background: '#dbeafe', color: '#1d4ed8' }}>
                          Active Dataset
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Uploaded on {item.timestamp} • {item.rows} rows • {item.issuesCount} health issues fixed
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => onReloadHistoryItem(item)}
                    className="btn-sample"
                    style={{ margin: 0, padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
                  >
                    <RotateCcw size={14} />
                    Reload into Dashboard
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            No past upload history found. Upload a spreadsheet to save history automatically!
          </div>
        )}
      </div>

      {/* Business Executive Summary Preview */}
      <div className="card-box" style={{ margin: 0, background: 'linear-gradient(135deg, #f8fafc, #eff6ff)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={20} color="#2563eb" />
              Automated Business Executive Report
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#475569' }}>
              Generated summary report based on your latest dataset cleaning & dashboard analytics.
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="btn-primary"
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
          >
            <Download size={15} />
            Print / Save Report PDF
          </button>
        </div>

        <div style={{ background: 'white', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#059669', marginBottom: '0.5rem' }}>
            <CheckCircle2 size={18} />
            BAAPP-AI Quality Certified Report
          </div>
          <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>
            Dataset status verified clean. Duplicate records eliminated, currency formats normalized, and missing details imputed. Your live Recharts business dashboard and AI Analyst assistant are ready for executive decision-making.
          </p>
        </div>
      </div>
    </div>
  );
}
