import React, { useState } from 'react';
import { 
  User, Moon, Sun, Volume2, VolumeX, RotateCcw, 
  ShieldCheck, ShieldAlert, Building2, Smartphone, 
  ChevronRight, Award, AlertTriangle, CheckCircle2,
  Lock, Info, ExternalLink
} from 'lucide-react';
import { formatINR } from '../utils/storage';

export const ProfileView = ({
  profile,
  settings,
  balance,
  onUpdateSettings,
  onResetData,
  onOpenAbout,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'light' ? 'dark' : 'light';
    onUpdateSettings({ theme: nextTheme });
  };

  const toggleSound = () => {
    onUpdateSettings({ soundEnabled: !settings.soundEnabled });
  };

  const handleConfirmReset = () => {
    onResetData();
    setShowResetConfirm(false);
  };

  return (
    <div className="view-container profile-view">
      <div className="profile-top-header">
        <h2>Demo Profile & Settings</h2>
      </div>

      {/* Profile Info Card */}
      <div className="profile-hero-card">
        <div className="profile-avatar-large">
          <span>{profile.name.charAt(0)}</span>
          <div className="verified-badge-dot" title="Demo KYC Verified">
            <CheckCircle2 size={16} />
          </div>
        </div>

        <div className="profile-identity">
          <h3 className="profile-name">{profile.name}</h3>
          <span className="profile-upi mono">{profile.upiId}</span>
          <span className="profile-phone">{profile.phone}</span>
        </div>

        <div className="profile-kyc-badge">
          <Award size={14} />
          <span>{profile.kycStatus}</span>
        </div>
      </div>

      {/* Linked Demo Bank Account */}
      <div className="settings-section">
        <h4 className="settings-group-title">Linked Demo Bank Account</h4>
        <div className="settings-card">
          <div className="bank-card-item">
            <div className="bank-icon-box">
              <Building2 size={22} className="text-purple" />
            </div>
            <div className="bank-meta">
              <strong>{profile.bankName}</strong>
              <span className="account-num mono">{profile.accountNumber}</span>
              <span className="ifsc-code mono">IFSC: {profile.ifsc}</span>
            </div>
            <span className="primary-pill">Primary</span>
          </div>
        </div>
      </div>

      {/* App Preferences */}
      <div className="settings-section">
        <h4 className="settings-group-title">Preferences</h4>
        <div className="settings-card">
          {/* Theme Toggle */}
          <div className="setting-toggle-row">
            <div className="setting-info">
              {settings.theme === 'dark' ? <Moon size={20} className="text-purple" /> : <Sun size={20} className="text-gold" />}
              <div>
                <strong>Appearance Mode</strong>
                <span>{settings.theme === 'dark' ? 'Dark Purple Mode' : 'Light Purple Mode'}</span>
              </div>
            </div>
            <button 
              className={`toggle-switch ${settings.theme === 'dark' ? 'on' : ''}`}
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
            >
              <div className="toggle-handle"></div>
            </button>
          </div>

          <div className="setting-divider"></div>

          {/* Sound Toggle */}
          <div className="setting-toggle-row">
            <div className="setting-info">
              {settings.soundEnabled ? <Volume2 size={20} className="text-purple" /> : <VolumeX size={20} className="text-muted" />}
              <div>
                <strong>UPI Audio Chime</strong>
                <span>Sound effect on payment success</span>
              </div>
            </div>
            <button 
              className={`toggle-switch ${settings.soundEnabled ? 'on' : ''}`}
              onClick={toggleSound}
              aria-label="Toggle audio effects"
            >
              <div className="toggle-handle"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Security & Sandbox Safe Notice */}
      <div className="settings-section">
        <h4 className="settings-group-title">Simulation Safety & Disclaimers</h4>
        <div className="security-notice-card">
          <div className="security-header">
            <ShieldAlert size={20} className="text-purple" />
            <strong>Safety & Zero Credentials Rule</strong>
          </div>
          <p>
            Parv Pay is strictly a frontend client demo. We do not ask for, accept, or transmit real bank PINs, passwords, OTPs, or debit/credit card numbers.
          </p>
          <div className="security-tags">
            <span className="sec-tag">🔒 No Real Money</span>
            <span className="sec-tag">💾 100% LocalStorage</span>
            <span className="sec-tag">⚡ Safe Sandbox</span>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="settings-section">
        <h4 className="settings-group-title">Data Management</h4>
        <div className="settings-card">
          <button 
            className="action-link-row danger"
            onClick={() => setShowResetConfirm(true)}
          >
            <div className="action-row-left">
              <RotateCcw size={18} className="text-danger" />
              <div>
                <strong className="text-danger">Reset All Demo Data</strong>
                <span>Restore ₹5,000 balance and default transactions</span>
              </div>
            </div>
            <ChevronRight size={16} />
          </button>

          <div className="setting-divider"></div>

          <button 
            className="action-link-row"
            onClick={onOpenAbout}
          >
            <div className="action-row-left">
              <Info size={18} className="text-purple" />
              <div>
                <strong>About Parv Pay Simulator</strong>
                <span>Documentation & version info</span>
              </div>
            </div>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* App Version Info */}
      <div className="profile-footer-version">
        <p>Parv Pay Mobile-First Demo • Build 2026.10</p>
        <p className="disclaimer-sub">Created with React, Vite, and CSS for educational simulation</p>
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
              Are you sure you want to restore the initial state? Your demo balance will be set back to <strong>₹5,000.00</strong> and sample transactions will be restored.
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
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
