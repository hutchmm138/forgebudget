import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { TrendingUp, TrendingDown, Plus, X } from 'lucide-react';
import { fmt } from '@/lib/utils';
import { cn } from '@/lib/utils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScoreEntry {
  id: string;
  date: string;       // YYYY-MM-DD
  score: number;
  source: string;
  notes: string;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const INITIAL_ENTRIES: ScoreEntry[] = [
  { id: 's1', date: '2026-01-15', score: 672, source: 'Credit Karma', notes: 'Starting point' },
  { id: 's2', date: '2026-02-14', score: 681, source: 'Credit Karma', notes: 'Paid down Chase card' },
  { id: 's3', date: '2026-03-18', score: 688, source: 'Experian',     notes: '' },
  { id: 's4', date: '2026-04-12', score: 695, source: 'Credit Karma', notes: 'Utilization dropped' },
  { id: 's5', date: '2026-05-10', score: 701, source: 'Credit Karma', notes: 'Broke 700!' },
  { id: 's6', date: '2026-06-15', score: 714, source: 'Experian',     notes: 'AZEO strategy working' },
];

const SOURCES = ['Credit Karma', 'Experian', 'Equifax', 'TransUnion', 'MyFICO', 'Credit Sesame', 'Bank App', 'Other'];

function genId() { return Math.random().toString(36).slice(2, 8); }

// ─── Score band helpers ───────────────────────────────────────────────────────

function getScoreBand(score: number): {
  label: string; color: string; bg: string; ring: string;
  gauge: string; min: number; max: number; tip: string;
} {
  if (score >= 800) return { label: 'Exceptional',  color: 'text-emerald-600', bg: 'bg-emerald-50',  ring: 'ring-emerald-300', gauge: '#059669', min: 800, max: 850, tip: 'You qualify for the best rates on any loan. Keep it up!' };
  if (score >= 740) return { label: 'Very Good',    color: 'text-teal-600',    bg: 'bg-teal-50',     ring: 'ring-teal-300',    gauge: '#0d9488', min: 740, max: 799, tip: 'Almost exceptional. Keep utilization below 10% and avoid new inquiries.' };
  if (score >= 670) return { label: 'Good',         color: 'text-blue-600',    bg: 'bg-blue-50',     ring: 'ring-blue-300',    gauge: '#2563eb', min: 670, max: 739, tip: 'Solid score. Pay all cards to $0 except one to push higher.' };
  if (score >= 580) return { label: 'Fair',         color: 'text-amber-600',   bg: 'bg-amber-50',    ring: 'ring-amber-300',   gauge: '#d97706', min: 580, max: 669, tip: 'On the way up. Focus on on-time payments and reducing balances.' };
  return               { label: 'Poor',           color: 'text-red-600',     bg: 'bg-red-50',      ring: 'ring-red-300',     gauge: '#dc2626', min: 300, max: 579, tip: 'Every on-time payment helps. Dispute any errors on your report.' };
}

// ─── Gauge SVG ────────────────────────────────────────────────────────────────

