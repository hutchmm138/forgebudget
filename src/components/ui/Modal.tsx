import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Modal({ open, onClose, title, subtitle, size = 'md', children, footer }: ModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy-DEFAULT/60 backdrop-blur-sm"
        style={{ background: 'rgba(15,30,46,0.65)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'relative w-full bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh]',
          sizes[size]
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-100">
          <div>
            <h2 id="modal-title" className="text-lg font-extrabold text-slate-900">
              {title}
            </h2>
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 flex-1">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-6 pt-4 border-t border-slate-100 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
