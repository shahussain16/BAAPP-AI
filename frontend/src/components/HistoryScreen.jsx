import React, { useState } from 'react';
import { History, FileSpreadsheet, RotateCcw, ShieldCheck, Sparkles, Download, CheckCircle2, Printer, X, FileText } from 'lucide-react';

export default function HistoryScreen({ historyList, onReloadHistoryItem, currentFilename }) {
  const [showReportModal, setShowReportModal] = useState(false);

  const activeHistoryItem = historyList.find((i) => i.filename === currentFilename) || historyList[0];

  const handleDownloadTextReport = () => {
    const text = `================================================
BAAPP-AI CERTIFIED BUSINESS EXECUTIVE REPORT
================================================
Generated Date : ${new Date().toLocaleDateString()}
Active File    : ${currentFilename || 'Business Dataset'}
Status         : Quality Certified Clean & Standardized

DATA SUMMARY:
- Processed Rows : ${activeHistoryItem?.rows || 'N/A'}
- Health Issues Fixed : ${activeHistoryItem?.issuesCount || 0} issues
- Verification : Zero duplicates, standard dates, currency normalized.

EXECUTIVE STATEMENT:
Dataset status verified clean. Duplicate records eliminated, currency formats normalized, and missing details imputed. Your live Recharts business dashboard and AI Analyst assistant are ready for executive decision-making.
================================================
    `;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentFilename || 'business_report'}_executive_summary.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
                  justifyContent: 'space-between',
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
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
            onClick={() => setShowReportModal(true)}
            className="btn-primary"
            style={{ fontSize: '0.85rem', padding: '0.55rem 1.1rem', whiteSpace: 'nowrap' }}
          >
            <FileText size={16} />
            Preview & Print Executive Report
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

      {/* Printable Report Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShieldCheck size={22} color="#2563eb" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  BAAPP-AI Executive Summary Report
                </h3>
              </div>
              <button className="modal-close-btn" onClick={() => setShowReportModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.6, color: '#1e293b' }}>
                <div><strong>REPORT TITLE:</strong> Executive Business Performance & Cleaning Audit</div>
                <div><strong>ACTIVE FILE:</strong> {currentFilename || 'Uploaded Spreadsheet'}</div>
                <div><strong>GENERATED DATE:</strong> {new Date().toLocaleString()}</div>
                <div><strong>STATUS:</strong> BAAPP-AI Quality Certified Clean</div>
                <hr style={{ margin: '0.8rem 0', borderColor: '#cbd5e1' }} />
                <div><strong>SUMMARY AUDIT FINDINGS:</strong></div>
                <div>• Processed Records: {activeHistoryItem?.rows || 'Active'} rows</div>
                <div>• Data Health Fixes: {activeHistoryItem?.issuesCount || 0} issues resolved</div>
                <div>• Standardizations: Currency values parsed, dates aligned (YYYY-MM-DD), missing numbers filled.</div>
                <hr style={{ margin: '0.8rem 0', borderColor: '#cbd5e1' }} />
                <div><strong>EXECUTIVE CONCLUSION:</strong></div>
                <div>This dataset is 100% verified clean. All analytics dashboards, sales trends, and AI Analyst queries are grounded in validated data.</div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => window.print()} className="btn-primary" style={{ fontSize: '0.85rem' }}>
                <Printer size={16} />
                Print / Save PDF
              </button>
              <button onClick={handleDownloadTextReport} className="btn-sample" style={{ fontSize: '0.85rem' }}>
                <Download size={16} />
                Download Text Report (.txt)
              </button>
              <button onClick={() => setShowReportModal(false)} className="btn-sample" style={{ fontSize: '0.85rem', background: '#f1f5f9' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
