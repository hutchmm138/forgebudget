import { useState, useRef } from 'react';
import { CheckCircle, GripVertical, Inbox, Scissors, X, Plus, Upload, ImageIcon } from 'lucide-react';
import { fmt } from '@/lib/utils';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SplitLine {
  id: string;
  categoryId: string;
  amount: string;
  note: string;
}

interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  icon: string;
  categoryId: string | null;
  splits: SplitLine[];
  receiptImage?: string; // base64 data URL
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget: number;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1',  merchant: 'Walmart',           amount: 127.43, date: 'Jul 1',  icon: '🛒', categoryId: null, splits: [] },
  { id: 't2',  merchant: 'Shell Gas Station', amount: 89.20,  date: 'Jul 1',  icon: '⛽', categoryId: null, splits: [] },
  { id: 't3',  merchant: 'Costco',            amount: 214.67, date: 'Jun 30', icon: '🏪', categoryId: null, splits: [] },
  { id: 't4',  merchant: 'Amazon',            amount: 43.99,  date: 'Jun 30', icon: '📦', categoryId: null, splits: [] },
  { id: 't5',  merchant: 'Safeway',           amount: 76.12,  date: 'Jun 29', icon: '🥦', categoryId: null, splits: [] },
  { id: 't6',  merchant: 'Home Depot',        amount: 156.88, date: 'Jun 29', icon: '🔨', categoryId: null, splits: [] },
  { id: 't7',  merchant: 'McDonalds',         amount: 18.43,  date: 'Jun 28', icon: '🍔', categoryId: null, splits: [] },
  { id: 't8',  merchant: 'Chevron',           amount: 72.50,  date: 'Jun 28', icon: '⛽', categoryId: null, splits: [] },
  { id: 't9',  merchant: 'Netflix',           amount: 15.99,  date: 'Jun 27', icon: '📺', categoryId: null, splits: [] },
  { id: 't10', merchant: 'Starbucks',         amount: 12.75,  date: 'Jun 27', icon: '☕', categoryId: null, splits: [] },
  { id: 't11', merchant: 'Target',            amount: 98.32,  date: 'Jun 26', icon: '🎯', categoryId: null, splits: [] },
  { id: 't12', merchant: 'Spotify',           amount: 9.99,   date: 'Jun 26', icon: '🎵', categoryId: null, splits: [] },
  { id: 't13', merchant: 'BECU ATM',          amount: 200.00, date: 'Jun 25', icon: '🏦', categoryId: null, splits: [] },
  { id: 't14', merchant: "Domino's Pizza",    amount: 34.67,  date: 'Jun 25', icon: '🍕', categoryId: null, splits: [] },
  { id: 't15', merchant: 'AutoZone',          amount: 67.24,  date: 'Jun 24', icon: '🚗', categoryId: null, splits: [] },
];

const CATEGORIES: Category[] = [
  { id: 'groceries',     name: 'Groceries',        icon: '🛒', color: 'emerald', budget: 800  },
  { id: 'gas',           name: 'Gas & Fuel',        icon: '⛽', color: 'orange',  budget: 300  },
  { id: 'dining',        name: 'Dining Out',        icon: '🍔', color: 'red',     budget: 200  },
  { id: 'tools',         name: 'Tools & Equipment', icon: '🔨', color: 'amber',   budget: 400  },
  { id: 'subscriptions', name: 'Subscriptions',     icon: '📺', color: 'purple',  budget: 100  },
  { id: 'shopping',      name: 'Shopping',          icon: '🛍️', color: 'blue',    budget: 300  },
  { id: 'auto',          name: 'Auto & Repairs',    icon: '🚗', color: 'slate',   budget: 250  },
  { id: 'other',         name: 'Everything Else',   icon: '📋', color: 'gray',    budget: 500  },
];

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; spent: string }> = {
  emerald: { bg: 'bg-emerald-50',  border: 'border-emerald-200', text: 'text-emerald-700', spent: 'bg-emerald-500' },
  orange:  { bg: 'bg-orange-50',   border: 'border-orange-200',  text: 'text-orange-700',  spent: 'bg-orange-500'  },
  red:     { bg: 'bg-red-50',      border: 'border-red-200',     text: 'text-red-700',     spent: 'bg-red-500'     },
  amber:   { bg: 'bg-amber-50',    border: 'border-amber-200',   text: 'text-amber-700',   spent: 'bg-amber-500'   },
  purple:  { bg: 'bg-purple-50',   border: 'border-purple-200',  text: 'text-purple-700',  spent: 'bg-purple-500'  },
  blue:    { bg: 'bg-blue-50',     border: 'border-blue-200',    text: 'text-blue-700',    spent: 'bg-blue-500'    },
  slate:   { bg: 'bg-slate-100',   border: 'border-slate-300',   text: 'text-slate-700',   spent: 'bg-slate-500'   },
  gray:    { bg: 'bg-gray-50',     border: 'border-gray-200',    text: 'text-gray-700',    spent: 'bg-gray-400'    },
};

