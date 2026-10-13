import React, { useState } from 'react';
import { 
  ArrowLeft, Copy, Check, Share2, ShieldAlert, 
  ArrowDownLeft, Sparkles, CheckCircle2, User, 
  DollarSign, FileText, ArrowRight, ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QRCodeCanvas } from 'qrcode.react';
import { formatINR, generateTxnId, generateRefId } from '../utils/storage';
import { soundEffects } from '../utils/audio';
import { generateDemoQrPayload } from '../utils/qrPayload';

export const ReceiveMoneyView = ({
  profile,
  balance,
  soundEnabled,
  onBack,
  onCompleteReceive,
  onViewReceipt,
}) => {
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [simulateAmount, setSimulateAmount] = useState('500');
  const [senderName, setSenderName] = useState('Ananya Sen');
  const [senderNote, setSenderNote] = useState('Dinner split & coffee');
  const [receivedTxn, setReceivedTxn] = useState(null);
  const [showSimulateDrawer, setShowSimulateDrawer] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const quickReceiveAmounts = [200, 500, 1000, 2500];

  const handleCopyUpi = () => {
    navigator.clipboard?.writeText(profile.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSimulateReceive = (e) => {
    e?.preventDefault();
    setErrorMessage('');

    const numAmount = parseFloat(simulateAmount);
    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Please enter a valid amount greater than ₹0.');
      return;
    }

    if (numAmount > 500000) {
      setErrorMessage('Maximum demo receive limit is ₹5,00,000.');
      return;
    }

    const trimmedSender = senderName.trim() || 'Demo Sender';
    const newTxn = {
      id: generateTxnId(),
      refNo: generateRefId(),
      type: 'received',
      title: `From ${trimmedSender}`,
      subtitle: senderNote || 'Demo UPI credit',
      recipient: trimmedSender,
      upiId: `${trimmedSender.toLowerCase().replace(/[^a-z0-9]/g, '') || 'sender'}@okaxis`,
      phone: '+91 98334 22110',
      amount: numAmount,
      timestamp: new Date().toISOString(),
      status: 'Demo Success',
      note: senderNote || 'Simulated incoming UPI payment',
      category: 'Income',
    };

    onCompleteReceive(newTxn, numAmount);
    setReceivedTxn(newTxn);

    // Audio chime
    if (soundEnabled) {
      soundEffects.playSuccess();
    }

    // Confetti
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06D6A0', '#10B981', '#FFD166', '#7B2CBF'],
      });
    } catch (e) {
      // Ignore
    }
  };

  // SUCCESS STATE
  if (receivedTxn) {
    return (
      <div className="view-container success-view">
        <div className="success-hero-card received">
          <div className="success-badge-circle received">
            <CheckCircle2 size={48} className="text-white" />
          </div>
          <h2 className="success-title">Payment Received</h2>
          <div className="simulation-pill">
            <ShieldCheck size={14} />
            <span>DEMO ONLY • LOCAL SIMULATION</span>
          </div>

          <div className="success-amount received-amount">
            + {formatINR(receivedTxn.amount)}
          </div>

          <p className="success-to">
            Received from <strong>{receivedTxn.recipient}</strong>
          </p>

          <div className="success-meta-box">
            <div className="meta-line">
              <span>Demo Txn ID:</span>
              <strong className="mono">{receivedTxn.id}</strong>
            </div>
            <div className="meta-line">
              <span>New Demo Balance:</span>
              <strong className="text-green">{formatINR(balance)}</strong>
            </div>
          </div>
        </div>

        <div className="success-actions">
          <button 
            className="btn-primary-action" 
            onClick={() => onViewReceipt(receivedTxn)}
          >
            <FileText size={18} />
            <span>View Demo Receipt</span>
          </button>

          <button 
            className="btn-secondary-action" 
            onClick={() => setReceivedTxn(null)}
          >
            <span>Simulate Another</span>
          </button>

          <button 
            className="btn-text-action" 
            onClick={onBack}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-container receive-view">
      <div className="screen-header">
        <button className="btn-back" onClick={onBack} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h2>Receive Money (Demo)</h2>
      </div>

      {/* Main QR Card */}
      <div className="receive-qr-card">
        <div className="qr-user-info">
          <h3 className="qr-user-name">{profile.name}</h3>
          <span className="qr-user-bank">{profile.bankName}</span>
        </div>

        {/* Real Scannable Demo QR Code */}
        <div className="qr-display-box my-qr-canvas-wrapper" style={{ padding: '12px', background: '#FFF', borderRadius: '16px' }}>
          <QRCodeCanvas
            value={generateDemoQrPayload(profile)}
            size={190}
            level="H"
            marginSize={2}
            imageSettings={{
              src: '/favicon.svg',
              height: 36,
              width: 36,
              excavate: true,
            }}
          />
        </div>

        {/* Copy UPI Address Strip */}
        <div className="shareable-address-strip">
          <div className="upi-id-box">
            <span className="label">UPI ID:</span>
            <span className="val mono">{profile.upiId}</span>
          </div>
          <button 
            className="btn-copy-upi" 
            onClick={handleCopyUpi}
            title="Copy UPI Address"
          >
            {copiedUpi ? <Check size={16} className="text-green" /> : <Copy size={16} />}
            <span>{copiedUpi ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        {/* Vital Safety Disclaimer */}
        <div className="qr-safety-disclaimer">
          <ShieldAlert size={15} />
          <span>Demo QR for simulation only. Cannot be scanned by real banking apps.</span>
        </div>
      </div>

      {/* Interactive Simulation Drawer / Card */}
      <div className="simulate-receive-card">
        <div className="simulate-card-header">
          <div className="simulate-badge">
            <Sparkles size={16} className="text-gold" />
            <h3>Simulate Receiving Funds</h3>
          </div>
          <p className="simulate-desc">
            Test incoming UPI transfers and see your demo balance increase immediately.
          </p>
        </div>

        <form onSubmit={handleSimulateReceive} className="simulate-form">
          <div className="form-group">
            <label className="form-label" htmlFor="sender-name">
              <User size={14} /> Simulated Sender Name
            </label>
            <input
              id="sender-name"
              type="text"
              className="text-input"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="e.g. Ananya Sen"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="receive-amount">
              Amount to Receive (₹)
            </label>
            <div className="amount-input-wrap">
              <span className="rupee-prefix">₹</span>
              <input
                id="receive-amount"
                type="number"
                min="1"
                step="any"
                className="amount-input"
                value={simulateAmount}
                onChange={(e) => setSimulateAmount(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Quick presets */}
          <div className="quick-chips-row">
            {quickReceiveAmounts.map((amt) => (
              <button
                type="button"
                key={amt}
                className={`chip-btn ${simulateAmount === amt.toString() ? 'active' : ''}`}
                onClick={() => setSimulateAmount(amt.toString())}
              >
                +₹{amt}
              </button>
            ))}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="receive-note">
              Payment Remarks / Note
            </label>
            <input
              id="receive-note"
              type="text"
              className="text-input"
              value={senderNote}
              onChange={(e) => setSenderNote(e.target.value)}
              placeholder="e.g. Reimbursement, Freelance gift"
            />
          </div>

          {errorMessage && (
            <div className="error-alert">
              <span>{errorMessage}</span>
            </div>
          )}

          <button type="submit" className="btn-simulate-receive">
            <ArrowDownLeft size={18} />
            <span>Simulate Receive (+{formatINR(parseFloat(simulateAmount) || 0)})</span>
          </button>
        </form>
      </div>
    </div>
  );
};
