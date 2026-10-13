import React, { useRef, useState, useMemo } from 'react';
import { 
  ArrowLeft, Download, Share2, Copy, Check, 
  ShieldAlert, Sparkles, Building2, User, RefreshCw, 
  CheckCircle2, Info
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { generateDemoQrPayload } from '../utils/qrPayload';

export const MyQrView = ({ profile, onBack, onShowToast }) => {
  const canvasRef = useRef(null);
  const [copiedId, setCopiedId] = useState(false);
  const [qrKey, setQrKey] = useState(Date.now()); // For refreshing payment reference

  // Generate QR payload containing app name 'Parv Pay', demo user ID, and unique demo payment reference
  const qrPayload = useMemo(() => {
    return generateDemoQrPayload(profile);
  }, [profile, qrKey]);

  // Extract reference number for UI display
  const demoRefNumber = useMemo(() => {
    try {
      const parsed = JSON.parse(qrPayload);
      return parsed.demoRef;
    } catch {
      return 'DEMO-REF-PARV';
    }
  }, [qrPayload]);

  const handleCopyDemoId = () => {
    navigator.clipboard?.writeText(profile.upiId);
    setCopiedId(true);
    if (onShowToast) onShowToast('Demo UPI ID copied to clipboard!');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleDownloadPng = () => {
    try {
      const sourceCanvas = canvasRef.current;
      if (!sourceCanvas) return;

      // Create a higher-resolution branded image with header and disclaimers
      const exportCanvas = document.createElement('canvas');
      const ctx = exportCanvas.getContext('2d');
      const width = 480;
      const height = 640;
      exportCanvas.width = width;
      exportCanvas.height = height;

      // Background - clean card with subtle border
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Top purple banner
      const grad = ctx.createLinearGradient(0, 0, width, 120);
      grad.addColorStop(0, '#5A189A');
      grad.addColorStop(1, '#3C096C');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, 130);

      // App Title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Parv Pay — Demo UPI', width / 2, 45);

      // User Name & ID
      ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillText(profile.name, width / 2, 80);
      ctx.fillStyle = '#FFD166';
      ctx.font = '14px monospace';
      ctx.fillText(profile.upiId, width / 2, 106);

      // Draw the QR Code in the center
      const qrSize = 300;
      const qrX = (width - qrSize) / 2;
      const qrY = 160;
      ctx.drawImage(sourceCanvas, qrX, qrY, qrSize, qrSize);

      // Brand labels below QR
      ctx.fillStyle = '#5A189A';
      ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PARV PAY — DEMO QR', width / 2, 495);

      ctx.fillStyle = '#D97706';
      ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillText('Not valid for real payments', width / 2, 525);

      // Unique reference & timestamp
      ctx.fillStyle = '#6B627E';
      ctx.font = '12px monospace';
      ctx.fillText(`Ref: ${demoRefNumber}`, width / 2, 555);

      ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillText('Simulated payment profile • Local browser storage only', width / 2, 585);

      // Download trigger
      const imageURL = exportCanvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `parvpay-demo-qr-${profile.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`;
      downloadLink.href = imageURL;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      if (onShowToast) onShowToast('Branded Demo QR PNG downloaded!');
    } catch (e) {
      console.error('Download QR failed:', e);
      if (onShowToast) onShowToast('Failed to download QR image.');
    }
  };

  const handleShareQr = async () => {
    const shareText = `Scan my Parv Pay Demo QR Code!\nName: ${profile.name}\nDemo ID: ${profile.upiId}\nRef: ${demoRefNumber}\n(SIMULATION ONLY: Not valid for real payments)`;

    if (navigator.share) {
      try {
        const sourceCanvas = canvasRef.current;
        if (sourceCanvas && navigator.canShare) {
          sourceCanvas.toBlob(async (blob) => {
            if (blob) {
              const file = new File([blob], 'parvpay-demo-qr.png', { type: 'image/png' });
              if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                  title: 'Parv Pay Demo QR',
                  text: shareText,
                  files: [file],
                });
                return;
              }
            }
            // Fallback to text share
            await navigator.share({
              title: 'Parv Pay Demo QR',
              text: shareText,
            });
          });
        } else {
          await navigator.share({
            title: 'Parv Pay Demo QR',
            text: shareText,
          });
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopyDemoId();
        }
      }
    } else {
      handleCopyDemoId();
    }
  };

  const handleRefreshRef = () => {
    setQrKey(Date.now());
    if (onShowToast) onShowToast('Generated new demo payment reference!');
  };

  return (
    <div className="view-container my-qr-view">
      {/* Header */}
      <div className="screen-header">
        <button className="btn-back" onClick={onBack} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h2>My QR Code</h2>
        <button 
          className="btn-icon-refresh" 
          onClick={handleRefreshRef}
          title="Regenerate Reference"
          aria-label="Refresh QR reference"
        >
          <RefreshCw size={17} />
        </button>
      </div>

      {/* Main QR Card */}
      <div className="my-qr-card">
        {/* User Profile Header */}
        <div className="my-qr-user-header">
          <div className="my-qr-avatar">
            {profile.name.charAt(0)}
          </div>
          <div className="my-qr-user-text">
            <h3 className="my-qr-user-name">{profile.name}</h3>
            <span className="my-qr-bank-tag">
              <Building2 size={13} />
              <span>{profile.bankName}</span>
            </span>
          </div>
        </div>

        {/* The Real Scannable QR Code Canvas */}
        <div className="my-qr-canvas-wrapper">
          <QRCodeCanvas
            ref={canvasRef}
            value={qrPayload}
            size={220}
            level="H" // High error correction level (30%) guarantees scannability with center logo
            marginSize={2}
            imageSettings={{
              src: '/favicon.svg',
              height: 42,
              width: 42,
              excavate: true,
            }}
          />
        </div>

        {/* Required Mandatory Labels */}
        <div className="my-qr-labels-block">
          <div className="my-qr-brand-label">
            PARV PAY — DEMO QR
          </div>
          <div className="my-qr-safety-warning">
            Not valid for real payments
          </div>
        </div>

        {/* Demo Reference & ID info */}
        <div className="my-qr-id-strip">
          <div className="my-qr-id-row">
            <span className="label">Demo ID:</span>
            <span className="val mono">{profile.upiId}</span>
          </div>
          <div className="my-qr-id-row sub">
            <span className="label">Ref:</span>
            <span className="val mono">{demoRefNumber}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons: Download PNG, Share QR, Copy Demo ID */}
      <div className="my-qr-actions-row">
        <button className="btn-qr-action" onClick={handleDownloadPng}>
          <div className="qr-action-icon download">
            <Download size={20} />
          </div>
          <span className="qr-action-text">Download QR</span>
        </button>

        <button className="btn-qr-action" onClick={handleShareQr}>
          <div className="qr-action-icon share">
            <Share2 size={20} />
          </div>
          <span className="qr-action-text">Share QR</span>
        </button>

        <button className="btn-qr-action" onClick={handleCopyDemoId}>
          <div className="qr-action-icon copy">
            {copiedId ? <Check size={20} className="text-green" /> : <Copy size={20} />}
          </div>
          <span className="qr-action-text">{copiedId ? 'Copied!' : 'Copy ID'}</span>
        </button>
      </div>

      {/* Educational Information Card */}
      <div className="my-qr-info-card">
        <div className="info-card-header">
          <Info size={16} className="text-purple" />
          <strong>How this Demo QR works</strong>
        </div>
        <ul>
          <li>Encodes your simulated profile (*{profile.name}* & *{profile.upiId}*).</li>
          <li>Can be scanned by other devices using Parv Pay's **Scan QR** feature or uploaded as an image.</li>
          <li>Rejects real UPI transactions and prevents real-world money movement.</li>
        </ul>
      </div>
    </div>
  );
};
