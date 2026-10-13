import React, { useState } from 'react';
import { 
  X, CheckCircle2, Copy, Check, Share2, 
  ArrowUpRight, ArrowDownLeft, ShieldCheck, 
  FileText, CornerDownRight, RotateCcw
} from 'lucide-react';
import { formatINR } from '../utils/storage';

export const TransactionReceiptModal = ({ txn, onClose, onRepeatPay }) => {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  if (!txn) return null;

  const isSent = txn.type === 'sent';
  const formattedDate = new Date(txn.timestamp).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const handleCopy = (text, type) => {
    navigator.clipboard?.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const handleShare = () => {
    const receiptText = `[DEMO RECEIPT - PARV PAY]\n${isSent ? 'Sent to' : 'Received from'}: ${txn.recipient}\nAmount: ${formatINR(txn.amount)}\nTxn ID: ${txn.id}\nDate: ${formattedDate}\nSTATUS: DEMO SUCCESS (SIMULATED - NO REAL MONEY MOVED)`;
    if (navigator.share) {
      navigator.share({
        title: 'Parv Pay Demo Receipt',
        text: receiptText,
      }).catch(() => {
        navigator.clipboard?.writeText(receiptText);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2500);
      });
    } else {
      navigator.clipboard?.writeText(receiptText);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="receipt-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Top Handle / Close */}
        <div className="receipt-header">
          <div className="receipt-brand-badge">
            <span className="brand-dot"></span>
            <span>Parv Pay Demo Receipt</span>
          </div>
          <button className="icon-btn-close" onClick={onClose} aria-label="Close receipt">
            <X size={20} />
          </button>
        </div>

        {/* Mandatory Watermark / Notice */}
        <div className="simulation-notice-badge">
          <ShieldCheck size={16} />
          <span>SIMULATED TRANSACTION — NO REAL MONEY MOVED</span>
        </div>

        {/* Main Status Block */}
        <div className="receipt-hero">
          <div className={`receipt-icon-circle ${isSent ? 'sent' : 'received'}`}>
            <CheckCircle2 size={36} className="text-white" />
          </div>
          <h2 className="receipt-status-title">
            {isSent ? 'Payment Successful' : 'Payment Received'}
          </h2>
          <span className="receipt-status-sub">DEMO ONLY • LOCAL SIMULATION</span>
          <div className={`receipt-amount ${isSent ? 'sent-amount' : 'received-amount'}`}>
            {isSent ? '- ' : '+ '}
            {formatINR(txn.amount)}
          </div>
          <p className="receipt-counterparty">
            {isSent ? 'Paid to' : 'Received from'} <strong>{txn.recipient}</strong>
          </p>
        </div>

        {/* Tear-line effect */}
        <div className="receipt-tear">
          <div className="tear-cutout left"></div>
          <div className="tear-line"></div>
          <div className="tear-cutout right"></div>
        </div>

        {/* Breakdown Details */}
        <div className="receipt-details">
          <div className="receipt-row">
            <span className="receipt-label">UPI ID</span>
            <span className="receipt-val mono">{txn.upiId || 'demo@upi'}</span>
          </div>

          {txn.phone && (
            <div className="receipt-row">
              <span className="receipt-label">Mobile Number</span>
              <span className="receipt-val">{txn.phone}</span>
            </div>
          )}

          {txn.note && (
            <div className="receipt-row">
              <span className="receipt-label">Note / Message</span>
              <span className="receipt-val">{txn.note}</span>
            </div>
          )}

          <div className="receipt-row">
            <span className="receipt-label">Date & Time</span>
            <span className="receipt-val">{formattedDate}</span>
          </div>

          <div className="receipt-row">
            <span className="receipt-label">Demo Transaction ID</span>
            <div className="receipt-copy-val">
              <span className="mono">{txn.id}</span>
              <button 
                className="btn-tiny-copy" 
                onClick={() => handleCopy(txn.id, 'id')}
                title="Copy Transaction ID"
              >
                {copiedId ? <Check size={14} className="text-green" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div className="receipt-row">
            <span className="receipt-label">UPI Ref / UTR</span>
            <div className="receipt-copy-val">
              <span className="mono">{txn.refNo || '428901849201'}</span>
              <button 
                className="btn-tiny-copy" 
                onClick={() => handleCopy(txn.refNo || '428901849201', 'ref')}
                title="Copy Reference"
              >
                {copiedRef ? <Check size={14} className="text-green" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div className="receipt-row">
            <span className="receipt-label">
              {isSent ? 'Debited From' : 'Credited To'}
            </span>
            <span className="receipt-val">Parv Demo Wallet (Local Storage)</span>
          </div>

          <div className="receipt-row">
            <span className="receipt-label">Category</span>
            <span className="category-pill">{txn.category || 'General'}</span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="receipt-footer-actions">
          <button className="btn-secondary-action" onClick={handleShare}>
            <Share2 size={16} />
            <span>Share Receipt</span>
          </button>

          {isSent && onRepeatPay && (
            <button 
              className="btn-primary-action" 
              onClick={() => {
                onClose();
                onRepeatPay(txn);
              }}
            >
              <RotateCcw size={16} />
              <span>Pay Again</span>
            </button>
          )}

          {!isSent && (
            <button className="btn-primary-action" onClick={onClose}>
              <span>Done</span>
            </button>
          )}
        </div>

        {shareToast && (
          <div className="toast-pill">
            <Check size={14} /> Receipt text copied to clipboard!
          </div>
        )}
      </div>
    </div>
  );
};
