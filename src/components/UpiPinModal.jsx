import React, { useState } from 'react';
import { ShieldAlert, X, Delete, CheckCircle } from 'lucide-react';
import { formatINR } from '../utils/storage';

export const UpiPinModal = ({ amount, recipient, onAuthorize, onCancel }) => {
  const [pin, setPin] = useState('');

  const handleDigit = (digit) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 4) {
        // Auto authorize after 4 digits
        setTimeout(() => {
          onAuthorize();
        }, 300);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleQuickDemoSubmit = () => {
    onAuthorize();
  };

  return (
    <div className="modal-backdrop">
      <div className="pin-sheet">
        <div className="pin-header">
          <div className="pin-header-info">
            <span className="pin-subtitle">AUTHORIZING DEMO PAYMENT TO</span>
            <h3 className="pin-recipient">{recipient}</h3>
            <span className="pin-amount">{formatINR(amount)}</span>
          </div>
          <button className="icon-btn-close" onClick={onCancel} aria-label="Cancel payment">
            <X size={20} />
          </button>
        </div>

        {/* Vital Safety Warning */}
        <div className="pin-safety-notice">
          <ShieldAlert size={18} className="text-amber" />
          <div>
            <strong>DEMO SIMULATION ONLY</strong>
            <p>DO NOT enter your real UPI PIN or bank password! Tap any digits or use the quick simulation button below.</p>
          </div>
        </div>

        {/* PIN Dots */}
        <div className="pin-dots-row">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`pin-dot ${idx < pin.length ? 'filled' : ''}`}
            />
          ))}
        </div>

        {/* Quick instant bypass button */}
        <div className="pin-quick-actions">
          <button className="btn-quick-pin" onClick={handleQuickDemoSubmit}>
            ⚡ Bypass & Simulate Demo Payment
          </button>
        </div>

        {/* Virtual Pin Pad */}
        <div className="pin-pad-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              className="pin-key"
              onClick={() => handleDigit(digit.toString())}
            >
              {digit}
            </button>
          ))}
          <button className="pin-key special" onClick={() => setPin('')}>
            C
          </button>
          <button
            className="pin-key"
            onClick={() => handleDigit('0')}
          >
            0
          </button>
          <button
            className="pin-key special"
            onClick={handleBackspace}
            aria-label="Backspace"
          >
            <Delete size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
