import React, { useState } from 'react';
import { 
  Send, QrCode, ArrowDownLeft, Wallet, 
  History, Eye, EyeOff, ShieldCheck, 
  ArrowUpRight, ChevronRight, Sparkles, Building2,
  Smartphone, PlusCircle
} from 'lucide-react';
import { formatINR } from '../utils/storage';
import { QuickContacts } from '../components/QuickContacts';

export const HomeView = ({
  balance,
  transactions,
  profile,
  onNavigate,
  onSelectTransaction,
  onSelectContact,
  onOpenScanner,
}) => {
  const [showBalance, setShowBalance] = useState(true);

  // Take top 4 recent transactions
  const recentTransactions = transactions.slice(0, 4);

  return (
    <div className="view-container home-view">
      {/* Wallet Balance Hero Card */}
      <section className="wallet-hero-card">
        <div className="card-top">
          <div className="wallet-title-row">
            <div className="wallet-badge">
              <Wallet size={15} />
              <span>Demo Wallet Balance</span>
            </div>
            <div className="wallet-header-actions">
              <button 
                className="btn-card-my-qr" 
                onClick={() => onNavigate('my-qr')}
                title="View My Demo QR Code"
              >
                <QrCode size={13} />
                <span>My QR</span>
              </button>
              <button 
                className="btn-eye-toggle" 
                onClick={() => setShowBalance(!showBalance)}
                aria-label={showBalance ? "Hide balance" : "Show balance"}
                title={showBalance ? "Hide balance" : "Show balance"}
              >
                {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="balance-display">
            {showBalance ? (
              <span className="balance-amount">{formatINR(balance)}</span>
            ) : (
              <span className="balance-hidden">••••••••</span>
            )}
            <span className="demo-tag">SIMULATION ONLY</span>
          </div>
        </div>

        <div className="card-divider"></div>

        <div className="card-bottom">
          <div className="bank-account-chip">
            <Building2 size={14} />
            <span>{profile.bankName} ({profile.accountNumber.slice(-4)})</span>
          </div>
          <button 
            className="btn-check-balance-link" 
            onClick={() => onNavigate('balance')}
          >
            <span>Check Balance</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </section>

      {/* Main UPI Action Grid */}
      <section className="quick-actions-section">
        <h2 className="sr-only">Quick Actions</h2>
        <div className="action-grid five-tiles">
          <button 
            className="action-tile primary"
            onClick={() => onNavigate('send')}
          >
            <div className="tile-icon-box send">
              <Send size={22} />
            </div>
            <span className="tile-title">Send Money</span>
            <span className="tile-sub">To Mobile/UPI</span>
          </button>

          <button 
            className="action-tile primary"
            onClick={() => onNavigate('receive')}
          >
            <div className="tile-icon-box receive">
              <ArrowDownLeft size={22} />
            </div>
            <span className="tile-title">Receive</span>
            <span className="tile-sub">Simulate Credit</span>
          </button>

          <button 
            className="action-tile my-qr-tile"
            onClick={() => onNavigate('my-qr')}
          >
            <div className="tile-icon-box my-qr">
              <QrCode size={22} />
            </div>
            <span className="tile-title">My QR</span>
            <span className="tile-sub">Show Code</span>
          </button>

          <button 
            className="action-tile"
            onClick={onOpenScanner}
          >
            <div className="tile-icon-box scan">
              <QrCode size={22} />
            </div>
            <span className="tile-title">Scan QR</span>
            <span className="tile-sub">Camera Scan</span>
          </button>

          <button 
            className="action-tile"
            onClick={() => onNavigate('balance')}
          >
            <div className="tile-icon-box balance">
              <Wallet size={22} />
            </div>
            <span className="tile-title">Check Balance</span>
            <span className="tile-sub">View Limits</span>
          </button>
        </div>
      </section>

      {/* Quick Demo Contacts */}
      <QuickContacts
        onSelectContact={onSelectContact}
        onNewContact={() => onNavigate('send')}
      />

      {/* Simulated UPI Features Banner */}
      <section className="promo-card">
        <div className="promo-icon">
          <Sparkles size={24} className="text-gold" />
        </div>
        <div className="promo-text">
          <h4>Safe Educational Sandbox</h4>
          <p>Practice simulated payments risk-free. No real banks or debit cards involved.</p>
        </div>
      </section>

      {/* Recent Transactions List */}
      <section className="recent-transactions-section">
        <div className="section-header">
          <div className="section-title-wrap">
            <History size={18} className="text-purple" />
            <h3 className="section-title">Recent Transactions</h3>
          </div>
          <button 
            className="btn-view-all" 
            onClick={() => onNavigate('history')}
          >
            <span>View All</span>
            <ChevronRight size={15} />
          </button>
        </div>

        <div className="transaction-list">
          {recentTransactions.length === 0 ? (
            <div className="empty-tx-placeholder">
              <p>No transactions yet</p>
            </div>
          ) : (
            recentTransactions.map((tx) => {
              const isSent = tx.type === 'sent';
              const dateObj = new Date(tx.timestamp);
              const timeFormatted = dateObj.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              });

              return (
                <div
                  key={tx.id}
                  className="tx-item-card"
                  onClick={() => onSelectTransaction(tx)}
                  role="button"
                  tabIndex={0}
                >
                  <div className={`tx-icon-bubble ${isSent ? 'sent' : 'received'}`}>
                    {isSent ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                  </div>

                  <div className="tx-details">
                    <span className="tx-party">{tx.recipient}</span>
                    <span className="tx-sub-info">
                      {dateObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} • {timeFormatted}
                    </span>
                  </div>

                  <div className="tx-amount-col">
                    <span className={`tx-value ${isSent ? 'sent' : 'received'}`}>
                      {isSent ? '- ' : '+ '}
                      {formatINR(tx.amount)}
                    </span>
                    <span className="tx-status-badge">Demo</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};
