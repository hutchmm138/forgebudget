import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, DollarSign, PiggyBank, TrendingUp,
  Landmark, Target, CreditCard, Link2, ArrowLeftRight, Star,
} from 'lucide-react';
import { useStore, useDerived } from '@/store/useForgeBudget';
import { fmt, pct, currentMonthLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/',              icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/income',        icon: DollarSign,      label: 'Income' },
  { to: '/transactions',  icon: ArrowLeftRight,  label: 'Transactions' },
  { to: '/savings',       icon: PiggyBank,       label: 'Savings' },
  { to: '/investments',   icon: TrendingUp,      label: 'Investments' },
  { to: '/retirement',    icon: Landmark,        label: 'Retirement' },
  { to: '/goals',         icon: Target,          label: 'Financial Goals' },
  { to: '/credit',        icon: CreditCard,      label: 'Credit Cards' },
  { to: '/credit-score',  icon: Star,            label: 'Credit Score' },
  { to: '/plaid',         icon: Link2,           label: 'Plaid Accounts' },
];

export function Sidebar() {
  const derived = useDerived();
  const monthInc = derived.monthlyIncome();
  const allocPct = derived.allocatedPct();

  return (
    <aside className="w-60 min-h-screen bg-[#0f1e2e] flex flex-col fixed top-0 left-0 z-40">
      <div className="px-5 py-5 border-b border-[#1e3a52]">
        <h1 className="text-lg font-black tracking-widest text-orange-400">⚒ ForgeBudget</h1>
        <p className="text-[10px] text-slate-500 tracking-wider mt-0.5 uppercase">Zero-Based · Built for Real Life</p>
        <p className="text-[9px] text-slate-600 mt-1">v0.95 · Prototype</p>
      </div>

      <div className="px-5 py-4 border-b border-[#1e3a52] flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-sm shrink-0">MH</div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white leading-none truncate">Morgan Hutchins</p>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">Gig Harbor, WA · Family of 6+</p>
        </div>
      </div>

      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-5 py-2.5 text-[13px] font-medium transition-all duration-150 border-l-[3px]',
                isActive
                  ? 'bg-[#162840] text-orange-400 border-orange-500'
                  : 'text-slate-400 border-transparent hover:bg-[#162840] hover:text-white'
              )
            }
          >
            <Icon size={16} className="shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-[#1e3a52] bg-[#162840]">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Zero-Based Active</span>
        </div>
        <p className="text-sm font-bold text-white">{fmt(monthInc)} this month</p>
        <p className="text-xs text-orange-400 font-semibold mt-0.5">{pct(allocPct, 0)} allocated · {currentMonthLabel()}</p>
        <div className="mt-2 h-1 bg-[#0f1e2e] rounded-full overflow-hidden">
          <div className="h-full bg-orange-500 rounded-full transition-all duration-700" style={{ width: `${allocPct}%` }} />
        </div>
      </div>
    </aside>
  );
}
