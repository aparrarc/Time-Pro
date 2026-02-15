import type { ReactNode } from 'react';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    variant?: 'default' | 'outlined' | 'interactive';
}

export function GlassCard({
    children,
    className = '',
    onClick,
    variant = 'default'
}: GlassCardProps) {
    const baseStyles = 'card';

    const variantStyles = {
        default: '',
        outlined: 'border-2 border-[var(--color-primary)]/20',
        interactive: 'hover:shadow-lg cursor-pointer active:scale-[0.99]'
    };

    return (
        <div
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {children}
        </div>
    );
}
