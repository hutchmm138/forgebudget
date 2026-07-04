import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useStore } from '@/store/useForgeBudget';
import { fmt, pct } from '@/lib/utils';
import { Card, CardHeader, MetricCard } from '@/components/ui';

ChartJS.register(ArcElement, Tooltip, Legend);

const PALETTE = ['#ea580c', '#2563eb', '#059669', '#d97706', '#7c3aed', '#0891b2'];

export function InvestmentsPage() {
  const holdings  = useStore((s) => s.holdings);
  const total     = holdings.reduce((s, h) => s + h.value, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-extrabold text-slate-900">Investment Portfolio</h2>
        <p className="text-sm text-slate-500 mt-0.5">Track brokerage accounts and long-term holdings.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MetricCard label="Total Portfolio Value" value={fmt(total)} />
        <MetricCard label="YTD Return" value="+8.4%" change="↑ Strong growth" changeColor="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Doughnut */}
        <Card className="lg:col-span-2 flex flex-col items-center justify-center">
          <CardHeader title="Allocation by Symbol" />
          <div className="w-56 h-56">
            <Doughnut
              data={{
                labels: holdings.map((h) => h.symbol),
                datasets: [{
                  data: holdings.map((h) => h.value),
                  backgroundColor: PALETTE.slice(0, holdings.length),
                  borderWidth: 0,
                  hoverOffset: 6,
                }],
              }}
              options={{
                responsive: true,
                cutout: '65%',
                plugins: {
                  legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 12 } },
                  tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${fmt(ctx.parsed)}` } },
                },
              }}
            />
          </div>
        </Card>

        {/* Holdings table */}
        <Card className="lg:col-span-3" padding={false}>
          <div className="p-5 pb-0">
            <CardHeader title="Holdings" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-semibold">Symbol / Name</th>
                  <th className="text-right px-5 py-3 font-semibold">Value</th>
                  <th className="text-right px-5 py-3 font-semibold">% Portfolio</th>
                  <th className="text-right px-5 py-3 font-semibold">1M Chg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {holdings.map((h, i) => (
                  <tr key={h.symbol} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ background: PALETTE[i % PALETTE.length] }}
                        />
                        <div>
                          <p className="font-bold text-slate-900">{h.symbol}</p>
                          <p className="text-xs text-slate-400">{h.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-slate-900">{fmt(h.value)}</td>
                    <td className="px-5 py-3 text-right text-slate-600">{pct(h.value / total * 100)}</td>
                    <td className={`px-5 py-3 text-right font-semibold ${h.change1m >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {h.change1m >= 0 ? '+' : ''}{pct(h.change1m)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 pb-5 pt-3 flex gap-2">
            <button className="text-xs font-semibold text-orange-600 border border-orange-200 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors">
              + Add Holding
            </button>
            <button className="text-xs font-semibold text-slate-600 border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors">
              📥 Import from Plaid
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
