# 💜 Parv Pay — Mobile-First UPI Simulation Web App

> **IMPORTANT DISCLAIMER — SIMULATION ONLY**  
> **Parv Pay is an educational web prototype.** It is strictly a client-side simulation. It does **NOT** connect to any real bank, NPCI, Unified Payments Interface (UPI) network, payment gateway, or payment server. All transactions, balances, and digital receipts are simulated demo data stored locally in your browser's `localStorage`. No actual money is moved. Never enter real banking credentials, real UPI PINs, passwords, or OTPs.

---

## 📱 Features Overview

### 1. 🎨 Mobile-First Interface
- **Polished Purple-and-White Theme**: Inspired by Indian digital payment apps (deep royal purple `#5A189A`, crisp cards, and energetic gold accents).
- **Responsive Layout**: Designed primarily for Android mobile screens and mobile Chrome, with an elegant framed preview on desktop browsers.
- **Persistent Bottom Navigation**: Seamless switching between **Home**, **History**, and **Profile**.
- **Dark Mode Support**: Quick toggle between Light Purple and Dark Purple themes.
- **Original Branding**: Custom geometric brand icon featuring stylized rupee flourishes (independent original design).

### 2. 🏠 Home Screen
- **Demo Wallet Balance Card**: Shows current demo balance with an eye toggle (`Show/Hide`) and linked demo bank account.
- **Quick Actions Grid**: One-tap access to **Send Money**, **Receive Money**, **Scan QR**, and **Check Balance**.
- **Quick Demo Contacts**: Horizontal scroller with sample contacts (*Priya Verma, Sharma Kirana, Rohit Sen, Aarav Gupta, Sneha Patel*) for instant 1-tap testing.
- **Prominent DEMO MODE Badges**: Top pulsing demo indicator and collapsible educational simulation banner.
- **Recent Transactions Feed**: Quick preview of recent simulated payments with tap-to-view digital receipts.

### 3. 📤 Send Money Simulation
- Enter recipient name, phone number, or demo UPI ID (`user@okparv`).
- Quick amount chips (+₹100, +₹250, +₹500, +₹1,000, +₹2,000) and optional payment notes.
- **Safe Validation**: Validates positive amounts and prevents sending more than the available local demo balance.
- **Confirmation Review**: Displays payee details, debited account, and before/after balance calculation before simulating.
- **Demo PIN Pad**: Realistic 4-digit PIN screen with safety disclaimers and a 1-tap bypass button (*"DO NOT enter real credentials"*).
- **Celebration Feedback**: Triggers confetti burst and synthetic Web Audio UPI sound chime.
- Deducts amount from the local demo balance and records a unique transaction ID (e.g. `TXN261013PARV9827419`).

### 4. 🔲 My QR Code Feature (New)
- **Dedicated QR Code Screen**: Clean purple-and-white card displaying your personal demo payment profile.
- **Locally Generated Scannable QR**: Generated in-browser using `qrcode.react` with High Error Correction (`level="H"`) and excavated center logo.
- **Demo Profile Encoding**: Encodes app name `Parv Pay`, demo user ID (`parv.sharma@parvpay`), and unique demo payment reference (`DEMO-REF-...`).
- **Prominent Disclaimers**: Boldly marked with `PARV PAY — DEMO QR` and `Not valid for real payments`.
- **PNG Download & Sharing**:
  - **Download QR**: Exports a high-resolution branded PNG badge with headers and disclaimers.
  - **Share QR**: Uses Web Share API (with file sharing or text fallback).
  - **Copy Demo ID**: 1-click clipboard copy with toast feedback.
  - **Regenerate Ref**: 1-click button to refresh unique demo transaction references.

### 5. 📷 Real-Time Camera & File QR Scanner (New)
- **Phone Camera Integration**: Uses `navigator.mediaDevices.getUserMedia` with permission handling.
- **Friendly Fallback Handling**: If camera permission is denied or unavailable, displays an intuitive fallback screen with:
  - **Upload QR Image**: Upload a saved QR screenshot/photo from device gallery.
  - **Manual Demo ID Entry**: Enter recipient name and Demo UPI ID manually.
  - **Simulate Demo Merchants**: 1-tap quick buttons for demo merchants (*Sharma General Store*, *Chai & Samosa Corner*, *Fresh Mart Supermarket*, *Priya Verma*).