function ScoreGauge({ score }: { score: number }) {
  const band    = getScoreBand(score);
  const minScore = 300;
  const maxScore = 850;
  const pct     = (score - minScore) / (maxScore - minScore); // 0–1
  const angle   = -180 + pct * 180;                           // -180 to 0 degrees

  // Arc path for a semicircle
  const cx = 120, cy = 110, r = 90;
  function polarToXY(deg: number) {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  const segments = [
    { from: -180, to: -144, color: '#dc2626' },  // Poor
    { from: -144, to: -108, color: '#f97316' },  // Fair-ish
    { from: -108, to:  -72, color: '#eab308' },  // Fair
    { from:  -72, to:  -36, color: '#2563eb' },  // Good
    { from:  -36, to:    0, color: '#059669' },  // Very Good / Exceptional
  ];

  function arcPath(fromDeg: number, toDeg: number) {
    const start = polarToXY(fromDeg);
    const end   = polarToXY(toDeg);
    const large = toDeg - fromDeg > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
  }

  const needle = polarToXY(angle);

  return (
    <svg viewBox="0 0 240 160" className="w-full max-w-xs mx-auto">
      {/* Track */}
      <path d={arcPath(-180, 0)} fill="none" stroke="#e2e8f0" strokeWidth="18" strokeLinecap="round" />
      {/* Colored segments */}
      {segments.map((s, i) => (
        <path key={i} d={arcPath(s.from, s.to)} fill="none" stroke={s.color} strokeWidth="16" opacity="0.85" />
      ))}
      {/* Needle */}
      <line x1={cx} y1={cy} x2={needle.x} y2={needle.y} stroke="#0f1e2e" strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="6" fill="#0f1e2e" />
      {/* Score label */}
      <text x={cx} y={cy + 26} textAnchor="middle" fontSize="28" fontWeight="800" fill="#0f1e2e">{score}</text>
      <text x={cx} y={cy + 44} textAnchor="middle" fontSize="11" fontWeight="600" fill={band.gauge}>{band.label}</text>
      {/* Range labels */}
      <text x="18"  y="122" fontSize="9" fill="#94a3b8">300</text>
      <text x="202" y="122" fontSize="9" fill="#94a3b8">850</text>
    </svg>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function CreditScorePage() {
  const [entries, setEntries]     = useState<ScoreEntry[]>(INITIAL_ENTRIES);
  const [showForm, setShowForm]   = useState(false);
  const [newScore, setNewScore]   = useState('');
  const [newSource, setNewSource] = useState(SOURCES[0]);
  const [newDate, setNewDate]     = useState(new Date().toISOString().split('T')[0]);
  const [newNotes, setNewNotes]   = useState('');

  const sorted  = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const latest  = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];
  const change  = latest && previous ? latest.score - previous.score : 0;
  const band    = latest ? getScoreBand(latest.score) : null;

  function handleAdd() {
    const score = parseInt(newScore);
    if (!score || score < 300 || score > 850) return;
    if (!newDate) return;
    const entry: ScoreEntry = { id: genId(), date: newDate, score, source: newSource, notes: newNotes };
    setEntries((prev) => [...prev, entry]);
    setNewScore(''); setNewNotes(''); setShowForm(false);
  }

  function handleDelete(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function formatDate(d: string) {
    const [y, m, day] = d.split('-').map(Number);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[m-1]} ${day}, ${y}`;
  }

  // Chart data
  const chartData = {
    labels: sorted.map((e) => formatDate(e.date)),
    datasets: [{
      label: 'Credit Score',
      data: sorted.map((e) => e.score),
      borderColor: '#ea580c',
      backgroundColor: 'rgba(234,88,12,0.08)',
      borderWidth: 2.5,
      pointBackgroundColor: '#ea580c',
      pointRadius: 5,
      pointHoverRadius: 7,
      tension: 0.35,
      fill: true,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: any) => ` Score: ${ctx.parsed.y}` } },
    },
    scales: {
      y: {
        min: Math.max(300, (latest?.score ?? 650) - 80),
        max: Math.min(850, (latest?.score ?? 700) + 60),
        ticks: { font: { size: 11 }, color: '#94a3b8' },
        grid: { color: '#f1f5f9' },
      },
      x: {
        ticks: { font: { size: 10 }, color: '#94a3b8', maxRotation: 30 },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Credit Score Monitoring</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Log your score whenever you check it. Watch it grow over time.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-lg transition-colors"
        >
          <Plus size={15} />
          Log New Score
        </button>
      </div>

      {/* Log form */}
      {showForm && (
        <div className="bg-white rounded-2xl border-2 border-orange-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Log a New Score</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Credit Score (300–850)</label>
              <input
                type="number"
                min="300"
                max="850"
                placeholder="e.g. 712"
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
                className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-orange-500 outline-none font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Where did you check it?</label>
              <select
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-orange-500 outline-none"
              >
                {SOURCES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Notes (optional)</label>
              <input
                type="text"
                placeholder="e.g. Paid off Discover card"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-orange-500 outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!newScore || parseInt(newScore) < 300 || parseInt(newScore) > 850}
              className="flex-1 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Save Score
            </button>
          </div>
        </div>
      )}

      {/* Current score + gauge */}
      {latest && band && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Gauge card */}
          <div className={cn('bg-white rounded-2xl border-2 p-5 flex flex-col items-center', band.ring)}>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Score</p>
            <ScoreGauge score={latest.score} />
            <p className="text-xs text-slate-500 mt-2">From {latest.source} · {formatDate(latest.date)}</p>
          </div>

          {/* Stats */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            {/* Change */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Since Last Check</p>
              <div className="flex items-end gap-2 mt-2">
                <span className={cn('text-3xl font-extrabold', change >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                  {change >= 0 ? '+' : ''}{change}
                </span>
                {change >= 0
                  ? <TrendingUp size={20} className="text-emerald-500 mb-1" />
                  : <TrendingDown size={20} className="text-red-500 mb-1" />
                }
              </div>
              <p className="text-xs text-slate-400 mt-1">points</p>
            </div>

            {/* Score range */}
            <div className={cn('rounded-2xl border p-4', band.bg, band.ring)}>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rating</p>
              <p className={cn('text-2xl font-extrabold mt-2', band.color)}>{band.label}</p>
              <p className="text-xs text-slate-500 mt-1">Range: {band.min}–{band.max}</p>
            </div>

            {/* All-time high */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">All-Time High</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">{Math.max(...entries.map((e) => e.score))}</p>
              <p className="text-xs text-slate-400 mt-1">best recorded score</p>
            </div>

            {/* Total gain */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Gain</p>
              <p className="text-3xl font-extrabold text-emerald-600 mt-2">
                +{latest.score - sorted[0].score}
              </p>
              <p className="text-xs text-slate-400 mt-1">since you started tracking</p>
            </div>

            {/* Tip */}
            <div className="col-span-2 bg-orange-50 border border-orange-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-1">💡 Next Step</p>
              <p className="text-sm text-orange-800">{band.tip}</p>
            </div>
          </div>
        </div>
      )}

      {/* Score range legend */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Score Ranges</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Poor',        range: '300–579', color: 'bg-red-100 text-red-700' },
            { label: 'Fair',        range: '580–669', color: 'bg-amber-100 text-amber-700' },
            { label: 'Good',        range: '670–739', color: 'bg-blue-100 text-blue-700' },
            { label: 'Very Good',   range: '740–799', color: 'bg-teal-100 text-teal-700' },
            { label: 'Exceptional', range: '800–850', color: 'bg-emerald-100 text-emerald-700' },
          ].map((b) => (
            <span key={b.label} className={cn('px-3 py-1.5 rounded-full text-xs font-bold', b.color)}>
              {b.label} · {b.range}
            </span>
          ))}
        </div>
      </div>

      {/* History chart */}
      {sorted.length > 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm font-bold text-slate-900 mb-4">Score History</p>
          <Line data={chartData} options={chartOptions} />
        </div>
      )}

      {/* History table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <p className="text-sm font-bold text-slate-900">All Score Entries</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wide">
                <th className="text-left px-5 py-3 font-semibold">Date</th>
                <th className="text-left px-5 py-3 font-semibold">Score</th>
                <th className="text-left px-5 py-3 font-semibold">Source</th>
                <th className="text-left px-5 py-3 font-semibold">Notes</th>
                <th className="text-left px-5 py-3 font-semibold">Change</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[...sorted].reverse().map((entry, idx, arr) => {
                const prev = arr[idx + 1];
                const diff = prev ? entry.score - prev.score : null;
                const scoreBand = getScoreBand(entry.score);
                return (
                  <tr key={entry.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 text-slate-600">{formatDate(entry.date)}</td>
                    <td className="px-5 py-3">
                      <span className={cn('font-extrabold text-base', scoreBand.color)}>{entry.score}</span>
                      <span className={cn('ml-2 text-xs font-semibold px-2 py-0.5 rounded-full', scoreBand.bg, scoreBand.color)}>{scoreBand.label}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{entry.source}</td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{entry.notes || '—'}</td>
                    <td className="px-5 py-3">
                      {diff !== null && (
                        <span className={cn('font-bold text-sm', diff >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                          {diff >= 0 ? '+' : ''}{diff}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => handleDelete(entry.id)} className="text-slate-300 hover:text-red-400 transition-colors">
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
