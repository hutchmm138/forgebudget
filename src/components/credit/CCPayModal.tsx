import { useState, useEffect } from 'react';
import { useStore, useModal } from '@/store/useForgeBudget';
import { fmt } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { FormField, inputCls } from '@/components/ui';

export function CCPayModal() {
  const { modal, closeModal } = useModal();
  const cards       = useStore((s) => s.cards);
  const makePayment = useStore((s) => s.makePayment);
  const addToast    = useStore((s) => s.addToast);
  const [amount, setAmount] = useState('');

  const isOpen = modal.open === 'ccPay';
  const card   = cards.find((c) => c.id === modal.targetId);

  useEffect(() => {
    if (!isOpen) { setAmount(''); return; }
    if (card && card.balance > 0) setAmount(String(card.balance));
  }, [isOpen, modal.targetId]);

  function handleApply() {
    const v = parseFloat(amount);
    if (!v || v <= 0) { addToast('Enter a valid payment amount.', 'error'); return; }
    makePayment(modal.targetId!, v);
    addToast(`Payment of ${fmt(v)} applied to ${card?.name}!`);
    closeModal();
  }

  return (
    <Modal
      open={isOpen}
      onClose={closeModal}
      title={`Payment: ${card?.name ?? 'Card'}`}
      subtitle={card ? `Current balance: ${fmt(card.balance)} · Limit: ${fmt(card.limit)}` : undefined}
      footer={
        <>
          <Button variant="ghost" onClick={closeModal}>Cancel</Button>
          <Button onClick={handleApply}>Record Payment</Button>
        </>
      }
    >
      <FormField label="Payment Amount">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">$</span>
          <input
            type="number" min="0" step="0.01" placeholder="0.00" autoFocus
            value={amount} onChange={(e) => setAmount(e.target.value)}
            className={inputCls + ' pl-7'}
          />
        </div>
      </FormField>
      {card && card.balance > 0 && (
        <p className="text-xs text-slate-400 mt-2">
          Full payoff: {fmt(card.balance)} · Partial payments reduce utilization too.
        </p>
      )}
    </Modal>
  );
}
