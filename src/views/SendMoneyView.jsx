import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Send, ShieldCheck, CheckCircle2, 
  AlertCircle, Sparkles, Building2, User, Phone, 
  CreditCard, FileText, ArrowRight, RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatINR, generateTxnId, generateRefId } from '../utils/storage';
import { soundEffects } from '../utils/audio';
import { UpiPinModal } from '../components/UpiPinModal';

export const SendMoneyView = ({
  balance,
  prefilledTarget,
  soundEnabled,
  onBack,
  onCompletePayment,
  onViewReceipt,
}) => {
  // Input fields
  const [recipient, setRecipient] = useState('');
  const [upiId, setUpiId] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('Transfer');

  // Flow states: 'input' | 'confirm' | 'pin' | 'success'
  const [flowStep, setFlowStep] = useState('input');
  const [errorMessage, setErrorMessage] = useState('');
  const [createdTxn, setCreatedTxn] = useState(null);

  // Quick amount chips
  const quickAmounts = [100, 250, 500, 1000, 2000];

  // Prefill if target passed from Quick Contacts or QR Scanner
  useEffect(() => {
    if (prefilledTarget) {
      if (prefilledTarget.name) setRecipient(prefilledTarget.name);
      if (prefilledTarget.upiId) setUpiId(prefilledTarget.upiId);
      if (prefilledTarget.phone) setPhone(prefilledTarget.phone);
      if (prefilledTarget.amount) setAmount(prefilledTarget.amount.toString());
      if (prefilledTarget.note) setNote(prefilledTarget.note);
    }
  }, [prefilledTarget]);

  const handleValidateAndReview = (e) => {
    e?.preventDefault();
    setErrorMessage('');

    const trimmedRecipient = recipient.trim();
    const trimmedUpi = upiId.trim();
    const numAmount = parseFloat(amount);

    if (!trimmedRecipient && !trimmedUpi) {
      setErrorMessage('Please enter a recipient name or UPI ID.');
      return;
    }

    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Please enter a valid amount greater than ₹0.');
      return;
    }

    if (numAmount > balance) {
      setErrorMessage(
        `Insufficient demo balance! You have ${formatINR(balance)}, cannot send ${formatINR(numAmount)}.`
      );
      return;
    }

    if (numAmount > 100000) {
      setErrorMessage('Demo maximum limit is ₹1,00,000 per transaction.');
      return;
    }

    // Auto-generate realistic demo UPI ID if not typed
    if (!trimmedUpi) {
      const sanitizedName = trimmedRecipient.toLowerCase().replace(/[^a-z0-9]/g, '');
      setUpiId(`${sanitizedName || 'user'}@okparv`);
    }

    setFlowStep('confirm');
  };

  const handleProceedToAuth = () => {
    setFlowStep('pin');
  };

  const executePaymentSimulation = () => {
    const numAmount = parseFloat(amount);
    const newTxn = {
      id: generateTxnId(),
      refNo: generateRefId(),
      type: 'sent',
      title: recipient || upiId,
      subtitle: note || 'Demo payment via Parv Pay',
      recipient: recipient || upiId,
      upiId: upiId || 'recipient@okparv',
      phone: phone || '',
      amount: numAmount,
      timestamp: new Date().toISOString(),
      status: 'Demo Success',
      note: note || 'Demo payment',
      category: category || 'Transfer',
    };

    // Update parent state and localStorage
    onCompletePayment(newTxn, numAmount);
    setCreatedTxn(newTxn);
    setFlowStep('success');

    // Trigger sound
    if (soundEnabled) {
      soundEffects.playSuccess();
    }

    // Trigger Confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#7B2CBF', '#9D4EDD', '#FFD166', '#06D6A0', '#4CC9F0'],
      });
    } catch (e) {
      // Ignore if canvas not supported
    }
  };

  // SUCCESS STATE
  if (flowStep === 'success' && createdTxn) {
    return (
      <div className="view-container success-view">
        <div className="success-hero-card">
          <div className="success-badge-circle">
            <CheckCircle2 size={48} className="text-white" />
          </div>
          <h2 className="success-title">Payment Successful</h2>
          <div className="simulation-pill">
            <ShieldCheck size={14} />
            <span>DEMO ONLY • NO REAL MONEY MOVED</span>
          </div>

          <div className="success-amount">
            {formatINR(createdTxn.amount)}
          </div>

          <p className="success-to">
            Sent to <strong>{createdTxn.recipient}</strong>
          </p>

          <div className="success-meta-box">
            <div className="meta-line">
              <span>UPI ID:</span>
              <strong className="mono">{createdTxn.upiId}</strong>
            </div>
            <div className="meta-line">
              <span>Demo Txn ID:</span>
              <strong className="mono">{createdTxn.id}</strong>
            </div>
            <div className="meta-line">
              <span>Remaining Demo Balance:</span>
              <strong className="text-purple">{formatINR(balance)}</strong>
            </div>
          </div>
        </div>

        <div className="success-actions">
          <button 
            className="btn-primary-action" 
            onClick={() => onViewReceipt(createdTxn)}
          >
            <FileText size={18} />
            <span>View Demo Receipt</span>
          </button>

          <button 
            className="btn-secondary-action" 
            onClick={onBack}
          >
            <span>Done / Return Home</span>
          </button>
        </div>
      </div>
    );
  }

  // CONFIRMATION STEP
  if (flowStep === 'confirm') {
    return (
      <div className="view-container confirm-view">
        <div className="screen-header">
          <button className="btn-back" onClick={() => setFlowStep('input')} aria-label="Back">
            <ArrowLeft size={20} />
          </button>
          <h2>Confirm Demo Payment</h2>
        </div>

        <div className="confirm-card">
          <div className="confirm-watermark-tag">
            <ShieldCheck size={14} />
            <span>DEMO SIMULATION REVIEW</span>
          </div>

          <div className="confirm-amount-display">
            <span className="currency-symbol">₹</span>
            <span className="confirm-amount-number">{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="confirm-recipient-box">
            <div className="confirm-avatar">
              {(recipient || upiId).charAt(0).toUpperCase()}
            </div>
            <div className="confirm-user-info">
              <span className="confirm-payee-label">Paying To</span>
              <h3 className="confirm-payee-name">{recipient || 'Demo Recipient'}</h3>
              <span className="confirm-payee-upi mono">{upiId}</span>
              {phone && <span className="confirm-payee-phone">{phone}</span>}
            </div>
          </div>

          <div className="confirm-details-list">
            <div className="detail-row">
              <span className="detail-key">Debited From</span>
              <span className="detail-val">Parv Demo Wallet</span>
            </div>
            <div className="detail-row">
              <span className="detail-key">Current Demo Balance</span>
              <span className="detail-val">{formatINR(balance)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-key">Balance After Payment</span>
              <span className="detail-val text-amber">
                {formatINR(balance - parseFloat(amount))}
              </span>
            </div>
            {note && (
              <div className="detail-row">
                <span className="detail-key">Message / Note</span>
                <span className="detail-val">{note}</span>
              </div>
            )}
          </div>

          <div className="simulation-guarantee-note">
            <AlertCircle size={15} />
            <span>This is an educational simulation. No actual banking networks are involved.</span>
          </div>
        </div>

        <div className="confirm-footer">
          <button className="btn-primary-action" onClick={handleProceedToAuth}>
            <span>Simulate Payment Now</span>
            <ArrowRight size={18} />
          </button>
          <button className="btn-text-action" onClick={() => setFlowStep('input')}>
            Edit Payment Details
          </button>
        </div>

        {/* PIN pad modal trigger */}
        {flowStep === 'pin' && (
          <UpiPinModal
            amount={parseFloat(amount)}
            recipient={recipient || upiId}
            onAuthorize={executePaymentSimulation}
            onCancel={() => setFlowStep('confirm')}
          />
        )}
      </div>
    );
  }

  // DEFAULT STEP 1: INPUT FORM
  return (
    <div className="view-container send-view">
      <div className="screen-header">
        <button className="btn-back" onClick={onBack} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h2>Send Money (Demo)</h2>
      </div>

      <div className="available-balance-pill">
        <span>Available Demo Balance:</span>
        <strong>{formatINR(balance)}</strong>
      </div>

      <form className="send-form" onSubmit={handleValidateAndReview}>
        {/* Recipient Input */}
        <div className="form-group">
          <label className="form-label" htmlFor="recipient-input">
            <User size={15} /> Recipient Name or Mobile Number
          </label>
          <input
            id="recipient-input"
            type="text"
            className="text-input"
            placeholder="e.g. Aarav Sharma or 9876543210"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
            autoFocus
          />
        </div>

        {/* UPI ID Input */}
        <div className="form-group">
          <label className="form-label" htmlFor="upi-input">
            <CreditCard size={15} /> Demo UPI ID (Optional)
          </label>
          <input
            id="upi-input"
            type="text"
            className="text-input mono"
            placeholder="e.g. aarav@okparv or priya@upi"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
          />
          <span className="input-hint">Will auto-generate demo ID if left empty</span>
        </div>

        {/* Amount Input */}
        <div className="form-group">
          <label className="form-label" htmlFor="amount-input">
            Enter Amount (₹)
          </label>
          <div className="amount-input-wrap">
            <span className="rupee-prefix">₹</span>
            <input
              id="amount-input"
              type="number"
              min="1"
              max={balance}
              step="any"
              className="amount-input"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Quick Amount Chips */}
        <div className="quick-chips-row">
          {quickAmounts.map((q) => (
            <button
              type="button"
              key={q}
              className={`chip-btn ${amount === q.toString() ? 'active' : ''}`}
              onClick={() => setAmount(q.toString())}
            >
              +₹{q}
            </button>
          ))}
        </div>

        {/* Note / Remarks */}
        <div className="form-group">
          <label className="form-label" htmlFor="note-input">
            <FileText size={15} /> Add a Note (Optional)
          </label>
          <input
            id="note-input"
            type="text"
            className="text-input"
            placeholder="e.g. Dinner, Coffee, Rent share"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={40}
          />
        </div>

        {/* Validation Error Message */}
        {errorMessage && (
          <div className="error-alert">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn-primary-action">
            <Send size={18} />
            <span>Proceed to Review</span>
          </button>
        </div>
      </form>

      {/* Safety Notice */}
      <div className="form-disclaimer">
        <ShieldCheck size={14} />
        <span>Safe Demo Simulation • Local browser storage only</span>
      </div>
    </div>
  );
};
