import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import ManualEntry from './components/ManualEntry';
import CleaningSummary from './components/CleaningSummary';
import DataPreviewTable from './components/DataPreviewTable';
import Dashboard from './components/Dashboard';
import AIChat from './components/AIChat';
import ExportBar from './components/ExportBar';
import HistoryScreen from './components/HistoryScreen';
import WhatIfSimulator from './components/WhatIfSimulator';
import { Upload, Edit3, ArrowLeft, LayoutDashboard, Table, MessageSquareText, History, Zap, RotateCcw } from 'lucide-react';

export default function App() {
  const [inputMode, setInputMode] = useState('upload'); // 'upload' | 'manual'
  const [currentStep, setCurrentStep] = useState(1); // 1: Input, 2: Review, 3: Complete View
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'whatif' | 'ai_chat' | 'cleaning' | 'history'
  const [prevTab, setPrevTab] = useState('dashboard');
  const [filename, setFilename] = useState('');
  const [rawData, setRawData] = useState(null);
  const [cleanedData, setCleanedData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [cleanReport, setCleanReport] = useState(null);
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Helper for changing tabs with history
  const handleTabChange = (newTab) => {
    setPrevTab(activeTab);
    setActiveTab(newTab);
  };

  // Load history from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('baapp_history');
      if (saved) {
        setHistoryList(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load history from LocalStorage:', e);
    }
  }, []);

  const saveToHistory = (name, raw, clean, report, metrics, issues) => {
    const newItem = {
      filename: name,
      timestamp: new Date().toLocaleString(),
      rows: clean?.length || 0,
      issuesCount: issues?.length || 0,
      raw_data: raw,
      cleaned_data: clean,
      clean_report: report,
      dashboard_metrics: metrics,
    };

    setHistoryList((prev) => {
      const updated = [newItem, ...prev.filter((i) => i.filename !== name)].slice(0, 10);
      try {
        localStorage.setItem('baapp_history', JSON.stringify(updated));
      } catch (e) {
        console.error('LocalStorage write error:', e);
      }
      return updated;
    });
  };

  // File Upload Handler
  const handleFileUpload = async (file) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Upload failed');
      }

      const result = await response.json();
      setFilename(result.filename);
      setRawData(result.raw_data);
      setAnalysis(result.analysis);
      setCleanedData(result.cleaned_data);
      setCleanReport(result.clean_report);
      setDashboardMetrics(result.dashboard_metrics);
      saveToHistory(result.filename, result.raw_data, result.cleaned_data, result.clean_report, result.dashboard_metrics, result.analysis?.issues);
      setCurrentStep(3);
      setActiveTab('dashboard');
    } catch (err) {
      console.error('File Upload Error:', err);
      alert('Error analyzing file: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Sample Data Handler
  const handleSelectSample = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/sample-data');
      if (!response.ok) throw new Error('Failed to load sample dataset');

      const result = await response.json();
      setFilename(result.filename);
      setRawData(result.raw_data);
      setAnalysis(result.analysis);
      setCleanedData(result.cleaned_data);
      setCleanReport(result.clean_report);
      setDashboardMetrics(result.dashboard_metrics);
      saveToHistory(result.filename, result.raw_data, result.cleaned_data, result.clean_report, result.dashboard_metrics, result.analysis?.issues);
      setCurrentStep(3);
      setActiveTab('dashboard');
    } catch (err) {
      console.error('Sample Data Error:', err);
      alert('Error loading sample data: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Manual Entry Form Handler
  const handleManualSubmit = async (entries) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/manual-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries }),
      });

      if (!response.ok) throw new Error('Failed to process manual entry');

      const result = await response.json();
      setFilename(result.filename);
      setRawData(result.raw_data);
      setAnalysis(result.analysis);
      setCleanedData(result.cleaned_data);
      setCleanReport(result.clean_report);
      setDashboardMetrics(result.dashboard_metrics);
      saveToHistory(result.filename, result.raw_data, result.cleaned_data, result.clean_report, result.dashboard_metrics, result.analysis?.issues);
      setCurrentStep(3);
      setActiveTab('dashboard');
    } catch (err) {
      console.error('Manual Entry Error:', err);
      alert('Error processing manual entries: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-clean with Custom Options
  const handleApplyCleanOptions = async (options) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_data: rawData, options }),
      });

      if (!response.ok) throw new Error('Failed to clean dataset');

      const result = await response.json();
      setCleanedData(result.cleaned_data);
      setCleanReport(result.clean_report);
      setDashboardMetrics(result.dashboard_metrics);
      setCurrentStep(3);
    } catch (err) {
      console.error('Cleaning Error:', err);
      alert('Error applying clean options: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReloadHistoryItem = (item) => {
    setFilename(item.filename);
    setRawData(item.raw_data);
    setCleanedData(item.cleaned_data);
    setCleanReport(item.clean_report);
    setDashboardMetrics(item.dashboard_metrics);
    setCurrentStep(3);
    setActiveTab('dashboard');
  };

  // Soft Go Back (does not wipe loaded dataset)
  const handleGoBack = () => {
    if (activeTab !== 'dashboard') {
      setActiveTab('dashboard');
    } else {
      setCurrentStep(1);
    }
  };

  // Full Reset to Start Over
  const handleReset = () => {
    if (cleanedData && !window.confirm('Start over and upload a new file? Your current active dataset preview will be cleared.')) {
      return;
    }
    setCurrentStep(1);
    setRawData(null);
    setCleanedData(null);
    setAnalysis(null);
    setCleanReport(null);
    setDashboardMetrics(null);
    setFilename('');
  };

  return (
    <div className="app-container">
      <Header currentStep={currentStep} />

      <main className="main-content">
        {currentStep === 1 && (
          <>
            {/* Resume Active Dataset Banner if dataset in memory */}
            {cleanedData && (
              <div style={{ background: 'linear-gradient(135deg, #e0e7ff, #ede9fe)', border: '1px solid #c7d2fe', borderRadius: '14px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <LayoutDashboard size={20} color="#4f46e5" />
                  <div>
                    <span style={{ fontWeight: 700, color: '#3730a3', fontSize: '0.95rem' }}>Active Dataset Loaded: {filename}</span>
                    <p style={{ fontSize: '0.8rem', color: '#4338ca', margin: 0 }}>You can resume analyzing your dataset without uploading again.</p>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="btn-primary"
                  style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem' }}
                >
                  Resume Dashboard →
                </button>
              </div>
            )}

            <div className="hero-banner">
              <h1 className="hero-title">Simple Business Data Analysis for Small Vendors</h1>
              <p className="hero-subtitle">
                Upload your sales spreadsheet or enter daily sales below. Our smart engine auto-cleans your data, generates a live dashboard, and unlocks an AI analyst — zero jargon!
              </p>
            </div>

            <div className="input-mode-tabs">
              <button
                className={`tab-btn ${inputMode === 'upload' ? 'active' : ''}`}
                onClick={() => setInputMode('upload')}
              >
                <Upload size={18} />
                Spreadsheet Upload (CSV/Excel)
              </button>
              <button
                className={`tab-btn ${inputMode === 'manual' ? 'active' : ''}`}
                onClick={() => setInputMode('manual')}
              >
                <Edit3 size={18} />
                Quick Manual Entry
              </button>
            </div>

            {inputMode === 'upload' ? (
              <FileUpload
                onFileUpload={handleFileUpload}
                onSelectSample={handleSelectSample}
                isLoading={isLoading}
              />
            ) : (
              <ManualEntry
                onSubmitManual={handleManualSubmit}
                isLoading={isLoading}
              />
            )}
          </>
        )}

        {currentStep >= 2 && (
          <>
            {/* Top Toolbar Header Row with Dual Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={handleGoBack}
                  className="btn-sample"
                  style={{ margin: 0, padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  title="Go back to previous tab or upload screen without clearing dataset"
                >
                  <ArrowLeft size={16} />
                  Go Back
                </button>

                <button
                  onClick={handleReset}
                  className="btn-reset"
                  style={{ margin: 0, padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  title="Reset application to upload a new spreadsheet"
                >
                  <RotateCcw size={14} />
                  Start Over / Upload New
                </button>
              </div>

              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '20px', padding: '0.4rem 0.9rem', fontSize: '0.85rem', color: '#1e40af', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                Active File: <strong>{filename}</strong>
              </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="input-mode-tabs">
              <button
                className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <LayoutDashboard size={17} color="#2563eb" />
                Business Dashboard
              </button>

              <button
                className={`tab-btn ${activeTab === 'whatif' ? 'active' : ''}`}
                onClick={() => setActiveTab('whatif')}
              >
                <Zap size={17} color="#d97706" />
                What-If Simulator
              </button>

              <button
                className={`tab-btn ${activeTab === 'ai_chat' ? 'active' : ''}`}
                onClick={() => setActiveTab('ai_chat')}
              >
                <MessageSquareText size={17} color="#4f46e5" />
                Ask AI Analyst
              </button>

              <button
                className={`tab-btn ${activeTab === 'cleaning' ? 'active' : ''}`}
                onClick={() => setActiveTab('cleaning')}
              >
                <Table size={17} color="#059669" />
                Data Cleaning & Review
              </button>

              <button
                className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <History size={17} color="#64748b" />
                History & Reports
              </button>
            </div>

            {/* Export Bar */}
            <ExportBar cleanedData={cleanedData} filename={filename} />

            {/* Tab Views */}
            {activeTab === 'dashboard' && (
              <Dashboard metrics={dashboardMetrics} cleanedData={cleanedData} />
            )}

            {activeTab === 'whatif' && (
              <WhatIfSimulator metrics={dashboardMetrics} />
            )}

            {activeTab === 'ai_chat' && (
              <AIChat cleanedData={cleanedData} />
            )}

            {activeTab === 'cleaning' && (
              <>
                <CleaningSummary
                  analysis={analysis}
                  onApplyCleanOptions={handleApplyCleanOptions}
                  isCleaning={isLoading}
                />

                <DataPreviewTable
                  rawData={rawData}
                  cleanedData={cleanedData}
                  cleanReport={cleanReport}
                />
              </>
            )}

            {activeTab === 'history' && (
              <HistoryScreen
                historyList={historyList}
                onReloadHistoryItem={handleReloadHistoryItem}
                currentFilename={filename}
              />
            )}
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>BAAPP-AI — AI-Powered Business Data Analyst for Small Food & Retail Vendors</p>
      </footer>
    </div>
  );
}
