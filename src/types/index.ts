// ─── Core Data Types ─────────────────────────────────────────────────────────

export interface Income {
  id: number;
  date: string;        // YYYY-MM-DD
  amount: number;
  source: string;
  notes?: string;
  allocated: boolean;
}

export interface SavingsBucket {
  id: number;
  name: string;
  target: number;
  current: number;
  color: BucketColor;
  notes?: string;
}

export type BucketColor = 'emerald' | 'blue' | 'orange' | 'amber' | 'red' | 'purple' | 'teal';

export interface InvestmentHolding {
  symbol: string;
  name: string;
  value: number;
  change1m: number;
}

export interface RetirementAccount {
  type: '401k' | 'roth_ira' | 'pension';
  label: string;
  balance: number;
  contribRate?: number;       // % of pay (401k)
  employerMatch?: number;     // % employer match
  ytdContrib: number;
  annualLimit?: number;       // IRA limit
}

export interface FinancialGoal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;   // YYYY-MM-DD
  priority: 'High' | 'Medium' | 'Low';
  linkedBucketId?: number | null;
}

export interface CreditCard {
  id: number;
  name: string;
  issuer: string;
  balance: number;
  limit: number;
  apr: number;
  dueDate: string;
  lastPayment: string;
}

export interface PlaidAccount {
  id: number;
  institution: string;
  accountName: string;
  type: 'depository' | 'credit';
  balance: number;
  lastSync: string;     // ISO string
  plaidItemId: string;
}

// ─── App State ────────────────────────────────────────────────────────────────

export interface AppState {
  income: Income[];
  nextIncId: number;
  buckets: SavingsBucket[];
  nextBktId: number;
  goals: FinancialGoal[];
  nextGoalId: number;
  cards: CreditCard[];
  nextCardId: number;
  plaidAccounts: PlaidAccount[];
  nextPlaidId: number;
  retirementAccounts: RetirementAccount[];
  holdings: InvestmentHolding[];
}

// ─── Modal State ──────────────────────────────────────────────────────────────

export type ModalType =
  | 'alloc'
  | 'plaid'
  | 'bucket'
  | 'contrib'
  | 'editBucket'
  | 'goal'
  | 'goalContrib'
  | 'addCard'
  | 'ccPay'
  | 'retContrib'
  | null;

export interface ModalState {
  open: ModalType;
  targetId?: number;
  incomeId?: number;
}

// ─── Toast ────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

// ─── Income Sources ───────────────────────────────────────────────────────────

export const INCOME_SOURCES = [
  'Main Job - Asphalt Paving (Prevailing Wage)',
  'Main Job - Asphalt Paving + Overtime',
  'Side Hustle - KDP Royalties (Bo Fordham)',
  'Side Hustle - Farmers Market Art Sales',
  'Overtime / Bonus',
  'Other Irregular Income',
] as const;

export type IncomeSource = (typeof INCOME_SOURCES)[number];

// ─── Plaid Mock Institutions ──────────────────────────────────────────────────

export interface PlaidInstitution {
  id: string;
  name: string;
  abbr: string;
  description: string;
  defaultType: 'depository' | 'credit';
  defaultBalance: number;
  defaultAccountName: string;
}

export const PLAID_INSTITUTIONS: PlaidInstitution[] = [
  {
    id: 'becu',
    name: 'BECU',
    abbr: 'BE',
    description: 'Boeing Employees Credit Union • Gig Harbor branch',
    defaultType: 'depository',
    defaultBalance: 24820.5,
    defaultAccountName: 'Checking',
  },
  {
    id: 'usaa',
    name: 'USAA',
    abbr: 'US',
    description: 'Banking & Insurance',
    defaultType: 'depository',
    defaultBalance: 8450.0,
    defaultAccountName: 'Checking',
  },
  {
    id: 'chase',
    name: 'Chase',
    abbr: 'JP',
    description: 'Personal & Business Banking',
    defaultType: 'credit',
    defaultBalance: 380.0,
    defaultAccountName: 'Freedom',
  },
  {
    id: 'capitalone',
    name: 'Capital One',
    abbr: 'CO',
    description: 'Quicksilver & Venture Cards',
    defaultType: 'credit',
    defaultBalance: 0.0,
    defaultAccountName: 'Quicksilver',
  },
];
