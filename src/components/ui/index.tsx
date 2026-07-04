import { cn } from '@/lib/utils';

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}
export function Card({ children, className, padding = true }: CardProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-slate-200 shadow-sm', padding && 'p-5', className)}>
      {children}
    </div>
  );
}

// ─── Card Header ──────────────────────────────────────────────────────────────
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}
export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-4', className)}>
      <div>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="ml-4 shrink-0">{action}</div>}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = 'green' | 'amber' | 'red' | 'blue' | 'gray' | 'orange' | 'purple';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const badgeStyles: Record<BadgeVariant, string> = {
  green:  'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  amber:  'bg-amber-50   text-amber-700   ring-1 ring-amber-200',
  red:    'bg-red-50     text-red-700     ring-1 ring-red-200',
  blue:   'bg-blue-50    text-blue-700    ring-1 ring-blue-200',
  gray:   'bg-slate-100  text-slate-600   ring-1 ring-slate-200',
  orange: 'bg-orange-50  text-orange-700  ring-1 ring-orange-200',
  purple: 'bg-purple-50  text-purple-700  ring-1 ring-purple-200',
};

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold', badgeStyles[variant], className)}>
      {children}
    </span>
  );
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────
interface ProgressBarProps {
  value: number;  // 0-100
  color?: 'emerald' | 'orange' | 'amber' | 'blue' | 'red' | 'purple' | 'teal';
  size?: 'sm' | 'md';
  className?: string;
}

const barColors: Record<string, string> = {
  emerald: 'bg-emerald-500',
  orange:  'bg-orange-500',
  amber:   'bg-amber-500',
  blue:    'bg-blue-500',
  red:     'bg-red-500',
  purple:  'bg-purple-500',
  teal:    'bg-teal-500',
};

export function ProgressBar({ value, color = 'emerald', size = 'sm', className }: ProgressBarProps) {
  const height = size === 'sm' ? 'h-2' : 'h-3';
  return (
    <div className={cn('w-full bg-slate-100 rounded-full overflow-hidden', height, className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-500', barColors[color] || barColors.emerald)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}

// ─── MetricCard ───────────────────────────────────────────────────────────────
interface MetricCardProps {
  label: string;
  value: string;
  change?: string;
  changeColor?: 'green' | 'amber' | 'neutral';
  className?: string;
}

export function MetricCard({ label, value, change, changeColor = 'green', className }: MetricCardProps) {
  const changeColors = {
    green:   'text-emerald-600',
    amber:   'text-amber-600',
    neutral: 'text-slate-500',
  };
  return (
    <Card className={cn('flex flex-col', className)}>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{label}</p>
      <p className="text-2xl font-extrabold text-slate-900 leading-none">{value}</p>
      {change && <p className={cn('text-xs mt-1.5 font-medium', changeColors[changeColor])}>{change}</p>}
    </Card>
  );
}

// ─── FormField ────────────────────────────────────────────────────────────────
interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, required, error, children, className }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label className="text-xs font-semibold text-slate-600 tracking-wide uppercase">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
    </div>
  );
}

// Shared input/select class strings
export const inputCls = 'w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm text-slate-800 bg-white outline-none transition-colors focus:border-orange-500 placeholder:text-slate-400';
export const selectCls = inputCls;

// ─── SectionDivider ───────────────────────────────────────────────────────────
export function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 my-3">
      <div className="h-px flex-1 bg-slate-100" />
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">{label}</span>
      <div className="h-px flex-1 bg-slate-100" />
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}
export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-sm font-bold text-slate-700">{title}</h3>
      {subtitle && <p className="text-xs text-slate-400 mt-1 max-w-xs">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
