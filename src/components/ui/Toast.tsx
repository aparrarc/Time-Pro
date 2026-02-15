import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { useAppStore, type Toast as ToastType } from '../../store/appStore';

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
};

const colors = {
    success: { bg: '#ecfdf5', border: '#a7f3d0', icon: '#059669', text: '#065f46' },
    error: { bg: '#fef2f2', border: '#fecaca', icon: '#dc2626', text: '#991b1b' },
    info: { bg: '#eff6ff', border: '#bfdbfe', icon: '#2563eb', text: '#1e40af' },
    warning: { bg: '#fffbeb', border: '#fde68a', icon: '#d97706', text: '#92400e' },
};

export function ToastContainer() {
    const { toasts, removeToast } = useAppStore();

    if (toasts.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            maxWidth: '380px',
            width: '100%',
        }}>
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
            ))}
        </div>
    );
}

interface ToastItemProps {
    toast: ToastType;
    onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
    const [isExiting, setIsExiting] = useState(false);
    const Icon = icons[toast.type];
    const color = colors[toast.type];

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => onDismiss(toast.id), 300);
        }, 4000);
        return () => clearTimeout(timer);
    }, [toast.id, onDismiss]);

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.875rem 1rem',
                background: color.bg,
                border: `1px solid ${color.border}`,
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                animation: isExiting ? 'toastOut 0.3s ease-in forwards' : 'toastIn 0.3s ease-out',
                fontSize: '0.8125rem',
                color: color.text,
            }}
        >
            <Icon size={18} style={{ color: color.icon, flexShrink: 0, marginTop: 1 }} />
            <span style={{ flex: 1, fontWeight: 500, lineHeight: 1.4 }}>{toast.message}</span>
            <button
                onClick={() => {
                    setIsExiting(true);
                    setTimeout(() => onDismiss(toast.id), 300);
                }}
                style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: '2px',
                    color: color.icon,
                    opacity: 0.6,
                    flexShrink: 0,
                }}
            >
                <X size={14} />
            </button>
        </div>
    );
}