- **Strict Format Validation**: Uses `jsQR` to decode video frames and images. Validates that only authentic Parv Pay Demo QR codes are accepted while rejecting unsupported external links and real UPI links to prevent confusion.
- **Seamless Send Money Integration**: Automatically pre-fills recipient name and Demo ID into the payment workflow.

### 6. 📥 Receive Money Simulation
- Interactive demo QR card and shareable payment address (`parv.sharma@parvpay`).
- **Interactive "Simulate Receive" Drawer**: Enter an amount and simulated sender to test incoming funds.
- Immediately increments demo balance and creates a simulated credit receipt.

### 7. 🏦 Check Balance
- Big Indian Rupee typography displaying current local demo balance.
- Detailed breakdown: Demo Wallet, Linked Demo Bank Account, and daily demo limits.
- Refresh button to synchronize state.
- **Reset Demo Data Option**: Restores default ₹5,000 balance and initial transactions with confirmation prompt.

### 8. 📜 Transaction History & Digital Receipts
- Filter transactions by **All**, **Sent**, and **Received**.
- Real-time search by recipient name, UPI ID, note, or transaction ID.
- **Authentic Digital Receipt Modal**:
  - Clear watermark banner: `SIMULATED TRANSACTION — NO REAL MONEY MOVED`
  - Tear-line receipt styling.
  - Demo Transaction ID & UPI Reference Number with 1-click copy buttons.
  - Share receipt summary (Web Share API with clipboard fallback).
  - "Pay Again" shortcut for sent transactions.

### 9. 👤 Profile & Settings
- User details with demo KYC verification badge.
- Linked demo bank account (*State Bank Demo - **** 4812*).
- **Appearance Mode**: Toggle between Light and Dark purple themes.
- **Sound Effects Toggle**: Enable/disable Web Audio API payment chimes.
- **Reset Demo Data**: Confirmation modal to restore the ₹5,000 initial sandbox state.
- **Zero Credentials Policy**: Transparent disclaimers outlining sandbox security.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + Vite 6
- **Styling**: Pure Modern CSS with custom CSS variables (no bloated CSS frameworks)
- **Icons**: [Lucide React](https://lucide.dev)
- **Audio**: Web Audio API (100% synthetic, zero external sound files required)
- **Animation**: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
- **Storage**: Browser HTML5 `localStorage` (100% client-side, zero backend required)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Navigate to the project folder:
   ```bash
   cd parv-pay
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server (with built-in HTTPS & Network exposure):
   ```bash
   npm run dev
   ```

4. **Testing on a Mobile Phone**:
   - Both your computer and your phone must be on the **same Wi-Fi network**.
   - Vite will display a Network URL in your terminal, for example: `https://192.168.1.5:5173`.
   - Open that **`https://`** URL in **Chrome** on your phone.
   - When Chrome shows a certificate notice (due to the local development SSL certificate), tap **Advanced** -> **Proceed**.
   - Tap **Scan QR** -> Grant camera permission when prompted.
   - The rear camera will open instantly!

> [!NOTE]
> **Why HTTPS is Required for Mobile Cameras**:  
> Web standards in mobile browsers (Chrome, Safari, Firefox) strictly restrict `navigator.mediaDevices.getUserMedia` to **Secure Contexts** (`https://` or `localhost`). If an app is opened over plain `http://192.168.x.x`, mobile browsers disable camera APIs for security. Parv Pay includes `@vitejs/plugin-basic-ssl` out-of-the-box so you can test real camera streaming on mobile phones without third-party tunnels!

---

## 📦 Building for Production

To create an optimized production build:

```bash
npm run build
```

The compiled output will be generated in the `dist/` directory.

To test the production build locally:
```bash
npm run preview
```

---

## 🌐 Deploying to Free Static Hosting

### Vercel (Recommended)
1. Push this repository to GitHub or install the [Vercel CLI](https://vercel.com/cli):
   ```bash
   npm i -g vercel
   vercel
   ```
2. The included `vercel.json` already contains SPA route rewrites to `dist/index.html`.

### Netlify
1. Connect your repository to Netlify or drag-and-drop the `dist` folder into the Netlify Dashboard.
2. Build command: `npm run build`
3. Publish directory: `dist`

### GitHub Pages
1. In `vite.config.js`, set `base: './'`.
2. Run `npm run build` and deploy the `dist/` folder using `gh-pages`.

---

## 📄 License & Fair Use
Created for educational, demonstration, and UX research purposes. Not affiliated with PhonePe, Google Pay, Paytm, NPCI, or any Indian banking institution.
