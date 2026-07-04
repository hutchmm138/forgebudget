import { useState } from 'react';
import { useStore } from '@/store/useForgeBudget';
import { fmt, futureValue } from '@/lib/utils';
import { Card, CardHeader, FormField, inputCls } from '@/components/ui';
import { Button } from '@/components/ui/Button';

export function RetirementPage() {
  const accounts = useStore((s) => s.retirementAccounts);
  const [years, setYears]   = useState('25');
  const [rate, setRate]     = useState('7');
  const [projection, setProjection] = useState<number | null>(null);

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const totalYTD     = accounts.reduce((s, a) => s + a.ytdContrib, 0);

  function calcProjection() {
    const y = parseInt(years) || 25;
    const r = parseFloat(rate) || 7;
    const annual = totalYTD;
    const fv = futureValue(totalBalance, annual, y, r);
    setProjection(fv);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-extrabold text-slate-900">Retirement Tracking</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Monitor 401(k), IRA, and pension progress. Plan for the long haul while managing irregular income.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Total Retirement Balance</p>
          <p className="text-2xl font-extrabold text-slate-900">{fmt(totalBalance)}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">YTD Contributions</p>
          <p className="text-2xl font-extrabold text-emerald-600">{fmt(totalYTD)}</p>
        </Card>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.map((acct) => (
          <Card key={acct.type}>
            <p className="text-xs font-extrabold text-orange-600 uppercase tracking-widest mb-1">{acct.label}</p>
            <p className="text-3xl font-extrabold text-slate-900 mb-4">{fmt(acct.balance)}</p>

            <div className="divide-y divide-slate-100 text-sm">
              {acct.type === '401k' && (
                <>
                  <Row label="Your Contribution" value={`${acct.contribRate}% of pay (+$${Math.round((acct.contribRate! / 100) * 3000)}/pay)`} />
                  <Row label="Employer Match"    value={`${acct.employerMatch}% match (+$${Math.round((acct.employerMatch! / 100) * 3000)}/pay)`} />
                </>
              )}
              {acct.type === 'roth_ira' && (
                <>
                  <Row label="2026 Contributions" value={`${fmt(acct.ytdContrib)} contributed`} valueColor="text-emerald-600" />
                  <Row label="Annual Limit Status" value="Maxing annual limit ✓" valueColor="text-emerald-600" />
                  <Row label="Strategy"            value="Roth selected — tax-free growth" />
                </>
              )}
              <Row label="YTD Contributions" value={fmt(acct.ytdContrib)} />
              {acct.type === '401k' && (
                <Row label="Projected @ 65" value="$412k+" valueColor="text-emerald-600" />
              )}
            </div>

            <div className="mt-4">
              <Button variant="outline" size="sm" fullWidth>
                {acct.type === '401k' ? 'Update Balance or Add Contribution' : 'Log IRA Contribution'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Projection Tool */}
      <Card>
        <CardHeader title="Simple Projection Tool" subtitle="See your estimated future balance based on current trajectory." />
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Years Until Retirement">
            <input
              type="number" min="1" max="50"
              className={inputCls}
              value={years}
              onChange={(e) => setYears(e.target.value)}
            />
          </FormField>
          <FormField label="Expected Annual Return %">
            <input
              type="number" min="1" max="20" step="0.5"
              className={inputCls}
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
          </FormField>
        </div>
        <Button onClick={calcProjection}>Calculate</Button>

        {projection !== null && (
          <div className="mt-5 rounded-xl bg-emerald-50 ring-1 ring-emerald-200 p-5">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
              Projected Balance in {years} Years
            </p>
            <p className="text-3xl font-extrabold text-emerald-600">{fmt(projection)}</p>
            <p className="text-xs text-emerald-600 mt-1">
              Based on {rate}% avg annual return · {fmt(totalYTD)}/yr contributions · {fmt(totalBalance)} starting balance
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

function Row({ label, value, valueColor = 'text-slate-900' }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex justify-between py-2.5">
      <span className="text-slate-500">{label}</span>
      <span className={`font-semibold ${valueColor}`}>{value}</span>
    </div>
  );
}
