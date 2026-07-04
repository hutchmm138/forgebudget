import { clsx, type ClassValue } from 'clsx';

// ─── Class merger ────────────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// ─── Currency formatting ─────────────────────────────────────────────────────
export function fmt(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function fmtCompact(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    return '$' + (amount / 1_000_000).toFixed(1) + 'M';
  }
  if (Math.abs(amount) >= 1_000) {
    return '$' + (amount / 1_000).toFixed(1) + 'k';
  }
  return fmt(amount);
}

// ─── Percentage formatting ────────────────────────────────────────────────────
export function pct(value: number, decimals = 1): string {
  return value.toFixed(decimals) + '%';
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[m - 1]} ${d}, ${y}`;
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((target.getTime() - now.getTime()) / 86_400_000));
}

export function currentMonthLabel(): string {
  return new Date().toLocaleString('default', { month: 'long' });
}

export function getDayLabel(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getFullDateLabel(): string {
  const now = new Date();
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const months = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
  ];
  return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
}

// ─── Financial calculations ───────────────────────────────────────────────────
export function calcUtilization(balance: number, limit: number): number {
  if (!limit) return 0;
  return (balance / limit) * 100;
}

export function utilizationLabel(util: number): string {
  if (util === 0) return 'Zero balance • Excellent';
  if (util < 10) return 'Excellent • AZEO aligned';
  if (util < 30) return 'Good standing';
  if (util < 50) return 'Fair — consider paydown';
  return 'High utilization — pay down now';
}

export function utilizationColor(util: number): string {
  if (util < 10) return 'text-emerald-600';
  if (util < 30) return 'text-amber-600';
  return 'text-red-600';
}

export function futureValue(
  presentValue: number,
  annualContrib: number,
  years: number,
  ratePercent: number
): number {
  const r = ratePercent / 100;
  if (r === 0) return presentValue + annualContrib * years;
  return (
    presentValue * Math.pow(1 + r, years) +
    annualContrib * ((Math.pow(1 + r, years) - 1) / r)
  );
}

// ─── Progress helpers ─────────────────────────────────────────────────────────
export function progressPct(current: number, target: number): number {
  if (!target) return 0;
  return Math.min(100, (current / target) * 100);
}

// ─── ID generation ────────────────────────────────────────────────────────────
export function genId(): string {
  return Math.random().toString(36).slice(2, 9);
}

// ─── Color map for buckets ────────────────────────────────────────────────────
export const BUCKET_COLOR_MAP: Record<string, { bar: string; badge: string }> = {
  emerald: { bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700' },
  blue:    { bar: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700' },
  orange:  { bar: 'bg-orange-500',  badge: 'bg-orange-50 text-orange-700' },
  amber:   { bar: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700' },
  red:     { bar: 'bg-red-500',     badge: 'bg-red-50 text-red-700' },
  purple:  { bar: 'bg-purple-500',  badge: 'bg-purple-50 text-purple-700' },
  teal:    { bar: 'bg-teal-500',    badge: 'bg-teal-50 text-teal-700' },
};
