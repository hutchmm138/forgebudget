import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AppState,
  Income,
  SavingsBucket,
  FinancialGoal,
  CreditCard,
  PlaidAccount,
  BucketColor,
  ModalState,
  Toast,
  ToastType,
  ModalType,
} from '@/types';
import { getDefaultState } from '@/lib/defaultData';
import { buildMockPlaidAccount, simulateSync } from '@/lib/plaidMock';
import type { PlaidInstitution } from '@/types';
import { genId, calcUtilization } from '@/lib/utils';

// ─── Derived selectors ────────────────────────────────────────────────────────

interface Derived {
  monthlyIncome: () => number;
  allocatedAmount: () => number;
  allocatedPct: () => number;
  totalSavings: () => number;
  totalCCBalance: () => number;
  totalCCLimit: () => number;
  overallUtil: () => number;
  cardsAtZero: () => number;
  totalPortfolio: () => number;
  totalRetirement: () => number;
  unallocatedIncome: () => Income[];
}

// ─── Store shape ──────────────────────────────────────────────────────────────

interface StoreState extends AppState {
  // Modal
  modal: ModalState;
  openModal: (type: ModalType, targetId?: number, incomeId?: number) => void;
  closeModal: () => void;

  // Toasts
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;

  // Income actions
  addIncome: (payload: Omit<Income, 'id' | 'allocated'>) => void;
  markAllocated: (id: number) => void;

  // Allocation action — core zero-based logic
  applyAllocation: (
    incomeId: number,
    bucketAmounts: Record<number, number>,
    goalAmounts: Record<number, number>,
    cardAmounts: Record<number, number>,
    retirementAmount: number
  ) => void;

  // Savings bucket actions
  addBucket: (payload: Omit<SavingsBucket, 'id'>) => void;
  updateBucket: (id: number, payload: Partial<SavingsBucket>) => void;
  deleteBucket: (id: number) => void;
  contributeToBank: (id: number, amount: number) => void;

  // Goal actions
  addGoal: (payload: Omit<FinancialGoal, 'id'>) => void;
  updateGoal: (id: number, payload: Partial<FinancialGoal>) => void;
  deleteGoal: (id: number) => void;
  contributeToGoal: (id: number, amount: number) => void;

  // Credit card actions
  addCard: (payload: Omit<CreditCard, 'id'>) => void;
  updateCard: (id: number, payload: Partial<CreditCard>) => void;
  deleteCard: (id: number) => void;
  makePayment: (id: number, amount: number) => void;

  // Plaid actions
  connectAccount: (inst: PlaidInstitution) => void;
  syncAccount: (id: number) => void;
  syncAll: () => void;

  // Retirement
  updateRetirementBalance: (type: string, balance: number) => void;
  logRetirementContrib: (type: string, amount: number) => void;

  // Derived
  derived: Derived;

  // Reset
  resetToDefaults: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...getDefaultState(),

      // ── Modal ────────────────────────────────────────────────────────────────
      modal: { open: null },

      openModal: (type, targetId, incomeId) =>
        set({ modal: { open: type, targetId, incomeId } }),

      closeModal: () => set({ modal: { open: null } }),

      // ── Toasts ───────────────────────────────────────────────────────────────
      toasts: [],

      addToast: (message, type = 'success') => {
        const id = genId();
        set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
        setTimeout(() => get().removeToast(id), 4000);
      },

      removeToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      // ── Income ───────────────────────────────────────────────────────────────
      addIncome: (payload) =>
        set((s) => ({
          income: [{ ...payload, id: s.nextIncId, allocated: false }, ...s.income],
          nextIncId: s.nextIncId + 1,
        })),

      markAllocated: (id) =>
        set((s) => ({
          income: s.income.map((i) => (i.id === id ? { ...i, allocated: true } : i)),
        })),

