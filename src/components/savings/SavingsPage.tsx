import { useStore } from '@/store/useForgeBudget';
import { fmt, pct, progressPct, BUCKET_COLOR_MAP } from '@/lib/utils';
import { Card, Badge, ProgressBar, EmptyState } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { PlusCircle } from 'lucide-react';

export function SavingsPage() {
  const buckets   = useStore((s) => s.buckets);
  const openModal = useStore((s) => s.openModal);

  const totalSaved  = buckets.reduce((s, b) => s + b.current, 0);
  const totalTarget = buckets.reduce((s, b) => s + b.target, 0);
  const overallPct  = progressPct(totalSaved, totalTarget);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Savings Buckets</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Every dollar saved has a specific purpose. Zero-based means intentional allocation.
          </p>
        </div>
        <Button onClick={() => openModal('bucket')}>
          <PlusCircle size={15} />
          New Bucket
        </Button>
      </div>

      {/* Overall summary */}
      {buckets.length > 0 && (
        <Card className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-semibold text-slate-700">Overall Progress</span>
              <span className="font-extrabold text-slate-900">{fmt(totalSaved)} <span className="text-slate-400 font-medium">of {fmt(totalTarget)}</span></span>
            </div>
            <ProgressBar value={overallPct} color="emerald" size="md" />
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold text-emerald-600">{pct(overallPct, 0)}</p>
            <p className="text-xs text-slate-500">of total goals</p>
          </div>
        </Card>
      )}

      {/* Buckets grid */}
      {buckets.length === 0 ? (
        <EmptyState
          icon="🪣"
          title="No savings buckets yet"
          subtitle="Create your first bucket to start allocating money with purpose."
          action={<Button onClick={() => openModal('bucket')}>Create First Bucket</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {buckets.map((b) => {
            const p = progressPct(b.current, b.target);
            const remaining = Math.max(0, b.target - b.current);
            const colors = BUCKET_COLOR_MAP[b.color] ?? BUCKET_COLOR_MAP.emerald;

            return (
              <Card key={b.id} className="flex flex-col">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{b.name}</h3>
                  <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${colors.badge}`}>
                    {pct(p, 0)}
                  </span>
                </div>

                {b.notes && <p className="text-xs text-slate-400 mb-3">{b.notes}</p>}

                <div className="flex justify-between items-end mb-2 mt-1">
                  <div>
                    <p className="text-2xl font-extrabold text-slate-900">{fmt(b.current)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">of {fmt(b.target)} target</p>
                  </div>
                </div>

                <ProgressBar value={p} color={b.color as 'emerald'} size="md" className="mb-2" />

                <p className="text-xs text-slate-500 mb-4">
                  {remaining > 0 ? `${fmt(remaining)} remaining to goal` : '🎉 Goal reached!'}
                </p>

                <div className="flex gap-2 mt-auto">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => openModal('contrib', b.id)}
                  >
                    + Add Funds
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openModal('editBucket', b.id)}
                  >
                    Edit
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
