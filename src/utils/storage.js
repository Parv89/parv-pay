// Parv Pay - LocalStorage Data Layer & Demo Constants

const STORAGE_KEYS = {
  BALANCE: 'parvpay_demo_balance',
  TRANSACTIONS: 'parvpay_demo_transactions',
  SETTINGS: 'parvpay_demo_settings',
  PROFILE: 'parvpay_demo_profile',
};

export const INITIAL_BALANCE = 5000.00;

export const INITIAL_PROFILE = {
  name: 'Parv Sharma',
  upiId: 'parv.sharma@parvpay',
  phone: '+91 98765 43210',
  bankName: 'State Bank Demo',
  accountNumber: '•••• •••• 4812',
  ifsc: 'SBIN000DEMO',
  kycStatus: 'Demo Verified',
  joinedDate: 'Oct 2026',
};

export const INITIAL_SETTINGS = {
  theme: 'light', // 'light' | 'dark'
  soundEnabled: true,
  requirePinSimulation: true,
};

export const INITIAL_TRANSACTIONS = [
  {
    id: 'TXN20261013P88341',
    refNo: '428901928412',
    type: 'sent', // 'sent' | 'received'
    title: 'Sharma Daily Kirana',
    subtitle: 'Groceries & Milk',
    recipient: 'Sharma Daily Kirana',
    upiId: 'sharma.kirana@okupi',
    phone: '+91 98234 11223',
    amount: 340.00,
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 mins ago
    status: 'Demo Success',
    note: 'Fresh veggies & milk',
    category: 'Shopping',
  },
  {
    id: 'TXN20261013P77210',
    refNo: '428901847291',
    type: 'received',
    title: 'From Priya Verma',
    subtitle: 'Weekend brunch share',
    recipient: 'Priya Verma',
    upiId: 'priya.verma@axisbank',
    phone: '+91 98112 33445',
    amount: 650.00,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hrs ago
    status: 'Demo Success',
    note: 'Cafe share split',
    category: 'Transfer',
  },
  {
    id: 'TXN20261012P64920',
    refNo: '428900481920',
    type: 'sent',
    title: 'Chai Point Express',
    subtitle: 'Tea & Snacks',
    recipient: 'Chai Point Express',
    upiId: 'chaipoint@paytm',
    phone: '+91 97654 32109',
    amount: 120.00,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // Yesterday
    status: 'Demo Success',
    note: 'Masala Chai & bun maska',
    category: 'Food',
  },
  {
    id: 'TXN20261011P51029',
    refNo: '428899210492',
    type: 'received',
    title: 'From Rohit Sen',
    subtitle: 'Movie ticket reimbursement',
    recipient: 'Rohit Sen',
    upiId: 'rohit.sen@icici',
    phone: '+91 99887 76655',
    amount: 480.00,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    status: 'Demo Success',
    note: 'IMAX tickets',
    category: 'Entertainment',
  },
  {
    id: 'TXN20261010P39182',
    refNo: '428898129034',
    type: 'sent',
    title: 'Metro Smart Card Recharge',
    subtitle: 'Transit pass',
    recipient: 'Delhi Metro Rail Corp',
    upiId: 'dmrc.transit@sbi',
    phone: '+91 98450 00112',
    amount: 500.00,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    status: 'Demo Success',
    note: 'Monthly card top-up',
    category: 'Travel',
  },
];

// Quick demo contacts for rapid test payments
export const DEMO_CONTACTS = [
  { name: 'Priya Verma', upiId: 'priya.verma@axisbank', phone: '+91 98112 33445', avatarColor: '#7B2CBF' },
  { name: 'Sharma Kirana', upiId: 'sharma.kirana@okupi', phone: '+91 98234 11223', avatarColor: '#10B981' },
  { name: 'Rohit Sen', upiId: 'rohit.sen@icici', phone: '+91 99887 76655', avatarColor: '#3B82F6' },
  { name: 'Aarav Gupta', upiId: 'aarav.g@hdfcbank', phone: '+91 97722 33441', avatarColor: '#F59E0B' },
  { name: 'Sneha Patel', upiId: 'sneha.p@okaxis', phone: '+91 98221 99887', avatarColor: '#EC4899' },
  { name: 'Chai Point', upiId: 'chaipoint@paytm', phone: '+91 97654 32109', avatarColor: '#8B5CF6' },
];

export const generateTxnId = () => {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000000 + Math.random() * 9000000);
  return `TXN${dateStr}PARV${randomSuffix}`;
};

export const generateRefId = () => {
  const part1 = Math.floor(400000 + Math.random() * 599999);
  const part2 = Math.floor(100000 + Math.random() * 899999);
  return `${part1}${part2}`;
};

export const formatINR = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export const getBalance = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.BALANCE);
    if (saved !== null) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading balance from localStorage', e);
  }
  setBalance(INITIAL_BALANCE);
  return INITIAL_BALANCE;
};

export const setBalance = (amount) => {
  try {
    const valid = Math.max(0, Math.round(Number(amount) * 100) / 100);
    localStorage.setItem(STORAGE_KEYS.BALANCE, valid.toString());
    return valid;
  } catch (e) {
    console.error('Error writing balance to localStorage', e);
    return amount;
  }
};

export const getTransactions = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading transactions from localStorage', e);
  }
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
  return INITIAL_TRANSACTIONS;
};

export const addTransaction = (txn) => {
  try {
    const existing = getTransactions();
    const updated = [txn, ...existing];
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error adding transaction to localStorage', e);
    return [];
  }
};

export const getProfile = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error reading profile from localStorage', e);
  }
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(INITIAL_PROFILE));
  return INITIAL_PROFILE;
};

export const updateProfile = (data) => {
  try {
    const current = getProfile();
    const updated = { ...current, ...data };
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error writing profile to localStorage', e);
    return INITIAL_PROFILE;
  }
};

export const getSettings = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error reading settings from localStorage', e);
  }
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
  return INITIAL_SETTINGS;
};

export const updateSettings = (data) => {
  try {
    const current = getSettings();
    const updated = { ...current, ...data };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error writing settings to localStorage', e);
    return INITIAL_SETTINGS;
  }
};

export const resetAllDemoData = () => {
  try {
    localStorage.setItem(STORAGE_KEYS.BALANCE, INITIAL_BALANCE.toString());
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(INITIAL_PROFILE));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    return {
      balance: INITIAL_BALANCE,
      transactions: INITIAL_TRANSACTIONS,
      profile: INITIAL_PROFILE,
      settings: INITIAL_SETTINGS,
    };
  } catch (e) {
    console.error('Error resetting demo data', e);
    return null;
  }
};
