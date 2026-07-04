import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStore, useModal } from '@/store/useForgeBudget';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { FormField, inputCls, selectCls } from '@/components/ui';

const schema = z.object({
  name:          z.string().min(1, 'Name is required'),
  targetAmount:  z.coerce.number().positive('Target must be greater than 0'),
  currentAmount: z.coerce.number().min(0).default(0),
  targetDate:    z.string().min(1, 'Target date is required'),
  priority:      z.enum(['High', 'Medium', 'Low']),
});
type FormValues = z.infer<typeof schema>;

export function GoalModal() {
  const { modal, closeModal } = useModal();
  const addGoal  = useStore((s) => s.addGoal);
  const addToast = useStore((s) => s.addToast);
  const isOpen   = modal.open === 'goal';

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'Medium', currentAmount: 0 },
  });

  const onSubmit = (data: FormValues) => {
    addGoal({
      name: data.name,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount ?? 0,
      targetDate: data.targetDate,
      priority: data.priority,
    });
    addToast(`Goal "${data.name}" created!`);
    reset({ priority: 'Medium', currentAmount: 0 });
    closeModal();
  };

  return (
    <Modal
      open={isOpen}
      onClose={() => { reset(); closeModal(); }}
      title="🎯 New Financial Goal"
      subtitle="Set a clear target with a deadline to stay on track"
      footer={
        <>
          <Button variant="ghost" onClick={() => { reset(); closeModal(); }}>Cancel</Button>
          <Button form="goal-form" type="submit">Create Goal</Button>
        </>
      }
    >
      <form id="goal-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Goal Name" required error={errors.name?.message}>
          <input className={inputCls} placeholder='e.g. Pay off truck loan' {...register('name')} />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Target Amount" required error={errors.targetAmount?.message}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">$</span>
              <input type="number" step="0.01" min="0" placeholder="0.00" {...register('targetAmount')} className={inputCls + ' pl-7'} />
            </div>
          </FormField>
          <FormField label="Current Amount">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">$</span>
              <input type="number" step="0.01" min="0" placeholder="0.00" {...register('currentAmount')} className={inputCls + ' pl-7'} />
            </div>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Target Date" required error={errors.targetDate?.message}>
            <input type="date" {...register('targetDate')} className={inputCls} />
          </FormField>
          <FormField label="Priority">
            <select {...register('priority')} className={selectCls}>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </FormField>
        </div>
      </form>
    </Modal>
  );
}
