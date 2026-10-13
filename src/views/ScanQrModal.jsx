import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Camera, CameraOff, Upload, Zap, Store, 
  Coffee, ShoppingBag, ArrowRight, AlertCircle, 
  CheckCircle2, RefreshCw, KeyRound, ShieldAlert,
  UserCheck, Lock, Globe, StopCircle
} from 'lucide-react';
import jsQR from 'jsqr';
import { parseAndValidateDemoQr } from '../utils/qrPayload';

export const ScanQrModal = ({ onClose, onScannedTarget }) => {
  // Camera states: 'idle' | 'requesting' | 'active' | 'denied' | 'insecure_context' | 'unavailable' | 'busy' | 'stopped'
  const [cameraStatus, setCameraStatus] = useState('requesting');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [scanValidationBanner, setScanValidationBanner] = useState(null);
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'manual'

  // Manual Demo ID form state
  const [manualName, setManualName] = useState('');
  const [manualId, setManualId] = useState('');
  const [manualAmount, setManualAmount] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanCanvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const fileInputRef = useRef(null);
  const isScanningRef = useRef(false);

  // Quick simulation demo targets (allows instant 1-tap testing on any device)
  const demoQrs = [
    { name: 'Sharma General Store', upiId: 'sharma.store@okupi', amount: 180, icon: Store, note: 'Daily Essentials' },
    { name: 'Chai & Samosa Corner', upiId: 'chaicorner@paytm', amount: 45, icon: Coffee, note: 'Evening Snacks' },
    { name: 'Fresh Mart Supermarket', upiId: 'freshmart@icici', amount: 560, icon: ShoppingBag, note: 'Weekly Grocery' },
    { name: 'Priya Verma', upiId: 'priya.verma@axisbank', amount: 350, icon: UserCheck, note: 'Weekend Split' },
  ];

  // Stop every single track on the media stream and clear video ref
  const stopCameraStream = () => {
    isScanningRef.current = false;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      try {
        const tracks = streamRef.current.getTracks();
        tracks.forEach((track) => {
          track.stop();
        });
      } catch (e) {
        console.warn('Error stopping camera tracks:', e);
      }
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
  };

  // Check if current context is secure (HTTPS or localhost)
  const checkSecureContext = () => {
    const isLocalhost = 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '[::1]';

    return window.isSecureContext || isLocalhost;
  };

  // Start rear/environment camera with permission handling
  const startCamera = async () => {
    stopCameraStream();
    setErrorMessage('');
    setErrorDetails('');
    setScanValidationBanner(null);
    setCameraStatus('requesting');
    isScanningRef.current = true;

    // 1. Verify HTTPS / secure context requirement
    const isSecure = checkSecureContext();
    if (!isSecure) {
      setCameraStatus('insecure_context');
      setErrorMessage('Camera access requires a secure HTTPS connection.');
      setErrorDetails(
        `Mobile browsers (Chrome & Safari) strictly block camera APIs over insecure HTTP (${window.location.protocol}//${window.location.host}). Please load via HTTPS (e.g. on Vercel or https://... with Vite SSL) or test using the Image Upload button below.`
      );
      isScanningRef.current = false;
      return;
    }

    // 2. Check navigator.mediaDevices and getUserMedia availability
    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
      setCameraStatus('unavailable');
      setErrorMessage('Camera API is not supported by this browser.');
      setErrorDetails('Your mobile browser or WebView does not expose navigator.mediaDevices.getUserMedia. Please update your browser or use image upload.');
      isScanningRef.current = false;
      return;
    }

    // 3. Request rear/environment camera with fallback
    let stream = null;
    try {
      // Primary attempt: rear/environment camera with ideal facingMode
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
    } catch (primaryErr) {
      console.warn('Primary environment camera constraint failed, attempting generic video fallback:', primaryErr);
      try {
        // Secondary attempt: fallback to any available video camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      } catch (fallbackErr) {
        handleCameraError(fallbackErr);
        isScanningRef.current = false;
        return;
      }
    }

    if (!stream) {
      setCameraStatus('unavailable');
      setErrorMessage('Could not establish camera video stream.');
      isScanningRef.current = false;
      return;
    }

    // 4. Attach stream to video element
    streamRef.current = stream;

    if (videoRef.current) {
      try {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Critical for iOS Safari and mobile Chrome
        videoRef.current.muted = true; // Required by mobile autoplay policies

        // Wait until video metadata is loaded before starting scan loop
        await videoRef.current.play();
        setCameraStatus('active');
        animationFrameRef.current = requestAnimationFrame(tickScan);
      } catch (playErr) {
        console.error('Error playing camera video stream:', playErr);
        setCameraStatus('unavailable');
        setErrorMessage('Failed to start video playback. Tap Retry Camera below.');
        isScanningRef.current = false;
      }
    } else {
      // If video element wasn't ready yet, set active and it will link in useEffect
      setCameraStatus('active');
    }
  };

  // Map specific camera error codes to helpful user-facing explanations
  const handleCameraError = (err) => {
    console.error('Camera getUserMedia error:', err);
    const errName = err.name || '';

    if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
      setCameraStatus('denied');
      setErrorMessage('Camera permission was denied.');
      setErrorDetails('Please tap the permissions/lock icon in your mobile browser address bar to allow Camera access for this site, then tap "Retry Camera".');
    } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
      setCameraStatus('unavailable');
      setErrorMessage('No camera hardware found on this device.');
      setErrorDetails('No video input device was detected. You can upload a QR image from your gallery or enter a Demo ID manually.');
    } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
      setCameraStatus('busy');
      setErrorMessage('Camera is currently in use by another application.');
      setErrorDetails('Another app or browser tab is locking the camera hardware. Please close other camera apps and retry.');
    } else if (errName === 'OverconstrainedError') {
      setCameraStatus('unavailable');
      setErrorMessage('Requested camera configuration could not be satisfied.');
      setErrorDetails('Your device camera could not satisfy the resolution requirements. Try switching cameras or uploading an image.');
    } else if (errName === 'SecurityError') {
      setCameraStatus('insecure_context');
      setErrorMessage('Camera access blocked due to security restrictions.');
      setErrorDetails('Mobile Chrome blocks camera access over unencrypted HTTP connections. Please access the site via HTTPS.');
    } else {
      setCameraStatus('unavailable');
      setErrorMessage(err.message || 'Unable to access device camera.');
      setErrorDetails('You can still test by uploading a QR image from your gallery or selecting a demo merchant below.');
    }
  };

  // Continuous frame scanner using jsQR
  const tickScan = () => {
    if (!isScanningRef.current) return;

    const video = videoRef.current;
    if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) {
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
        return; // Pause scanning while evaluating result
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

      // Haptic vibration feedback on supported mobile devices
      try {
        navigator.vibrate?.(100);
      } catch (e) {}

      // Pre-fill recipient and proceed through simulated payment flow
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
      // Resume scanning after 2.8 seconds
      setTimeout(() => {
        setScanValidationBanner(null);
        if (cameraStatus === 'active') {
          animationFrameRef.current = requestAnimationFrame(tickScan);
        }
      }, 2800);
    }
  };

  // Image Upload Scanner (Fall-back for any device or when camera is unavailable)
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
          setScanValidationBanner('No QR code detected in the selected image. Please upload a clear QR code image.');
          setTimeout(() => setScanValidationBanner(null), 3500);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input so same file can be re-selected
  };

  // Manual Demo ID Form Submit
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualId.trim() && !manualName.trim()) {
      setErrorMessage('Please enter a recipient name or Demo UPI ID.');
      return;
    }

    const trimmedId = manualId.trim() || `${manualName.toLowerCase().replace(/[^a-z0-9]/g, '')}@okparv`;
    stopCameraStream();
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

  // User taps Close / Stop Camera button
  const handleCloseCameraAction = () => {
    stopCameraStream();
    onClose();
  };

  // Lifecycle: only start camera when modal is active and on the 'camera' tab
  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCameraStream();
    }

    // Always stop every media track when unmounting or navigating away
    return () => {
      stopCameraStream();
    };
  }, [activeTab]);

  return (
    <div className="modal-backdrop" onClick={handleCloseCameraAction}>
      <div className="scanner-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div className="scanner-header">
          <div className="scanner-title-box">
            <h3>Scan Parv Pay Demo QR</h3>
            <span className="scanner-subtitle">Mobile Camera & File Scanner</span>
          </div>
          <button 
            className="icon-btn-close light" 
            onClick={handleCloseCameraAction} 
            aria-label="Close scanner"
            title="Close Camera"
          >
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
            {/* Viewfinder Container: Video element is ALWAYS mounted to preserve ref */}
            <div className="viewfinder-container">
              <div className={`viewfinder-frame ${cameraStatus === 'active' ? 'camera-active' : 'camera-fallback'}`}>
                {/* Live Video Element: always rendered so videoRef is never null */}
                <video 
                  ref={videoRef} 
                  className="camera-video-stream"
                  autoPlay
                  playsInline
                  muted
                  style={{ display: cameraStatus === 'active' ? 'block' : 'none' }}
                />
                
                {/* Camera Active Viewfinder Overlay */}
                {cameraStatus === 'active' && (
                  <>
                    <div className="corner-bracket top-left"></div>
                    <div className="corner-bracket top-right"></div>
                    <div className="corner-bracket bottom-left"></div>
                    <div className="corner-bracket bottom-right"></div>

                    <div className="scanning-laser"></div>

                    <div className="viewfinder-overlay-tag">
                      <span>Align Parv Pay Demo QR in frame</span>
                    </div>
                  </>
                )}

                {/* Initializing State */}
                {cameraStatus === 'requesting' && (
                  <div className="camera-fallback-content">
                    <RefreshCw size={36} className="camera-fallback-icon spinning" />
                    <span className="fallback-title">Requesting Camera...</span>
                    <p className="fallback-desc">Please grant camera permission when prompted by your mobile browser.</p>
                  </div>
                )}

                {/* Insecure Context (HTTP) Explanation Alert */}
                {cameraStatus === 'insecure_context' && (
                  <div className="camera-fallback-content insecure">
                    <Lock size={36} className="camera-fallback-icon text-amber" />
                    <span className="fallback-title">HTTPS Connection Required</span>
                    <p className="fallback-desc">
                      Mobile Chrome strictly blocks camera access on unencrypted connections (<code>http://...</code>).
                    </p>
                    <div className="insecure-helper-box">
                      <small>
                        💡 <strong>How to fix:</strong> Access via <strong>HTTPS</strong> (e.g. <code>https://...</code> using Vite SSL or deployed on Vercel), or test immediately using <strong>Upload QR Image</strong> below!
                      </small>
                    </div>
                  </div>
                )}

                {/* Permission Denied or Unavailable State */}
                {(cameraStatus === 'denied' || cameraStatus === 'unavailable' || cameraStatus === 'busy') && (
                  <div className="camera-fallback-content">
                    <CameraOff size={36} className="camera-fallback-icon" />
                    <span className="fallback-title">{errorMessage}</span>
                    <p className="fallback-desc">{errorDetails}</p>
                    
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
            </div>

            {/* Hidden File Input for Image Scanning */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageFileChange}
            />

            {/* Gallery Upload & Visible Stop Camera Controls */}
            <div className="scanner-quick-controls">
              <button 
                className="btn-gallery-upload"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={16} />
                <span>Upload QR Image from Phone Gallery</span>
              </button>

              {cameraStatus === 'active' && (
                <button 
                  className="btn-stop-camera"
                  onClick={stopCameraStream}
                  title="Pause Camera"
                >
                  <StopCircle size={15} />
                  <span>Pause Camera</span>
                </button>
              )}
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

        {/* Bottom Actions: Visible Close Camera Button */}
        <div className="scanner-footer">
          <button 
            className="btn-cancel-scanner" 
            onClick={handleCloseCameraAction}
          >
            Close Camera & Return
          </button>
        </div>
      </div>
    </div>
  );
};