      // ── Zero-Based Allocation ────────────────────────────────────────────────
      applyAllocation: (incomeId, bucketAmounts, goalAmounts, cardAmounts, retirementAmount) => {
        const s = get();
        const entry = s.income.find((i) => i.id === incomeId);
        if (!entry) return;

        // Validate total
        const total =
          Object.values(bucketAmounts).reduce((a, b) => a + b, 0) +
          Object.values(goalAmounts).reduce((a, b) => a + b, 0) +
          Object.values(cardAmounts).reduce((a, b) => a + b, 0) +
          retirementAmount;

        if (Math.abs(total - entry.amount) > 0.01) {
          get().addToast(
            `Total must equal ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(entry.amount)}. Off by $${Math.abs(entry.amount - total).toFixed(2)}.`,
            'error'
          );
          return;
        }

        set((s) => ({
          income: s.income.map((i) => (i.id === incomeId ? { ...i, allocated: true } : i)),
          buckets: s.buckets.map((b) =>
            bucketAmounts[b.id] ? { ...b, current: b.current + bucketAmounts[b.id] } : b
          ),
          goals: s.goals.map((g) =>
            goalAmounts[g.id]
              ? { ...g, currentAmount: Math.min(g.targetAmount, g.currentAmount + goalAmounts[g.id]) }
              : g
          ),
          cards: s.cards.map((c) =>
            cardAmounts[c.id]
              ? {
                  ...c,
                  balance: Math.max(0, c.balance - cardAmounts[c.id]),
                  lastPayment: new Date().toISOString().split('T')[0],
                }
              : c
          ),
        }));

        get().addToast(`🎉 Every dollar allocated! ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(entry.amount)} fully deployed.`, 'success');
      },

      // ── Savings Buckets ───────────────────────────────────────────────────────
      addBucket: (payload) =>
        set((s) => ({
          buckets: [...s.buckets, { ...payload, id: s.nextBktId }],
          nextBktId: s.nextBktId + 1,
        })),

      updateBucket: (id, payload) =>
        set((s) => ({
          buckets: s.buckets.map((b) => (b.id === id ? { ...b, ...payload } : b)),
        })),

      deleteBucket: (id) =>
        set((s) => ({ buckets: s.buckets.filter((b) => b.id !== id) })),

      contributeToBank: (id, amount) =>
        set((s) => ({
          buckets: s.buckets.map((b) =>
            b.id === id ? { ...b, current: b.current + amount } : b
          ),
        })),

      // ── Goals ─────────────────────────────────────────────────────────────────
      addGoal: (payload) =>
        set((s) => ({
          goals: [...s.goals, { ...payload, id: s.nextGoalId }],
          nextGoalId: s.nextGoalId + 1,
        })),

