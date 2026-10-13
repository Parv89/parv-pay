import React from 'react';
import { QrCode, Info, Sparkles } from 'lucide-react';

export const Header = ({ onOpenScanner, onOpenAbout }) => {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="brand-logo-icon">
          <svg width="26" height="26" viewBox="0 0 100 100" fill="none">
            <rect width="100" height="100" rx="24" fill="#FFFFFF"/>
            <rect x="28" y="24" width="10" height="52" rx="5" fill="#5A189A"/>
            <path d="M 32 24 H 56 C 68 24 74 33 74 42 C 74 51 68 60 56 60 H 32" 
                  fill="none" stroke="#5A189A" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M 40 37 H 64" stroke="#FFB703" strokeWidth="5" strokeLinecap="round"/>
            <path d="M 40 47 H 58" stroke="#FFB703" strokeWidth="5" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="brand-titles">
          <h1 className="brand-title">Parv Pay</h1>
          <span className="brand-tagline">UPI Simulation</span>
        </div>
      </div>

      <div className="header-right">
        {/* Prominent Demo Mode Badge */}
        <div className="demo-badge-pill" title="Demo mode active: purely simulated funds">
          <span className="demo-pulse-dot"></span>
          <span>DEMO MODE</span>
        </div>

        {/* Quick QR Scanner Icon */}
        <button 
          className="header-icon-btn" 
          onClick={onOpenScanner}
          aria-label="Scan QR Code"
          title="Scan Demo QR"
        >
          <QrCode size={20} />
        </button>

        {/* Demo Info Trigger */}
        <button 
          className="header-icon-btn" 
          onClick={onOpenAbout}
          aria-label="Demo Information"
          title="About Demo Simulation"
        >
          <Info size={19} />
        </button>
      </div>
    </header>
  );
};
