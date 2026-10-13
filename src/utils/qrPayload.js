// Parv Pay - Demo QR Code Payload Generator & Validator
// SIMULATION ONLY: Never connects to real UPI or banking infrastructure

/**
 * Generate a demo payment profile JSON payload for Parv Pay
 * @param {Object} profile - User profile { name, upiId, phone, bankName }
 * @returns {string} JSON string encoded for the QR code
 */
export const generateDemoQrPayload = (profile) => {
  const uniqueRef = `DEMO-REF-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
  
  const payload = {
    app: 'Parv Pay',
    version: '1.0',
    type: 'DEMO_PAYMENT_PROFILE',
    userId: profile.upiId || 'parv.sharma@parvpay',
    name: profile.name || 'Parv Sharma',
    phone: profile.phone || '+91 98765 43210',
    demoRef: uniqueRef,
    bank: profile.bankName || 'State Bank Demo',
    note: 'Demo payment via Parv Pay QR',
    disclaimer: 'SIMULATION ONLY - Not valid for real payments',
    createdAt: new Date().toISOString(),
  };

  return JSON.stringify(payload);
};

/**
 * Validate and extract data from a scanned QR text
 * Rejects non-Parv Pay codes, real UPI URIs, and arbitrary URLs.
 * @param {string} rawText 
 * @returns {{ valid: boolean, data?: Object, error?: string }}
 */
export const parseAndValidateDemoQr = (rawText) => {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return {
      valid: false,
      error: 'Empty or unreadable QR code.',
    };
  }

  const trimmed = rawText.trim();

  // Try parsing JSON format
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object') {
      if (parsed.app === 'Parv Pay' && (parsed.userId || parsed.id)) {
        return {
          valid: true,
          data: {
            name: parsed.name || 'Parv Pay User',
            upiId: parsed.userId || parsed.id,
            phone: parsed.phone || '',
            demoRef: parsed.demoRef || 'DEMO-REF-SCANNED',
            note: parsed.note || 'Payment via Parv Pay Demo QR',
            amount: parsed.amount ? parseFloat(parsed.amount) : undefined,
          },
        };
      }
    }
  } catch (e) {
    // Not valid JSON, check custom URI fallback
  }

  // Check custom URI format fallback (e.g. parvpay://demo-pay?...)
  if (trimmed.startsWith('parvpay://') || trimmed.startsWith('parv-pay://')) {
    try {
      const url = new URL(trimmed);
      const app = url.searchParams.get('app');
      const userId = url.searchParams.get('userId') || url.searchParams.get('id');
      if (app === 'Parv Pay' && userId) {
        return {
          valid: true,
          data: {
            name: url.searchParams.get('name') || 'Parv Pay User',
            upiId: userId,
            phone: url.searchParams.get('phone') || '',
            demoRef: url.searchParams.get('ref') || 'DEMO-REF-SCANNED',
            note: 'Payment via Parv Pay Demo QR',
            amount: url.searchParams.get('amount') ? parseFloat(url.searchParams.get('amount')) : undefined,
          },
        };
      }
    } catch (e) {
      // Invalid URL format
    }
  }

  // Check if someone scanned a real UPI string (e.g. upi://pay?...)
  if (trimmed.startsWith('upi://')) {
    return {
      valid: false,
      error: 'Real UPI QR detected: Parv Pay is an offline educational simulation and rejects real UPI payment links to safeguard your real accounts.',
    };
  }

  // Check if someone scanned an external web URL (https://...)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return {
      valid: false,
      error: 'External website QR detected: Only Parv Pay Demo QR codes can be processed in this simulator.',
    };
  }

  // Generic rejection
  return {
    valid: false,
    error: 'Unsupported QR code: This is not a recognized Parv Pay demo payment profile.',
  };
};
