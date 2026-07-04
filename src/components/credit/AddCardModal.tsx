import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStore, useModal } from '@/store/useForgeBudget';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { FormField, inputCls } from '@/components/ui';

const schema = z.object({
  name:    z.string().min(1, 'Card name is required'),
  issuer:  z.string().min(1, 'Issuer is required'),
  balance: z.coerce.number().min(0).default(0),
  limit:   z.coerce.number().positive('Credit limit is required'),
  apr:     z.coerce.number().min(0),
  dueDate: z.string().min(1, 'Due date is required'),
});
type FormValues = z.infer<typeof schema>;

export function AddCardModal() {
  const { modal, closeModal } = useModal();
  const addCard  = useStore((s) => s.addCard);
  const addToast = useStore((s) => s.addToast);
  const isOpen   = modal.open === 'addCard';

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { balance: 0 },
  });

  const onSubmit = (data: FormValues) => {
    addCard({
      name: data.name, issuer: data.issuer,
      balance: data.balance ?? 0, limit: data.limit,
      apr: data.apr, dueDate: data.dueDate,
      lastPayment: new Date().toISOString().split('T')[0],
    });
    addToast(`Card "${data.name}" added!`);
    reset({ balance: 0 });
    closeModal();
  };

  return (
    <Modal
      open={isOpen}
      onClose={() => { reset({ balance: 0 }); closeModal(); }}
      title="💳 Add Credit Card"
      subtitle="Track balances and optimize utilization for your AZEO strategy"
      footer={
        <>
          <Button variant="ghost" onClick={() => { reset({ balance: 0 }); closeModal(); }}>Cancel</Button>
          <Button form="add-card-form" type="submit">Add Card</Button>
        </>
      }
    >
      <form id="add-card-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Card Name" required error={errors.name?.message}>
            <input className={inputCls} placeholder='e.g. Chase Sapphire' {...register('name')} />
          </FormField>
          <FormField label="Issuer" required error={errors.issuer?.message}>
            <input className={inputCls} placeholder='e.g. Chase' {...register('issuer')} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Current Balance">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">$</span>
              <input type="number" step="0.01" min="0" placeholder="0.00" {...register('balance')} className={inputCls + ' pl-7'} />
            </div>
          </FormField>
          <FormField label="Credit Limit" required error={errors.limit?.message}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">$</span>
              <input type="number" step="0.01" min="0" placeholder="0.00" {...register('limit')} className={inputCls + ' pl-7'} />
            </div>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="APR %" error={errors.apr?.message}>
            <input type="number" step="0.01" min="0" placeholder="24.99" {...register('apr')} className={inputCls} />
          </FormField>
          <FormField label="Payment Due Date" required error={errors.dueDate?.message}>
            <input type="date" {...register('dueDate')} className={inputCls} />
          </FormField>
        </div>
      </form>
    </Modal>
  );
}
