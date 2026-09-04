import React, { useState } from 'react';
import { Table, CheckCircle, Search, FileText } from 'lucide-react';

export default function DataPreviewTable({ rawData, cleanedData, cleanReport }) {
  const [activeView, setActiveView] = useState('cleaned'); // 'cleaned' or 'raw'
  const [searchTerm, setSearchTerm] = useState('');

  const displayData = activeView === 'cleaned' ? (cleanedData || []) : (rawData || []);
  const columns = displayData.length > 0 ? Object.keys(displayData[0]) : [];

  const filteredData = displayData.filter((row) => {
    if (!searchTerm) return true;
    return Object.values(row).some(
      (val) => val !== null && String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="card-box">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Table color="#2563eb" size={22} />
            Data Preview & Inspection
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
            Showing {filteredData.length} records. Toggle between your raw upload and cleaned dataset.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '2rem', width: '180px' }}
            />
          </div>

          <div className="input-mode-tabs" style={{ margin: 0, width: 'auto' }}>
            <button
              className={`tab-btn ${activeView === 'cleaned' ? 'active' : ''}`}
              onClick={() => setActiveView('cleaned')}
            >
              <CheckCircle size={15} color="#059669" />
              Cleaned Data ({cleanedData?.length || 0})
            </button>
            <button
              className={`tab-btn ${activeView === 'raw' ? 'active' : ''}`}
              onClick={() => setActiveView('raw')}
            >
              <FileText size={15} color="#64748b" />
              Raw Data ({rawData?.length || 0})
            </button>
          </div>
        </div>
      </div>

      {cleanReport?.changes_made && activeView === 'cleaned' && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.88rem', color: '#065f46' }}>
          <strong>Applied Clean Fixes:</strong> {cleanReport.changes_made.join(' • ')}
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>#</th>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ color: '#94a3b8', fontWeight: 600 }}>{idx + 1}</td>
                  {columns.map((col) => {
                    const val = row[col];
                    const isMissing = val === null || val === undefined || val === '' || val === 'Not Specified' || val === 'Unspecified';
                    return (
                      <td key={col}>
                        {isMissing ? (
                          <span className="cell-missing">{String(val || 'Missing')}</span>
                        ) : (
                          <span>{String(val)}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  No records match your view filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
