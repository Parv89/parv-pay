import React from 'react';
import { X, ShieldCheck, Database, RefreshCw, Smartphone, Award } from 'lucide-react';

export const AboutDemoModal = ({ onClose, onResetData }) => {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="about-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="about-header">
          <div className="about-logo-badge">
            <ShieldCheck size={28} className="text-purple" />
          </div>
          <h3>About Parv Pay (Demo)</h3>
          <p className="about-version">Mobile-First UPI Simulator v1.0.0</p>
          <button className="icon-btn-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="about-content">
          <div className="disclaimer-callout">
            <strong>⚠️ IMPORTANT NOTICE:</strong>
            <p>
              This is a SIMULATION ONLY. Parv Pay is an educational web prototype that does NOT connect to NPCI, real banks, UPI networks, payment gateways, or payment servers.
            </p>
          </div>

          <div className="about-feature-list">
            <div className="feature-item">
              <Database size={20} className="feature-icon" />
              <div>
                <h4>Local Data Only</h4>
                <p>Balances and transaction history are stored purely in your browser's LocalStorage. No database or backend required.</p>
              </div>
            </div>

            <div className="feature-item">
              <Smartphone size={20} className="feature-icon" />
              <div>
                <h4>Mobile-First Experience</h4>
                <p>Designed for mobile screens and Android Chrome, with full desktop responsiveness.</p>
              </div>
            </div>

            <div className="feature-item">
              <ShieldCheck size={20} className="feature-icon" />
              <div>
                <h4>Zero Credential Request</h4>
                <p>Never enter real banking passwords, bank PINs, debit cards, or OTPs.</p>
              </div>
            </div>
          </div>

          <div className="about-actions">
            <button 
              className="btn-danger-outline" 
              onClick={() => {
                onClose();
                onResetData();
              }}
            >
              <RefreshCw size={16} />
              <span>Reset All Demo Data (₹5,000)</span>
            </button>
          </div>
        </div>

        <div className="about-footer">
          <button className="btn-primary-action" onClick={onClose}>
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
