/**
 * plaidMock.ts
 * All mock Plaid Link logic lives here.
 * In production, replace with real Plaid Link SDK calls — the rest of the app stays untouched.
 */

import type { PlaidAccount, PlaidInstitution } from '@/types';

export function buildMockPlaidAccount(
  inst: PlaidInstitution,
  nextId: number
): PlaidAccount {
  const mask = Math.floor(1000 + Math.random() * 9000).toString();
  return {
    id: nextId,
    institution: inst.name,
    accountName: `${inst.defaultAccountName} ••${mask}`,
    type: inst.defaultType,
    balance: inst.defaultBalance + (Math.random() - 0.5) * 200,
    lastSync: new Date().toISOString(),
    plaidItemId: `item_${inst.id}_${mask}`,
  };
}

export function simulateSync(account: PlaidAccount): PlaidAccount {
  // Realistic small balance drift — within ±$150
  const drift = (Math.random() - 0.45) * 150;
  return {
    ...account,
    balance: Math.max(0, account.balance + drift),
    lastSync: new Date().toISOString(),
  };
}

export function formatLastSync(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
