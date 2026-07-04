import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStore, useModal } from '@/store/useForgeBudget';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { FormField, inputCls, selectCls } from '@/components/ui';
import type { BucketColor } from '@/types';

const schema = z.object({
  name:    z.string().min(1, 'Name is required'),
  target:  z.coerce.number().positive('Target must be greater than 0'),
  current: z.coerce.number().min(0).default(0),
  color:   z.string(),
  notes:   z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const COLORS: { value: BucketColor; label: string }[] = [
  { value: 'emerald', label: 'Emerald' },
  { value: 'blue',    label: 'Blue' },
  { value: 'orange',  label: 'Orange' },
  { value: 'amber',   label: 'Amber' },
  { value: 'teal',    label: 'Teal' },
  { value: 'purple',  label: 'Purple' },
  { value: 'red',     label: 'Red' },
];

export function BucketModal() {
  const { modal, closeModal } = useModal();
  const addBucket = useStore((s) => s.addBucket);
  const addToast  = useStore((s) => s.addToast);
  const isOpen = modal.open === 'bucket';

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { color: 'emerald', current: 0 },
  });

  const onSubmit = (data: FormValues) => {
    addBucket({ name: data.name, target: data.target, current: data.current ?? 0, color: data.color as BucketColor, notes: data.notes });
    addToast(`Savings bucket "${data.name}" created!`);
    reset({ color: 'emerald', current: 0 });
    closeModal();
  };

  return (
    <Modal
      open={isOpen}
      onClose={() => { reset(); closeModal(); }}
      title="🪣 New Savings Bucket"
      subtitle="Create a named fund with a specific target"
      footer={
        <>
          <Button variant="ghost" onClick={() => { reset(); closeModal(); }}>Cancel</Button>
          <Button form="bucket-form" type="submit">Create Bucket</Button>
        </>
      }
    >
      <form id="bucket-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Bucket Name" required error={errors.name?.message}>
          <input className={inputCls} placeholder='e.g. New Truck Fund' {...register('name')} />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Target Amount" required error={errors.target?.message}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">$</span>
              <input type="number" step="0.01" min="0" placeholder="0.00" {...register('target')} className={inputCls + ' pl-7'} />
            </div>
          </FormField>
          <FormField label="Starting Amount">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">$</span>
              <input type="number" step="0.01" min="0" placeholder="0.00" {...register('current')} className={inputCls + ' pl-7'} />
            </div>
          </FormField>
        </div>

        <FormField label="Color">
          <select {...register('color')} className={selectCls}>
            {COLORS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </FormField>

        <FormField label="Notes (optional)">
          <input className={inputCls} placeholder="What is this bucket for?" {...register('notes')} />
        </FormField>
      </form>
    </Modal>
  );
}
