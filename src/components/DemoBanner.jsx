import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

export const DemoBanner = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`demo-persistent-banner ${expanded ? 'expanded' : ''}`}>
      <div className="banner-summary" onClick={() => setExpanded(!expanded)}>
        <div className="banner-left">
          <ShieldCheck size={16} className="banner-icon" />
          <span className="banner-text">
            <strong>DEMO SIMULATION:</strong> No real bank connection or money transfer
          </span>
        </div>
        <button className="banner-toggle" aria-label="Toggle details">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {expanded && (
        <div className="banner-details">
          <p>
            Parv Pay is an educational prototype simulating Indian UPI mobile payments using browser LocalStorage.
          </p>
          <ul>
            <li>✨ Balance and transactions are stored locally on your device only.</li>
            <li>🔒 Never connects to NPCI, banks, cards, or payment gateways.</li>
            <li>💳 All receipts and balances are strictly demo data.</li>
          </ul>
        </div>
      )}
    </div>
  );
};
