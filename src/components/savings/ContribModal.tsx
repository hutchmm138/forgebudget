import { useState, useEffect } from 'react';
import { useStore, useModal } from '@/store/useForgeBudget';
import { fmt } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { FormField, inputCls } from '@/components/ui';

export function ContribModal() {
  const { modal, closeModal } = useModal();
  const buckets         = useStore((s) => s.buckets);
  const contributeToBank = useStore((s) => s.contributeToBank);
  const updateBucket    = useStore((s) => s.updateBucket);
  const deleteBucket    = useStore((s) => s.deleteBucket);
  const addToast        = useStore((s) => s.addToast);

  const [amount, setAmount] = useState('');
  const [newTarget, setNewTarget] = useState('');

  const isContrib = modal.open === 'contrib';
  const isEdit    = modal.open === 'editBucket';
  const isOpen    = isContrib || isEdit;

  const bucket = buckets.find((b) => b.id === modal.targetId);

  useEffect(() => {
    if (!isOpen) { setAmount(''); setNewTarget(''); }
    if (isEdit && bucket) setNewTarget(String(bucket.target));
  }, [isOpen, modal.targetId]);

  function handleContrib() {
    const v = parseFloat(amount);
    if (!v || v <= 0) { addToast('Enter a valid amount.', 'error'); return; }
    contributeToBank(modal.targetId!, v);
    addToast(`${fmt(v)} added to "${bucket?.name}"!`);
    closeModal();
  }

  function handleEditTarget() {
    const v = parseFloat(newTarget);
    if (!v || v <= 0) { addToast('Enter a valid target.', 'error'); return; }
    updateBucket(modal.targetId!, { target: v });
    addToast('Target updated!');
    closeModal();
  }

  function handleDelete() {
    if (!confirm(`Remove "${bucket?.name}"? This cannot be undone.`)) return;
    deleteBucket(modal.targetId!);
    addToast('Bucket removed.', 'info');
    closeModal();
  }

  if (isContrib) {
    return (
      <Modal
        open={isOpen}
        onClose={closeModal}
        title={`Add to: ${bucket?.name ?? 'Bucket'}`}
        subtitle={bucket ? `Current: ${fmt(bucket.current)} · Target: ${fmt(bucket.target)}` : undefined}
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleContrib}>Add Contribution</Button>
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

  // Edit bucket modal
  return (
    <Modal
      open={isOpen}
      onClose={closeModal}
      title={`Edit: ${bucket?.name ?? 'Bucket'}`}
      footer={
        <>
          <Button variant="danger" size="sm" onClick={handleDelete}>Delete Bucket</Button>
          <div className="flex-1" />
          <Button variant="ghost" onClick={closeModal}>Cancel</Button>
          <Button onClick={handleEditTarget}>Save Target</Button>
        </>
      }
    >
      <FormField label="New Target Amount">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">$</span>
          <input
            type="number" min="0" step="0.01" autoFocus
            value={newTarget} onChange={(e) => setNewTarget(e.target.value)}
            className={inputCls + ' pl-7'}
          />
        </div>
      </FormField>
    </Modal>
  );
}
