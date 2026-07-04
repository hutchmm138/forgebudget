import { useNavigate } from 'react-router-dom';
import { DollarSign, Target, CreditCard, Link2, ArrowRight } from 'lucide-react';
import { useStore, useDerived } from '@/store/useForgeBudget';
import {
  fmt, pct, getDayLabel, getFullDateLabel, formatDateDisplay,
  currentMonthLabel, progressPct,
} from '@/lib/utils';
import { MetricCard, Card, CardHeader, ProgressBar, Badge, EmptyState } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { IncomeChart } from './IncomeChart';

export function Dashboard() {
  const navigate = useNavigate();
  const derived  = useDerived();
  const openModal = useStore((s) => s.openModal);
  const income    = useStore((s) => s.income);
  const buckets   = useStore((s) => s.buckets);

  const monthInc  = derived.monthlyIncome();
  const allocPct  = derived.allocatedPct();
  const totalSav  = derived.totalSavings();
  const totPort   = derived.totalPortfolio();
  const totRet    = derived.totalRetirement();
  const util      = derived.overallUtil();
  const remaining = monthInc * (1 - allocPct / 100);

  // Recent activity: latest 5 income entries
  const recentActivity = income.slice(0, 5);

  const QUICK_ACTIONS = [
    { icon: DollarSign, label: 'Log New Paycheck',       action: () => navigate('/income') },
    { icon: Target,     label: 'Create New Goal',         action: () => openModal('goal') },
    { icon: CreditCard, label: 'Record Credit Payment',   action: () => navigate('/credit') },
    { icon: Link2,      label: 'Connect New Account',     action: () => openModal('plaid') },
  ];

  const utilColor = util < 10 ? 'green' : util < 30 ? 'amber' : 'neutral';
  const utilLabel = util < 10 ? `Excellent • AZEO aligned` : util < 30 ? 'Good standing' : 'High — pay down';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl bg-gradient-to-r from-[#0f1e2e] to-[#1e3a52] px-7 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] text-slate-500 uppercase tracking-widest mb-1">{getFullDateLabel()}</p>
          <h1 className="text-2xl font-extrabold text-white">{getDayLabel()}, Morgan.</h1>
          <p className="text-sm text-slate-400 mt-1">Your financial foundation is being forged, one paycheck at a time.</p>
        </div>
        <div className="shrink-0">
          <span className="inline-flex items-center gap-1.5 bg-orange-600/20 border border-orange-500/50 text-orange-300 text-xs font-bold px-4 py-2 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            On Track · Zero-based · {currentMonthLabel()}
          </span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Savings"
          value={fmt(totalSav)}
          change="+ $1,240 this month"
          changeColor="green"
        />
        <MetricCard
          label="Investments"
          value={fmt(totPort)}
          change="+8.4% YTD"
          changeColor="green"
        />
        <MetricCard
          label="Retirement"
          value={fmt(totRet)}
          change="+ $620 this month"
          changeColor="green"
        />
        <MetricCard
          label="Credit Utilization"
          value={pct(util)}
          change={utilLabel}
          changeColor={utilColor}
        />
      </div>

      {/* Charts + Allocation Status */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Income Chart */}
        <Card className="lg:col-span-3">
          <CardHeader
            title="Income Trend (Last 6 Months)"
            subtitle="Irregular income pattern · Prevailing wage + side work"
            action={<Badge variant="gray">Zero-based view</Badge>}
          />
          <IncomeChart />
        </Card>

        {/* Allocation Status */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader title={`${currentMonthLabel()} Allocation Status`} />
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-500">Total Income Logged</span>
              <strong className="text-slate-900">{fmt(monthInc)}</strong>
            </div>
            <ProgressBar value={allocPct} color="emerald" size="md" className="mb-1" />
            <p className="text-right text-xs text-slate-500 mb-4">
              {pct(allocPct, 0)} allocated · {fmt(remaining)} remaining
            </p>

            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Where Dollars Went</p>
            <div className="space-y-1.5 text-sm">
              {[
                { label: 'Savings Buckets', value: '$3,180' },
                { label: 'Financial Goals', value: '$1,650' },
                { label: 'Credit Paydowns', value: '$1,200' },
                { label: 'Retirement (extra)', value: '$450' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-slate-600">
                    <span className="text-orange-500 font-bold mr-1">→</span>{label}
                  </span>
                  <strong className="text-slate-900">{value}</strong>
                </div>
              ))}
            </div>

            {remaining > 0 && (
              <Button
                fullWidth
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => openModal('alloc')}
              >
                Allocate Remaining {fmt(remaining)}
              </Button>
            )}
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader
              title="Recent Activity"
              action={
                <button
                  onClick={() => navigate('/income')}
                  className="text-xs text-orange-600 font-semibold flex items-center gap-0.5 hover:underline"
                >
                  View all <ArrowRight size={12} />
                </button>
              }
            />
            {recentActivity.length === 0 ? (
              <EmptyState icon="💵" title="No income logged yet" subtitle="Log your first paycheck to get started." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentActivity.map((i) => (
                  <li key={i.id} className="py-2.5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-sm shrink-0">💵</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{i.source}</p>
                      <p className="text-[11px] text-slate-400">{formatDateDisplay(i.date)}</p>
                    </div>
                    <span className="text-sm font-bold text-slate-900">+{fmt(i.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {/* Savings Snapshot */}
      {buckets.length > 0 && (
        <Card>
          <CardHeader
            title="Savings Snapshot"
            action={
              <button onClick={() => navigate('/savings')} className="text-xs text-orange-600 font-semibold hover:underline flex items-center gap-0.5">
                All buckets <ArrowRight size={12} />
              </button>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {buckets.map((b) => {
              const p = progressPct(b.current, b.target);
              return (
                <div key={b.id} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs font-bold text-slate-700 truncate mb-1">{b.name}</p>
                  <p className="text-base font-extrabold text-slate-900">{fmt(b.current)}</p>
                  <ProgressBar value={p} color={b.color as 'emerald'} className="my-1.5" />
                  <p className="text-[11px] text-slate-500">{pct(p, 0)} of {fmt(b.target)}</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader title="Quick Actions" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(({ icon: Icon, label, action }) => (
            <button
              key={label}
              onClick={action}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-orange-500 hover:bg-orange-50 transition-all duration-150 text-center group"
            >
              <Icon size={22} className="text-slate-400 group-hover:text-orange-600 transition-colors" />
              <span className="text-xs font-semibold text-slate-600 group-hover:text-orange-700">{label}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
