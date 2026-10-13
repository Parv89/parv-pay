import React, { useState } from 'react';
import { 
  ArrowLeft, Wallet, Building2, RefreshCw, 
  RotateCcw, ShieldCheck, CheckCircle2, AlertTriangle, 
  Send, ArrowDownLeft, TrendingUp, History
} from 'lucide-react';
import { formatINR } from '../utils/storage';

export const CheckBalanceView = ({
  balance,
  profile,
  onBack,
  onNavigate,
  onResetData,
  onRefresh,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (onRefresh) onRefresh();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 450);
  };

  const handleConfirmReset = () => {
    onResetData();
    setShowResetConfirm(false);
  };

  return (
    <div className="view-container balance-view">
      <div className="screen-header">
        <button className="btn-back" onClick={onBack} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h2>Check Balance (Demo)</h2>
        <button 
          className={`btn-icon-refresh ${isRefreshing ? 'spinning' : ''}`}
          onClick={handleRefresh}
          title="Refresh Balance"
          aria-label="Refresh balance"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Main Balance Display Card */}
      <div className="balance-main-card">
        <div className="balance-status-badge">
          <span className="live-dot"></span>
          <span>LOCAL DEMO BALANCE</span>
        </div>

        <div className="balance-amount-display">
          <span className="balance-hero-val">{formatINR(balance)}</span>
          <span className="balance-helper">Persisted in browser LocalStorage</span>
        </div>

        <div className="balance-breakdown-box">
          <div className="breakdown-item">
            <div className="breakdown-item-header">
              <Wallet size={16} className="text-purple" />
              <span>Parv Demo Wallet</span>
            </div>
            <strong>{formatINR(balance)}</strong>
          </div>

          <div className="breakdown-divider"></div>

          <div className="breakdown-item">
            <div className="breakdown-item-header">
              <Building2 size={16} className="text-purple" />
              <span>{profile.bankName}</span>
            </div>
            <span className="mono">{profile.accountNumber}</span>
          </div>

          <div className="breakdown-divider"></div>

          <div className="breakdown-item">
            <div className="breakdown-item-header">
              <TrendingUp size={16} className="text-purple" />
              <span>Daily Demo Limit</span>
            </div>
            <span>₹1,00,000 / day</span>
          </div>
        </div>

        <div className="balance-card-footer">
          <ShieldCheck size={15} />
          <span>No actual money moved • Offline sandbox</span>
        </div>
      </div>

      {/* Quick Transaction Shortcuts */}
      <div className="balance-shortcuts-grid">
        <button 
          className="btn-balance-shortcut"
          onClick={() => onNavigate('send')}
        >
          <div className="shortcut-icon send">
            <Send size={18} />
          </div>
          <span>Send Money</span>
        </button>

        <button 
          className="btn-balance-shortcut"
          onClick={() => onNavigate('receive')}
        >
          <div className="shortcut-icon receive">
            <ArrowDownLeft size={18} />
          </div>
          <span>Receive Money</span>
        </button>

        <button 
          className="btn-balance-shortcut"
          onClick={() => onNavigate('history')}
        >
          <div className="shortcut-icon history">
            <History size={18} />
          </div>
          <span>View History</span>
        </button>
      </div>

      {/* Reset Data Option */}
      <div className="reset-data-card">
        <div className="reset-info">
          <h4>Reset Demo Balance</h4>
          <p>Restore default ₹5,000 demo wallet balance and initial transaction history.</p>
        </div>
        <button 
          className="btn-reset-trigger"
          onClick={() => setShowResetConfirm(true)}
        >
          <RotateCcw size={16} />
          <span>Reset Demo Data</span>
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="modal-backdrop" onClick={() => setShowResetConfirm(false)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-icon-warning">
              <AlertTriangle size={32} />
            </div>
            <h3>Reset All Demo Data?</h3>
            <p>
              This will reset your local demo balance back to <strong>₹5,000.00</strong> and reload initial demo transactions.
            </p>
            <div className="dialog-actions">
              <button 
                className="btn-cancel" 
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-confirm-reset" 
                onClick={handleConfirmReset}
              >
                Yes, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
