import React from 'react';

// Generates a deterministic SVG QR Code grid for demo display
export const UpiQrVisual = ({ upiId, amount, name = 'Parv User', size = 220 }) => {
  // Deterministic 25x25 matrix generator based on seed
  const matrixSize = 25;
  const seedString = `${upiId}:${amount || 'any'}`;
  
  // Simple deterministic hash
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }

  // Pre-define finder patterns (7x7) in 3 corners: top-left, top-right, bottom-left
  const isFinder = (r, c) => {
    // Top-Left
    if (r < 7 && c < 7) {
      if (r === 0 || r === 6 || c === 0 || c === 6) return true;
      if (r >= 2 && r <= 4 && c >= 2 && c <= 4) return true;
      return false;
    }
    // Top-Right
    if (r < 7 && c >= matrixSize - 7) {
      const col = c - (matrixSize - 7);
      if (r === 0 || r === 6 || col === 0 || col === 6) return true;
      if (r >= 2 && r <= 4 && col >= 2 && col <= 4) return true;
      return false;
    }
    // Bottom-Left
    if (r >= matrixSize - 7 && c < 7) {
      const row = r - (matrixSize - 7);
      if (row === 0 || row === 6 || c === 0 || c === 6) return true;
      if (row >= 2 && row <= 4 && c >= 2 && c <= 4) return true;
      return false;
    }
    // Center logo clearance zone (5x5)
    if (r >= 10 && r <= 14 && c >= 10 && c <= 14) {
      return 'logo_clearance';
    }
    return false;
  };

  const cells = [];
  const cellSize = size / matrixSize;

  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      const finderStatus = isFinder(r, c);
      if (finderStatus === 'logo_clearance') {
        continue;
      }
      if (finderStatus === true) {
        cells.push({ r, c, active: true, finder: true });
      } else if (finderStatus === false) {
        // Separator bands around finder patterns (white space)
        const isSeparator =
          (r === 7 && c <= 7) ||
          (c === 7 && r <= 7) ||
          (r === 7 && c >= matrixSize - 8) ||
          (c === matrixSize - 8 && r <= 7) ||
          (r === matrixSize - 8 && c <= 7) ||
          (c === 7 && r >= matrixSize - 8);

        if (isSeparator) {
          cells.push({ r, c, active: false });
        } else {
          // Pseudo-random bit based on position and hash
          const bitVal = ((hash ^ (r * 31 + c * 17)) + (r * c)) % 3 === 0;
          cells.push({ r, c, active: bitVal });
        }
      }
    }
  }

  return (
    <div className="upi-qr-wrapper" style={{ width: size + 24, padding: 12 }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="upi-qr-svg"
      >
        <rect width={size} height={size} fill="#FFFFFF" rx="12" />
        {cells.map((cell) => {
          if (!cell.active) return null;
          return (
            <rect
              key={`${cell.r}-${cell.c}`}
              x={cell.c * cellSize}
              y={cell.r * cellSize}
              width={cellSize + 0.2}
              height={cellSize + 0.2}
              fill={cell.finder ? '#4A0E4E' : '#1F1A24'}
              rx={cell.finder ? 1 : 0.8}
            />
          );
        })}

        {/* Center Logo Badge */}
        <g transform={`translate(${size / 2 - 22}, ${size / 2 - 22})`}>
          <rect width="44" height="44" rx="10" fill="#FFFFFF" stroke="#5A189A" strokeWidth="2.5" />
          <rect x="4" y="4" width="36" height="36" rx="8" fill="#5A189A" />
          {/* Logo "P" inside */}
          <path
            d="M 15 12 H 24 C 28 12 30 15 30 18 C 30 22 28 24 24 24 H 15 Z"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path d="M 15 12 V 32" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          <path d="M 19 18 H 27" stroke="#FFD166" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </svg>
      <div className="upi-qr-brand-tag">
        <span className="upi-pill">DEMO UPI QR</span>
        <span className="upi-text">{upiId}</span>
      </div>
    </div>
  );
};
