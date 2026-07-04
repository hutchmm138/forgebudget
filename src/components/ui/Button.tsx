import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

const variants = {
  primary:   'bg-orange-600 hover:bg-orange-700 text-white shadow-sm',
  secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200',
  outline:   'bg-transparent border border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white',
  ghost:     'bg-transparent border border-slate-200 text-slate-600 hover:bg-slate-100',
  danger:    'bg-red-600 hover:bg-red-700 text-white shadow-sm',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs font-semibold rounded-md',
  md: 'px-4 py-2 text-sm font-semibold rounded-lg',
  lg: 'px-6 py-2.5 text-sm font-semibold rounded-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth, loading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-1.5 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
