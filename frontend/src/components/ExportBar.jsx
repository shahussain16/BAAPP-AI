import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Zap } from 'lucide-react';

export default function ExportBar({ cleanedData, filename }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format) => {
    if (!cleanedData || cleanedData.length === 0) {
      alert('No cleaned data available to export.');
      return;
    }

    setIsExporting(true);
    try {
      const response = await fetch(`/api/export/${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cleaned_data: cleanedData })
      });

      if (!response.ok) throw new Error(`Export to ${format} failed.`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const ext = format === 'excel' ? 'xlsx' : 'csv';
      const defaultName = format === 'powerbi' ? 'powerbi_ready_dataset.csv' : `cleaned_${filename || 'data'}.${ext}`;
      a.download = defaultName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('Export failed: ' + err.message);
    } finally {
      setIsLoadingFalseDelayed();
    }
  };

  const setIsLoadingFalseDelayed = () => {
    setTimeout(() => setIsExporting(false), 500);
  };

  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
      <div>
        <h4 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Download size={18} color="#2563eb" />
          Export Cleaned Dataset
        </h4>
        <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
          Download your standardized dataset in clean CSV, styled Excel, or Power BI format.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => handleExport('csv')}
          disabled={isExporting}
          className="btn-sample"
          style={{ margin: 0, background: 'white' }}
        >
          <FileText size={16} color="#059669" />
          Download CSV
        </button>

        <button
          onClick={() => handleExport('excel')}
          disabled={isExporting}
          className="btn-sample"
          style={{ margin: 0, background: 'white' }}
        >
          <FileSpreadsheet size={16} color="#1d4ed8" />
          Download Excel (.xlsx)
        </button>

        <button
          onClick={() => handleExport('powerbi')}
          disabled={isExporting}
          className="btn-primary"
          style={{ background: 'linear-gradient(135deg, #d97706, #b45309)', fontSize: '0.88rem', padding: '0.55rem 1rem' }}
        >
          <Zap size={16} />
          Export for Power BI
        </button>
      </div>
    </div>
  );
}