      updateGoal: (id, payload) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, ...payload } : g)),
        })),

      deleteGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      contributeToGoal: (id, amount) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === id
              ? { ...g, currentAmount: Math.min(g.targetAmount, g.currentAmount + amount) }
              : g
          ),
        })),

      // ── Credit Cards ───────────────────────────────────────────────────────────
      addCard: (payload) =>
        set((s) => ({
          cards: [
            ...s.cards,
            {
              ...payload,
              id: s.nextCardId,
              lastPayment: new Date().toISOString().split('T')[0],
            },
          ],
          nextCardId: s.nextCardId + 1,
        })),

      updateCard: (id, payload) =>
        set((s) => ({
          cards: s.cards.map((c) => (c.id === id ? { ...c, ...payload } : c)),
        })),

      deleteCard: (id) =>
        set((s) => ({ cards: s.cards.filter((c) => c.id !== id) })),

      makePayment: (id, amount) =>
        set((s) => ({
          cards: s.cards.map((c) =>
            c.id === id
              ? {
                  ...c,
                  balance: Math.max(0, c.balance - amount),
                  lastPayment: new Date().toISOString().split('T')[0],
                }
              : c
          ),
        })),

      // ── Plaid ──────────────────────────────────────────────────────────────────
      connectAccount: (inst) => {
        const s = get();
        const alreadyConnected = s.plaidAccounts.some((a) => a.institution === inst.name);
        if (alreadyConnected) {
          get().addToast(`${inst.name} is already connected.`, 'info');
          return;
        }
        const newAcct = buildMockPlaidAccount(inst, s.nextPlaidId);
        set((s) => ({
          plaidAccounts: [...s.plaidAccounts, newAcct],
          nextPlaidId: s.nextPlaidId + 1,
        }));
        get().addToast(`${inst.name} connected successfully!`, 'success');
      },

      syncAccount: (id) =>
        set((s) => ({
          plaidAccounts: s.plaidAccounts.map((a) => (a.id === id ? simulateSync(a) : a)),
        })),

      syncAll: () =>
        set((s) => ({ plaidAccounts: s.plaidAccounts.map(simulateSync) })),

      // ── Retirement ────────────────────────────────────────────────────────────
      updateRetirementBalance: (type, balance) =>
        set((s) => ({
          retirementAccounts: s.retirementAccounts.map((r) =>
            r.type === type ? { ...r, balance } : r
          ),
        })),

      logRetirementContrib: (type, amount) =>
        set((s) => ({
          retirementAccounts: s.retirementAccounts.map((r) =>
            r.type === type
              ? { ...r, ytdContrib: r.ytdContrib + amount, balance: r.balance + amount }
              : r
          ),
        })),

      // ── Derived ───────────────────────────────────────────────────────────────
      derived: {
        monthlyIncome: () => {
          const { income } = get();
          const now = new Date();
          return income
            .filter((i) => {
              const d = new Date(i.date);
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            })
            .reduce((s, i) => s + i.amount, 0);
        },
        allocatedAmount: () => {
          const { income } = get();
          const now = new Date();
          return income
            .filter((i) => {
              const d = new Date(i.date);
              return i.allocated && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            })
            .reduce((s, i) => s + i.amount, 0);
        },
        allocatedPct: () => {
          const { derived } = get();
          const total = derived.monthlyIncome();
          if (!total) return 0;
          return Math.round((derived.allocatedAmount() / total) * 100);
        },
        totalSavings: () => get().buckets.reduce((s, b) => s + b.current, 0),
        totalCCBalance: () => get().cards.reduce((s, c) => s + c.balance, 0),
        totalCCLimit: () => get().cards.reduce((s, c) => s + c.limit, 0),
        overallUtil: () => {
          const { derived } = get();
          return calcUtilization(derived.totalCCBalance(), derived.totalCCLimit());
        },
        cardsAtZero: () => get().cards.filter((c) => c.balance === 0).length,
        totalPortfolio: () => get().holdings.reduce((s, h) => s + h.value, 0),
        totalRetirement: () => get().retirementAccounts.reduce((s, r) => s + r.balance, 0),
        unallocatedIncome: () => get().income.filter((i) => !i.allocated),
      },

      // ── Reset ─────────────────────────────────────────────────────────────────
      resetToDefaults: () => set({ ...getDefaultState() }),
    }),
    {
      name: 'forgebudget-v095',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        income: s.income,
        nextIncId: s.nextIncId,
        buckets: s.buckets,
        nextBktId: s.nextBktId,
        goals: s.goals,
        nextGoalId: s.nextGoalId,
        cards: s.cards,
        nextCardId: s.nextCardId,
        plaidAccounts: s.plaidAccounts,
        nextPlaidId: s.nextPlaidId,
        retirementAccounts: s.retirementAccounts,
        holdings: s.holdings,
      }),
    }
  )
);

// ─── Convenience hook re-exports ──────────────────────────────────────────────
export const useModal = () => useStore((s) => ({ modal: s.modal, openModal: s.openModal, closeModal: s.closeModal }));
export const useToasts = () => useStore((s) => ({ toasts: s.toasts, addToast: s.addToast, removeToast: s.removeToast }));
export const useDerived = () => useStore((s) => s.derived);
