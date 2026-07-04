import { useStore } from '@/store/useForgeBudget';
import { fmt, pct, progressPct, formatDateDisplay, daysUntil } from '@/lib/utils';
import { Card, Badge, ProgressBar, EmptyState } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Target } from 'lucide-react';
import type { FinancialGoal } from '@/types';

const PRIORITY_BADGE: Record<FinancialGoal['priority'], 'red' | 'amber' | 'gray'> = {
  High:   'red',
  Medium: 'amber',
  Low:    'gray',
};

export function GoalsPage() {
  const goals      = useStore((s) => s.goals);
  const openModal  = useStore((s) => s.openModal);
  const deleteGoal = useStore((s) => s.deleteGoal);
  const addToast   = useStore((s) => s.addToast);

  function handleDelete(id: number, name: string) {
    if (!confirm(`Remove "${name}"?`)) return;
    deleteGoal(id);
    addToast('Goal removed.', 'info');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Financial Goals</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Clear targets keep your family moving forward — homeownership, legacy, security.
          </p>
        </div>
        <Button onClick={() => openModal('goal')}>
          <Target size={15} />
          New Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="No goals yet"
          subtitle="Set a financial goal to stay motivated and on track."
          action={<Button onClick={() => openModal('goal')}>Create First Goal</Button>}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {goals.map((g) => {
            const p      = progressPct(g.currentAmount, g.targetAmount);
            const days   = daysUntil(g.targetDate);
            const remain = Math.max(0, g.targetAmount - g.currentAmount);

            return (
              <Card key={g.id}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-slate-900 text-sm">{g.name}</h3>
                      <Badge variant={PRIORITY_BADGE[g.priority]}>{g.priority} Priority</Badge>
                    </div>
                    <p className="text-xs text-slate-400">
                      Target date: {formatDateDisplay(g.targetDate)} · {days} days remaining
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl font-extrabold text-slate-900">{fmt(g.currentAmount)}</p>
                    <p className="text-xs text-slate-400">of {fmt(g.targetAmount)}</p>
                  </div>
                </div>

                <ProgressBar value={p} color="orange" size="md" className="mb-2" />

                <div className="flex justify-between text-xs text-slate-500 mb-4">
                  <span className="text-emerald-600 font-semibold">{pct(p, 0)} complete</span>
                  <span>{remain > 0 ? `${fmt(remain)} to go` : '🎉 Goal reached!'}</span>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" onClick={() => openModal('goalContrib', g.id)}>
                    + Contribute
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(g.id, g.name)}>
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
