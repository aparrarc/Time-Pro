import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    disabled,
    className = '',
    ...props
}: ButtonProps) {
    const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-semibold rounded-xl
    transition-all duration-200
    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-[0.98]
  `;

    const variantStyles = {
        primary: 'btn btn-primary',
        secondary: `
      bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]
      border border-[var(--color-border)]
      hover:bg-[var(--color-bg-tertiary)]
      focus-visible:ring-[var(--color-primary)]
    `,
        outline: `
      bg-transparent text-[var(--color-primary)]
      border border-[var(--color-primary)]/30
      hover:bg-[var(--color-primary)]/5
      focus-visible:ring-[var(--color-primary)]
    `,
        ghost: `
      bg-transparent text-[var(--color-text-secondary)]
      hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]
    `,
        danger: `
      bg-[var(--color-error)] text-white
      hover:bg-[var(--color-error)]/90
      focus-visible:ring-[var(--color-error)]
    `
    };

    const sizeStyles = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
    };

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <>
                    {leftIcon}
                    {children}
                    {rightIcon}
                </>
            )}
        </button>
    );
}
