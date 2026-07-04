import { useState, useEffect } from 'react';
import { useStore, useModal } from '@/store/useForgeBudget';
import { fmt } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { FormField, inputCls } from '@/components/ui';

export function GoalContribModal() {
  const { modal, closeModal } = useModal();
  const goals           = useStore((s) => s.goals);
  const contributeToGoal = useStore((s) => s.contributeToGoal);
  const addToast        = useStore((s) => s.addToast);
  const [amount, setAmount] = useState('');

  const isOpen = modal.open === 'goalContrib';
  const goal   = goals.find((g) => g.id === modal.targetId);

  useEffect(() => { if (!isOpen) setAmount(''); }, [isOpen]);

  function handleApply() {
    const v = parseFloat(amount);
    if (!v || v <= 0) { addToast('Enter a valid amount.', 'error'); return; }
    contributeToGoal(modal.targetId!, v);
    addToast(`${fmt(v)} contributed toward "${goal?.name}"!`);
    closeModal();
  }

  return (
    <Modal
      open={isOpen}
      onClose={closeModal}
      title={`Contribute: ${goal?.name ?? 'Goal'}`}
      subtitle={goal ? `Current: ${fmt(goal.currentAmount)} · Target: ${fmt(goal.targetAmount)}` : undefined}
      footer={
        <>
          <Button variant="ghost" onClick={closeModal}>Cancel</Button>
          <Button onClick={handleApply}>Add Contribution</Button>
        </>
      }
    >
      <FormField label="Amount to Add">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">$</span>
          <input
            type="number" min="0" step="0.01" placeholder="0.00" autoFocus
            value={amount} onChange={(e) => setAmount(e.target.value)}
            className={inputCls + ' pl-7'}
          />
        </div>
      </FormField>
    </Modal>
  );
}
