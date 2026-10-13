import React, { useState, useEffect } from 'react';
import { 
  getBalance, setBalance, 
  getTransactions, addTransaction, 
  getProfile, updateProfile, 
  getSettings, updateSettings, 
  resetAllDemoData 
} from './utils/storage';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DemoBanner } from './components/DemoBanner';
import { TransactionReceiptModal } from './components/TransactionReceiptModal';
import { AboutDemoModal } from './components/AboutDemoModal';
import { ScanQrModal } from './views/ScanQrModal';
import { HomeView } from './views/HomeView';
import { SendMoneyView } from './views/SendMoneyView';
import { ReceiveMoneyView } from './views/ReceiveMoneyView';
import { CheckBalanceView } from './views/CheckBalanceView';
import { HistoryView } from './views/HistoryView';
import { ProfileView } from './views/ProfileView';
import { MyQrView } from './views/MyQrView';

export default function App() {
  // Core state
  const [balance, setLocalBalance] = useState(getBalance());
  const [transactions, setTransactions] = useState(getTransactions());
  const [profile, setProfileState] = useState(getProfile());
  const [settings, setSettingsState] = useState(getSettings());

  // Navigation: main tabs ('home' | 'history' | 'profile') & subviews ('send' | 'receive' | 'balance')
  const [activeTab, setActiveTab] = useState('home');
  const [activeSubView, setActiveSubView] = useState(null);

  // Modals
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [prefilledTarget, setPrefilledTarget] = useState(null);
  const [toast, setToast] = useState(null);

  // Apply theme class to document body / root
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }, [settings.theme]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Payment completed (Send Money)
  const handleCompleteSend = (txn, amount) => {
    const newBal = setBalance(balance - amount);
    setLocalBalance(newBal);
    const updatedTxns = addTransaction(txn);
    setTransactions(updatedTxns);
  };

  // Payment received (Receive Money)
  const handleCompleteReceive = (txn, amount) => {
    const newBal = setBalance(balance + amount);
    setLocalBalance(newBal);
    const updatedTxns = addTransaction(txn);
    setTransactions(updatedTxns);
  };

  // Reset demo data
  const handleResetData = () => {
    const fresh = resetAllDemoData();
    if (fresh) {
      setLocalBalance(fresh.balance);
      setTransactions(fresh.transactions);
      setProfileState(fresh.profile);
      setSettingsState(fresh.settings);
      showToast('All demo data reset to default (₹5,000)!');
    }
  };

  // Update Settings
  const handleUpdateSettings = (partial) => {
    const updated = updateSettings(partial);
    setSettingsState(updated);
  };

  // Navigation handlers
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setActiveSubView(null);
    setPrefilledTarget(null);
  };

  const handleSubViewNavigate = (subview) => {
    setActiveSubView(subview);
  };

  const handleSelectContactToSend = (contact) => {
    setPrefilledTarget(contact);
    setActiveSubView('send');
  };

  const handleScannedQr = (qrTarget) => {
    setPrefilledTarget(qrTarget);
    setActiveSubView('send');
  };

  const handleRepeatPay = (oldTxn) => {
    setPrefilledTarget({
      name: oldTxn.recipient,
      upiId: oldTxn.upiId,
      phone: oldTxn.phone,
      amount: oldTxn.amount,
      note: oldTxn.note,
    });
    setActiveSubView('send');
  };

  return (
    <div className="mobile-app-shell">
      <div className="mobile-container">
        {/* Top Header */}
        <Header 
          onOpenScanner={() => setIsScannerOpen(true)}
          onOpenAbout={() => setIsAboutOpen(true)}
        />

        {/* Global Demo Simulation Banner */}
        <DemoBanner />

        {/* Main Content Area */}
        <main className="app-main-content">
          {/* Subviews (Send / Receive / Check Balance) take precedence */}
          {activeSubView === 'send' && (
            <SendMoneyView
              balance={balance}
              prefilledTarget={prefilledTarget}
              soundEnabled={settings.soundEnabled}
              onBack={() => {
                setActiveSubView(null);
                setPrefilledTarget(null);
              }}
              onCompletePayment={handleCompleteSend}
              onViewReceipt={(txn) => setSelectedTxn(txn)}
            />
          )}

          {activeSubView === 'receive' && (
            <ReceiveMoneyView
              profile={profile}
              balance={balance}
              soundEnabled={settings.soundEnabled}
              onBack={() => setActiveSubView(null)}
              onCompleteReceive={handleCompleteReceive}
              onViewReceipt={(txn) => setSelectedTxn(txn)}
            />
          )}

          {activeSubView === 'balance' && (
            <CheckBalanceView
              balance={balance}
              profile={profile}
              onBack={() => setActiveSubView(null)}
              onNavigate={(sub) => setActiveSubView(sub)}
              onResetData={handleResetData}
              onRefresh={() => setLocalBalance(getBalance())}
            />
          )}

          {activeSubView === 'my-qr' && (
            <MyQrView
              profile={profile}
              onBack={() => setActiveSubView(null)}
              onShowToast={showToast}
            />
          )}

          {/* Tab Views */}
          {!activeSubView && activeTab === 'home' && (
            <HomeView
              balance={balance}
              transactions={transactions}
              profile={profile}
              onNavigate={handleSubViewNavigate}
              onSelectTransaction={(txn) => setSelectedTxn(txn)}
              onSelectContact={handleSelectContactToSend}
              onOpenScanner={() => setIsScannerOpen(true)}
            />
          )}

          {!activeSubView && activeTab === 'history' && (
            <HistoryView
              transactions={transactions}
              onSelectTransaction={(txn) => setSelectedTxn(txn)}
            />
          )}

          {!activeSubView && activeTab === 'profile' && (
            <ProfileView
              profile={profile}
              settings={settings}
              balance={balance}
              onUpdateSettings={handleUpdateSettings}
              onResetData={handleResetData}
              onOpenAbout={() => setIsAboutOpen(true)}
            />
          )}
        </main>

        {/* Persistent Bottom Navigation (Hidden during active send/receive subviews for clean mobile focus) */}
        {!activeSubView && (
          <BottomNav 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
          />
        )}

        {/* Floating Toast Notification */}
        {toast && (
          <div className="global-toast">
            <span>{toast}</span>
          </div>
        )}

        {/* Transaction Receipt Modal */}
        {selectedTxn && (
          <TransactionReceiptModal
            txn={selectedTxn}
            onClose={() => setSelectedTxn(null)}
            onRepeatPay={handleRepeatPay}
          />
        )}

        {/* Mock QR Scanner Modal */}
        {isScannerOpen && (
          <ScanQrModal
            onClose={() => setIsScannerOpen(false)}
            onScannedTarget={handleScannedQr}
          />
        )}

        {/* About Demo Simulation Modal */}
        {isAboutOpen && (
          <AboutDemoModal
            onClose={() => setIsAboutOpen(false)}
            onResetData={handleResetData}
          />
        )}
      </div>
    </div>
  );
}
