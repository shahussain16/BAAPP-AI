import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, Sparkles, AlertCircle } from 'lucide-react';

export default function FileUpload({ onFileUpload, onSelectSample, isLoading }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const validateAndProcessFile = (file) => {
    setErrorMessage('');
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      setErrorMessage('Please upload a spreadsheet file ending in .csv or .xlsx');
      return;
    }
    onFileUpload(file);
  };

  return (
    <div className="card-box">
      <div
        className={`dropzone ${isDragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleChange}
          style={{ display: 'none' }}
        />

        <div className="dropzone-icon">
          <UploadCloud size={30} />
        </div>

        <h3 className="dropzone-title">
          {isLoading ? 'Reading and Analyzing Data...' : 'Drag & Drop your sales or inventory spreadsheet here'}
        </h3>
        <p className="dropzone-hint">
          Supports <strong>CSV</strong> and <strong>Excel (.xlsx)</strong> files from your register, POS, or bookkeeping app.
        </p>

        <button type="button" className="btn-primary" disabled={isLoading}>
          <FileSpreadsheet size={18} />
          {isLoading ? 'Processing...' : 'Browse Files on Your Computer'}
        </button>
      </div>

      {errorMessage && (
        <div style={{ color: '#e11d48', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>
          Don't have a file ready? Test the app with 1 click:
        </p>
        <button
          type="button"
          className="btn-sample"
          onClick={onSelectSample}
          disabled={isLoading}
        >
          <Sparkles size={16} color="#2563eb" />
          Try with Sample Cafe & Bakery Sales Data
        </button>
      </div>
    </div>
  );
}
