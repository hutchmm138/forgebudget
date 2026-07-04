import { useStore, useDerived } from '@/store/useForgeBudget';
import { fmt, pct, calcUtilization, formatDateDisplay } from '@/lib/utils';
import { Card, Badge, ProgressBar, EmptyState } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { CreditCard } from 'lucide-react';
import type { CreditCard as CCType } from '@/types';

function utilBadge(util: number): 'green' | 'amber' | 'red' {
  if (util === 0) return 'green';
  if (util < 10)  return 'green';
  if (util < 30)  return 'amber';
  return 'red';
}

export function CreditPage() {
  const cards       = useStore((s) => s.cards);
  const openModal   = useStore((s) => s.openModal);
  const deleteCard  = useStore((s) => s.deleteCard);
  const addToast    = useStore((s) => s.addToast);
  const derived     = useDerived();

  const totalBal   = derived.totalCCBalance();
  const totalLim   = derived.totalCCLimit();
  const avail      = totalLim - totalBal;
  const util       = derived.overallUtil();
  const cardsZero  = derived.cardsAtZero();

  const utilLabel = util < 10 ? 'Excellent standing · AZEO aligned'
    : util < 30 ? 'Good standing'
    : 'High utilization — consider paydown';

  function handleDelete(c: CCType) {
    if (!confirm(`Remove "${c.name}"?`)) return;
    deleteCard(c.id);
    addToast('Card removed.', 'info');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Credit Card Tracking</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Full visibility + AZEO optimization. Pay all but one card to zero every month.
          </p>
        </div>
        <Button onClick={() => openModal('addCard')}>
          <CreditCard size={15} />
          Add Card
        </Button>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Overall Utilization', value: pct(util), sub: utilLabel, big: true },
          { label: 'Total Balance',        value: fmt(totalBal)  },
          { label: 'Total Limit',          value: fmt(totalLim)  },
          { label: 'Available Credit',     value: fmt(avail)     },
          { label: 'Cards at $0',          value: String(cardsZero) },
        ].map(({ label, value, sub, big }) => (
          <Card key={label} className="text-center">
            <p className={`font-extrabold ${big ? 'text-2xl' : 'text-xl'} ${util < 10 ? 'text-emerald-600' : util < 30 ? 'text-amber-600' : 'text-red-600'}`}>
              {value}
            </p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
            {sub && <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">{sub}</p>}
          </Card>
        ))}
      </div>

      {/* Cards */}
      {cards.length === 0 ? (
        <EmptyState
          icon="💳"
          title="No cards added yet"
          subtitle="Track your credit cards to optimize utilization and hit AZEO status."
          action={<Button onClick={() => openModal('addCard')}>Add First Card</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((c) => {
            const u  = calcUtilization(c.balance, c.limit);
            const bv = utilBadge(u);

            return (
              <Card key={c.id}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.issuer}</p>
                  </div>
                  <Badge variant={bv}>{u === 0 ? '$0' : pct(u)}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Balance</p>
                    <p className="font-extrabold text-slate-900">{fmt(c.balance)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Limit</p>
                    <p className="font-bold text-slate-700">{fmt(c.limit)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Available</p>
                    <p className="font-bold text-emerald-600">{fmt(c.limit - c.balance)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">APR</p>
                    <p className="font-bold text-slate-700">{c.apr}%</p>
                  </div>
                </div>

                <ProgressBar
                  value={u}
                  color={u < 10 ? 'emerald' : u < 30 ? 'amber' : 'orange'}
                  className="mb-3"
                />

                <div className="flex justify-between text-xs text-slate-400 mb-4">
                  <span>Due {formatDateDisplay(c.dueDate)}</span>
                  <span>Last pmt {formatDateDisplay(c.lastPayment)}</span>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => openModal('ccPay', c.id)}>
                    💳 Make Payment
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(c)}>
                    Remove
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
