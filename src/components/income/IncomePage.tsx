import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStore, useDerived } from '@/store/useForgeBudget';
import { INCOME_SOURCES } from '@/types';
import { fmt, formatDateDisplay, todayISO, currentMonthLabel } from '@/lib/utils';
import { Card, CardHeader, Badge, FormField, inputCls, selectCls, EmptyState } from '@/components/ui';
import { Button } from '@/components/ui/Button';

const schema = z.object({
  date:   z.string().min(1, 'Date is required'),
  amount: z.coerce.number().positive('Must be a positive amount'),
  source: z.string().min(1),
  notes:  z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function IncomePage() {
  const addIncome  = useStore((s) => s.addIncome);
  const income     = useStore((s) => s.income);
  const openModal  = useStore((s) => s.openModal);
  const addToast   = useStore((s) => s.addToast);
  const derived    = useDerived();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { date: todayISO(), source: INCOME_SOURCES[0] },
  });

  const onSubmit = (data: FormValues) => {
    addIncome({ date: data.date, amount: data.amount, source: data.source, notes: data.notes });
    addToast(`${fmt(data.amount)} logged! Open Allocate Income to assign every dollar.`);
    reset({ date: todayISO(), source: INCOME_SOURCES[0] });
    openModal('alloc');
  };

  const monthInc = derived.monthlyIncome();
  const monthEntries = income.filter((i) => {
    const d = new Date(i.date), n = new Date();
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  });
  const largest = [...monthEntries].sort((a, b) => b.amount - a.amount)[0];

  return (
    <div className="space-y-6">
      {/* Log Form */}
      <Card>
        <CardHeader
          title="Log New Income Entry"
          subtitle="Zero-based: allocate every dollar after logging."
        />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Date" required error={errors.date?.message}>
              <input type="date" {...register('date')} className={inputCls} />
            </FormField>
            <FormField label="Amount" required error={errors.amount?.message}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register('amount')}
                  className={inputCls + ' pl-7'}
                />
              </div>
            </FormField>
          </div>
          <FormField label="Source" required>
            <select {...register('source')} className={selectCls}>
              {INCOME_SOURCES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </FormField>
          <FormField label="Notes (optional)">
            <input type="text" placeholder="Add context about this paycheck..." {...register('notes')} className={inputCls} />
          </FormField>
          <Button type="submit" size="lg" fullWidth>
            ⚡ Log Income & Prepare Allocation
          </Button>
        </form>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">This Month ({currentMonthLabel()})</p>
          <p className="text-2xl font-extrabold text-slate-900">{fmt(monthInc)}</p>
          <p className="text-xs text-slate-500 mt-1">{monthEntries.length} entries · Avg {fmt(monthEntries.length ? monthInc / monthEntries.length : 0)}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">YTD Total</p>
          <p className="text-2xl font-extrabold text-slate-900">$41,280</p>
          <p className="text-xs text-emerald-600 mt-1">+12% vs same period last year</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Largest Paycheck ({currentMonthLabel()})</p>
          <p className="text-2xl font-extrabold text-slate-900">{largest ? fmt(largest.amount) : '—'}</p>
          {largest && <p className="text-xs text-slate-500 mt-1">{largest.source.split(' - ')[0]} · {formatDateDisplay(largest.date)}</p>}
        </Card>
      </div>

      {/* History Table */}
      <Card padding={false}>
        <div className="p-5 pb-0">
          <CardHeader title="Income History" subtitle="Click any unallocated row to assign it." />
        </div>
        {income.length === 0 ? (
          <EmptyState icon="💵" title="No income logged yet" subtitle="Log your first paycheck above." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100">
                  <th className="text-left px-5 py-3 font-semibold">Date</th>
                  <th className="text-left px-5 py-3 font-semibold">Source</th>
                  <th className="text-right px-5 py-3 font-semibold">Amount</th>
                  <th className="text-center px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {income.map((i) => (
                  <tr
                    key={i.id}
                    className={`hover:bg-slate-50 transition-colors ${!i.allocated ? 'cursor-pointer' : ''}`}
                    onClick={() => !i.allocated && openModal('alloc', undefined, i.id)}
                  >
                    <td className="px-5 py-3 text-slate-700 font-medium">{formatDateDisplay(i.date)}</td>
                    <td className="px-5 py-3">
                      <p className="text-slate-800 font-medium">{i.source}</p>
                      {i.notes && <p className="text-xs text-slate-400">{i.notes}</p>}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-slate-900">{fmt(i.amount)}</td>
                    <td className="px-5 py-3 text-center">
                      <Badge variant={i.allocated ? 'green' : 'amber'}>
                        {i.allocated ? 'Allocated' : 'Needs Allocation'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      {!i.allocated && (
                        <Button
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); openModal('alloc', undefined, i.id); }}
                        >
                          Allocate →
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