function genId() { return Math.random().toString(36).slice(2, 8); }

// ─── Split Modal ──────────────────────────────────────────────────────────────

function SplitModal({
  transaction,
  onClose,
  onSave,
  onSaveReceipt,
}: {
  transaction: Transaction;
  onClose: () => void;
  onSave: (splits: SplitLine[]) => void;
  onSaveReceipt: (image: string) => void;
}) {
  const [splits, setSplits] = useState<SplitLine[]>(
    transaction.splits.length > 0
      ? transaction.splits
      : [
          { id: genId(), categoryId: CATEGORIES[0].id, amount: '', note: '' },
          { id: genId(), categoryId: CATEGORIES[1].id, amount: '', note: '' },
        ]
  );
  const [receiptImage, setReceiptImage] = useState<string | undefined>(transaction.receiptImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSplit = splits.reduce((s, l) => s + (parseFloat(l.amount) || 0), 0);
  const remaining  = transaction.amount - totalSplit;
  const isBalanced = Math.abs(remaining) < 0.01;
  const isOver     = remaining < -0.01;

  function handleReceiptUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setReceiptImage(result);
      onSaveReceipt(result);
    };
    reader.readAsDataURL(file);
  }

  function addLine() {
    setSplits((prev) => [...prev, { id: genId(), categoryId: CATEGORIES[0].id, amount: '', note: '' }]);
  }

  function removeLine(id: string) {
    setSplits((prev) => prev.filter((l) => l.id !== id));
  }

  function updateLine(id: string, field: keyof SplitLine, value: string) {
    setSplits((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  }

  function fillRemaining(id: string) {
    const otherTotal = splits
      .filter((l) => l.id !== id)
      .reduce((s, l) => s + (parseFloat(l.amount) || 0), 0);
    const fill = Math.max(0, transaction.amount - otherTotal).toFixed(2);
    updateLine(id, 'amount', fill);
  }

  function handleSave() {
    if (!isBalanced) return;
    onSave(splits);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0f1e2e]/60 backdrop-blur-sm" onClick={onClose} />

      {/* Wide panel — two columns when receipt is present */}
      <div className={cn(
        'relative bg-white rounded-2xl shadow-2xl flex flex-col max-h-[92vh] w-full transition-all duration-300',
        receiptImage ? 'max-w-4xl' : 'max-w-lg'
      )}>

        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{transaction.icon}</span>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">{transaction.merchant}</h2>
              <p className="text-xs text-slate-400">{transaction.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-slate-400">Transaction total</p>
              <p className="text-xl font-extrabold text-slate-900">{fmt(transaction.amount)}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Body — side by side when receipt loaded */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── LEFT: Receipt panel ──────────────────────────────────────────── */}
          <div className={cn(
            'flex flex-col border-r border-slate-100 transition-all duration-300',
            receiptImage ? 'w-1/2' : 'w-0 overflow-hidden'
          )}>
            {receiptImage && (
              <>
                <div className="px-4 pt-4 pb-2 flex items-center justify-between shrink-0">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">📄 Receipt</p>
                  <button
                    onClick={() => { setReceiptImage(undefined); onSaveReceipt(''); }}
                    className="text-xs text-red-400 hover:text-red-600 font-semibold"
                  >
                    Remove
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-4">
                  <img
                    src={receiptImage}
                    alt="Receipt"
                    className="w-full rounded-xl border border-slate-200 shadow-sm object-contain"
                  />
                </div>
              </>
            )}
          </div>

          {/* ── RIGHT: Split lines panel ─────────────────────────────────────── */}
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* Remaining counter */}
            <div className="px-5 pt-4 shrink-0">
              <div className={cn(
                'rounded-xl px-4 py-2.5 flex items-center justify-between text-sm font-bold',
                isOver     ? 'bg-red-50 text-red-600 ring-1 ring-red-200' :
                isBalanced ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' :
                             'bg-slate-100 text-slate-600'
              )}>
                <span>{isBalanced ? '✅ Perfectly balanced!' : isOver ? '⚠️ Over by' : 'Remaining to split'}</span>
                {!isBalanced && <span className="text-lg">{fmt(Math.abs(remaining))}</span>}
              </div>
            </div>

            {/* Receipt upload button — shown when no receipt yet */}
            {!receiptImage && (
              <div className="px-5 pt-3 shrink-0">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-xs font-semibold text-slate-400 hover:border-orange-400 hover:text-orange-500 transition-colors"
                >
                  <Upload size={13} />
                  Upload receipt photo to view while splitting
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleReceiptUpload}
                />
              </div>
            )}

            {/* Split lines */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Split Lines</p>

              {splits.map((line, idx) => (
                <div key={line.id} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-400 w-5">#{idx + 1}</span>
                    <select
                      value={line.categoryId}
                      onChange={(e) => updateLine(line.id, 'categoryId', e.target.value)}
                      className="flex-1 text-xs font-semibold border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:border-orange-400 outline-none"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                      ))}
                    </select>
                    {splits.length > 1 && (
                      <button onClick={() => removeLine(line.id)} className="text-slate-300 hover:text-red-400 transition-colors">
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={line.amount}
                        onChange={(e) => updateLine(line.id, 'amount', e.target.value)}
                        className="w-full pl-6 pr-2 py-1.5 border border-slate-200 rounded-lg text-sm font-bold text-right focus:border-orange-400 outline-none bg-white"
                      />
                    </div>
                    <button
                      onClick={() => fillRemaining(line.id)}
                      className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-2 hover:bg-orange-100 transition-colors whitespace-nowrap"
                    >
                      Fill rest
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Note — e.g. kids snacks, work gloves"
                    value={line.note}
                    onChange={(e) => updateLine(line.id, 'note', e.target.value)}
                    className="mt-2 w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 focus:border-orange-400 outline-none bg-white"
                  />
                </div>
              ))}

              <button
                onClick={addLine}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-xs font-semibold text-slate-400 hover:border-orange-400 hover:text-orange-500 transition-colors"
              >
                <Plus size={13} />
                Add another split line
              </button>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-slate-100 flex gap-3 shrink-0">
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!isBalanced}
                className={cn(
                  'flex-1 py-2 rounded-xl text-sm font-bold transition-colors',
                  isBalanced
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                )}
              >
                {isBalanced ? '✅ Save Split' : `Balance first (${fmt(Math.abs(remaining))} off)`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Transaction Card ─────────────────────────────────────────────────────────

function TransactionCard({
  transaction,
  onDragStart,
  onTouchStart,
  onOpenSplit,
  isDragging,
}: {
  transaction: Transaction;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onTouchStart: (e: React.TouchEvent, id: string) => void;
  onOpenSplit: (id: string) => void;
  isDragging: boolean;
}) {
  const isSplit = transaction.splits.length > 0;
  const hasReceipt = !!transaction.receiptImage;

  return (
    <div
      draggable={!isSplit}
      onDragStart={(e) => !isSplit && onDragStart(e, transaction.id)}
      onTouchStart={(e) => !isSplit && onTouchStart(e, transaction.id)}
      className={cn(
        'bg-white border-2 rounded-2xl p-3 shadow-sm transition-all duration-150 select-none flex flex-col gap-1.5',
        isSplit
          ? 'border-orange-300 bg-orange-50'
          : 'border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-orange-400',
        isDragging && 'opacity-40 scale-95'
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xl">{transaction.icon}</span>
        <div className="flex items-center gap-1">
          {hasReceipt && <ImageIcon size={11} className="text-orange-400" />}
          {isSplit
            ? <span className="text-[10px] font-bold text-orange-500 bg-orange-100 px-1.5 py-0.5 rounded-full">SPLIT</span>
            : <GripVertical size={13} className="text-slate-300" />
          }
        </div>
      </div>
      <p className="text-xs font-bold text-slate-800 leading-tight">{transaction.merchant}</p>
      <p className="text-sm font-extrabold text-slate-900">{fmt(transaction.amount)}</p>
      <p className="text-[10px] text-slate-400">{transaction.date}</p>

      {isSplit && (
        <div className="mt-1 space-y-0.5">
          {transaction.splits.map((s) => {
            const cat = CATEGORIES.find((c) => c.id === s.categoryId);
            return (
              <div key={s.id} className="flex justify-between text-[10px] text-slate-500">
                <span>{cat?.icon} {cat?.name}</span>
                <span className="font-semibold">{fmt(parseFloat(s.amount) || 0)}</span>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={(e) => { e.stopPropagation(); onOpenSplit(transaction.id); }}
        className="mt-1 flex items-center justify-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 rounded-lg py-1 hover:bg-orange-100 transition-colors"
      >
        <Scissors size={10} />
        {isSplit ? 'Edit split' : 'Split'}
      </button>
    </div>
  );
}

// ─── Category Drop Zone ───────────────────────────────────────────────────────

function CategoryZone({
  category,
  transactions,
  isOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemove,
}: {
  category: Category;
  transactions: Transaction[];
  isOver: boolean;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, categoryId: string) => void;
  onRemove: (transactionId: string) => void;
}) {
  const colors = COLOR_MAP[category.color] ?? COLOR_MAP.gray;
  const spent = transactions.filter((t) => t.splits.length === 0).reduce((s, t) => s + t.amount, 0);
  const pct   = Math.min(100, (spent / category.budget) * 100);
  const over  = spent > category.budget;

  return (
    <div
      onDragOver={(e) => onDragOver(e, category.id)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, category.id)}
      className={cn(
        'rounded-2xl border-2 p-3 transition-all duration-150 min-h-[100px]',
        isOver ? 'border-orange-400 bg-orange-50 scale-[1.02] shadow-lg' : `${colors.border} ${colors.bg}`
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-base">{category.icon}</span>
          <span className={cn('text-xs font-bold', colors.text)}>{category.name}</span>
        </div>
        <span className={cn('text-xs font-extrabold', over ? 'text-red-600' : colors.text)}>{fmt(spent)}</span>
      </div>
      <div className="h-1.5 bg-white/70 rounded-full overflow-hidden mb-2">
        <div className={cn('h-full rounded-full transition-all duration-300', over ? 'bg-red-500' : colors.spent)} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10px] text-slate-400 mb-2">Budget: {fmt(category.budget)}</p>
      {transactions.length === 0 && (
        <div className={cn('flex items-center justify-center gap-1 py-2 rounded-xl border border-dashed text-xs', isOver ? 'border-orange-400 text-orange-500' : 'border-slate-200 text-slate-300')}>
          <Inbox size={12} />Drop here
        </div>
      )}
      <div className="flex flex-col gap-1.5 mt-1">
        {transactions.map((t) => (
          <div key={t.id} className="flex items-center justify-between bg-white/80 rounded-xl px-2.5 py-1.5 border border-white shadow-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{t.icon}</span>
              <div>
                <p className="text-[11px] font-semibold text-slate-800 leading-none">{t.merchant}</p>
                <p className="text-[10px] text-slate-400">{t.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900">{fmt(t.amount)}</span>
              <button onClick={() => onRemove(t.id)} className="text-slate-300 hover:text-red-400 transition-colors"><X size={12} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [draggingId, setDraggingId]         = useState<string | null>(null);
  const [overCategoryId, setOverCategoryId] = useState<string | null>(null);
  const [splitModalId, setSplitModalId]     = useState<string | null>(null);
  const touchDragId = useRef<string | null>(null);

  const unsorted = transactions.filter((t) => t.categoryId === null && t.splits.length === 0);
  const sorted   = transactions.filter((t) => t.categoryId !== null || t.splits.length > 0);
  const totalSorted   = sorted.reduce((s, t) => s + t.amount, 0);
  const totalUnsorted = unsorted.reduce((s, t) => s + t.amount, 0);
  const splitTransaction = transactions.find((t) => t.id === splitModalId) ?? null;

  function handleDragStart(e: React.DragEvent, id: string) { e.dataTransfer.setData('transactionId', id); setDraggingId(id); }
  function handleDragOver(e: React.DragEvent, categoryId: string) { e.preventDefault(); setOverCategoryId(categoryId); }
  function handleDragLeave() { setOverCategoryId(null); }
  function handleDrop(e: React.DragEvent, categoryId: string) {
    e.preventDefault();
    const id = e.dataTransfer.getData('transactionId');
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, categoryId, splits: [] } : t)));
    setDraggingId(null); setOverCategoryId(null);
  }
  function handleDragEnd() { setDraggingId(null); setOverCategoryId(null); }
  function handleTouchStart(_e: React.TouchEvent, id: string) { touchDragId.current = id; }

  function removeFromCategory(transactionId: string) {
    setTransactions((prev) => prev.map((t) => (t.id === transactionId ? { ...t, categoryId: null, splits: [] } : t)));
  }

  function handleSaveSplit(splits: SplitLine[]) {
    setTransactions((prev) => prev.map((t) => t.id === splitModalId ? { ...t, splits, categoryId: 'split' } : t));
    setSplitModalId(null);
  }

  function handleSaveReceipt(image: string) {
    setTransactions((prev) => prev.map((t) => t.id === splitModalId ? { ...t, receiptImage: image || undefined } : t));
  }

  function resetAll() { setTransactions(INITIAL_TRANSACTIONS); }

  return (
    <div className="space-y-6" onDragEnd={handleDragEnd}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Transactions</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Drag to a category, or tap <strong>Split</strong> to divide across budget lines. Upload a receipt photo to reference while splitting.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unsorted.length === 0 && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
              <CheckCircle size={13} />All sorted!
            </span>
          )}
          <button onClick={resetAll} className="text-xs text-slate-400 hover:text-slate-600 underline">Reset all</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200 p-3 text-center">
          <p className="text-xl font-extrabold text-slate-900">{transactions.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total transactions</p>
        </div>
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-3 text-center">
          <p className="text-xl font-extrabold text-amber-700">{unsorted.length}</p>
          <p className="text-xs text-amber-600 mt-0.5">Unsorted · {fmt(totalUnsorted)}</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-3 text-center">
          <p className="text-xl font-extrabold text-emerald-700">{sorted.length}</p>
          <p className="text-xs text-emerald-600 mt-0.5">Sorted · {fmt(totalSorted)}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 shrink-0">
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 sticky top-20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Unsorted</h3>
              {unsorted.length > 0 && (
                <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{unsorted.length} left</span>
              )}
            </div>
            {unsorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle size={32} className="text-emerald-400 mb-2" />
                <p className="text-sm font-bold text-emerald-600">All done!</p>
                <p className="text-xs text-slate-400 mt-1">Every transaction is categorized.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {unsorted.map((t) => (
                  <TransactionCard key={t.id} transaction={t} onDragStart={handleDragStart} onTouchStart={handleTouchStart} onOpenSplit={setSplitModalId} isDragging={draggingId === t.id} />
                ))}
              </div>
            )}
            {transactions.filter((t) => t.splits.length > 0).length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-orange-600 mb-2 flex items-center gap-1"><Scissors size={11} /> Split</p>
                <div className="grid grid-cols-2 gap-2">
                  {transactions.filter((t) => t.splits.length > 0).map((t) => (
                    <TransactionCard key={t.id} transaction={t} onDragStart={handleDragStart} onTouchStart={handleTouchStart} onOpenSplit={setSplitModalId} isDragging={false} />
                  ))}
                </div>
              </div>
            )}
            {unsorted.length > 0 && <p className="text-[10px] text-slate-400 text-center mt-3">Drag to category or tap Split →</p>}
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 content-start">
          {CATEGORIES.map((cat) => (
            <CategoryZone
              key={cat.id}
              category={cat}
              transactions={transactions.filter((t) => t.categoryId === cat.id && t.splits.length === 0)}
              isOver={overCategoryId === cat.id}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onRemove={removeFromCategory}
            />
          ))}
        </div>
      </div>

      {splitTransaction && (
        <SplitModal
          transaction={splitTransaction}
          onClose={() => setSplitModalId(null)}
          onSave={handleSaveSplit}
          onSaveReceipt={handleSaveReceipt}
        />
      )}
    </div>
  );
}
