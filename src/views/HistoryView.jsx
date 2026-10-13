import React, { useState, useMemo } from 'react';
import { 
  Search, ArrowUpRight, ArrowDownLeft, Filter, 
  Calendar, FileText, ChevronRight, X, ShieldCheck
} from 'lucide-react';
import { formatINR } from '../utils/storage';

export const HistoryView = ({ transactions, onSelectTransaction }) => {
  const [filterType, setFilterType] = useState('all'); // 'all' | 'sent' | 'received'
  const [searchQuery, setSearchQuery] = useState('');

  // Filter & Search logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type filter
      if (filterType !== 'all' && tx.type !== filterType) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = tx.recipient?.toLowerCase().includes(query);
        const matchesUpi = tx.upiId?.toLowerCase().includes(query);
        const matchesId = tx.id?.toLowerCase().includes(query);
        const matchesNote = tx.note?.toLowerCase().includes(query);
        const matchesCategory = tx.category?.toLowerCase().includes(query);
        return matchesName || matchesUpi || matchesId || matchesNote || matchesCategory;
      }

      return true;
    });
  }, [transactions, filterType, searchQuery]);

  return (
    <div className="view-container history-view">
      <div className="history-top-header">
        <h2>Transaction History</h2>
        <span className="history-counter">
          {filteredTransactions.length} demo records
        </span>
      </div>

      {/* Persistent Disclaimer */}
      <div className="history-simulation-badge">
        <ShieldCheck size={14} />
        <span>All entries are simulated demo records</span>
      </div>

      {/* Search Input Bar */}
      <div className="search-bar-wrap">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search by name, UPI ID, or Txn ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            className="clear-search-btn" 
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="filter-pill-row">
        <button
          className={`filter-pill ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          All ({transactions.length})
        </button>
        <button
          className={`filter-pill ${filterType === 'sent' ? 'active' : ''}`}
          onClick={() => setFilterType('sent')}
        >
          Sent ({transactions.filter(t => t.type === 'sent').length})
        </button>
        <button
          className={`filter-pill ${filterType === 'received' ? 'active' : ''}`}
          onClick={() => setFilterType('received')}
        >
          Received ({transactions.filter(t => t.type === 'received').length})
        </button>
      </div>

      {/* Transaction List */}
      <div className="history-list">
        {filteredTransactions.length === 0 ? (
          <div className="empty-history-state">
            <FileText size={38} className="empty-icon" />
            <h3>No transactions found</h3>
            <p>Try adjusting your search query or filter selection.</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isSent = tx.type === 'sent';
            const dateObj = new Date(tx.timestamp);
            const dateStr = dateObj.toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });
            const timeStr = dateObj.toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            });

            return (
              <div
                key={tx.id}
                className="history-tx-card"
                onClick={() => onSelectTransaction(tx)}
                role="button"
                tabIndex={0}
              >
                <div className={`tx-icon-bubble ${isSent ? 'sent' : 'received'}`}>
                  {isSent ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                </div>

                <div className="history-card-middle">
                  <div className="history-party-line">
                    <span className="party-name">{tx.recipient}</span>
                    <span className="party-category-tag">{tx.category || 'General'}</span>
                  </div>

                  <div className="history-sub-line">
                    <span className="mono">{tx.upiId}</span>
                  </div>

                  <div className="history-timestamp-line">
                    <span>{dateStr} at {timeStr}</span>
                    <span className="dot">•</span>
                    <span className="mono txn-id-hint">{tx.id.slice(-8)}</span>
                  </div>
                </div>

                <div className="history-card-right">
                  <span className={`tx-value ${isSent ? 'sent' : 'received'}`}>
                    {isSent ? '- ' : '+ '}
                    {formatINR(tx.amount)}
                  </span>
                  <span className="tx-status-pill success">
                    {tx.status || 'Demo Success'}
                  </span>
                  <ChevronRight size={14} className="chevron-icon" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
