import React from 'react';
import { Store, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Header({ currentStep }) {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-badge">
          <div className="logo-icon">
            <Store size={22} />
          </div>
          <div>
            <span>BAAPP-AI</span>
            <span className="badge-tag" style={{ marginLeft: '8px' }}>Smart Business Assistant</span>
          </div>
        </div>

        <div className="step-indicator">
          <div className={`step-item ${currentStep >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span>Upload or Enter</span>
          </div>
          <div className={`step-item ${currentStep >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span>Auto-Cleaning</span>
          </div>
          <div className={`step-item ${currentStep >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span>Business Dashboard</span>
          </div>
        </div>
      </div>
    </header>
  );
}
