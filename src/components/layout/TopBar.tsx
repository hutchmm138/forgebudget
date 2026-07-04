import { useLocation } from 'react-router-dom';
import { Zap, RefreshCw } from 'lucide-react';
import { useStore, useDerived } from '@/store/useForgeBudget';
import { fmt, pct } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

const ROUTE_TITLES: Record<string, string> = {
  '/':              'Dashboard',
  '/income':        'Income Tracking',
  '/transactions':  'Transactions',
  '/savings':       'Savings Buckets',
  '/investments':   'Investment Portfolio',
  '/retirement':    'Retirement Tracking',
  '/goals':         'Financial Goals',
  '/credit':        'Credit Cards',
  '/plaid':         'Plaid Accounts',
};

export function TopBar() {
  const location = useLocation();
  const title = ROUTE_TITLES[location.pathname] ?? 'ForgeBudget';
  const derived = useDerived();
  const openModal = useStore((s) => s.openModal);
  const syncAll = useStore((s) => s.syncAll);
  const addToast = useStore((s) => s.addToast);
  const monthInc = derived.monthlyIncome();
  const allocPct = derived.allocatedPct();

  function handleSyncAll() {
    syncAll();
    addToast('All accounts synced.', 'info');
  }

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-7 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <h2 className="text-[15px] font-bold text-slate-900">{title}</h2>
        <span className="text-[10px] bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 rounded-full px-2.5 py-0.5 font-semibold">
          Zero-Based Active
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-[10px] text-slate-500 uppercase tracking-wide leading-none">This Month</p>
          <p className="text-sm font-bold text-slate-900">{fmt(monthInc)}</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-[10px] text-slate-500 uppercase tracking-wide leading-none">Allocated</p>
          <p className="text-sm font-bold text-orange-600">{pct(allocPct, 0)}</p>
        </div>
        <Button
          size="sm"
          onClick={() => openModal('alloc')}
          className="gap-1"
        >
          <Zap size={13} />
          Allocate Income
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSyncAll}
          className="gap-1"
        >
          <RefreshCw size={13} />
          Sync All
        </Button>
      </div>
    </header>
  );
}
