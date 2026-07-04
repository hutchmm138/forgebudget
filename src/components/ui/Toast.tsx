import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useToasts } from '@/store/useForgeBudget';
import type { Toast } from '@/types';

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToasts();

  const icons = {
    success: <CheckCircle size={16} className="text-emerald-400 shrink-0" />,
    error:   <XCircle    size={16} className="text-red-400    shrink-0" />,
    info:    <Info       size={16} className="text-blue-400   shrink-0" />,
  };

  const borders = {
    success: 'border-l-emerald-500',
    error:   'border-l-red-500',
    info:    'border-l-blue-500',
  };

  return (
    <div
      className={`flex items-start gap-3 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border-l-4 ${borders[toast.type]} max-w-sm text-sm font-medium animate-in slide-in-from-right-5 duration-200`}
      role="alert"
    >
      {icons[toast.type]}
      <span className="flex-1 leading-snug">{toast.message}</span>
      <button
        onClick={() => removeToast(toast.id)}
        className="ml-2 text-slate-400 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToasts();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  );
}
