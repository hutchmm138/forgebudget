import { useState, useEffect, useCallback } from 'react';
import { useStore, useModal } from '@/store/useForgeBudget';
import { fmt, formatDateDisplay } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SectionDivider } from '@/components/ui';

export function AllocModal() {
  const { modal, closeModal } = useModal();
  const income   = useStore((s) => s.income);
  const buckets  = useStore((s) => s.buckets);
  const goals    = useStore((s) => s.goals);
  const cards    = useStore((s) => s.cards);
  const applyAllocation = useStore((s) => s.applyAllocation);

  const isOpen = modal.open === 'alloc';
  const unallocated = income.filter((i) => !i.allocated);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [bucketVals, setBucketVals]   = useState<Record<number, string>>({});
  const [goalVals, setGoalVals]       = useState<Record<number, string>>({});
  const [cardVals, setCardVals]       = useState<Record<number, string>>({});
  const [retVal, setRetVal]           = useState('');

  // Seed selected entry
  useEffect(() => {
    if (!isOpen) return;
    if (modal.incomeId && unallocated.some((i) => i.id === modal.incomeId)) {
      setSelectedId(modal.incomeId);
    } else if (unallocated.length > 0) {
      setSelectedId(unallocated[0].id);
    }
  }, [isOpen, modal.incomeId]);

  // Reset numeric fields when entry changes
  useEffect(() => {
    setBucketVals({});
    setGoalVals({});
    setCardVals({});
    setRetVal('');
  }, [selectedId]);

  const selectedEntry = income.find((i) => i.id === selectedId);
  const entryAmount   = selectedEntry?.amount ?? 0;

  const parse = (v: string) => Math.max(0, parseFloat(v) || 0);

  const totalAllocated = useCallback(() => {
    let t = 0;
    buckets.forEach((b) => { t += parse(bucketVals[b.id] ?? ''); });
    goals.filter((g) => g.currentAmount < g.targetAmount).forEach((g) => { t += parse(goalVals[g.id] ?? ''); });
    cards.filter((c) => c.balance > 0).forEach((c) => { t += parse(cardVals[c.id] ?? ''); });
    t += parse(retVal);
    return t;
  }, [bucketVals, goalVals, cardVals, retVal, buckets, goals, cards]);

  const remaining = entryAmount - totalAllocated();
  const isOver    = remaining < -0.01;
  const isZero    = Math.abs(remaining) < 0.01;

  function handleApply() {
    if (!selectedId) return;
    const bAmts: Record<number, number> = {};
    buckets.forEach((b) => { const v = parse(bucketVals[b.id] ?? ''); if (v) bAmts[b.id] = v; });
    const gAmts: Record<number, number> = {};
    goals.filter((g) => g.currentAmount < g.targetAmount).forEach((g) => { const v = parse(goalVals[g.id] ?? ''); if (v) gAmts[g.id] = v; });
    const cAmts: Record<number, number> = {};
    cards.filter((c) => c.balance > 0).forEach((c) => { const v = parse(cardVals[c.id] ?? ''); if (v) cAmts[c.id] = v; });
    applyAllocation(selectedId, bAmts, gAmts, cAmts, parse(retVal));
    if (Math.abs(remaining) < 0.01) closeModal();
  }

  const openGoals  = goals.filter((g) => g.currentAmount < g.targetAmount);
  const openCards  = cards.filter((c) => c.balance > 0);

  return (
    <Modal
      open={isOpen}
      onClose={closeModal}
      title="⚡ Allocate Income"
      subtitle="Zero-based budgeting · Assign every dollar a job"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={closeModal}>Cancel</Button>
          <Button onClick={handleApply} disabled={!isZero && !isOver}>
            ✅ Apply Allocation
          </Button>
        </>
      }
    >
      {unallocated.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">
          All income entries are fully allocated. Log a new paycheck first.
        </p>
      ) : (
        <div className="space-y-4">
          {/* Entry selector */}
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1.5">
              Select Income Entry to Allocate
            </label>
            <select
              className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm text-slate-800 focus:border-orange-500 outline-none"
              value={selectedId ?? ''}
              onChange={(e) => setSelectedId(Number(e.target.value))}
            >
              {unallocated.map((i) => (
                <option key={i.id} value={i.id}>
                  {formatDateDisplay(i.date)} — {i.source} — {fmt(i.amount)}
                </option>
              ))}
            </select>
          </div>

          {/* Remaining counter */}
          <div
            className={`rounded-lg px-4 py-3 text-center font-black text-2xl transition-colors ${
              isOver
                ? 'bg-red-50 text-red-600 ring-1 ring-red-200'
                : isZero
                ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {isOver
              ? `Over by ${fmt(Math.abs(remaining))}`
              : isZero
              ? '✅ Every dollar has a job!'
              : `${fmt(remaining)} remaining`}
          </div>

          {/* Savings Buckets */}
          <SectionDivider label="Savings Buckets" />
          {buckets.map((b) => (
            <AllocRow
              key={b.id}
              label={b.name}
              sublabel={`${fmt(Math.max(0, b.target - b.current))} to goal`}
              value={bucketVals[b.id] ?? ''}
              onChange={(v) => setBucketVals((prev) => ({ ...prev, [b.id]: v }))}
            />
          ))}

          {/* Goals */}
          {openGoals.length > 0 && (
            <>
              <SectionDivider label="Financial Goals" />
              {openGoals.map((g) => (
                <AllocRow
                  key={g.id}
                  label={g.name}
                  sublabel={`${fmt(g.targetAmount - g.currentAmount)} remaining`}
                  value={goalVals[g.id] ?? ''}
                  onChange={(v) => setGoalVals((prev) => ({ ...prev, [g.id]: v }))}
                />
              ))}
            </>
          )}

          {/* Credit Cards */}
          {openCards.length > 0 && (
            <>
              <SectionDivider label="Credit Card Paydowns" />
              {openCards.map((c) => (
                <AllocRow
                  key={c.id}
                  label={c.name}
                  sublabel={`Balance: ${fmt(c.balance)}`}
                  value={cardVals[c.id] ?? ''}
                  onChange={(v) => setCardVals((prev) => ({ ...prev, [c.id]: v }))}
                />
              ))}
            </>
          )}

          {/* Retirement */}
          <SectionDivider label="Retirement (Extra)" />
          <AllocRow
            label="Extra 401(k) Contribution"
            sublabel="Above regular payroll deductions"
            value={retVal}
            onChange={setRetVal}
          />
        </div>
      )}
    </Modal>
  );
}

function AllocRow({
  label, sublabel, value, onChange,
}: {
  label: string; sublabel: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-800 font-medium truncate">{label}</p>
        <p className="text-xs text-slate-400">{sublabel}</p>
      </div>
      <div className="relative w-28 shrink-0">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">$</span>
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-6 pr-2 py-1.5 border-2 border-slate-200 rounded-lg text-sm text-right focus:border-orange-500 outline-none"
        />
      </div>
    </div>
  );
}
