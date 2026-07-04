import type { AppState } from '@/types';

export function getDefaultState(): AppState {
  return {
    income: [
      { id: 1, date: '2026-06-14', amount: 4100, source: 'Main Job - Asphalt Paving + Overtime', notes: 'Overtime week', allocated: true },
      { id: 2, date: '2026-06-07', amount: 2200, source: 'Main Job - Asphalt Paving (Prevailing Wage)', notes: 'Standard week', allocated: true },
      { id: 3, date: '2026-06-20', amount: 780,  source: 'Side Hustle - KDP Royalties (Bo Fordham)', notes: 'June royalties', allocated: false },
      { id: 4, date: '2026-06-22', amount: 370,  source: 'Side Hustle - Farmers Market Art Sales', notes: 'Saturday market', allocated: false },
    ],
    nextIncId: 5,

    buckets: [
      { id: 1, name: 'Emergency Fund', target: 12000, current: 6420, color: 'emerald', notes: '6-month target' },
      { id: 2, name: 'Home Down Payment – Gig Harbor', target: 65000, current: 4800, color: 'blue', notes: '20% on $325k home' },
      { id: 3, name: 'Kids Future (UTMA/529)', target: 25000, current: 2100, color: 'orange', notes: 'College + legacy' },
      { id: 4, name: 'Vehicle & Equipment Maintenance', target: 4500, current: 1100, color: 'amber', notes: 'Truck + trailer' },
      { id: 5, name: 'Family Vacation & Memories', target: 3800, current: 400, color: 'teal', notes: 'Summer 2027' },
    ],
    nextBktId: 6,

    goals: [
      { id: 1, name: 'Secure 20% down payment on Gig Harbor home', targetAmount: 65000, currentAmount: 4800,  targetDate: '2028-06-01', priority: 'High' },
      { id: 2, name: 'Build full 6-month emergency fund',            targetAmount: 12000, currentAmount: 6420,  targetDate: '2027-01-01', priority: 'High' },
      { id: 3, name: 'Pay off remaining Nissan Armada balance',      targetAmount: 14200, currentAmount: 8600,  targetDate: '2027-06-01', priority: 'Medium' },
      { id: 4, name: 'Fund side business launch (art prints + ebooks)', targetAmount: 3500, currentAmount: 820, targetDate: '2026-12-31', priority: 'Medium' },
    ],
    nextGoalId: 5,

    cards: [
      { id: 1, name: 'BECU Visa Signature',     issuer: 'BECU',        balance: 0,   limit: 10000, apr: 14.99, dueDate: '2026-07-15', lastPayment: '2026-06-01' },
      { id: 2, name: 'Chase Freedom Flex',       issuer: 'Chase',       balance: 380, limit: 6000,  apr: 24.99, dueDate: '2026-07-08', lastPayment: '2026-06-05' },
      { id: 3, name: 'Capital One Quicksilver',  issuer: 'Capital One', balance: 0,   limit: 5500,  apr: 22.49, dueDate: '2026-07-12', lastPayment: '2026-06-10' },
      { id: 4, name: 'USAA Cashback Rewards',    issuer: 'USAA',        balance: 820, limit: 8000,  apr: 18.99, dueDate: '2026-07-20', lastPayment: '2026-05-22' },
      { id: 5, name: 'Discover it Cash Back',    issuer: 'Discover',    balance: 450, limit: 3000,  apr: 26.99, dueDate: '2026-07-03', lastPayment: '2026-06-03' },
    ],
    nextCardId: 6,

    plaidAccounts: [
      { id: 1, institution: 'BECU', accountName: 'Checking ••4821', type: 'depository', balance: 6240.18, lastSync: new Date().toISOString(), plaidItemId: 'item_becu_1' },
      { id: 2, institution: 'BECU', accountName: 'Savings ••2210',  type: 'depository', balance: 18580.32, lastSync: new Date().toISOString(), plaidItemId: 'item_becu_2' },
      { id: 3, institution: 'USAA', accountName: 'Checking ••9102', type: 'depository', balance: 4812.60, lastSync: new Date().toISOString(), plaidItemId: 'item_usaa_1' },
    ],
    nextPlaidId: 4,

    retirementAccounts: [
      {
        type: '401k',
        label: '401(k) • Current Employer',
        balance: 28450,
        contribRate: 6,
        employerMatch: 3,
        ytdContrib: 2160,
      },
      {
        type: 'roth_ira',
        label: 'Roth IRA • Personal',
        balance: 8000,
        ytdContrib: 7000,
        annualLimit: 7000,
      },
    ],

    holdings: [
      { symbol: 'VTI',  name: 'Vanguard Total Stock Market',    value: 5420, change1m: 2.1 },
      { symbol: 'SCHD', name: 'Schwab Dividend Equity',         value: 3100, change1m: 1.4 },
      { symbol: 'VXUS', name: 'Vanguard Total Intl Stock',      value: 2200, change1m: -0.8 },
      { symbol: 'BTC',  name: 'Bitcoin (via Coinbase)',          value: 1480, change1m: 12.3 },
      { symbol: 'VNQ',  name: 'Vanguard Real Estate',           value: 640,  change1m: -1.2 },
    ],
  };
}
