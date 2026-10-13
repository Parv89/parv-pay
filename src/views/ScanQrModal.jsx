import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Camera, CameraOff, Upload, Zap, Store, 
  Coffee, ShoppingBag, ArrowRight, AlertCircle, 
  CheckCircle2, RefreshCw, KeyRound, ShieldAlert,
  UserCheck
} from 'lucide-react';
import jsQR from 'jsqr';
import { parseAndValidateDemoQr } from '../utils/qrPayload';

export const ScanQrModal = ({ onClose, onScannedTarget }) => {
  // Camera state: 'initializing' | 'active' | 'denied' | 'unavailable'
  const [cameraStatus, setCameraStatus] = useState('initializing');
  const [errorMessage, setErrorMessage] = useState('');
  const [scanValidationBanner, setScanValidationBanner] = useState(null);
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'manual'

  // Manual Demo ID form
  const [manualName, setManualName] = useState('');
  const [manualId, setManualId] = useState('');
  const [manualAmount, setManualAmount] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanCanvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const fileInputRef = useRef(null);
  const isScanningRef = useRef(true);

  // Quick simulation demo targets
  const demoQrs = [
    { name: 'Sharma General Store', upiId: 'sharma.store@okupi', amount: 180, icon: Store, note: 'Daily Essentials' },
    { name: 'Chai & Samosa Corner', upiId: 'chaicorner@paytm', amount: 45, icon: Coffee, note: 'Evening Snacks' },
    { name: 'Fresh Mart Supermarket', upiId: 'freshmart@icici', amount: 560, icon: ShoppingBag, note: 'Weekly Grocery' },
    { name: 'Priya Verma', upiId: 'priya.verma@axisbank', amount: 350, icon: UserCheck, note: 'Weekend Split' },
  ];

  // Stop camera tracks helper
  const stopCameraStream = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Start phone camera with permission handling
  const startCamera = async () => {
    stopCameraStream();
    setErrorMessage('');
    setScanValidationBanner(null);
    setCameraStatus('initializing');
    isScanningRef.current = true;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraStatus('unavailable');
      setErrorMessage('Camera access is not supported by this browser. You can upload a QR image or enter a Demo ID manually.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 640 } },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Critical for iOS Safari & Android
        await videoRef.current.play();
        setCameraStatus('active');
        requestAnimationFrame(tickScan);
      }
    } catch (err) {
      console.warn('Camera access failed:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraStatus('denied');
        setErrorMessage('Camera permission was denied. Please allow camera access in browser settings, or upload a QR image below.');
      } else {
        setCameraStatus('unavailable');
        setErrorMessage('No camera found or camera is currently busy. You can upload a QR image or enter a Demo ID manually.');
      }
    }
  };

  // Continuous frame scanner using jsQR
  const tickScan = () => {
    if (!isScanningRef.current) return;

    const video = videoRef.current;
    if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
      if (!scanCanvasRef.current) {
        scanCanvasRef.current = document.createElement('canvas');
      }
      const canvas = scanCanvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        handleRawDecodedData(code.data);
        return; // Pause scanning while evaluating
      }
    }

    animationFrameRef.current = requestAnimationFrame(tickScan);
  };

  // Evaluate decoded QR content
  const handleRawDecodedData = (rawText) => {
    const validation = parseAndValidateDemoQr(rawText);

    if (validation.valid && validation.data) {
      isScanningRef.current = false;
      stopCameraStream();

      // Haptic feedback if available
      try {
        navigator.vibrate?.(100);
      } catch (e) {}

      // Pass recipient and proceed to simulated payment
      onScannedTarget({
        name: validation.data.name,
        upiId: validation.data.upiId,
        phone: validation.data.phone,
        amount: validation.data.amount,
        note: validation.data.note,
      });
      onClose();
    } else {
      // Rejection of invalid / unsupported / real UPI codes
      setScanValidationBanner(validation.error || 'Invalid or unrecognized QR code format.');
      // Resume scanning after 2.5 seconds
      setTimeout(() => {
        setScanValidationBanner(null);
        if (cameraStatus === 'active') {
          animationFrameRef.current = requestAnimationFrame(tickScan);
        }
      }, 2800);
    }
  };

  // Image Upload Scanner
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, img.width, img.height);

        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          handleRawDecodedData(code.data);
        } else {
          setScanValidationBanner('No QR code detected in the selected image. Please try a clearer picture.');
          setTimeout(() => setScanValidationBanner(null), 3000);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  // Manual Demo ID Form Submit
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualId.trim() && !manualName.trim()) {
      setErrorMessage('Please enter a recipient name or Demo UPI ID.');
      return;
    }

    const trimmedId = manualId.trim() || `${manualName.toLowerCase().replace(/[^a-z0-9]/g, '')}@okparv`;
    onScannedTarget({
      name: manualName.trim() || 'Demo Recipient',
      upiId: trimmedId,
      amount: manualAmount ? parseFloat(manualAmount) : undefined,
      note: 'Payment via Manual Demo ID',
    });
    onClose();
  };

  // Simulate quick merchant click
  const handleQuickSimulate = (qr) => {
    stopCameraStream();
    onScannedTarget(qr);
    onClose();
  };

  // Lifecycle
  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCameraStream();
    }

    return () => {
      stopCameraStream();
    };
  }, [activeTab]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="scanner-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div className="scanner-header">
          <div className="scanner-title-box">
            <h3>Scan Parv Pay Demo QR</h3>
            <span className="scanner-subtitle">Real-time Browser QR Scanner</span>
          </div>
          <button className="icon-btn-close light" onClick={onClose} aria-label="Close scanner">
            <X size={20} />
          </button>
        </div>

        {/* Tab switcher: Camera vs Manual Entry */}
        <div className="scanner-tab-bar">
          <button 
            className={`scanner-tab-btn ${activeTab === 'camera' ? 'active' : ''}`}
            onClick={() => setActiveTab('camera')}
          >
            <Camera size={16} />
            <span>Scan Camera</span>
          </button>
          <button 
            className={`scanner-tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
            onClick={() => setActiveTab('manual')}
          >
            <KeyRound size={16} />
            <span>Manual Demo ID</span>
          </button>
        </div>

        {/* Validation Rejection Alert */}
        {scanValidationBanner && (
          <div className="scanner-validation-alert">
            <ShieldAlert size={18} className="text-amber" />
            <div className="alert-content">
              <strong>QR REJECTED</strong>
              <p>{scanValidationBanner}</p>
            </div>
          </div>
        )}

        {/* CAMERA VIEW TAB */}
        {activeTab === 'camera' && (
          <>
            {/* Viewfinder or Fallback */}
            <div className="viewfinder-container">
              {cameraStatus === 'active' ? (
                <div className="viewfinder-frame camera-active">
                  <video ref={videoRef} className="camera-video-stream" />
                  
                  {/* Corner styling */}
                  <div className="corner-bracket top-left"></div>
                  <div className="corner-bracket top-right"></div>
                  <div className="corner-bracket bottom-left"></div>
                  <div className="corner-bracket bottom-right"></div>

                  <div className="scanning-laser"></div>

                  <div className="viewfinder-overlay-tag">
                    <span>Align Parv Pay Demo QR</span>
                  </div>
                </div>
              ) : (
                <div className="viewfinder-frame camera-fallback">
                  <CameraOff size={38} className="camera-fallback-icon" />
                  <span className="fallback-title">
                    {cameraStatus === 'denied' ? 'Camera Permission Denied' : 'Camera Unavailable'}
                  </span>
                  <p className="fallback-desc">
                    {errorMessage || 'Cannot access camera video stream.'}
                  </p>
                  
                  <div className="fallback-actions">
                    <button 
                      className="btn-retry-camera" 
                      onClick={startCamera}
                    >
                      <RefreshCw size={14} />
                      <span>Retry Camera</span>
                    </button>
                    <button 
                      className="btn-switch-upload"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={14} />
                      <span>Upload QR File</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Hidden File Input for Image Scanning */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageFileChange}
            />

            {/* Quick Upload from Gallery Trigger */}
            <div className="scanner-gallery-row">
              <button 
                className="btn-gallery-upload"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={16} />
                <span>Upload QR Image from Device / Gallery</span>
              </button>
            </div>
          </>
        )}

        {/* MANUAL ENTRY TAB */}
        {activeTab === 'manual' && (
          <form onSubmit={handleManualSubmit} className="manual-scan-form">
            <div className="manual-form-group">
              <label htmlFor="manual-name">Recipient Name</label>
              <input
                id="manual-name"
                type="text"
                placeholder="e.g. Aarav Sharma"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                required
              />
            </div>

            <div className="manual-form-group">
              <label htmlFor="manual-id">Demo UPI ID</label>
              <input
                id="manual-id"
                type="text"
                placeholder="e.g. aarav@okparv or priya@axisbank"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                className="mono"
              />
            </div>

            <div className="manual-form-group">
              <label htmlFor="manual-amount">Amount (Optional)</label>
              <input
                id="manual-amount"
                type="number"
                min="1"
                placeholder="Leave blank to enter on next screen"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-manual-proceed">
              <span>Proceed to Payment</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* Quick Demo Target Chips for 1-Tap Simulation */}
        <div className="mock-qr-targets">
          <div className="targets-header">
            <Zap size={14} />
            <span>Simulate Scanning Demo QR Codes:</span>
          </div>
          <div className="targets-list">
            {demoQrs.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  className="target-item-btn"
                  onClick={() => handleQuickSimulate(item)}
                >
                  <div className="target-icon-wrap">
                    <Icon size={16} />
                  </div>
                  <div className="target-info">
                    <span className="target-name">{item.name}</span>
                    <span className="target-upi">{item.upiId} {item.amount ? `• ₹${item.amount}` : ''}</span>
                  </div>
                  <ArrowRight size={15} className="target-arrow" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Close Button */}
        <div className="scanner-footer">
          <button className="btn-cancel-scanner" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
