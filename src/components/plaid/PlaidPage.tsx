import { useStore } from '@/store/useForgeBudget';
import { fmt } from '@/lib/utils';
import { formatLastSync } from '@/lib/plaidMock';
import { Card, Badge, EmptyState } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Link2, RefreshCw } from 'lucide-react';

export function PlaidPage() {
  const plaidAccounts = useStore((s) => s.plaidAccounts);
  const syncAccount   = useStore((s) => s.syncAccount);
  const syncAll       = useStore((s) => s.syncAll);
  const openModal     = useStore((s) => s.openModal);
  const addToast      = useStore((s) => s.addToast);

  function handleSyncOne(id: number, name: string) {
    syncAccount(id);
    addToast(`${name} refreshed.`, 'info');
  }

  function handleSyncAll() {
    syncAll();
    addToast('All accounts synced.', 'info');
  }

  const totalDeposit = plaidAccounts
    .filter((a) => a.type === 'depository')
    .reduce((s, a) => s + a.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Connected Accounts via Plaid</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Secure bank and credit card syncing. Balances and transactions update automatically.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleSyncAll}>
            <RefreshCw size={14} />
            Sync All
          </Button>
          <Button onClick={() => openModal('plaid')}>
            <Link2 size={14} />
            Connect New Account
          </Button>
        </div>
      </div>

      {/* Total */}
      {plaidAccounts.length > 0 && (
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Deposit Balances</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{fmt(totalDeposit)}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {plaidAccounts.length} account{plaidAccounts.length !== 1 ? 's' : ''} connected
          </div>
        </Card>
      )}

      {/* Account list */}
      {plaidAccounts.length === 0 ? (
        <EmptyState
          icon="🔗"
          title="No accounts connected yet"
          subtitle="Connect your bank or credit union to see live balances."
          action={<Button onClick={() => openModal('plaid')}>Connect First Account</Button>}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {plaidAccounts.map((a) => (
            <Card key={a.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#0f1e2e] flex items-center justify-center text-white font-extrabold text-sm shrink-0">
                  {a.institution.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{a.institution}</p>
                  <p className="text-xs text-slate-500">{a.accountName}</p>
                  <Badge variant={a.type === 'depository' ? 'blue' : 'gray'} className="mt-1">
                    {a.type === 'depository' ? 'Bank Account' : 'Credit Card'}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-1">
                <p className="text-xl font-extrabold text-slate-900">{fmt(a.balance)}</p>
                <p className="text-xs text-slate-400">Last sync: {formatLastSync(a.lastSync)}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleSyncOne(a.id, a.institution)}
                >
                  <RefreshCw size={12} />
                  Sync Now
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-xl bg-blue-50 ring-1 ring-blue-200 p-4 text-xs text-blue-700">
        <p className="font-bold mb-1">🔒 Prototype Note</p>
        <p>
          Plaid integration is fully mocked in this prototype. In production, this uses Plaid Link for bank-grade
          OAuth security. Your credentials are never stored by ForgeBudget. Real Plaid integration requires API keys
          and a server-side token exchange.
        </p>
      </div>
    </div>
  );
}
