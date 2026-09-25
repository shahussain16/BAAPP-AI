import React from 'react';
import { Store, Sparkles, TrendingUp, Cpu } from 'lucide-react';

export default function Header({ currentStep }) {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-badge">
          <div className="logo-icon">
            <Store size={22} className="logo-store-icon" />
            <Sparkles size={12} className="logo-sparkle-icon" />
          </div>
          <div className="logo-text-group">
            <div className="logo-brand">
              <span className="brand-name">BAAPP</span>
              <span className="brand-ai-badge">AI</span>
            </div>
            <span className="badge-tag">
              <Cpu size={12} />
              Smart Business Assistant
            </span>
          </div>
        </div>

        <div className="step-indicator">
          <div className={`step-item ${currentStep >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Upload Data</span>
          </div>
          <div className={`step-item ${currentStep >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Auto-Clean</span>
          </div>
          <div className={`step-item ${currentStep >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Dashboard & AI</span>
          </div>
        </div>
      </div>
    </header>
  );
}
